import type { CategoryEntity } from '../domain/types';
import type { CategoryRepository } from './repository.interface';
import { APP_CONFIG } from '@/shared/config/app-config';
import { ApiError } from '@/shared/lib/api';

const STORAGE_KEY = 'admin-categories-v1';

const seedCategory = (options: {
  idSuffix: number;
  name: string;
  slug: string;
  description: string;
  parentCategoryId?: string;
  isActive?: boolean;
  sortOrder?: number;
}): CategoryEntity => {
  const now = new Date().toISOString();

  return {
    id: `00000000-0000-4000-8000-${String(options.idSuffix).padStart(12, '0')}`,
    name: options.name,
    slug: options.slug,
    description: options.description,
    parentCategoryId: options.parentCategoryId,
    isActive: options.isActive ?? true,
    sortOrder: options.sortOrder ?? 0,
    isDeleted: false,
    createdAt: now,
    updatedAt: now,
  };
};

const initialCategories = [
  seedCategory({ idSuffix: 1, name: 'Engine oils', slug: 'engine-oils', description: 'All engine oil products', sortOrder: 1 }),
  seedCategory({ idSuffix: 2, name: 'Industrial oils', slug: 'industrial-oils', description: 'Industrial lubricant category', sortOrder: 2 }),
  seedCategory({ idSuffix: 3, name: 'Hydraulic oils', slug: 'hydraulic-oils', description: 'Hydraulic lubricant family', parentCategoryId: '00000000-0000-4000-8000-000000000002', sortOrder: 3 }),
  seedCategory({ idSuffix: 4, name: 'Greases', slug: 'greases', description: 'Grease category', sortOrder: 4 }),
  seedCategory({ idSuffix: 5, name: 'Transmission oils', slug: 'transmission-oils', description: 'Transmission category', sortOrder: 5 }),
];

const isBrowser = () => typeof window !== 'undefined';
let memoryStore = initialCategories;

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
    const parsed = JSON.parse(raw) as CategoryEntity[];
    memoryStore = parsed;
    return parsed;
  } catch {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(memoryStore));
    return memoryStore;
  }
};

const writeStore = (categories: CategoryEntity[]) => {
  memoryStore = categories;

  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(categories));
};

const assertUnique = (categories: CategoryEntity[], options: { name: string; slug: string; ignoreId?: string }) => {
  const normalizedName = options.name.trim().toLowerCase();
  const normalizedSlug = options.slug.trim().toLowerCase();

  const found = categories.find(item => item.id !== options.ignoreId && !item.isDeleted && (item.name.trim().toLowerCase() === normalizedName || item.slug.trim().toLowerCase() === normalizedSlug));

  if (found) {
    throw new ApiError({
      message: 'Category name or slug already exists',
      statusCode: 409,
    });
  }
};

export const categoryLocalRepository: CategoryRepository = {
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
  listOptions: async () => {
    return readStore()
      .filter(item => !item.isDeleted)
      .map(item => ({ id: item.id, name: item.name }));
  },
  create: async (data) => {
    const categories = readStore();
    assertUnique(categories, data);

    const now = new Date().toISOString();
    const category: CategoryEntity = {
      id: crypto.randomUUID(),
      name: data.name,
      slug: data.slug,
      description: data.description,
      parentCategoryId: data.parentCategoryId,
      isActive: data.isActive,
      sortOrder: data.sortOrder,
      isDeleted: false,
      createdAt: now,
      updatedAt: now,
    };

    writeStore([category, ...categories]);

    return {
      category,
      message: 'Category created successfully',
    };
  },
  update: async (id, data) => {
    const categories = readStore();
    const target = categories.find(item => item.id === id && !item.isDeleted);

    if (!target) {
      throw new ApiError({
        message: 'Category not found',
        statusCode: 404,
      });
    }

    assertUnique(categories, {
      ...data,
      ignoreId: id,
    });

    const updated: CategoryEntity = {
      ...target,
      name: data.name,
      slug: data.slug,
      description: data.description,
      parentCategoryId: data.parentCategoryId,
      isActive: data.isActive,
      sortOrder: data.sortOrder,
      updatedAt: new Date().toISOString(),
    };

    writeStore(categories.map(item => (item.id === id ? updated : item)));

    return {
      category: updated,
      message: 'Category updated successfully',
    };
  },
  delete: async (id) => {
    const categories = readStore();
    const target = categories.find(item => item.id === id && !item.isDeleted);

    if (!target) {
      throw new ApiError({
        message: 'Category not found',
        statusCode: 404,
      });
    }

    writeStore(categories.map(item => (item.id === id
      ? {
          ...item,
          isDeleted: true,
          updatedAt: new Date().toISOString(),
        }
      : item)));

    return {
      message: 'Category deleted successfully',
    };
  },
  toggleActive: async (id) => {
    const categories = readStore();
    const target = categories.find(item => item.id === id && !item.isDeleted);

    if (!target) {
      throw new ApiError({
        message: 'Category not found',
        statusCode: 404,
      });
    }

    const updated: CategoryEntity = {
      ...target,
      isActive: !target.isActive,
      updatedAt: new Date().toISOString(),
    };

    writeStore(categories.map(item => (item.id === id ? updated : item)));

    return {
      category: updated,
      message: 'Category status updated',
    };
  },
};
