import { useState, useEffect, useCallback } from 'react';
import { AxiosError } from 'axios';
import { ApiErrorResponse, extractErrorMessage } from '../utils/apiErrorHandler';

interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: ApiErrorResponse | null;
}

interface ApiHookOptions {
  /** Whether to fetch data immediately when the hook is mounted */
  immediate?: boolean;
  /** Dependencies array for the useEffect that triggers immediate fetching */
  deps?: any[];
  /** Initial data to use before the first fetch */
  initialData?: any;
  /** Whether to reset data to null when fetching starts */
  resetOnFetch?: boolean;
  /** Callback to run when fetch is successful */
  onSuccess?: (data: any) => void;
  /** Callback to run when fetch fails */
  onError?: (error: ApiErrorResponse) => void;
}

/**
 * Custom hook for making API calls with loading, error, and data states
 * @param apiCall - The API call function to execute
 * @param options - Configuration options for the hook
 * @returns Object containing data, loading state, error state, and execute function
 */
const useApi = <T, P extends any[] = any[]>(
  apiCall: (...params: P) => Promise<T>,
  options: ApiHookOptions = {}
) => {
  const {
    immediate = false,
    deps = undefined,
    initialData = null,
    resetOnFetch = true,
    onSuccess,
    onError
  } = options;

  const [state, setState] = useState<ApiState<T>>({
    data: initialData,
    loading: immediate,
    error: null
  });

  // Function to execute the API call
  const execute = useCallback(
    async (...params: P): Promise<T | null> => {
      try {
        // Set loading state
        setState(prev => ({
          data: resetOnFetch ? null : prev.data,
          loading: true,
          error: null
        }));

        // Execute the API call
        const data = await apiCall(...params);

        // Update state with successful response
        setState({
          data,
          loading: false,
          error: null
        });

        // Call onSuccess callback if provided
        if (onSuccess) {
          onSuccess(data);
        }

        return data;
      } catch (error) {
        // Extract standardized error message
        const apiError = extractErrorMessage(error);

        // Update state with error
        setState({
          data: null,
          loading: false,
          error: apiError
        });

        // Call onError callback if provided
        if (onError) {
          onError(apiError);
        }

        return null;
      }
    },
    [apiCall, resetOnFetch, onSuccess, onError]
  );

  // Execute API call immediately if immediate is true
  useEffect(() => {
    if (immediate) {
      execute(...([] as any as P));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps || ([] as any[]));

  return {
    ...state,
    execute,
    // Helper function to reset the state
    reset: useCallback(() => {
      setState({
        data: initialData,
        loading: false,
        error: null
      });
    }, [initialData])
  };
};

export default useApi;