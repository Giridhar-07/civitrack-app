import api, { USE_MOCK_SERVICE } from './api';
import { User } from '../types';
import mockService from './mockService';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  username: string;
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

const authService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    try {
      console.log('Attempting login with credentials:', { email: credentials.email, passwordLength: credentials.password.length });
      
      // Use mock service if enabled
      if (USE_MOCK_SERVICE) {
        console.log('Using mock service for login');
        const mockResponse = await mockService.login(credentials.email, credentials.password);
        const { token, user } = mockResponse;
        
        if (!token) {
          console.warn('No token received in mock login response');
          throw new Error('Authentication failed');
        }
        
        localStorage.setItem('token', token);
        console.log('Mock token stored in localStorage');
        
        // Dispatch a storage event to notify other components about the token change
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new StorageEvent('storage', {
            key: 'token',
            newValue: token,
            oldValue: null,
            storageArea: localStorage
          }));
        }
        
        return { user, token };
      }
      
      // Use real API
      const response = await api.post<AuthResponse>('/auth/login', credentials);
      
      // Log successful login response
      console.log('Login successful, response:', response.data);
      
      // Store token in localStorage
      if (response.data && response.data.token) {
        localStorage.setItem('token', response.data.token);
        console.log('Token stored in localStorage');
        
        // Dispatch a storage event to notify other components about the token change
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new StorageEvent('storage', {
            key: 'token',
            newValue: response.data.token,
            oldValue: null,
            storageArea: localStorage
          }));
        }
      } else {
        console.warn('No token received in login response');
      }
      
      return response.data;
    } catch (error: any) {
      // Enhanced error logging with specific handling for timeout errors
      if (error.code === 'ECONNABORTED' || (error.message && error.message.includes('timeout'))) {
        console.error('Login API timeout error:', error.message);
        // Throw a more user-friendly error for network issues
        const networkError = new Error('Network connection issue. Please check your internet connection and try again.');
        networkError.errorCode = 'NETWORK_ERROR';
        throw networkError;
      } else if (!error.response) {
        console.error('Login API network error:', error.message);
        const networkError = new Error('Unable to connect to the server. Please try again later.');
        networkError.errorCode = 'NETWORK_ERROR';
        throw networkError;
      } else if (error.response?.status === 401 || error.statusCode === 401 || error.status === 401) {
        // Handle authentication errors properly
        console.error('Login API authentication error:', error.message);
        const authError = new Error(error.response?.data?.message || 'Invalid email or password');
        (authError as any).status = 401;
        throw authError;
      } else {
        console.error('Login API error:', error.response?.data || error.message);
        throw error;
      }
    }
  },

  register: async (userData: RegisterData): Promise<AuthResponse> => {
    try {
      const response = await api.post<AuthResponse>('/auth/register', userData);
      // Store token in localStorage
      localStorage.setItem('token', response.data.token);
      return response.data;
    } catch (error: any) {
      // Enhanced error logging with specific handling for timeout errors
      if (error.code === 'ECONNABORTED' || (error.message && error.message.includes('timeout'))) {
        console.error('Register API timeout error:', error.message);
        // Throw a more user-friendly error for network issues
        const networkError = new Error('Network connection issue. Please check your internet connection and try again.');
        networkError.errorCode = 'NETWORK_ERROR';
        throw networkError;
      } else if (!error.response) {
        console.error('Register API network error:', error.message);
        const networkError = new Error('Unable to connect to the server. Please try again later.');
        networkError.errorCode = 'NETWORK_ERROR';
        throw networkError;
      } else {
        console.error('Register API error:', error.response?.data || error.message);
        throw error;
      }
    }
  },

  logout: (): void => {
    // Remove token from localStorage
    console.log('Logging out user, removing token');
    localStorage.removeItem('token');
    console.log('Token removed from localStorage');
    
    // Dispatch a storage event to notify other components about the token change
    if (typeof window !== 'undefined') {
      // Create and dispatch a storage event to notify other components
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'token',
        newValue: null,
        oldValue: 'removed-token',
        storageArea: localStorage
      }));
    }
    
    // Clear any other auth-related data from localStorage if needed
    // localStorage.removeItem('user');
    
    // Optionally, you could make a logout API call here if the backend needs to invalidate the token
    // try {
    //   await api.post('/auth/logout');
    // } catch (error) {
    //   console.error('Logout API error:', error);
    // }
  },

  getCurrentUser: async (): Promise<User | null> => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('No token found, user is not authenticated');
        return null;
      }

      console.log('Token found, fetching current user');
      
      // Use mock service if enabled
      if (USE_MOCK_SERVICE) {
        console.log('Using mock service for getCurrentUser');
        const mockUser = await mockService.getCurrentUser();
        console.log('Mock user data received:', mockUser);
        return mockUser;
      }
      
      // Use real API
      const response = await api.get<User>('/auth/me');
      console.log('Current user data received:', response.data);
      return response.data;
    } catch (error: any) {
      // Enhanced error logging with specific handling for timeout errors
      if (error.code === 'ECONNABORTED' || (error.message && error.message.includes('timeout'))) {
        console.error('Get current user API timeout error:', error.message);
        // Throw a more user-friendly error for network issues
        const networkError = new Error('Network connection issue. Please check your internet connection and try again.');
        networkError.errorCode = 'NETWORK_ERROR';
        throw networkError;
      } else if (!error.response) {
        console.error('Get current user API network error:', error.message);
        const networkError = new Error('Unable to connect to the server. Please try again later.');
        networkError.errorCode = 'NETWORK_ERROR';
        throw networkError;
      } else if (error.response?.status === 401 || error.response?.status === 403) {
        // For 401/403 errors, clear the token
        console.error('Get current user API unauthorized error');
        localStorage.removeItem('token');
        return null;
      } else {
        console.error('Get current user API error:', error.response?.data || error.message);
        throw error;
      }
    }
  },

  isAuthenticated: (): boolean => {
    const token = localStorage.getItem('token');
    const isAuth = token !== null;
    console.log('Authentication check:', isAuth ? 'User is authenticated' : 'User is not authenticated');
    return isAuth;
  }
};

export default authService;