'use client';

import type { BrandSubmitValues } from '../types/brand.types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { brandKeys } from '../query-keys';
import { createBrand } from '../services';

export const useCreateBrand = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: BrandSubmitValues) => createBrand(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: brandKeys.all });
    },
  });

  return {
    isLoading: mutation.isPending,
    execute: mutation.mutateAsync,
  };
};
