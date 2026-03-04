'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { brandKeys } from '../query-keys';
import { toggleBrandActive } from '../services';

export const useToggleBrand = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (id: string) => toggleBrandActive(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: brandKeys.all });
    },
  });

  return {
    isLoading: mutation.isPending,
    execute: mutation.mutateAsync,
  };
};
