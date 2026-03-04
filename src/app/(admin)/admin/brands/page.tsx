import type { BrandListFilters } from '@/modules/brands/types';
import dynamic from 'next/dynamic';
import { listBrands } from '@/modules/brands/services';
import { APP_CONFIG } from '@/shared/config/app-config';

const BrandsListPageView = dynamic(
  () => import('@/modules/brands/components/BrandsListView').then(module => module.BrandsListView),
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

const parseStatus = (value?: string): BrandListFilters['status'] => {
  if (value === 'active' || value === 'inactive') {
    return value;
  }

  return 'all';
};

export default async function AdminBrandsPage(props: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const searchParams = await props.searchParams;
  const filters: BrandListFilters = {
    search: getSearchParamValue(searchParams.q) ?? '',
    status: parseStatus(getSearchParamValue(searchParams.status)),
  };

  const initialQuery = {
    page: parsePage(getSearchParamValue(searchParams.page)),
    pageSize: APP_CONFIG.pagination.defaultPageSize,
    filters,
  };

  const initialListData = await listBrands(initialQuery).catch(() => undefined);

  return (
    <BrandsListPageView
      initialListData={initialListData}
      initialQuery={initialQuery}
    />
  );
}
