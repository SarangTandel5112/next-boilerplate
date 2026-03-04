import type { ProductEntity, ProductListQuery, ProductListResult, ProductMutationResult, ProductSubmitValues } from '../domain/types';
import { normalizeApiError } from '@/shared/lib/api';
import { resolveProductRepository } from '../infrastructure/repository.factory';
import { productIdSchema, productSubmitSchema } from '../schemas/product.schema';

const withUseCaseGuard = async <T>(handler: () => Promise<T>) => {
  try {
    return await handler();
  } catch (error) {
    throw normalizeApiError(error);
  }
};

const sanitizePayload = (data: ProductSubmitValues): ProductSubmitValues => {
  return {
    ...data,
    name: data.name.trim(),
    sku: data.sku.trim().toUpperCase(),
    category: data.category.trim(),
    brand: data.brand.trim(),
    description: data.description.trim(),
    sae: data.sae.trim(),
    api: data.api.trim(),
    acea: data.acea.trim(),
    oemApprovals: data.oemApprovals.map(item => item.trim()).filter(Boolean),
    viscosity: data.viscosity.trim(),
    baseOilType: data.baseOilType.trim(),
    packSize: data.packSize.trim(),
    unit: data.unit.trim(),
    tierPricing: data.tierPricing.map(item => ({
      tierName: item.tierName.trim(),
      minQty: item.minQty,
      price: item.price,
    })),
  };
};

export const listProducts = async (query: ProductListQuery): Promise<ProductListResult> => {
  return withUseCaseGuard(async () => {
    return resolveProductRepository().list(query);
  });
};

export const getProductById = async (id: string): Promise<ProductEntity> => {
  return withUseCaseGuard(async () => {
    const safeId = productIdSchema.parse(id);

    return resolveProductRepository().getById(safeId);
  });
};

export const createProduct = async (data: ProductSubmitValues): Promise<ProductMutationResult> => {
  return withUseCaseGuard(async () => {
    const parsed = productSubmitSchema.parse(data);

    return resolveProductRepository().create(sanitizePayload(parsed));
  });
};

export const updateProduct = async (id: string, data: ProductSubmitValues): Promise<ProductMutationResult> => {
  return withUseCaseGuard(async () => {
    const safeId = productIdSchema.parse(id);
    const parsed = productSubmitSchema.parse(data);

    return resolveProductRepository().update(safeId, sanitizePayload(parsed));
  });
};

export const deleteProduct = async (id: string): Promise<{ message: string }> => {
  return withUseCaseGuard(async () => {
    const safeId = productIdSchema.parse(id);

    return resolveProductRepository().delete(safeId);
  });
};

export const getProductFilterMeta = async (): Promise<{ brands: string[]; categories: string[] }> => {
  return withUseCaseGuard(async () => {
    return resolveProductRepository().getFilterMeta();
  });
};
