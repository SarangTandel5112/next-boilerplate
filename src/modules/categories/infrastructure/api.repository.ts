import type { CategoryListResult, CategoryMutationResult } from '../domain/types';
import type { CategoryRepository } from './repository.interface';
import { httpAdapter } from '@/shared/lib/api';

export const categoryApiRepository: CategoryRepository = {
  list: async (query) => {
    return httpAdapter.request<CategoryListResult>({
      url: '/categories',
      method: 'GET',
      params: {
        page: query.page,
        pageSize: query.pageSize,
        search: query.filters.search,
        status: query.filters.status,
      },
    });
  },
  listOptions: async () => {
    return httpAdapter.request<Array<{ id: string; name: string }>>({
      url: '/categories/options',
      method: 'GET',
    });
  },
  create: async (data) => {
    return httpAdapter.request<CategoryMutationResult>({
      url: '/categories',
      method: 'POST',
      data,
    });
  },
  update: async (id, data) => {
    return httpAdapter.request<CategoryMutationResult>({
      url: `/categories/${id}`,
      method: 'PUT',
      data,
    });
  },
  delete: async (id) => {
    await httpAdapter.request({
      url: `/categories/${id}`,
      method: 'PATCH',
      data: { isDeleted: true },
    });

    return { message: 'Category deleted successfully' };
  },
  toggleActive: async (id) => {
    return httpAdapter.request<CategoryMutationResult>({
      url: `/categories/${id}/toggle-active`,
      method: 'PATCH',
    });
  },
};
