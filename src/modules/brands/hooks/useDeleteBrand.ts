'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { brandKeys } from '../query-keys';
import { deleteBrand } from '../services';

export const useDeleteBrand = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (id: string) => deleteBrand(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: brandKeys.all });
    },
  });

  return {
    isLoading: mutation.isPending,
    execute: mutation.mutateAsync,
  };
};
