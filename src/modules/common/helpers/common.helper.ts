import { Env } from '@/libs/Env';

export const getBaseUrl = () => {
  if (Env.NEXT_PUBLIC_APP_URL) {
    return Env.NEXT_PUBLIC_APP_URL;
  }

  return 'http://localhost:3000';
};

export const isServer = () => {
  return typeof window === 'undefined';
};
