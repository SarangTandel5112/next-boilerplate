'use client';

import type { BrandListFilters, BrandListResult } from '../types/brand.types';
import type { ApiError } from '@/shared/lib/api';
import { useQuery } from '@tanstack/react-query';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { APP_CONFIG } from '@/shared/config/app-config';
import { brandKeys } from '../query-keys';
import { listBrands } from '../services';

const MASTER_DATA_STALE_TIME_MS = 10 * 60 * 1000;

const parsePage = (value: string | null) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
};

const parseFilters = (params: URLSearchParams): BrandListFilters => {
  return {
    search: params.get('q') ?? '',
    status: (params.get('status') as BrandListFilters['status']) ?? 'all',
  };
};

type UseBrandsListOptions = {
  initialListData?: BrandListResult;
  initialQuery?: {
    page: number;
    pageSize: number;
    filters: BrandListFilters;
  };
};

const hasMatchingInitialQuery = (
  initialQuery: UseBrandsListOptions['initialQuery'],
  query: { page: number; pageSize: number; filters: BrandListFilters },
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

export const useBrandsList = (options?: UseBrandsListOptions) => {
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
    queryKey: brandKeys.list(query),
    queryFn: () => listBrands(query),
    staleTime: MASTER_DATA_STALE_TIME_MS,
    initialData: canUseInitialListData ? options?.initialListData : undefined,
  });

  const updateParams = useCallback((options: {
    page?: number;
    search?: string;
    status?: BrandListFilters['status'];
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
    isLoading: listQuery.isPending,
    isError: listQuery.isError,
    errorMessage: (listQuery.error as ApiError | null)?.message,
    page,
    pageSize,
    filters,
    searchInput,
    setSearchInput,
    onPageChange: (nextPage: number) => {
      updateParams({ page: nextPage });
    },
    onStatusChange: (status: BrandListFilters['status']) => {
      updateParams({
        page: 1,
        status,
      });
    },
    retry: () => {
      listQuery.refetch();
    },
  };
};
