import type { ProductEntity } from '../domain/types';
import type { ProductRepository } from './repository.interface';
import { APP_CONFIG } from '@/shared/config/app-config';
import { ApiError } from '@/shared/lib/api';

const STORAGE_KEY = 'admin-products-v2';

const createSeedProduct = (index: number): ProductEntity => {
  const id = `00000000-0000-4000-8000-${String(index + 1).padStart(12, '0')}`;
  const now = new Date(Date.now() - index * 86_400_000).toISOString();
  const brand = ['Shell', 'Mobil', 'Castrol', 'Valvoline'][index % 4] ?? 'Shell';
  const category = ['Industrial', 'Automotive', 'Heavy duty'][index % 3] ?? 'Industrial';

  return {
    id,
    name: `${brand} Lubricant ${index + 1}`,
    sku: `SKU-${1000 + index}`,
    category,
    brand,
    description: `${brand} product for ${category.toLowerCase()} operations`,
    sae: index % 2 === 0 ? '5W-30' : '15W-40',
    api: 'API SN',
    acea: 'ACEA C3',
    oemApprovals: ['OEM A', 'OEM B'],
    viscosity: index % 2 === 0 ? 'Medium' : 'High',
    baseOilType: index % 2 === 0 ? 'Synthetic' : 'Semi-synthetic',
    packSize: index % 2 === 0 ? '4' : '20',
    unit: 'L',
    minimumOrderQty: 1,
    basePrice: 40 + index,
    tierPricing: [
      { tierName: 'Dealer', minQty: 10, price: 37 + index },
      { tierName: 'Distributor', minQty: 50, price: 34 + index },
    ],
    isActive: index % 5 !== 0,
    isFeatured: index % 7 === 0,
    isDeleted: false,
    createdAt: now,
    updatedAt: now,
    imageUrl: `https://picsum.photos/seed/lubricant-${index + 1}/640/480`,
  };
};

const createSeedProducts = () => {
  return Array.from({ length: 48 }, (_, index) => createSeedProduct(index));
};

const isBrowser = () => typeof window !== 'undefined';
let memoryStore: ProductEntity[] = createSeedProducts();

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
    const parsed = JSON.parse(raw) as ProductEntity[];
    memoryStore = parsed;
    return parsed;
  } catch {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(memoryStore));
    return memoryStore;
  }
};

const writeStore = (products: ProductEntity[]) => {
  memoryStore = products;

  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
};

const assertSkuUnique = (products: ProductEntity[], sku: string, currentId?: string) => {
  const normalizedSku = sku.trim().toLowerCase();
  const matched = products.find(item => item.sku.toLowerCase() === normalizedSku && item.id !== currentId && !item.isDeleted);

  if (matched) {
    throw new ApiError({
      message: 'SKU already exists',
      statusCode: 409,
    });
  }
};

export const productLocalRepository: ProductRepository = {
  list: async (query) => {
    const safePage = Math.max(1, query.page);
    const safePageSize = Math.max(1, Math.min(query.pageSize, APP_CONFIG.pagination.maxPageSize));

    const products = readStore().filter(item => !item.isDeleted);
    const normalizedSearch = query.filters.search.trim().toLowerCase();
    const filtered = products.filter((item) => {
      const status = item.isActive ? 'active' : 'inactive';

      if (query.filters.status !== 'all' && query.filters.status !== status) {
        return false;
      }

      if (query.filters.category !== 'all' && item.category !== query.filters.category) {
        return false;
      }

      if (query.filters.brand !== 'all' && item.brand !== query.filters.brand) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      return `${item.name} ${item.sku} ${item.brand} ${item.category}`.toLowerCase().includes(normalizedSearch);
    });

    const start = (safePage - 1) * safePageSize;

    return {
      items: filtered.slice(start, start + safePageSize),
      total: filtered.length,
      page: safePage,
      pageSize: safePageSize,
    };
  },
  getById: async (id) => {
    const product = readStore().find(item => item.id === id && !item.isDeleted);

    if (!product) {
      throw new ApiError({
        message: 'Product not found',
        statusCode: 404,
      });
    }

    return product;
  },
  create: async (data) => {
    const products = readStore();
    assertSkuUnique(products, data.sku);

    const now = new Date().toISOString();
    const id = crypto.randomUUID();

    const product: ProductEntity = {
      id,
      ...data,
      isDeleted: false,
      createdAt: now,
      updatedAt: now,
      imageUrl: `https://picsum.photos/seed/${id}/640/480`,
    };

    writeStore([product, ...products]);

    return {
      product,
      message: 'Product created successfully',
    };
  },
  update: async (id, data) => {
    const products = readStore();
    const target = products.find(item => item.id === id && !item.isDeleted);

    if (!target) {
      throw new ApiError({
        message: 'Product not found',
        statusCode: 404,
      });
    }

    assertSkuUnique(products, data.sku, id);

    const updated: ProductEntity = {
      ...target,
      ...data,
      updatedAt: new Date().toISOString(),
    };

    writeStore(products.map(item => (item.id === id ? updated : item)));

    return {
      product: updated,
      message: 'Product updated successfully',
    };
  },
  delete: async (id) => {
    const products = readStore();
    const target = products.find(item => item.id === id && !item.isDeleted);

    if (!target) {
      throw new ApiError({
        message: 'Product not found',
        statusCode: 404,
      });
    }

    const updated = products.map(item => (item.id === id
      ? {
          ...item,
          isDeleted: true,
          updatedAt: new Date().toISOString(),
        }
      : item));

    writeStore(updated);

    return { message: 'Product deleted successfully' };
  },
  getFilterMeta: async () => {
    const products = readStore().filter(item => !item.isDeleted);
    const brands = Array.from(new Set(products.map(item => item.brand))).filter(Boolean).sort((a, b) => a.localeCompare(b));
    const categories = Array.from(new Set(products.map(item => item.category))).filter(Boolean).sort((a, b) => a.localeCompare(b));

    return { brands, categories };
  },
};
