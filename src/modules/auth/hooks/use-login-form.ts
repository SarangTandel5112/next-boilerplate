'use client';

import type { LoginFormValues } from '../types';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { CSRF_COOKIE_NAME, CSRF_HEADER_NAME } from '@/shared/config/security';
import { loginValidationSchema } from '../schemas';

const defaultValues: LoginFormValues = {
  email: '',
  password: '',
  remember: false,
};

type FormApi = ReturnType<typeof useForm<LoginFormValues>>;

export type UseLoginFormResult = {
  formError?: string;
  isSubmitting: boolean;
  register: FormApi['register'];
  errors: FormApi['formState']['errors'];
  handleSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
};

export const useLoginForm = (): UseLoginFormResult => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formError, setFormError] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { handleSubmit: submitWithValidation, register, formState } = useForm<LoginFormValues>({
    resolver: zodResolver(loginValidationSchema),
    defaultValues,
    mode: 'onTouched',
  });

  const onSubmit = useCallback(async (values: LoginFormValues) => {
    setFormError(undefined);
    setIsSubmitting(true);

    const csrfToken = typeof document === 'undefined'
      ? undefined
      : document.cookie
          .split('; ')
          .find(item => item.startsWith(`${CSRF_COOKIE_NAME}=`))
          ?.split('=')
          .slice(1)
          .join('=');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(csrfToken ? { [CSRF_HEADER_NAME]: decodeURIComponent(csrfToken) } : {}),
        },
        credentials: 'include',
        body: JSON.stringify({
          email: values.email,
          password: values.password,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null) as {
          error?: {
            message?: string;
          };
          requestId?: string;
        } | null;

        const requestIdMessage = data?.requestId ? ` (Request ID: ${data.requestId})` : '';
        setFormError((data?.error?.message ?? 'Invalid credentials') + requestIdMessage);
        setIsSubmitting(false);
        return;
      }

      const nextPath = searchParams.get('next');
      const safePath = nextPath?.startsWith('/admin') ? nextPath : '/admin';

      router.replace(safePath);
      router.refresh();
    } catch {
      setFormError('Unable to sign in');
      setIsSubmitting(false);
    }
  }, [router, searchParams]);

  const onInvalid = useCallback(() => {
    setFormError('Please correct the highlighted fields before continuing.');
  }, []);

  const handleSubmit = useMemo(
    () => submitWithValidation(onSubmit, onInvalid),
    [onInvalid, onSubmit, submitWithValidation],
  );

  return {
    formError,
    isSubmitting,
    register,
    errors: formState.errors,
    handleSubmit,
  };
};
