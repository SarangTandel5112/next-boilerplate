import type { BrandListQuery, BrandListResult, BrandMutationResult, BrandSubmitValues } from '../domain/types';

export type BrandRepository = {
  list: (query: BrandListQuery) => Promise<BrandListResult>;
  create: (data: BrandSubmitValues) => Promise<BrandMutationResult>;
  update: (id: string, data: BrandSubmitValues) => Promise<BrandMutationResult>;
  delete: (id: string) => Promise<{ message: string }>;
  toggleActive: (id: string) => Promise<BrandMutationResult>;
};
