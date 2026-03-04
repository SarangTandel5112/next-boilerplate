import type { BrandEntity, BrandListQuery, BrandListResult, BrandMutationResult, BrandSubmitValues } from '../types/brand.types';
import { ApiError } from '@/shared/lib/api';
import { brandFormSchema, brandIdSchema } from '../schemas/brand.schema';

// Temporary in-memory brand service used during setup.
// Replace with application/infrastructure implementation once module development resumes.
const sortBrands = (brands: BrandEntity[]) => {
  return [...brands].sort((first, second) => {
    if (first.sortOrder !== second.sortOrder) {
      return first.sortOrder - second.sortOrder;
    }

    return first.name.localeCompare(second.name);
  });
};

const now = () => new Date().toISOString();

const createSeedBrands = (): BrandEntity[] => {
  const timestamp = now();

  return [
    {
      id: '00000000-0000-0000-0000-000000000001',
      name: 'Motul',
      slug: 'motul',
      logoUrl: '',
      description: 'Lubricant specialist',
      isActive: true,
      sortOrder: 1,
      isDeleted: false,
      createdAt: timestamp,
      updatedAt: timestamp,
    },
    {
      id: '00000000-0000-0000-0000-000000000002',
      name: 'Castrol',
      slug: 'castrol',
      logoUrl: '',
      description: 'Performance oils',
      isActive: true,
      sortOrder: 2,
      isDeleted: false,
      createdAt: timestamp,
      updatedAt: timestamp,
    },
  ];
};

let brandStore: BrandEntity[] = createSeedBrands();

const findBrandIndex = (id: string) => {
  return brandStore.findIndex(item => item.id === id && !item.isDeleted);
};

const ensureUniqueSlug = (slug: string, excludeId?: string) => {
  const duplicate = brandStore.find((item) => {
    if (item.isDeleted) {
      return false;
    }

    if (excludeId && item.id === excludeId) {
      return false;
    }

    return item.slug === slug;
  });

  if (duplicate) {
    throw new ApiError({
      message: 'Slug already exists',
      statusCode: 409,
    });
  }
};

export const listBrands = (query: BrandListQuery): Promise<BrandListResult> => {
  const search = query.filters.search.trim().toLowerCase();
  const allItems = sortBrands(brandStore).filter((item) => {
    if (item.isDeleted) {
      return false;
    }

    if (query.filters.status === 'active' && !item.isActive) {
      return false;
    }

    if (query.filters.status === 'inactive' && item.isActive) {
      return false;
    }

    if (!search) {
      return true;
    }

    return item.name.toLowerCase().includes(search) || item.slug.toLowerCase().includes(search);
  });

  const start = (query.page - 1) * query.pageSize;
  const items = allItems.slice(start, start + query.pageSize);

  return Promise.resolve({
    items,
    total: allItems.length,
    page: query.page,
    pageSize: query.pageSize,
  });
};

export const createBrand = (data: BrandSubmitValues): Promise<BrandMutationResult> => {
  const parsed = brandFormSchema.parse(data);
  ensureUniqueSlug(parsed.slug);

  const timestamp = now();
  const brand: BrandEntity = {
    id: crypto.randomUUID(),
    name: parsed.name,
    slug: parsed.slug,
    logoUrl: parsed.logoUrl,
    description: parsed.description,
    isActive: parsed.isActive,
    sortOrder: parsed.sortOrder,
    isDeleted: false,
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  brandStore = sortBrands([...brandStore, brand]);

  return Promise.resolve({
    brand,
    message: 'Brand created successfully',
  });
};

export const updateBrand = (id: string, data: BrandSubmitValues): Promise<BrandMutationResult> => {
  const safeId = brandIdSchema.parse(id);
  const parsed = brandFormSchema.parse(data);
  const index = findBrandIndex(safeId);

  if (index < 0) {
    throw new ApiError({
      message: 'Brand not found',
      statusCode: 404,
    });
  }

  ensureUniqueSlug(parsed.slug, safeId);

  const currentBrand = brandStore[index];

  if (!currentBrand) {
    throw new ApiError({
      message: 'Brand not found',
      statusCode: 404,
    });
  }

  const updatedBrand: BrandEntity = {
    ...currentBrand,
    name: parsed.name,
    slug: parsed.slug,
    logoUrl: parsed.logoUrl,
    description: parsed.description,
    isActive: parsed.isActive,
    sortOrder: parsed.sortOrder,
    updatedAt: now(),
  };

  const nextStore = [...brandStore];
  nextStore[index] = updatedBrand;
  brandStore = sortBrands(nextStore);

  return Promise.resolve({
    brand: updatedBrand,
    message: 'Brand updated successfully',
  });
};

export const toggleBrandActive = (id: string): Promise<BrandMutationResult> => {
  const safeId = brandIdSchema.parse(id);
  const index = findBrandIndex(safeId);

  if (index < 0) {
    throw new ApiError({
      message: 'Brand not found',
      statusCode: 404,
    });
  }

  const currentBrand = brandStore[index];

  if (!currentBrand) {
    throw new ApiError({
      message: 'Brand not found',
      statusCode: 404,
    });
  }

  const updatedBrand: BrandEntity = {
    ...currentBrand,
    isActive: !currentBrand.isActive,
    updatedAt: now(),
  };

  const nextStore = [...brandStore];
  nextStore[index] = updatedBrand;
  brandStore = sortBrands(nextStore);

  return Promise.resolve({
    brand: updatedBrand,
    message: 'Brand status updated successfully',
  });
};

export const deleteBrand = (id: string): Promise<{ message: string }> => {
  const safeId = brandIdSchema.parse(id);
  const index = findBrandIndex(safeId);

  if (index < 0) {
    throw new ApiError({
      message: 'Brand not found',
      statusCode: 404,
    });
  }

  const currentBrand = brandStore[index];

  if (!currentBrand) {
    throw new ApiError({
      message: 'Brand not found',
      statusCode: 404,
    });
  }

  const nextStore = [...brandStore];
  nextStore[index] = {
    ...currentBrand,
    isDeleted: true,
    updatedAt: now(),
  };
  brandStore = nextStore;

  return Promise.resolve({
    message: 'Brand deleted successfully',
  });
};
