import type { BrandRepository } from './repository.interface';
import { Env } from '@/shared/config/env';
import { brandApiRepository } from './api.repository';
import { brandLocalRepository } from './local.repository';

export const resolveBrandRepository = (): BrandRepository => {
  const isProduction = Env.NODE_ENV === 'production';
  const hasApiBaseUrl = Boolean(Env.NEXT_PUBLIC_API_BASE_URL);

  if (isProduction && Env.NEXT_PUBLIC_DATA_SOURCE === 'local') {
    throw new Error('[Brands] Local repository is disabled in production');
  }

  if (Env.NEXT_PUBLIC_DATA_SOURCE === 'api') {
    if (!hasApiBaseUrl) {
      throw new Error('[Brands] NEXT_PUBLIC_API_BASE_URL is required when NEXT_PUBLIC_DATA_SOURCE=api');
    }

    return brandApiRepository;
  }

  if (Env.NEXT_PUBLIC_DATA_SOURCE === 'local') {
    return brandLocalRepository;
  }

  if (isProduction && !hasApiBaseUrl) {
    throw new Error('[Brands] NEXT_PUBLIC_API_BASE_URL is required in production');
  }

  return hasApiBaseUrl ? brandApiRepository : brandLocalRepository;
};
