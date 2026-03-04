'use client';

import type { CategorySubmitValues } from '../types/category.types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { categoryKeys } from '../query-keys';
import { createCategory } from '../services';

export const useCreateCategory = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: CategorySubmitValues) => createCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.all });
    },
  });

  return {
    isLoading: mutation.isPending,
    execute: mutation.mutateAsync,
  };
};
