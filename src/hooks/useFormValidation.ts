import { useState, useCallback } from 'react';

type ValidationRule<T> = (value: any, formData: T) => string | null;
type ValidationRules<T> = Record<keyof T, ValidationRule<T>[]>;
type ValidationErrors<T> = Partial<Record<keyof T, string>>;

interface ValidationOptions<T> {
  /** Initial form data */
  initialData: T;
  /** Validation rules for each field */
  validationRules: ValidationRules<T>;
  /** Whether to validate on change */
  validateOnChange?: boolean;
  /** Whether to validate all fields or stop at first error */
  validateAllFields?: boolean;
}

/**
 * Custom hook for form validation
 * @param options - Validation configuration options
 * @returns Validation state and handler functions
 */
const useFormValidation = <T extends Record<string, any>>(
  options: ValidationOptions<T>
) => {
  const {
    initialData,
    validationRules,
    validateOnChange = true,
    validateAllFields = true
  } = options;

  const [formData, setFormData] = useState<T>(initialData);
  const [errors, setErrors] = useState<ValidationErrors<T>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});
  const [isValid, setIsValid] = useState<boolean>(false);

  // Validate a single field
  const validateField = useCallback(
    (field: keyof T, value: any): string | null => {
      if (!validationRules[field]) return null;

      for (const rule of validationRules[field]) {
        const error = rule(value, formData);
        if (error) return error;
      }

      return null;
    },
    [formData, validationRules]
  );

  // Validate all fields
  const validateForm = useCallback((): boolean => {
    const newErrors: ValidationErrors<T> = {};
    let formIsValid = true;

    // Check each field with its validation rules
    for (const field in validationRules) {
      const fieldKey = field as keyof T;
      const error = validateField(fieldKey, formData[fieldKey]);

      if (error) {
        newErrors[fieldKey] = error;
        formIsValid = false;

        // If not validating all fields, stop at first error
        if (!validateAllFields) break;
      }
    }

    setErrors(newErrors);
    setIsValid(formIsValid);
    return formIsValid;
  }, [formData, validateField, validateAllFields, validationRules]);

  // Handle field change
  const handleChange = useCallback(
    (field: keyof T, value: any) => {
      const newFormData = { ...formData, [field]: value };
      setFormData(newFormData);

      // Mark field as touched
      if (!touched[field]) {
        setTouched(prev => ({ ...prev, [field]: true }));
      }

      // Validate on change if enabled
      if (validateOnChange) {
        const error = validateField(field, value);
        setErrors(prev => ({ ...prev, [field]: error }));

        // Check if the entire form is valid
        const newErrors = { ...errors, [field]: error };
        setIsValid(!Object.values(newErrors).some(error => error !== null && error !== undefined));
      }
    },
    [formData, touched, validateOnChange, validateField, errors]
  );

  // Handle field blur
  const handleBlur = useCallback(
    (field: keyof T) => {
      // Mark field as touched
      if (!touched[field]) {
        setTouched(prev => ({ ...prev, [field]: true }));
      }

      // Validate field on blur
      const error = validateField(field, formData[field]);
      setErrors(prev => ({ ...prev, [field]: error }));

      // Check if the entire form is valid
      const newErrors = { ...errors, [field]: error };
      setIsValid(!Object.values(newErrors).some(error => error !== null && error !== undefined));
    },
    [formData, touched, validateField, errors]
  );

  // Reset form to initial state
  const resetForm = useCallback(() => {
    setFormData(initialData);
    setErrors({});
    setTouched({});
    setIsValid(false);
  }, [initialData]);

  // Set multiple fields at once
  const setFields = useCallback(
    (fields: Partial<T>) => {
      const newFormData = { ...formData, ...fields };
      setFormData(newFormData);

      // Mark fields as touched
      const newTouched = { ...touched };
      for (const field in fields) {
        newTouched[field as keyof T] = true;
      }
      setTouched(newTouched);

      // Validate fields if enabled
      if (validateOnChange) {
        const newErrors = { ...errors };
        let formIsValid = true;

        for (const field in fields) {
          const fieldKey = field as keyof T;
          const error = validateField(fieldKey, fields[fieldKey]);
          newErrors[fieldKey] = error ?? undefined;
          if (error) formIsValid = false;
        }

        setErrors(newErrors);
        setIsValid(formIsValid);
      }
    },
    [formData, touched, validateOnChange, validateField, errors]
  );

  return {
    // Form state
    formData,
    errors,
    touched,
    isValid,
    
    // Handlers
    handleChange,
    handleBlur,
    validateForm,
    resetForm,
    setFields,
    
    // Helper to get error state for a field
    getFieldError: useCallback(
      (field: keyof T): { error: boolean; helperText: string | null } => {
        return {
          error: Boolean(touched[field] && errors[field]),
          helperText: touched[field] ? errors[field] || null : null
        };
      },
      [errors, touched]
    )
  };
};

// Common validation rules
const validationRules = {
  required: (message = 'This field is required') => (
    (value: any) => {
      if (value === null || value === undefined || value === '') {
        return message;
      }
      if (Array.isArray(value) && value.length === 0) {
        return message;
      }
      return null;
    }
  ),
  
  minLength: (min: number, message = `Must be at least ${min} characters`) => (
    (value: string) => {
      if (!value || value.length < min) {
        return message;
      }
      return null;
    }
  ),
  
  maxLength: (max: number, message = `Must be at most ${max} characters`) => (
    (value: string) => {
      if (value && value.length > max) {
        return message;
      }
      return null;
    }
  ),
  
  email: (message = 'Please enter a valid email address') => (
    (value: string) => {
      if (!value) return null;
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      return emailRegex.test(value) ? null : message;
    }
  ),
  
  pattern: (regex: RegExp, message = 'Invalid format') => (
    (value: string) => {
      if (!value) return null;
      return regex.test(value) ? null : message;
    }
  ),
  
  match: (fieldToMatch: string, message = 'Fields do not match') => (
    (value: any, formData: Record<string, any>) => {
      return value === formData[fieldToMatch] ? null : message;
    }
  ),
  
  custom: (validationFn: (value: any, formData: Record<string, any>) => string | null) => (
    (value: any, formData: Record<string, any>) => validationFn(value, formData)
  )
};

export default useFormValidation;
export { validationRules };
export type { ValidationRule, ValidationRules, ValidationErrors };