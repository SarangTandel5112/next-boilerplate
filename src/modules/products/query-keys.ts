import type { ProductListFilters } from './types/product.types';
import { createStableKey } from '@/shared/lib/react-query/stable-key';

export const productKeys = {
  all: ['products'] as const,
  filterMeta: () => [...productKeys.all, 'filter-meta'] as const,
  list: (params: { page: number; pageSize: number; filters: ProductListFilters }) => [
    ...productKeys.all,
    'list',
    createStableKey(params),
  ] as const,
  detail: (id: string) => [...productKeys.all, 'detail', id] as const,
};
