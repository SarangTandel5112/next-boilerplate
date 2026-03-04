import type { BrandEntity } from '../domain/types';
import type { BrandRepository } from './repository.interface';
import { APP_CONFIG } from '@/shared/config/app-config';
import { ApiError } from '@/shared/lib/api';

const STORAGE_KEY = 'admin-brands-v1';

const seedBrand = (options: {
  idSuffix: number;
  name: string;
  slug: string;
  logoUrl: string;
  description: string;
  isActive?: boolean;
  sortOrder?: number;
}): BrandEntity => {
  const now = new Date().toISOString();

  return {
    id: `00000000-0000-4000-8000-${String(options.idSuffix).padStart(12, '0')}`,
    name: options.name,
    slug: options.slug,
    logoUrl: options.logoUrl,
    description: options.description,
    isActive: options.isActive ?? true,
    sortOrder: options.sortOrder ?? 0,
    isDeleted: false,
    createdAt: now,
    updatedAt: now,
  };
};

const initialBrands = [
  seedBrand({ idSuffix: 101, name: 'Shell', slug: 'shell', logoUrl: 'https://picsum.photos/seed/brand-shell/120/120', description: 'Shell lubricant portfolio', sortOrder: 1 }),
  seedBrand({ idSuffix: 102, name: 'Castrol', slug: 'castrol', logoUrl: 'https://picsum.photos/seed/brand-castrol/120/120', description: 'Castrol industrial range', sortOrder: 2 }),
  seedBrand({ idSuffix: 103, name: 'Mobil', slug: 'mobil', logoUrl: 'https://picsum.photos/seed/brand-mobil/120/120', description: 'Mobil premium solutions', sortOrder: 3 }),
  seedBrand({ idSuffix: 104, name: 'Valvoline', slug: 'valvoline', logoUrl: 'https://picsum.photos/seed/brand-valvoline/120/120', description: 'Valvoline product line', sortOrder: 4 }),
];

const isBrowser = () => typeof window !== 'undefined';
let memoryStore = initialBrands;

const readStore = () => {
  if (!isBrowser()) {
    return memoryStore;
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);

  if (!raw) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(memoryStore));
    return memoryStore;
  }

  try {
    const parsed = JSON.parse(raw) as BrandEntity[];
    memoryStore = parsed;
    return parsed;
  } catch {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(memoryStore));
    return memoryStore;
  }
};

const writeStore = (brands: BrandEntity[]) => {
  memoryStore = brands;

  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(brands));
};

const assertUnique = (brands: BrandEntity[], options: { name: string; slug: string; ignoreId?: string }) => {
  const normalizedName = options.name.trim().toLowerCase();
  const normalizedSlug = options.slug.trim().toLowerCase();

  const found = brands.find(item => item.id !== options.ignoreId && !item.isDeleted && (item.name.trim().toLowerCase() === normalizedName || item.slug.trim().toLowerCase() === normalizedSlug));

  if (found) {
    throw new ApiError({
      message: 'Brand name or slug already exists',
      statusCode: 409,
    });
  }
};

export const brandLocalRepository: BrandRepository = {
  list: async (query) => {
    const safePage = Math.max(1, query.page);
    const safePageSize = Math.max(1, Math.min(query.pageSize, APP_CONFIG.pagination.maxPageSize));

    const normalizedSearch = query.filters.search.trim().toLowerCase();
    const filtered = readStore()
      .filter(item => !item.isDeleted)
      .filter((item) => {
        if (query.filters.status !== 'all') {
          const status = item.isActive ? 'active' : 'inactive';
          if (query.filters.status !== status) {
            return false;
          }
        }

        if (!normalizedSearch) {
          return true;
        }

        return `${item.name} ${item.slug}`.toLowerCase().includes(normalizedSearch);
      })
      .sort((left, right) => left.sortOrder - right.sortOrder || left.name.localeCompare(right.name));

    const start = (safePage - 1) * safePageSize;

    return {
      items: filtered.slice(start, start + safePageSize),
      total: filtered.length,
      page: safePage,
      pageSize: safePageSize,
    };
  },
  create: async (data) => {
    const brands = readStore();
    assertUnique(brands, data);

    const now = new Date().toISOString();
    const brand: BrandEntity = {
      id: crypto.randomUUID(),
      name: data.name,
      slug: data.slug,
      logoUrl: data.logoUrl,
      description: data.description,
      isActive: data.isActive,
      sortOrder: data.sortOrder,
      isDeleted: false,
      createdAt: now,
      updatedAt: now,
    };

    writeStore([brand, ...brands]);

    return {
      brand,
      message: 'Brand created successfully',
    };
  },
  update: async (id, data) => {
    const brands = readStore();
    const target = brands.find(item => item.id === id && !item.isDeleted);

    if (!target) {
      throw new ApiError({
        message: 'Brand not found',
        statusCode: 404,
      });
    }

    assertUnique(brands, {
      ...data,
      ignoreId: id,
    });

    const updated: BrandEntity = {
      ...target,
      name: data.name,
      slug: data.slug,
      logoUrl: data.logoUrl,
      description: data.description,
      isActive: data.isActive,
      sortOrder: data.sortOrder,
      updatedAt: new Date().toISOString(),
    };

    writeStore(brands.map(item => (item.id === id ? updated : item)));

    return {
      brand: updated,
      message: 'Brand updated successfully',
    };
  },
  delete: async (id) => {
    const brands = readStore();
    const target = brands.find(item => item.id === id && !item.isDeleted);

    if (!target) {
      throw new ApiError({
        message: 'Brand not found',
        statusCode: 404,
      });
    }

    writeStore(brands.map(item => (item.id === id
      ? {
          ...item,
          isDeleted: true,
          updatedAt: new Date().toISOString(),
        }
      : item)));

    return {
      message: 'Brand deleted successfully',
    };
  },
  toggleActive: async (id) => {
    const brands = readStore();
    const target = brands.find(item => item.id === id && !item.isDeleted);

    if (!target) {
      throw new ApiError({
        message: 'Brand not found',
        statusCode: 404,
      });
    }

    const updated: BrandEntity = {
      ...target,
      isActive: !target.isActive,
      updatedAt: new Date().toISOString(),
    };

    writeStore(brands.map(item => (item.id === id ? updated : item)));

    return {
      brand: updated,
      message: 'Brand status updated',
    };
  },
};
