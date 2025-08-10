// Import necessary modules and types
import { AxiosInstance, AxiosError, AxiosResponse } from 'axios';
import mockService from './mockService';
import { extractErrorMessage } from '../utils/apiErrorHandler';
import { createRetryableAxiosInstance } from '../utils/apiRetry';

// Check if we should use mock service
export const USE_MOCK_SERVICE: boolean = false; // Set to false to use real backend
console.log('Using mock service:', USE_MOCK_SERVICE);

// Create a retryable axios instance with default config
const axiosInstance: AxiosInstance = createRetryableAxiosInstance({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true,
  timeout: 10000, // 10 seconds timeout - reduced from 30s
  timeoutErrorMessage: 'Request timed out. Please try again.'
}, {
  // Custom retry configuration
  maxRetries: 3, // Reduced from 5
  initialDelayMs: 1000,
  backoffFactor: 1.5,
  maxDelayMs: 10000, // Reduced from 15000
  retryStatusCodes: [408, 429, 500, 502, 503, 504],
  retryNetworkErrors: true
});

// Add console log to check if API URL is correctly set
console.log('API URL:', process.env.REACT_APP_API_URL || 'http://localhost:5000/api');

// Helper to normalize API responses (unwrap backend { success, message, data })
const unwrap = <T>(response: AxiosResponse<any, any>): T => {
  const resData = response?.data;
  // If backend wraps payload as { success, message, data }, return inner data
  if (resData && typeof resData === 'object' && 'data' in resData) {
    return (resData.data as T);
  }
  // Otherwise, return as-is
  return (resData as T);
};

// Create a mock API adapter with proper type handling
const mockApi = {
  get: async <T>(url: string, config?: any): Promise<{ data: T }> => {
    console.log(`Mock GET request to ${url}`);
    if (url === '/auth/me') {
      const user = await mockService.getCurrentUser();
      return { data: user as T };
    }
    throw new Error(`Unhandled mock GET request to ${url}`);
  },
  post: async <T>(url: string, data?: any, config?: any): Promise<{ data: T }> => {
    console.log(`Mock POST request to ${url}`);
    if (url === '/auth/login') {
      const response = await mockService.login(data.email, data.password);
      // mockService returns { token, user }
      return { data: (response as any) as T };
    }
    if (url.startsWith('/issues/') && url.endsWith('/flag')) {
      const id = url.split('/')[2];
      const response = await mockService.flagIssue(id, data.reason);
      return { data: response as T };
    }
    throw new Error(`Unhandled mock POST request to ${url}`);
  },
  put: async <T>(url: string, data?: any, config?: any): Promise<{ data: T }> => {
    console.log(`Mock PUT request to ${url}`);
    throw new Error(`Unhandled mock PUT request to ${url}`);
  },
  patch: async <T>(url: string, data?: any, config?: any): Promise<{ data: T }> => {
    console.log(`Mock PATCH request to ${url}`);
    throw new Error(`Unhandled mock PATCH request to ${url}`);
  },
  delete: async <T>(url: string, config?: any): Promise<{ data: T }> => {
    console.log(`Mock DELETE request to ${url}`);
    throw new Error(`Unhandled mock DELETE request to ${url}`);
  }
};

// Define the API interface
interface ApiInterface {
  get: <T>(url: string, config?: any) => Promise<{ data: T }>;
  post: <T>(url: string, data?: any, config?: any) => Promise<{ data: T }>;
  put: <T>(url: string, data?: any, config?: any) => Promise<{ data: T }>;
  patch: <T>(url: string, data?: any, config?: any) => Promise<{ data: T }>;
  delete: <T>(url: string, config?: any) => Promise<{ data: T }>;
}

// Create the API instance
const api: ApiInterface = USE_MOCK_SERVICE ? mockApi : {
  get: async <T>(url: string, config?: any) => {
    const response = await axiosInstance.get<T>(url, config);
    return { data: unwrap<T>(response) };
  },
  post: async <T>(url: string, data?: any, config?: any) => {
    const response = await axiosInstance.post<T>(url, data, config);
    return { data: unwrap<T>(response) };
  },
  put: async <T>(url: string, data?: any, config?: any) => {
    const response = await axiosInstance.put<T>(url, data, config);
    return { data: unwrap<T>(response) };
  },
  patch: async <T>(url: string, data?: any, config?: any) => {
    const response = await axiosInstance.patch<T>(url, data, config);
    return { data: unwrap<T>(response) };
  },
  delete: async <T>(url: string, config?: any) => {
    const response = await axiosInstance.delete<T>(url, config);
    return { data: unwrap<T>(response) };
  }
};

// Add request interceptors for authentication and logging
if (!USE_MOCK_SERVICE) {
  // Request interceptor for adding auth token
  axiosInstance.interceptors.request.use(
    (config: any): any => {
      // Add authentication token to headers
      const token = localStorage.getItem('token');
      if (token) {
        console.log('API: Adding auth token to request');
        if (!config.headers) {
          config.headers = {};
        }
        config.headers.Authorization = `Bearer ${token}`;
      } else {
        console.log('API: No auth token found for request');
      }
      
      // Log outgoing requests in development environment
      if (process.env.NODE_ENV === 'development') {
        console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`, config);
      }
      
      return config;
    },
    (error: AxiosError): Promise<AxiosError> => {
      console.error('Request interceptor error:', error);
      return Promise.reject(error);
    }
  );

  // Response interceptor for handling common response scenarios
  axiosInstance.interceptors.response.use(
    (response: AxiosResponse): AxiosResponse => {
      // Log successful responses in development environment
      if (process.env.NODE_ENV === 'development') {
        console.log(`API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, response);
      }
      return response;
    },
    (error: any): Promise<never> => {
      // Use our error handler utility to extract a standardized error message
      const errorResponse = extractErrorMessage(error);
      
      // Check if this is a network error or timeout
      const isNetworkError = !error.response || 
        (error as any).code === 'ECONNABORTED' || 
        errorResponse.errorCode === 'NETWORK_ERROR' || 
        errorResponse.errorCode === 'TIMEOUT_ERROR';
      
      // Handle authentication errors (401) specially
      if (errorResponse.statusCode === 401) {
        // Check if this is a request to /auth/me endpoint
        const isAuthMeRequest = error.config?.url?.includes('/auth/me');
        
        // For login endpoint, don't treat 401 as a network error
        const isLoginRequest = error.config?.url?.includes('/auth/login');
        
        // For register endpoint, don't treat 401 as a network error
        const isRegisterRequest = error.config?.url?.includes('/auth/register');
        
        // Clear token and redirect to login only if it's not the /auth/me endpoint
        // or if explicitly specified in the error response
        // Also don't logout if it's a network error or login/register request
        if (!isAuthMeRequest && !isNetworkError && !isLoginRequest && !isRegisterRequest) {
          console.log('API: Authentication error, clearing token and redirecting to login');
          localStorage.removeItem('token');
          
          // Dispatch a storage event to notify other components about the token change
          if (typeof window !== 'undefined') {
            // Create and dispatch a storage event to notify other components
            window.dispatchEvent(new StorageEvent('storage', {
              key: 'token',
              newValue: null,
              oldValue: 'removed-token',
              storageArea: localStorage
            }));
            
            // Redirect to login page after a short delay to allow the event to be processed
            setTimeout(() => {
              window.location.href = '/login';
            }, 100);
          }
        }
      }
      
      // Log all errors in development environment
      if (process.env.NODE_ENV === 'development') {
        console.error('API Error:', {
          originalError: error,
          processedError: errorResponse
        });
      }
      
      // Return a rejected promise with our standardized error
      return Promise.reject(errorResponse);
    }
  );
}

// Export the appropriate API based on the USE_MOCK_SERVICE flag
export default api;
