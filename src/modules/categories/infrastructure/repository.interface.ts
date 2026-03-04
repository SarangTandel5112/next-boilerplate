import type { CategoryListQuery, CategoryListResult, CategoryMutationResult, CategorySubmitValues } from '../domain/types';

export type CategoryRepository = {
  list: (query: CategoryListQuery) => Promise<CategoryListResult>;
  listOptions: () => Promise<Array<{ id: string; name: string }>>;
  create: (data: CategorySubmitValues) => Promise<CategoryMutationResult>;
  update: (id: string, data: CategorySubmitValues) => Promise<CategoryMutationResult>;
  delete: (id: string) => Promise<{ message: string }>;
  toggleActive: (id: string) => Promise<CategoryMutationResult>;
};
