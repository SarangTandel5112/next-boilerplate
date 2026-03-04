import type { ProductRepository } from './repository.interface';
import { Env } from '@/shared/config/env';
import { productApiRepository } from './api.repository';
import { productLocalRepository } from './local.repository';

export const resolveProductRepository = (): ProductRepository => {
  const isProduction = Env.NODE_ENV === 'production';
  const hasApiBaseUrl = Boolean(Env.NEXT_PUBLIC_API_BASE_URL);

  if (isProduction && Env.NEXT_PUBLIC_DATA_SOURCE === 'local') {
    throw new Error('[Products] Local repository is disabled in production');
  }

  if (Env.NEXT_PUBLIC_DATA_SOURCE === 'api') {
    if (!hasApiBaseUrl) {
      throw new Error('[Products] NEXT_PUBLIC_API_BASE_URL is required when NEXT_PUBLIC_DATA_SOURCE=api');
    }

    return productApiRepository;
  }

  if (Env.NEXT_PUBLIC_DATA_SOURCE === 'local') {
    return productLocalRepository;
  }

  if (isProduction && !hasApiBaseUrl) {
    throw new Error('[Products] NEXT_PUBLIC_API_BASE_URL is required in production');
  }

  return hasApiBaseUrl ? productApiRepository : productLocalRepository;
};
