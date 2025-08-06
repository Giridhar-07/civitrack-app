// Import necessary modules and types
import { AxiosInstance, AxiosError, AxiosResponse } from 'axios';
import mockService from './mockService';
import { extractErrorMessage } from '../utils/apiErrorHandler';
import { createRetryableAxiosInstance } from '../utils/apiRetry';

// Check if we should use mock service
export const USE_MOCK_SERVICE: boolean = true; // Set to true to use mock service until backend is working
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

// Create a mock API adapter with proper type handling
const mockApi = {
  get: async <T>(url: string, config?: any): Promise<{ data: T }> => {
    console.log(`Mock GET request to ${url}`);
    if (url === '/auth/me') {
      const data = await mockService.getCurrentUser();
      return { data: data as T };
    }
    if (url === '/issues') {
      const data = await mockService.getAllIssues();
      return { data: data as T };
    }
    if (url.startsWith('/issues/')) {
      const id = url.split('/')[2];
      if (id === 'user') {
        const data = await mockService.getIssuesByUser();
        return { data: data as T };
      }
      if (id === 'nearby') {
        const { latitude, longitude, radius } = config?.params || {};
        const data = await mockService.getNearbyIssues(latitude, longitude, radius);
        return { data: data as T };
      }
      const data = await mockService.getIssueById(id);
      return { data: data as T };
    }
    throw new Error(`Unhandled mock GET request to ${url}`);
  },
  post: async <T>(url: string, data?: any, config?: any): Promise<{ data: T }> => {
    console.log(`Mock POST request to ${url}`);
    if (url === '/auth/login') {
      const response = await mockService.login(data.email, data.password);
      return { data: response as T };
    }
    if (url === '/auth/register') {
      const response = await mockService.register(data.username, data.email, data.password);
      return { data: response as T };
    }
    if (url === '/issues') {
      const response = await mockService.createIssue(data);
      return { data: response as T };
    }
    if (/\/issues\/[\w-]+\/flag/.test(url)) {
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
    return { data: response.data };
  },
  post: async <T>(url: string, data?: any, config?: any) => {
    const response = await axiosInstance.post<T>(url, data, config);
    return { data: response.data };
  },
  put: async <T>(url: string, data?: any, config?: any) => {
    const response = await axiosInstance.put<T>(url, data, config);
    return { data: response.data };
  },
  patch: async <T>(url: string, data?: any, config?: any) => {
    const response = await axiosInstance.patch<T>(url, data, config);
    return { data: response.data };
  },
  delete: async <T>(url: string, config?: any) => {
    const response = await axiosInstance.delete<T>(url, config);
    return { data: response.data };
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
        error.code === 'ECONNABORTED' || 
        errorResponse.errorCode === 'NETWORK_ERROR' || 
        errorResponse.errorCode === 'TIMEOUT_ERROR';
      
      // Handle authentication errors (401) specially
      if (errorResponse.statusCode === 401) {
        // Check if this is a request to /auth/me endpoint
        const isAuthMeRequest = error.config?.url?.includes('/auth/me');
        
        // For login endpoint, don't treat 401 as a network error
        const isLoginRequest = error.config?.url?.includes('/auth/login');
        
        // Clear token and redirect to login only if it's not the /auth/me endpoint
        // or if explicitly specified in the error response
        // Also don't logout if it's a network error
        if (!isAuthMeRequest && !isNetworkError && !isLoginRequest) {
          localStorage.removeItem('token');
          // Only redirect if we're in a browser environment
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
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
