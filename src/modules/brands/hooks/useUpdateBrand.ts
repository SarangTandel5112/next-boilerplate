'use client';

import type { BrandSubmitValues } from '../types/brand.types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { brandKeys } from '../query-keys';
import { updateBrand } from '../services';

export const useUpdateBrand = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (options: { id: string; data: BrandSubmitValues }) => updateBrand(options.id, options.data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: brandKeys.all });
      queryClient.invalidateQueries({ queryKey: brandKeys.detail(variables.id) });
    },
  });

  return {
    isLoading: mutation.isPending,
    execute: (id: string, data: BrandSubmitValues) => mutation.mutateAsync({ id, data }),
  };
};
