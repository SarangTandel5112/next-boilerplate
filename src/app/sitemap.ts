import type { MetadataRoute } from 'next';
import { Env } from '@/shared/config/env';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = Env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
  const routes = [
    '/',
    '/admin/products',
    '/admin/products/create',
    '/admin/categories',
    '/admin/brands',
    '/login',
  ];

  return routes.map(route => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
  }));
}
