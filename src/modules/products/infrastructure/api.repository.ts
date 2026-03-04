import type { ProductEntity, ProductListResult, ProductMutationResult } from '../domain/types';
import type { ProductRepository } from './repository.interface';
import { httpAdapter } from '@/shared/lib/api';

export const productApiRepository: ProductRepository = {
  list: async (query) => {
    return httpAdapter.request<ProductListResult>({
      url: '/products',
      method: 'GET',
      params: {
        page: query.page,
        pageSize: query.pageSize,
        search: query.filters.search,
        category: query.filters.category,
        brand: query.filters.brand,
        status: query.filters.status,
      },
    });
  },
  getById: async (id) => {
    return httpAdapter.request<ProductEntity>({
      url: `/products/${id}`,
      method: 'GET',
    });
  },
  create: async (data) => {
    return httpAdapter.request<ProductMutationResult>({
      url: '/products',
      method: 'POST',
      data,
    });
  },
  update: async (id, data) => {
    return httpAdapter.request<ProductMutationResult>({
      url: `/products/${id}`,
      method: 'PUT',
      data,
    });
  },
  delete: async (id) => {
    await httpAdapter.request({
      url: `/products/${id}`,
      method: 'PATCH',
      data: { isDeleted: true },
    });

    return { message: 'Product deleted successfully' };
  },
  getFilterMeta: async () => {
    return httpAdapter.request<{ brands: string[]; categories: string[] }>({
      url: '/products/filter-meta',
      method: 'GET',
    });
  },
};
