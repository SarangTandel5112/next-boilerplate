import type { ProductListFilters } from '@/modules/products/types';
import dynamic from 'next/dynamic';
import { getProductFilterMeta, listProducts } from '@/modules/products/services/product.service';
import { APP_CONFIG } from '@/shared/config/app-config';

const ProductsAdminPageView = dynamic(
  () => import('@/modules/products/components/ProductsAdminPage').then(module => module.ProductsAdminPage),
);

const getSearchParamValue = (value?: string | string[]) => {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
};

const parsePage = (value?: string) => {
  const parsed = Number(value);

  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
};

const parseStatus = (value?: string): ProductListFilters['status'] => {
  if (value === 'active' || value === 'inactive') {
    return value;
  }

  return 'all';
};

export default async function AdminProductsPage(props: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const searchParams = await props.searchParams;
  const filters: ProductListFilters = {
    search: getSearchParamValue(searchParams.q) ?? '',
    brand: getSearchParamValue(searchParams.brand) ?? 'all',
    category: getSearchParamValue(searchParams.category) ?? 'all',
    status: parseStatus(getSearchParamValue(searchParams.status)),
  };

  const initialQuery = {
    page: parsePage(getSearchParamValue(searchParams.page)),
    pageSize: APP_CONFIG.pagination.defaultPageSize,
    filters,
  };

  const [initialListData, initialFilterMeta] = await Promise.all([
    listProducts(initialQuery).catch(() => undefined),
    getProductFilterMeta().catch(() => undefined),
  ]);

  return (
    <ProductsAdminPageView
      initialListData={initialListData}
      initialFilterMeta={initialFilterMeta}
      initialQuery={initialQuery}
    />
  );
}
