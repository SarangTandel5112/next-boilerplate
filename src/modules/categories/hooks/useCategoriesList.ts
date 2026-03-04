'use client';

import type { CategoryListFilters, CategoryListResult } from '../types/category.types';
import type { ApiError } from '@/shared/lib/api';
import { useQuery } from '@tanstack/react-query';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { APP_CONFIG } from '@/shared/config/app-config';
import { categoryKeys } from '../query-keys';
import { listCategories, listCategoryOptions } from '../services';

const MASTER_DATA_STALE_TIME_MS = 10 * 60 * 1000;

const parsePage = (value: string | null) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
};

const parseFilters = (params: URLSearchParams): CategoryListFilters => {
  return {
    search: params.get('q') ?? '',
    status: (params.get('status') as CategoryListFilters['status']) ?? 'all',
  };
};

type UseCategoriesListOptions = {
  initialListData?: CategoryListResult;
  initialOptions?: Array<{ id: string; name: string }>;
  initialQuery?: {
    page: number;
    pageSize: number;
    filters: CategoryListFilters;
  };
};

const hasMatchingInitialQuery = (
  initialQuery: UseCategoriesListOptions['initialQuery'],
  query: { page: number; pageSize: number; filters: CategoryListFilters },
) => {
  if (!initialQuery) {
    return false;
  }

  return (
    initialQuery.page === query.page
    && initialQuery.pageSize === query.pageSize
    && initialQuery.filters.search === query.filters.search
    && initialQuery.filters.status === query.filters.status
  );
};

export const useCategoriesList = (options?: UseCategoriesListOptions) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchParamsString = searchParams.toString();

  const page = parsePage(searchParams.get('page'));
  const pageSize = APP_CONFIG.pagination.defaultPageSize;
  const filters = useMemo(() => parseFilters(new URLSearchParams(searchParamsString)), [searchParamsString]);
  const [searchInput, setSearchInput] = useState(filters.search);
  const query = useMemo(
    () => ({
      page,
      pageSize,
      filters,
    }),
    [filters, page, pageSize],
  );
  const canUseInitialListData = hasMatchingInitialQuery(options?.initialQuery, query);

  const listQuery = useQuery({
    queryKey: categoryKeys.list(query),
    queryFn: () => listCategories(query),
    staleTime: MASTER_DATA_STALE_TIME_MS,
    initialData: canUseInitialListData ? options?.initialListData : undefined,
  });

  const optionsQuery = useQuery({
    queryKey: categoryKeys.options(),
    queryFn: listCategoryOptions,
    staleTime: MASTER_DATA_STALE_TIME_MS,
    initialData: options?.initialOptions,
  });

  const updateParams = useCallback((options: {
    page?: number;
    search?: string;
    status?: CategoryListFilters['status'];
  }) => {
    const next = new URLSearchParams(searchParamsString);

    if (typeof options.page === 'number') {
      next.set('page', String(options.page));
    }

    if (typeof options.search === 'string') {
      const value = options.search.trim();
      if (value) {
        next.set('q', value);
      } else {
        next.delete('q');
      }
    }

    if (typeof options.status === 'string') {
      if (options.status === 'all') {
        next.delete('status');
      } else {
        next.set('status', options.status);
      }
    }

    const query = next.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }, [pathname, router, searchParamsString]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      updateParams({
        page: 1,
        search: searchInput,
      });
    }, 500);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [searchInput, updateParams]);

  return {
    data: listQuery.data,
    isLoading: listQuery.isPending || optionsQuery.isPending,
    isError: listQuery.isError || optionsQuery.isError,
    errorMessage: (listQuery.error as ApiError | null)?.message ?? (optionsQuery.error as ApiError | null)?.message,
    page,
    pageSize,
    filters,
    searchInput,
    setSearchInput,
    parentOptions: optionsQuery.data ?? [],
    onPageChange: (nextPage: number) => {
      updateParams({ page: nextPage });
    },
    onStatusChange: (status: CategoryListFilters['status']) => {
      updateParams({
        page: 1,
        status,
      });
    },
    retry: () => {
      listQuery.refetch();
      optionsQuery.refetch();
    },
  };
};
