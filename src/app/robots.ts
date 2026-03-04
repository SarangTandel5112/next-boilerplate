import type { MetadataRoute } from 'next';
import { Env } from '@/shared/config/env';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = Env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
  return {
    rules: {
      userAgent: '*',
      allow: '/',
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
