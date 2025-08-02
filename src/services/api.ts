import axios from 'axios';
import mockService from './mockService';

// Check if we should use mock service
const USE_MOCK_SERVICE = true; // Set to true to use mock service, false to use real API

// Create an axios instance with default config
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add a request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Create a mock API adapter with proper type handling
const mockApi = {
  get: async <T>(url: string, config?: any): Promise<{ data: T }> => {
    console.log(`Mock GET request to ${url}`);
    
    if (url === '/auth/me') {
      return { data: await mockService.getCurrentUser() as T };
    }
    
    if (url === '/issues') {
      return { data: await mockService.getAllIssues() as T };
    }
    
    if (url.startsWith('/issues/')) {
      const id = url.split('/')[2];
      if (id === 'user') {
        return { data: await mockService.getIssuesByUser() as T };
      }
      if (id === 'nearby') {
        const { latitude, longitude, radius } = config?.params || {};
        return { data: await mockService.getNearbyIssues(latitude, longitude, radius) as T };
      }
      return { data: await mockService.getIssueById(id) as T };
    }
    
    throw new Error(`Unhandled mock GET request to ${url}`);
  },
  
  post: async <T>(url: string, data: any, config?: any): Promise<{ data: T }> => {
    console.log(`Mock POST request to ${url}`);
    
    if (url === '/auth/login') {
      return { data: await mockService.login(data.email, data.password) as T };
    }
    
    if (url === '/auth/register') {
      return { data: await mockService.register(data.username, data.email, data.password) as T };
    }
    
    if (url === '/issues') {
      return { data: await mockService.createIssue(data) as T };
    }
    
    if (url.match(/\/issues\/[\w-]+\/flag/)) {
      const id = url.split('/')[2];
      return { data: await mockService.flagIssue(id, data.reason) as T };
    }
    
    throw new Error(`Unhandled mock POST request to ${url}`);
  },
  
  patch: async <T>(url: string, data: any): Promise<{ data: T }> => {
    console.log(`Mock PATCH request to ${url}`);
    
    if (url.match(/\/issues\/[\w-]+\/status/)) {
      const id = url.split('/')[2];
      return { data: await mockService.updateIssueStatus(id, data.status, data.comment) as T };
    }
    
    throw new Error(`Unhandled mock PATCH request to ${url}`);
  }
};

// Export the appropriate API based on the USE_MOCK_SERVICE flag
export default USE_MOCK_SERVICE ? mockApi : api;