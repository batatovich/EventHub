'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthForm } from '@/lib/hooks/useAuthForm';
import { FormInput } from '@/components/auth/FormInput';
import { SignUpSchema } from '@/lib/validation-schemas';
import { FormButton } from '@/components/auth/FormButton';
import { useTranslations } from '@/lib/hooks/useTranslations';
import { StatusMessage } from '@/components/auth/StatusMessage';
import LoadingIndicator from '@/components/home/LoadingIndicator';

export default function SignUpPage() {
  const router = useRouter();

  const { statusMessage, processing, validationErrors, handleSubmit } = useAuthForm(SignUpSchema, submitForm);

  const translations =  useTranslations('auth/signup');
   
  if (!translations) {
    return <LoadingIndicator />;
  }

  async function submitForm(data) {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (result.status === 'success') {
      router.push(`/${translations.lang}/signin`);
    } 

    return result;
  }

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
        <Link href={`/${translations.lang}/signin`} className="text-blue-500 hover:text-blue-700 font-bold">
          {translations.signIn}
        </Link>
      </p>
    </div>
  );
}
