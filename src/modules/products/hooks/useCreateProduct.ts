'use client';

import type { ProductSubmitValues } from '../types/product.types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { productKeys } from '../query-keys';
import { createProduct } from '../services/product.service';

export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: ProductSubmitValues) => createProduct(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.all });
    },
  });

  return {
    isLoading: mutation.isPending,
    execute: mutation.mutateAsync,
  };
};
