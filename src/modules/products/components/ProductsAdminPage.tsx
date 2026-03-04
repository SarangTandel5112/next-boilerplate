'use client';

import type { ProductEntity, ProductListFilters, ProductListResult } from '../types/product.types';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, Input, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/modules/common';
import { useDeleteProduct, useProductsList } from '../hooks';
import { ProductDeleteDialog } from './ProductDeleteDialog';
import { ProductToast } from './ProductToast';

const selectClassName = 'h-9 rounded-md border border-neutral-800 bg-neutral-950 px-3 text-sm text-neutral-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500';

const renderStatusBadge = (isActive: boolean) => {
  return <Badge variant={isActive ? 'success' : 'muted'}>{isActive ? 'Active' : 'Inactive'}</Badge>;
};

const Pagination = (props: { currentPage: number; pageSize: number; total: number; onChange: (page: number) => void }) => {
  const totalPages = Math.max(1, Math.ceil(props.total / props.pageSize));

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border-t border-neutral-800 pt-4">
      <p className="text-sm text-neutral-400">
        Page
        {' '}
        {props.currentPage}
        {' '}
        of
        {' '}
        {totalPages}
      </p>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" disabled={props.currentPage <= 1} onClick={() => props.onChange(props.currentPage - 1)}>Previous</Button>
        <Button variant="outline" size="sm" disabled={props.currentPage >= totalPages} onClick={() => props.onChange(props.currentPage + 1)}>Next</Button>
      </div>
    </div>
  );
};

const ProductGridCard = (props: { product: ProductEntity; onDelete: (product: ProductEntity) => void }) => {
  return (
    <Card className="overflow-hidden border-neutral-800 bg-neutral-900/60">
      <div className="relative aspect-[16/10] border-b border-neutral-800">
        <Image src={props.product.imageUrl} alt={props.product.name} fill className="object-cover" sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw" />
      </div>
      <CardContent className="space-y-3 p-4">
        <div>
          <p className="text-base font-semibold text-neutral-100">{props.product.name}</p>
          <p className="text-sm text-neutral-300">{props.product.brand}</p>
        </div>
        <div className="flex items-center justify-between">
          {renderStatusBadge(props.product.isActive)}
          <p className="text-sm text-neutral-300">
            $
            {props.product.basePrice.toFixed(2)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/admin/products/${props.product.id}/edit`} className="text-sm text-blue-300 hover:text-blue-200">Edit</Link>
          <button type="button" className="text-sm text-red-300 hover:text-red-200" onClick={() => props.onDelete(props.product)}>Delete</button>
        </div>
      </CardContent>
    </Card>
  );
};

export const ProductsAdminPage = (props: {
  initialListData?: ProductListResult;
  initialFilterMeta?: { brands: string[]; categories: string[] };
  initialQuery?: {
    page: number;
    pageSize: number;
    filters: ProductListFilters;
  };
}) => {
  const list = useProductsList({
    initialListData: props.initialListData,
    initialFilterMeta: props.initialFilterMeta,
    initialQuery: props.initialQuery,
  });
  const deletion = useDeleteProduct();
  const [dialogProduct, setDialogProduct] = useState<ProductEntity | undefined>();
  const [toast, setToast] = useState<{ message: string; variant: 'success' | 'error' } | undefined>();

  useEffect(() => {
    if (!toast) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setToast(undefined);
    }, 3000);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [toast]);

  const hasItems = (list.data?.items.length ?? 0) > 0;

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-2xl border border-neutral-800 bg-neutral-900/70 p-6 md:p-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <Badge>Product catalog</Badge>
            <h2 className="mt-3 text-3xl font-semibold text-neutral-50 md:text-4xl">Products</h2>
            <p className="mt-2 text-sm text-neutral-300 md:text-base">Manage products, technical metadata, packaging, and pricing tiers.</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="inline-flex rounded-md border border-neutral-800 bg-neutral-950 p-1">
              <button type="button" className={list.viewMode === 'grid' ? 'rounded bg-neutral-800 px-3 py-1 text-sm text-neutral-100' : 'rounded px-3 py-1 text-sm text-neutral-400'} onClick={() => list.setViewMode('grid')}>Grid</button>
              <button type="button" className={list.viewMode === 'list' ? 'rounded bg-neutral-800 px-3 py-1 text-sm text-neutral-100' : 'rounded px-3 py-1 text-sm text-neutral-400'} onClick={() => list.setViewMode('list')}>List</button>
            </div>
            <Link href="/admin/products/create"><Button>Add product</Button></Link>
          </div>
        </div>
      </section>

      <Card className="border-neutral-800 bg-neutral-900/60">
        <CardContent className="space-y-4 p-4">
          <div className="grid grid-cols-1 gap-3 xl:grid-cols-4">
            <Input value={list.searchInput} placeholder="Search by name, SKU, brand" onChange={event => list.setSearchInput(event.target.value)} />
            <select className={selectClassName} value={list.filters.brand} onChange={event => list.onFilterChange('brand', event.target.value)}>
              <option value="all">All brands</option>
              {list.brands.map(brand => <option key={brand} value={brand}>{brand}</option>)}
            </select>
            <select className={selectClassName} value={list.filters.category} onChange={event => list.onFilterChange('category', event.target.value)}>
              <option value="all">All categories</option>
              {list.categories.map(category => <option key={category} value={category}>{category}</option>)}
            </select>
            <select className={selectClassName} value={list.filters.status} onChange={event => list.onFilterChange('status', event.target.value)}>
              <option value="all">All status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {list.isLoading
        ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
              {Array.from({ length: 8 }, (_, index) => (
                <Card key={`product-loading-${index}`} className="border-neutral-800 bg-neutral-900/60">
                  <CardContent className="space-y-3 p-4">
                    <div className="aspect-[16/10] rounded-lg bg-neutral-800/70" />
                    <div className="h-4 rounded bg-neutral-800/70" />
                    <div className="h-3 w-2/3 rounded bg-neutral-800/70" />
                  </CardContent>
                </Card>
              ))}
            </div>
          )
        : null}

      {!list.isLoading && list.isError
        ? (
            <Card className="border-red-500/30 bg-red-500/10">
              <CardContent className="flex flex-col items-center gap-3 p-8">
                <p className="text-lg font-semibold text-red-200">Failed to load products</p>
                <p className="text-sm text-red-200/80">{list.errorMessage}</p>
                <Button variant="outline" onClick={list.retry}>Retry</Button>
              </CardContent>
            </Card>
          )
        : null}

      {!list.isLoading && !list.isError && !hasItems
        ? (
            <Card className="border-neutral-800 bg-neutral-900/60">
              <CardContent className="flex flex-col items-center gap-3 p-10">
                <p className="text-lg font-semibold text-neutral-100">No products found</p>
                <Link href="/admin/products/create"><Button>Add new product</Button></Link>
              </CardContent>
            </Card>
          )
        : null}

      {!list.isLoading && !list.isError && hasItems
        ? (
            <Card className="border-neutral-800 bg-neutral-900/60">
              <CardHeader>
                <CardTitle>Product listing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                {list.viewMode === 'grid'
                  ? (
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                        {list.data?.items.map(item => <ProductGridCard key={item.id} product={item} onDelete={setDialogProduct} />)}
                      </div>
                    )
                  : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>SKU</TableHead>
                            <TableHead>Brand</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Price</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {list.data?.items.map(item => (
                            <TableRow key={item.id} className="border-neutral-800">
                              <TableCell>{item.name}</TableCell>
                              <TableCell>{item.sku}</TableCell>
                              <TableCell>{item.brand}</TableCell>
                              <TableCell>{item.category}</TableCell>
                              <TableCell>{renderStatusBadge(item.isActive)}</TableCell>
                              <TableCell>
                                $
                                {item.basePrice.toFixed(2)}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Link href={`/admin/products/${item.id}/edit`} className="text-sm text-blue-300 hover:text-blue-200">Edit</Link>
                                  <button type="button" className="text-sm text-red-300 hover:text-red-200" onClick={() => setDialogProduct(item)}>Delete</button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}

                <Pagination
                  currentPage={list.page}
                  pageSize={list.pageSize}
                  total={list.data?.total ?? 0}
                  onChange={list.onPageChange}
                />
              </CardContent>
            </Card>
          )
        : null}

      <ProductDeleteDialog
        isOpen={Boolean(dialogProduct)}
        productName={dialogProduct?.name ?? ''}
        isLoading={deletion.isLoading}
        onClose={() => setDialogProduct(undefined)}
        onConfirm={async () => {
          if (!dialogProduct) {
            return;
          }

          try {
            await deletion.execute(dialogProduct.id);
            setToast({ message: 'Product deleted successfully', variant: 'success' });
            setDialogProduct(undefined);
          } catch (error) {
            setToast({
              message: error instanceof Error ? error.message : 'Failed to delete product',
              variant: 'error',
            });
          }
        }}
      />

      {toast ? <ProductToast message={toast.message} variant={toast.variant} onClose={() => setToast(undefined)} /> : null}
    </div>
  );
};
