import type { CategoryListFilters } from './types/category.types';
import { createStableKey } from '@/shared/lib/react-query/stable-key';

export const categoryKeys = {
  all: ['categories'] as const,
  list: (params: { page: number; pageSize: number; filters: CategoryListFilters }) => [
    ...categoryKeys.all,
    'list',
    createStableKey(params),
  ] as const,
  detail: (id: string) => [...categoryKeys.all, 'detail', id] as const,
  options: () => [...categoryKeys.all, 'options'] as const,
};
