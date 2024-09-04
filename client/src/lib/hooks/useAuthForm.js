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
        // Validate data locally before submitting to backend
        await validationSchema.validate(data, { abortEarly: false });

        // Submit to backend
        const response = await submitCallback(data);

        // Handle backend validation errors or sucess
        if (response.status === 'fail') {
          setStatusMessage(`Fail: ${response.data.message}`);
        } else if (response.status === 'error') {
          setStatusMessage(`Error: ${response.message}`);
        } else {
          setStatusMessage(`Success: ${response.data.message}`);
        }
        setProcessing(false);
      } catch (error) {
        // Handle frontend validation errors
        if (error.name === 'ValidationError') {
          const formattedErrors = error.inner.reduce((acc, err) => {
            acc[err.path] = err.message;
            return acc;
          }, {});
          setValidationErrors(formattedErrors);
        } else {
          console.log(error);
          setStatusMessage('An unexpected error occurred. Please try again.');
        }
        setProcessing(false);
      }
    };

    return {
      statusMessage,
      processing,
      validationErrors,
      handleSubmit,
    };
  }
