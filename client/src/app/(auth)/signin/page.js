'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SignInSchema } from '@/lib/validation-schemas';
import Link from 'next/link';

function useSignIn() {
  const [statusMessage, setStatusMessage] = useState('');
  const [processing, setProcessing] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const router = useRouter();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setProcessing(true);
    setValidationErrors({});

    const formData = new FormData(event.target);
    const data = {
      email: formData.get('email'),
      password: formData.get('password'),
    };

    try {
      await SignInSchema.validate(data, { abortEarly: false });

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/signin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.error) {
        setStatusMessage(`Error: ${result.error}`);
        setProcessing(false);
      } else {
        setStatusMessage('Successfully authenticated!');
        router.push('/dashboard');
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

function StatusMessage({ message }) {
  if (!message) return null;

  const messageClass = message.includes('Error')
    ? 'bg-red-100 text-red-700 border border-red-500'
    : 'bg-green-100 text-green-700 border border-green-500';

  return (
    <div className={`mt-4 w-full text-center p-3 rounded ${messageClass}`}>
      <p>{message}</p>
    </div>
  );
}

function ValidationError({ error }) {
  return error ? <p className="text-red-500">{error}</p> : null;
}

export default function SignInPage() {
  const {
    statusMessage,
    processing,
    validationErrors,
    handleSubmit,
  } = useSignIn();

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 text-center">
        Sign In
      </h1>
      <form onSubmit={handleSubmit} className="flex flex-col items-center rounded max-w-[400px] mx-auto space-y-4">
        <input
          type="email"
          name="email"
          placeholder="Email"
          className="w-full border rounded h-10 px-3"
          required
        />
        <ValidationError error={validationErrors.email} />

        <input
          type="password"
          name="password"
          placeholder="Password"
          className="w-full border rounded h-10 px-3"
          required
        />
        <ValidationError error={validationErrors.password} />

        <button
          type="submit"
          className={`w-full font-bold py-2 px-4 rounded ${processing ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600 text-white'}`}
          disabled={processing}
        >
          Sign In
        </button>

        <StatusMessage message={statusMessage} />
      </form>

      <p className="mt-4 text-center text-gray-600">
        Don&apos;t have an account?{' '}
        <Link href="/signup" className="text-blue-500 hover:text-blue-700 font-bold">
          Sign Up!
        </Link>
      </p>
    </div>
  );
}
