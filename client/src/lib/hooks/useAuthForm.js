import { useState } from 'react';

export function useAuthForm(validationSchema, submitCallback) {
  const [statusMessage, setStatusMessage] = useState('');
  const [processing, setProcessing] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  const handleSubmit = async (event) => {
    event.preventDefault();
    setProcessing(true);
    setValidationErrors({});
    setStatusMessage('');

    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData.entries());

    try {
      await validationSchema.validate(data, { abortEarly: false });

      const response = await submitCallback(data);

      if (response.error) {
        setStatusMessage(`Error: ${response.error}`);
        setProcessing(false);
      } else {
        setStatusMessage('Success!');
      }
    } catch (error) {
      setProcessing(false);
      if (error.name === 'ValidationError') {
        const formattedErrors = error.inner.reduce((acc, err) => {
          acc[err.path] = err.message;
          return acc;
        }, {});
        setValidationErrors(formattedErrors);
      } else {
        setStatusMessage('An unexpected error occurred. Please try again.');
      }
    }
  };

  return {
    statusMessage,
    processing,
    validationErrors,
    handleSubmit,
  };
}
