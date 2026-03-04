import type * as z from 'zod';
import type { brandFormSchema } from '../schemas/brand.schema';

export type BrandEntity = {
  id: string;
  name: string;
  slug: string;
  logoUrl: string;
  description: string;
  isActive: boolean;
  sortOrder: number;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
};

export type BrandFormValues = z.input<typeof brandFormSchema>;

export type BrandSubmitValues = z.output<typeof brandFormSchema>;

export type BrandListFilters = {
  search: string;
  status: 'all' | 'active' | 'inactive';
};

export type BrandListQuery = {
  page: number;
  pageSize: number;
  filters: BrandListFilters;
};

export type BrandListResult = {
  items: BrandEntity[];
  total: number;
  page: number;
  pageSize: number;
};

export type BrandMutationResult = {
  brand: BrandEntity;
  message: string;
};
