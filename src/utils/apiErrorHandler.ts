import { AxiosError } from 'axios';
import { isNetworkError } from './networkUtils';

/**
 * Interface for standardized API error response
 */
export interface ApiErrorResponse {
  message: string;
  statusCode?: number;
  errorCode?: string;
  fieldErrors?: Record<string, string[]>;
}

/**
 * Extracts a user-friendly error message from an Axios error
 * @param error - The error object from an API request
 * @returns A standardized error response object
 */
export const extractErrorMessage = (error: unknown): ApiErrorResponse => {
  // Default error message
  const defaultError: ApiErrorResponse = {
    message: 'An unexpected error occurred. Please try again.',
  };

  // If not an error object, return default
  if (!error) {
    return defaultError;
  }

  // Handle Axios errors
  if (isAxiosError(error)) {
    // Get response data if available
    const responseData = error.response?.data;
    
    // If response has data with error information
    if (responseData) {
      // Handle different error response formats
      if (typeof responseData === 'string') {
        return { message: responseData, statusCode: error.response?.status };
      }
      
      // Handle structured error responses
      if ((responseData as any)?.message || (responseData as any)?.error) {
        return {
          message: (responseData as any).message || (responseData as any).error,
          statusCode: error.response?.status,
          errorCode: (responseData as any).code || (responseData as any).errorCode,
          fieldErrors: (responseData as any).fieldErrors || (responseData as any).errors
        };
      }
    }

    // Handle network errors using our utility function
    if (isNetworkError(error)) {
      // Differentiate between timeout and other network errors
      if (error.code === 'ECONNABORTED') {
        return { 
          message: 'Request timed out. Please check your internet connection and try again later.', 
          errorCode: 'TIMEOUT_ERROR' 
        };
      }
      
      return {
        message: 'Network connection issue. Please check your internet connection and try again.',
        errorCode: 'NETWORK_ERROR'
      };
    }

    if (!error.response) {
      return { 
        message: 'Network error. Please check your connection and try again.', 
        errorCode: 'NETWORK_ERROR' 
      };
    }

    // Handle specific HTTP status codes
    const status = error.response.status;
    if (status === 401) {
      // Check if this is a login request
      const isLoginRequest = error.config?.url?.includes('/auth/login');
      if (isLoginRequest) {
        return { message: 'Invalid email or password.', statusCode: status };
      } else {
        return { message: 'Authentication required. Please log in again.', statusCode: status };
      }
    }
    if (status === 403) {
      return { message: 'You do not have permission to perform this action.', statusCode: status };
    }
    if (status === 404) {
      return { message: 'The requested resource was not found.', statusCode: status };
    }
    if (status === 422) {
      return { 
        message: 'Validation error. Please check your input.', 
        statusCode: status,
        fieldErrors: (responseData as any)?.errors || {}
      };
    }
    if (status >= 500) {
      return { message: 'A server error occurred. Please try again later.', statusCode: status };
    }

    return { 
      message: 'An error occurred with your request.', 
      statusCode: status 
    };
  }

  // Handle standard Error objects
  if (error instanceof Error) {
    return { message: error.message };
  }

  // Handle string errors
  if (typeof error === 'string') {
    return { message: error };
  }

  return defaultError;
};

/**
 * Type guard to check if an error is an Axios error
 */
export const isAxiosError = (error: any): error is AxiosError => {
  return error && error.isAxiosError === true;
};

/**
 * Formats field errors into a user-friendly format
 * @param fieldErrors - Object containing field validation errors
 * @returns An object with field names as keys and error messages as values
 */
export const formatFieldErrors = (fieldErrors?: Record<string, string[]>): Record<string, string> => {
  if (!fieldErrors) return {};
  
  return Object.entries(fieldErrors).reduce((acc, [field, errors]) => {
    acc[field] = Array.isArray(errors) ? errors[0] : errors as unknown as string;
    return acc;
  }, {} as Record<string, string>);
};