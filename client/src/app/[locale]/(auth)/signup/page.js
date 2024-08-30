'use client';

import { useRouter } from 'next/navigation';
import { SignUpSchema } from '@/lib/validation-schemas';
import { useAuthForm } from '@/lib/hooks/useAuthForm';
import { FormInput } from '@/components/auth/FormInput';
import { FormButton } from '@/components/auth/FormButton';
import { StatusMessage } from '@/components/auth/StatusMessage';
import { getUserLangFromCookie } from '@/lib/helpers/getUserLang'; 
import Link from 'next/link';

export default function SignUpPage() {
  const router = useRouter();
  const userLang = getUserLangFromCookie();

  const translations = require(`@/locales/${userLang}/auth/signup`).default;

  async function submitForm(data) {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!result.error) {
      router.push(`/${userLang}/signin`);   
    }

    return result;
  }

  const { statusMessage, processing, validationErrors, handleSubmit } = useAuthForm(SignUpSchema, submitForm);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 text-center">{translations.signUp}</h1>
      <form onSubmit={handleSubmit} className="flex flex-col items-center rounded max-w-[400px] mx-auto space-y-4">
        <FormInput name="email" type="email" placeholder={translations.email} validationError={validationErrors.email} />
        <FormInput name="password" type="password" placeholder={translations.password} validationError={validationErrors.password} />
        <FormInput name="confirmPassword" type="password" placeholder={translations.confirmPassword} validationError={validationErrors.confirmPassword} />
        <FormButton label={translations.signUp} processing={processing} />
        <StatusMessage message={statusMessage} />
      </form>

      <p className="mt-4 text-center text-gray-600">
        {translations.alreadyHaveAccount}{' '}
        <Link href={`/${userLang}/signin`} className="text-blue-500 hover:text-blue-700 font-bold">
          {translations.signIn}
        </Link>
      </p>
    </div>
  );
}
