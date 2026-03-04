'use client';

import type { ProductListFilters, ProductListResult } from '../types/product.types';
import type { ApiError } from '@/shared/lib/api';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { APP_CONFIG } from '@/shared/config/app-config';
import { productKeys } from '../query-keys';
import { getProductFilterMeta, listProducts } from '../services/product.service';

const getPageFromSearch = (value: string | null) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
};

const getFiltersFromParams = (params: URLSearchParams): ProductListFilters => {
  return {
    search: params.get('q') ?? '',
    brand: params.get('brand') ?? 'all',
    category: params.get('category') ?? 'all',
    status: (params.get('status') as ProductListFilters['status']) ?? 'all',
  };
};

type UseProductsListOptions = {
  initialListData?: ProductListResult;
  initialFilterMeta?: { brands: string[]; categories: string[] };
  initialQuery?: {
    page: number;
    pageSize: number;
    filters: ProductListFilters;
  };
};

const hasMatchingInitialQuery = (
  initialQuery: UseProductsListOptions['initialQuery'],
  query: { page: number; pageSize: number; filters: ProductListFilters },
) => {
  if (!initialQuery) {
    return false;
  }

  return (
    initialQuery.page === query.page
    && initialQuery.pageSize === query.pageSize
    && initialQuery.filters.search === query.filters.search
    && initialQuery.filters.brand === query.filters.brand
    && initialQuery.filters.category === query.filters.category
    && initialQuery.filters.status === query.filters.status
  );
};

export const useProductsList = (options?: UseProductsListOptions) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const searchParamsString = searchParams.toString();

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchInput, setSearchInput] = useState(searchParams.get('q') ?? '');

  const page = getPageFromSearch(searchParams.get('page'));
  const pageSize = APP_CONFIG.pagination.defaultPageSize;
  const filters = useMemo(() => getFiltersFromParams(new URLSearchParams(searchParamsString)), [searchParamsString]);
  const query = useMemo(
    () => ({
      page,
      pageSize,
      filters,
    }),
    [filters, page, pageSize],
  );
  const canUseInitialListData = hasMatchingInitialQuery(options?.initialQuery, query);

  const listQueryKey = productKeys.list(query);

  const updateParams = useCallback((options: {
    page?: number;
    search?: string;
    filters?: Partial<ProductListFilters>;
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

    if (options.filters) {
      const merged: ProductListFilters = {
        ...filters,
        ...options.filters,
      };

      if (merged.brand === 'all') {
        next.delete('brand');
      } else {
        next.set('brand', merged.brand);
      }

      if (merged.category === 'all') {
        next.delete('category');
      } else {
        next.set('category', merged.category);
      }

      if (merged.status === 'all') {
        next.delete('status');
      } else {
        next.set('status', merged.status);
      }
    }

    const query = next.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }, [filters, pathname, router, searchParamsString]);

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

  const listQuery = useQuery({
    queryKey: listQueryKey,
    queryFn: async () => {
      return listProducts(query);
    },
    staleTime: APP_CONFIG.query.staleTimeMs,
    initialData: canUseInitialListData ? options?.initialListData : undefined,
  });

  const filterMetaQuery = useQuery({
    queryKey: productKeys.filterMeta(),
    queryFn: getProductFilterMeta,
    staleTime: APP_CONFIG.query.staleTimeMs,
    initialData: options?.initialFilterMeta,
  });

  return {
    data: listQuery.data,
    isLoading: listQuery.isPending || filterMetaQuery.isPending,
    isError: listQuery.isError || filterMetaQuery.isError,
    errorMessage: (listQuery.error as ApiError | null)?.message ?? (filterMetaQuery.error as ApiError | null)?.message,
    viewMode,
    setViewMode,
    page,
    pageSize,
    filters,
    brands: filterMetaQuery.data?.brands ?? [],
    categories: filterMetaQuery.data?.categories ?? [],
    searchInput,
    setSearchInput,
    queryKey: listQueryKey,
    onPageChange: (nextPage: number) => {
      updateParams({ page: nextPage });
    },
    onFilterChange: (key: keyof Omit<ProductListFilters, 'search'>, value: string) => {
      updateParams({
        page: 1,
        filters: {
          [key]: value,
        },
      });
    },
    retry: () => {
      listQuery.refetch();
      filterMetaQuery.refetch();
    },
    removeItemFromList: (id: string) => {
      queryClient.setQueryData(listQueryKey, (previous: typeof listQuery.data) => {
        if (!previous) {
          return previous;
        }

        return {
          ...previous,
          items: previous.items.filter(item => item.id !== id),
          total: Math.max(0, previous.total - 1),
        };
      });
    },
  };
};
