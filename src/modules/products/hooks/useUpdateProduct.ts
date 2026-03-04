'use client';

import type { ProductSubmitValues } from '../types/product.types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { productKeys } from '../query-keys';
import { updateProduct } from '../services/product.service';

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (options: { id: string; data: ProductSubmitValues }) => updateProduct(options.id, options.data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: productKeys.all });
      queryClient.invalidateQueries({ queryKey: productKeys.detail(variables.id) });
    },
  });

  return {
    isLoading: mutation.isPending,
    execute: async (id: string, data: ProductSubmitValues) => mutation.mutateAsync({ id, data }),
  };
};
