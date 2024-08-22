'use client';

import { useRouter } from 'next/navigation';
import { SignInSchema } from '@/lib/validation-schemas';
import { useAuthForm } from '@/lib/hooks/useAuthForm';
import { FormInput } from '@/components/auth/FormInput';
import { FormButton } from '@/components/auth/FormButton';
import { StatusMessage } from '@/components/auth/StatusMessage';
import Link from 'next/link';

export default function SignInPage() {
  const router = useRouter();

  async function submitForm(data) {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/signin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      credentials: 'include',
    });
    
    const result = await response.json();

    if (!result.error) {
      router.push('/my-events');
    }

    return result;
  }

  const { statusMessage, processing, validationErrors, handleSubmit } = useAuthForm(SignInSchema, submitForm);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 text-center">Sign In</h1>
      <form onSubmit={handleSubmit} className="flex flex-col items-center rounded max-w-[400px] mx-auto space-y-4">
        <FormInput name="email" type="email" placeholder="Email" validationError={validationErrors.email} />
        <FormInput name="password" type="password" placeholder="Password" validationError={validationErrors.password} />
        <FormButton label="Sign In" processing={processing} />
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
