'use client';

import type { ApiError } from '@/shared/lib/api';
import { useQuery } from '@tanstack/react-query';
import { productKeys } from '../query-keys';
import { getProductById } from '../services/product.service';

export const useProductById = (id: string) => {
  const query = useQuery({
    queryKey: productKeys.detail(id),
    queryFn: () => getProductById(id),
    enabled: Boolean(id),
  });

  return {
    data: query.data,
    isLoading: query.isPending,
    isError: query.isError,
    errorMessage: (query.error as ApiError | null)?.message,
  };
};
