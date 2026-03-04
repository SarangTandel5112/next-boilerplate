'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { categoryKeys } from '../query-keys';
import { toggleCategoryActive } from '../services';

export const useToggleCategory = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (id: string) => toggleCategoryActive(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.all });
    },
  });

  return {
    isLoading: mutation.isPending,
    execute: mutation.mutateAsync,
  };
};
