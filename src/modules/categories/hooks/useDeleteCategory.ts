'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { categoryKeys } from '../query-keys';
import { deleteCategory } from '../services';

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (id: string) => deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.all });
    },
  });

  return {
    isLoading: mutation.isPending,
    execute: mutation.mutateAsync,
  };
};
