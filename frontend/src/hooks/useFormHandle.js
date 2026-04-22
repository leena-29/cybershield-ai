import { useState, useCallback } from 'react';

export const useFormHandle = () => {
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});

  const updateField = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  }, [errors]);

  const setError = useCallback((field, message) => {
    setErrors(prev => ({ ...prev, [field]: message }));
  }, []);

  const reset = useCallback(() => {
    setFormData({});
    setErrors({});
  }, []);

  return {
    formData,
    errors,
    updateField,
    setError,
    reset
  };
};
