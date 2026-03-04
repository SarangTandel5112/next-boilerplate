import type { CategoryListFilters } from '@/modules/categories/types';
import dynamic from 'next/dynamic';
import { listCategories, listCategoryOptions } from '@/modules/categories/services';
import { APP_CONFIG } from '@/shared/config/app-config';

const CategoriesListPageView = dynamic(
  () => import('@/modules/categories/components/CategoriesListView').then(module => module.CategoriesListView),
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

const parseStatus = (value?: string): CategoryListFilters['status'] => {
  if (value === 'active' || value === 'inactive') {
    return value;
  }

  return 'all';
};

export default async function AdminCategoriesPage(props: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const searchParams = await props.searchParams;
  const filters: CategoryListFilters = {
    search: getSearchParamValue(searchParams.q) ?? '',
    status: parseStatus(getSearchParamValue(searchParams.status)),
  };

  const initialQuery = {
    page: parsePage(getSearchParamValue(searchParams.page)),
    pageSize: APP_CONFIG.pagination.defaultPageSize,
    filters,
  };

  const [initialListData, initialOptions] = await Promise.all([
    listCategories(initialQuery).catch(() => undefined),
    listCategoryOptions().catch(() => undefined),
  ]);

  return (
    <CategoriesListPageView
      initialListData={initialListData}
      initialOptions={initialOptions}
      initialQuery={initialQuery}
    />
  );
}
