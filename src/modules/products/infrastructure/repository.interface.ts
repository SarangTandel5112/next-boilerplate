import type { ProductEntity, ProductListQuery, ProductListResult, ProductMutationResult, ProductSubmitValues } from '../domain/types';

export type ProductRepository = {
  list: (query: ProductListQuery) => Promise<ProductListResult>;
  getById: (id: string) => Promise<ProductEntity>;
  create: (data: ProductSubmitValues) => Promise<ProductMutationResult>;
  update: (id: string, data: ProductSubmitValues) => Promise<ProductMutationResult>;
  delete: (id: string) => Promise<{ message: string }>;
  getFilterMeta: () => Promise<{ brands: string[]; categories: string[] }>;
};
