import type { CategoryListQuery, CategoryListResult, CategoryMutationResult, CategorySubmitValues } from '../domain/types';
import { normalizeApiError } from '@/shared/lib/api';
import { resolveCategoryRepository } from '../infrastructure/repository.factory';
import { categoryFormSchema, categoryIdSchema } from '../schemas/category.schema';

const withUseCaseGuard = async <T>(handler: () => Promise<T>) => {
  try {
    return await handler();
  } catch (error) {
    throw normalizeApiError(error);
  }
};

const sanitizePayload = (data: CategorySubmitValues): CategorySubmitValues => {
  return {
    ...data,
    name: data.name.trim(),
    slug: data.slug.trim().toLowerCase(),
    description: data.description.trim(),
  };
};

export const listCategories = async (query: CategoryListQuery): Promise<CategoryListResult> => {
  return withUseCaseGuard(async () => {
    return resolveCategoryRepository().list(query);
  });
};

export const listCategoryOptions = async (): Promise<Array<{ id: string; name: string }>> => {
  return withUseCaseGuard(async () => {
    return resolveCategoryRepository().listOptions();
  });
};

export const createCategory = async (data: CategorySubmitValues): Promise<CategoryMutationResult> => {
  return withUseCaseGuard(async () => {
    const parsed = categoryFormSchema.parse(data);

    return resolveCategoryRepository().create(sanitizePayload(parsed));
  });
};

export const updateCategory = async (id: string, data: CategorySubmitValues): Promise<CategoryMutationResult> => {
  return withUseCaseGuard(async () => {
    const safeId = categoryIdSchema.parse(id);
    const parsed = categoryFormSchema.parse(data);

    return resolveCategoryRepository().update(safeId, sanitizePayload(parsed));
  });
};

export const deleteCategory = async (id: string): Promise<{ message: string }> => {
  return withUseCaseGuard(async () => {
    const safeId = categoryIdSchema.parse(id);

    return resolveCategoryRepository().delete(safeId);
  });
};

export const toggleCategoryActive = async (id: string): Promise<CategoryMutationResult> => {
  return withUseCaseGuard(async () => {
    const safeId = categoryIdSchema.parse(id);

    return resolveCategoryRepository().toggleActive(safeId);
  });
};
