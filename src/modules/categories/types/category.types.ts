import type * as z from 'zod';
import type { categoryFormSchema } from '../schemas/category.schema';

export type CategoryEntity = {
  id: string;
  name: string;
  slug: string;
  description: string;
  parentCategoryId?: string;
  isActive: boolean;
  sortOrder: number;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CategoryFormValues = z.input<typeof categoryFormSchema>;

export type CategorySubmitValues = z.output<typeof categoryFormSchema>;

export type CategoryListFilters = {
  search: string;
  status: 'all' | 'active' | 'inactive';
};

export type CategoryListQuery = {
  page: number;
  pageSize: number;
  filters: CategoryListFilters;
};

export type CategoryListResult = {
  items: CategoryEntity[];
  total: number;
  page: number;
  pageSize: number;
};

export type CategoryMutationResult = {
  category: CategoryEntity;
  message: string;
};
