import type { BrandListResult, BrandMutationResult } from '../domain/types';
import type { BrandRepository } from './repository.interface';
import { httpAdapter } from '@/shared/lib/api';

export const brandApiRepository: BrandRepository = {
  list: async (query) => {
    return httpAdapter.request<BrandListResult>({
      url: '/brands',
      method: 'GET',
      params: {
        page: query.page,
        pageSize: query.pageSize,
        search: query.filters.search,
        status: query.filters.status,
      },
    });
  },
  create: async (data) => {
    return httpAdapter.request<BrandMutationResult>({
      url: '/brands',
      method: 'POST',
      data,
    });
  },
  update: async (id, data) => {
    return httpAdapter.request<BrandMutationResult>({
      url: `/brands/${id}`,
      method: 'PUT',
      data,
    });
  },
  delete: async (id) => {
    await httpAdapter.request({
      url: `/brands/${id}`,
      method: 'PATCH',
      data: { isDeleted: true },
    });

    return { message: 'Brand deleted successfully' };
  },
  toggleActive: async (id) => {
    return httpAdapter.request<BrandMutationResult>({
      url: `/brands/${id}/toggle-active`,
      method: 'PATCH',
    });
  },
};
