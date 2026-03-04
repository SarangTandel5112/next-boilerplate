import type { BrandListQuery, BrandListResult, BrandMutationResult, BrandSubmitValues } from '../domain/types';
import { normalizeApiError } from '@/shared/lib/api';
import { resolveBrandRepository } from '../infrastructure/repository.factory';
import { brandFormSchema, brandIdSchema } from '../schemas';

const withUseCaseGuard = async <T>(handler: () => Promise<T>) => {
  try {
    return await handler();
  } catch (error) {
    throw normalizeApiError(error);
  }
};

const sanitizePayload = (data: BrandSubmitValues): BrandSubmitValues => {
  return {
    ...data,
    name: data.name.trim(),
    slug: data.slug.trim().toLowerCase(),
    logoUrl: data.logoUrl.trim(),
    description: data.description.trim(),
  };
};

export const listBrands = async (query: BrandListQuery): Promise<BrandListResult> => {
  return withUseCaseGuard(async () => {
    return resolveBrandRepository().list(query);
  });
};

export const createBrand = async (data: BrandSubmitValues): Promise<BrandMutationResult> => {
  return withUseCaseGuard(async () => {
    const parsed = brandFormSchema.parse(data);

    return resolveBrandRepository().create(sanitizePayload(parsed));
  });
};

export const updateBrand = async (id: string, data: BrandSubmitValues): Promise<BrandMutationResult> => {
  return withUseCaseGuard(async () => {
    const safeId = brandIdSchema.parse(id);
    const parsed = brandFormSchema.parse(data);

    return resolveBrandRepository().update(safeId, sanitizePayload(parsed));
  });
};

export const deleteBrand = async (id: string): Promise<{ message: string }> => {
  return withUseCaseGuard(async () => {
    const safeId = brandIdSchema.parse(id);

    return resolveBrandRepository().delete(safeId);
  });
};

export const toggleBrandActive = async (id: string): Promise<BrandMutationResult> => {
  return withUseCaseGuard(async () => {
    const safeId = brandIdSchema.parse(id);

    return resolveBrandRepository().toggleActive(safeId);
  });
};
