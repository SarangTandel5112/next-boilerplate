'use client';

import type { ProductListResult } from '../types/product.types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { productKeys } from '../query-keys';
import { deleteProduct } from '../services/product.service';

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (id: string) => deleteProduct(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: productKeys.all });

      const snapshots = queryClient.getQueriesData<ProductListResult>({
        queryKey: productKeys.all,
      });

      queryClient.setQueriesData<ProductListResult>({
        queryKey: productKeys.all,
      }, (previous) => {
        if (!previous) {
          return previous;
        }

        return {
          ...previous,
          items: previous.items.filter(item => item.id !== id),
          total: Math.max(0, previous.total - 1),
        };
      });

      return { snapshots };
    },
    onError: (_, __, context) => {
      context?.snapshots.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data);
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.all });
    },
  });

  return {
    isLoading: mutation.isPending,
    execute: mutation.mutateAsync,
  };
};
