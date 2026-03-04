'use client';

import type { CategorySubmitValues } from '../types/category.types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { categoryKeys } from '../query-keys';
import { updateCategory } from '../services';

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (options: { id: string; data: CategorySubmitValues }) => updateCategory(options.id, options.data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.all });
      queryClient.invalidateQueries({ queryKey: categoryKeys.detail(variables.id) });
    },
  });

  return {
    isLoading: mutation.isPending,
    execute: (id: string, data: CategorySubmitValues) => mutation.mutateAsync({ id, data }),
  };
};
