import type { BrandListFilters } from './types/brand.types';
import { createStableKey } from '@/shared/lib/react-query/stable-key';

export const brandKeys = {
  all: ['brands'] as const,
  list: (params: { page: number; pageSize: number; filters: BrandListFilters }) => [
    ...brandKeys.all,
    'list',
    createStableKey(params),
  ] as const,
  detail: (id: string) => [...brandKeys.all, 'detail', id] as const,
};
