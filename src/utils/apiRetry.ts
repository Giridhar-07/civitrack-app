import axios, { AxiosError, AxiosRequestConfig, AxiosRequestHeaders, AxiosResponse } from 'axios';

/**
 * Configuration options for the retry mechanism
 */
export interface RetryConfig {
  /** Maximum number of retry attempts */
  maxRetries: number;
  
  /** Initial delay in milliseconds before the first retry */
  initialDelayMs: number;
  
  /** Factor by which to increase the delay with each retry attempt */
  backoffFactor: number;
  
  /** Maximum delay in milliseconds between retries */
  maxDelayMs: number;
  
  /** HTTP status codes that should trigger a retry */
  retryStatusCodes: number[];
  
  /** Whether to retry on network errors */
  retryNetworkErrors: boolean;
}

/**
 * Default retry configuration
 */
export const defaultRetryConfig: RetryConfig = {
  maxRetries: 5,
  initialDelayMs: 1000, // 1 second
  backoffFactor: 1.5, // Reduced from 2 to 1.5 for more gradual backoff
  maxDelayMs: 30000, // 30 seconds
  retryStatusCodes: [408, 429, 500, 502, 503, 504, 520, 521, 522, 523, 524], // Added Cloudflare error codes
  retryNetworkErrors: true
};

/**
 * Creates an axios instance with retry capability
 * @param config - Axios request configuration
 * @param retryConfig - Retry mechanism configuration
 * @returns Axios instance with retry capability
 */
export const createRetryableAxiosInstance = (
  config: AxiosRequestConfig = {},
  retryConfig: Partial<RetryConfig> = {}
) => {
  // Merge default retry config with provided config
  const finalRetryConfig: RetryConfig = {
    ...defaultRetryConfig,
    ...retryConfig
  };
  
  // Create axios instance
  const instance = axios.create(config);
  
  // Add response interceptor for retry logic
  instance.interceptors.response.use(
    // Return successful responses as-is
    (response: AxiosResponse) => response,
    
    // Handle errors with retry logic
    async (error: AxiosError) => {
      const { config, response } = error;
      
      // If no config object is available, we can't retry
      if (!config) {
        return Promise.reject(error);
      }
      
      // Initialize retry count if not already set
      const retryCount = config.headers?.['x-retry-count'] ? 
        Number(config.headers['x-retry-count']) : 0;
      
      // Check if we should retry based on status code or network error
      const shouldRetryStatusCode = response && 
        finalRetryConfig.retryStatusCodes.includes(response.status);
      
      // Include ECONNABORTED (timeout) errors in retry logic
      const isNetworkError = !response && 
        (error.code === 'ECONNABORTED' || (error.code !== 'ECONNABORTED' && finalRetryConfig.retryNetworkErrors));
      
      const shouldRetry = (shouldRetryStatusCode || isNetworkError) && 
        retryCount < finalRetryConfig.maxRetries;
      
      // If we shouldn't retry, reject with the original error
      if (!shouldRetry) {
        return Promise.reject(error);
      }
      
      // Calculate delay with exponential backoff
      const delay = Math.min(
        finalRetryConfig.initialDelayMs * Math.pow(finalRetryConfig.backoffFactor, retryCount),
        finalRetryConfig.maxDelayMs
      );
      
      // Wait for the calculated delay
      await new Promise(resolve => setTimeout(resolve, delay));
      
      // Update retry count in headers
      if (!config.headers) {
        config.headers = {} as AxiosRequestHeaders;
      }
      config.headers['x-retry-count'] = String(retryCount + 1);
      
      // Log retry attempt in development
      if (process.env.NODE_ENV === 'development') {
        console.log(`Retrying request (${retryCount + 1}/${finalRetryConfig.maxRetries}): ${config.method?.toUpperCase()} ${config.url}`);
      }
      
      // Retry the request
      return instance(config);
    }
  );
  
  return instance;
};

/**
 * Executes a function with retry capability
 * @param fn - Async function to execute with retry capability
 * @param retryConfig - Retry configuration
 * @returns Promise that resolves with the function result or rejects after all retries fail
 */
export const withRetry = async <T>(
  fn: () => Promise<T>,
  retryConfig: Partial<RetryConfig> = {}
): Promise<T> => {
  const config: RetryConfig = {
    ...defaultRetryConfig,
    ...retryConfig
  };
  
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt < config.maxRetries + 1; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      // If this was the last attempt, don't delay, just throw
      if (attempt >= config.maxRetries) {
        break;
      }
      
      // Calculate delay with exponential backoff
      const delay = Math.min(
        config.initialDelayMs * Math.pow(config.backoffFactor, attempt),
        config.maxDelayMs
      );
      
      // Log retry attempt in development
      if (process.env.NODE_ENV === 'development') {
        console.log(`Retry attempt ${attempt + 1}/${config.maxRetries} after ${delay}ms`);
      }
      
      // Wait before next attempt
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  // If we get here, all retries failed
  throw lastError;
};