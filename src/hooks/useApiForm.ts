import { useState, useCallback } from 'react';
import { ApiErrorResponse, extractErrorMessage, formatFieldErrors } from '../utils/apiErrorHandler';

interface FormState<T> {
  /** Form data */
  data: T;
  /** Whether the form is currently submitting */
  submitting: boolean;
  /** Whether the form submission was successful */
  submitted: boolean;
  /** General error message */
  error: string | null;
  /** Field-specific validation errors */
  fieldErrors: Record<string, string>;
}

interface FormOptions<T> {
  /** Initial form data */
  initialData: T;
  /** Validation function to run before submission */
  validate?: (data: T) => Record<string, string> | null;
  /** Callback to run on successful submission */
  onSuccess?: (response: any) => void;
  /** Callback to run on submission error */
  onError?: (error: ApiErrorResponse) => void;
  /** Whether to reset the form after successful submission */
  resetOnSuccess?: boolean;
}

/**
 * Custom hook for handling form submissions with API calls
 * @param submitFn - The API call function to execute on form submission
 * @param options - Configuration options for the form
 * @returns Form state and handler functions
 */
const useApiForm = <T extends Record<string, any>, R = any>(
  submitFn: (data: T) => Promise<R>,
  options: FormOptions<T>
) => {
  const {
    initialData,
    validate,
    onSuccess,
    onError,
    resetOnSuccess = false
  } = options;

  const [state, setState] = useState<FormState<T>>({
    data: initialData,
    submitting: false,
    submitted: false,
    error: null,
    fieldErrors: {}
  });

  // Handle form input changes
  const handleChange = useCallback(
    (field: keyof T, value: any) => {
      setState(prev => ({
        ...prev,
        data: { ...prev.data, [field]: value },
        // Clear field error when field is changed
        fieldErrors: {
          ...prev.fieldErrors,
          [field]: ''
        }
      }));
    },
    []
  );

  // Handle form submission
  const handleSubmit = useCallback(
    async (e?: React.FormEvent) => {
      if (e) {
        e.preventDefault();
      }

      // Run validation if provided
      if (validate) {
        const validationErrors = validate(state.data);
        if (validationErrors) {
          setState(prev => ({
            ...prev,
            fieldErrors: validationErrors,
            error: 'Please fix the errors in the form.'
          }));
          return null;
        }
      }

      // Set submitting state
      setState(prev => ({
        ...prev,
        submitting: true,
        error: null,
        fieldErrors: {}
      }));

      try {
        // Submit the form data
        const response = await submitFn(state.data);

        // Update state on success
        setState(prev => ({
          ...prev,
          submitting: false,
          submitted: true,
          error: null,
          // Reset data if resetOnSuccess is true
          data: resetOnSuccess ? initialData : prev.data
        }));

        // Call onSuccess callback if provided
        if (onSuccess) {
          onSuccess(response);
        }

        return response;
      } catch (error) {
        // Extract standardized error
        const apiError = extractErrorMessage(error);
        
        // Format field errors if available
        const formattedFieldErrors = formatFieldErrors(apiError.fieldErrors);

        // Update state with error information
        setState(prev => ({
          ...prev,
          submitting: false,
          error: apiError.message,
          fieldErrors: formattedFieldErrors
        }));

        // Call onError callback if provided
        if (onError) {
          onError(apiError);
        }

        return null;
      }
    },
    [state.data, validate, submitFn, initialData, resetOnSuccess, onSuccess, onError]
  );

  // Reset the form to initial state
  const resetForm = useCallback(() => {
    setState({
      data: initialData,
      submitting: false,
      submitted: false,
      error: null,
      fieldErrors: {}
    });
  }, [initialData]);

  return {
    ...state,
    handleChange,
    handleSubmit,
    resetForm,
    // Helper function to set multiple fields at once
    setFields: useCallback((fields: Partial<T>) => {
      setState(prev => ({
        ...prev,
        data: { ...prev.data, ...fields }
      }));
    }, [])
  };
};

export default useApiForm;