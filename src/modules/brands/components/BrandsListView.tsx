'use client';

import type { BrandEntity, BrandListFilters, BrandListResult, BrandSubmitValues } from '../types/brand.types';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, Input, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/modules/common';
import { useBrandsList, useCreateBrand, useDeleteBrand, useToggleBrand, useUpdateBrand } from '../hooks';
import { BrandDeleteDialog } from './BrandDeleteDialog';
import { BrandForm } from './BrandForm';

const selectClassName = 'h-9 rounded-md border border-neutral-800 bg-neutral-950 px-3 text-sm text-neutral-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500';

type FormDialogState = {
  mode: 'create' | 'edit';
  brand?: BrandEntity;
};

export const BrandsListView = (props: {
  initialListData?: BrandListResult;
  initialQuery?: {
    page: number;
    pageSize: number;
    filters: BrandListFilters;
  };
}) => {
  const list = useBrandsList({
    initialListData: props.initialListData,
    initialQuery: props.initialQuery,
  });
  const createBrand = useCreateBrand();
  const updateBrand = useUpdateBrand();
  const deleteBrand = useDeleteBrand();
  const toggleBrand = useToggleBrand();

  const [formDialog, setFormDialog] = useState<FormDialogState | undefined>();
  const [deleteDialog, setDeleteDialog] = useState<BrandEntity | undefined>();
  const [toast, setToast] = useState<{ message: string; variant: 'success' | 'error' } | undefined>();

  const isFormSubmitting = createBrand.isLoading || updateBrand.isLoading;

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
  const currentPageTotal = list.data ? Math.max(1, Math.ceil(list.data.total / list.pageSize)) : 1;

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-2xl border border-neutral-800 bg-neutral-900/70 p-6 md:p-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <Badge>Master data</Badge>
            <h2 className="mt-3 text-3xl font-semibold text-neutral-50 md:text-4xl">Brands</h2>
            <p className="mt-2 text-sm text-neutral-300 md:text-base">Manage brand references with lightweight CRUD workflows.</p>
          </div>
          <Button onClick={() => setFormDialog({ mode: 'create' })}>Create brand</Button>
        </div>
      </section>

      <Card className="border-neutral-800 bg-neutral-900/60">
        <CardContent className="space-y-4 p-4">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <Input value={list.searchInput} placeholder="Search brand by name or slug" onChange={event => list.setSearchInput(event.target.value)} />
            <select className={selectClassName} value={list.filters.status} onChange={event => list.onStatusChange(event.target.value as 'all' | 'active' | 'inactive')}>
              <option value="all">All status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {list.isLoading
        ? (
            <div className="space-y-3">
              {Array.from({ length: 6 }, (_, index) => <div key={`brand-loading-${index}`} className="h-14 animate-pulse rounded-lg bg-neutral-800/70" />)}
            </div>
          )
        : null}

      {!list.isLoading && list.isError
        ? (
            <Card className="border-red-500/30 bg-red-500/10">
              <CardContent className="flex flex-col items-center gap-3 p-8">
                <p className="text-lg font-semibold text-red-200">Failed to load brands</p>
                <p className="text-sm text-red-200/80">{list.errorMessage}</p>
                <Button variant="outline" onClick={list.retry}>Retry</Button>
              </CardContent>
            </Card>
          )
        : null}

      {!list.isLoading && !list.isError && !hasItems
        ? (
            <Card className="border-neutral-800 bg-neutral-900/60">
              <CardContent className="flex flex-col items-center gap-3 p-8">
                <p className="text-lg font-semibold text-neutral-100">No brands found</p>
                <Button onClick={() => setFormDialog({ mode: 'create' })}>Create brand</Button>
              </CardContent>
            </Card>
          )
        : null}

      {!list.isLoading && !list.isError && hasItems
        ? (
            <Card className="border-neutral-800 bg-neutral-900/60">
              <CardHeader>
                <CardTitle>Brand list</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Brand</TableHead>
                      <TableHead>Slug</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Sort order</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {list.data?.items.map(item => (
                      <TableRow key={item.id} className="border-neutral-800">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="relative h-10 w-10 overflow-hidden rounded-md border border-neutral-800 bg-neutral-950">
                              {item.logoUrl
                                ? <Image src={item.logoUrl} alt={item.name} fill className="object-cover" sizes="40px" />
                                : null}
                            </div>
                            <div>
                              <p className="font-medium text-neutral-100">{item.name}</p>
                              <p className="text-xs text-neutral-400">{item.description || '-'}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{item.slug}</TableCell>
                        <TableCell>
                          <Badge variant={item.isActive ? 'success' : 'muted'}>{item.isActive ? 'Active' : 'Inactive'}</Badge>
                        </TableCell>
                        <TableCell>{item.sortOrder}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap items-center gap-2">
                            <button type="button" className="text-sm text-blue-300 hover:text-blue-200" onClick={() => setFormDialog({ mode: 'edit', brand: item })}>Edit</button>
                            <button
                              type="button"
                              className="text-sm text-amber-300 hover:text-amber-200"
                              onClick={async () => {
                                try {
                                  await toggleBrand.execute(item.id);
                                  setToast({ message: 'Brand status updated', variant: 'success' });
                                } catch (error) {
                                  setToast({
                                    message: error instanceof Error ? error.message : 'Failed to toggle brand',
                                    variant: 'error',
                                  });
                                }
                              }}
                            >
                              Toggle active
                            </button>
                            <button type="button" className="text-sm text-red-300 hover:text-red-200" onClick={() => setDeleteDialog(item)}>Delete</button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                <div className="flex flex-wrap items-center justify-between gap-2 border-t border-neutral-800 pt-4">
                  <p className="text-sm text-neutral-400">
                    Page
                    {' '}
                    {list.page}
                    {' '}
                    of
                    {' '}
                    {currentPageTotal}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" disabled={list.page <= 1} onClick={() => list.onPageChange(list.page - 1)}>Previous</Button>
                    <Button variant="outline" size="sm" disabled={list.page >= currentPageTotal} onClick={() => list.onPageChange(list.page + 1)}>Next</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        : null}

      {formDialog
        ? (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
              <div className="w-full max-w-3xl rounded-xl border border-neutral-800 bg-neutral-900 p-5">
                <BrandForm
                  title={formDialog.mode === 'create' ? 'Create brand' : 'Edit brand'}
                  submitLabel={formDialog.mode === 'create' ? 'Create' : 'Update'}
                  isSubmitting={isFormSubmitting}
                  defaultValues={formDialog.brand
                    ? {
                        name: formDialog.brand.name,
                        slug: formDialog.brand.slug,
                        logoUrl: formDialog.brand.logoUrl,
                        description: formDialog.brand.description,
                        isActive: formDialog.brand.isActive,
                        sortOrder: formDialog.brand.sortOrder,
                      }
                    : undefined}
                  onCancel={() => setFormDialog(undefined)}
                  onSubmit={async (data: BrandSubmitValues) => {
                    try {
                      if (formDialog.mode === 'create') {
                        await createBrand.execute(data);
                        setToast({ message: 'Brand created successfully', variant: 'success' });
                      } else if (formDialog.brand) {
                        await updateBrand.execute(formDialog.brand.id, data);
                        setToast({ message: 'Brand updated successfully', variant: 'success' });
                      }

                      setFormDialog(undefined);
                    } catch (error) {
                      setToast({
                        message: error instanceof Error ? error.message : 'Failed to save brand',
                        variant: 'error',
                      });
                    }
                  }}
                />
              </div>
            </div>
          )
        : null}

      <BrandDeleteDialog
        isOpen={Boolean(deleteDialog)}
        brandName={deleteDialog?.name ?? ''}
        isLoading={deleteBrand.isLoading}
        onClose={() => setDeleteDialog(undefined)}
        onConfirm={async () => {
          if (!deleteDialog) {
            return;
          }

          try {
            await deleteBrand.execute(deleteDialog.id);
            setToast({ message: 'Brand deleted successfully', variant: 'success' });
            setDeleteDialog(undefined);
          } catch (error) {
            setToast({
              message: error instanceof Error ? error.message : 'Failed to delete brand',
              variant: 'error',
            });
          }
        }}
      />

      {toast
        ? (
            <div className={`fixed top-4 right-4 z-50 rounded-md border px-4 py-3 text-sm shadow-lg ${toast.variant === 'error' ? 'border-red-500/30 bg-red-500/10 text-red-200' : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200'}`}>
              <div className="flex items-center gap-3">
                <span>{toast.message}</span>
                <button type="button" onClick={() => setToast(undefined)}>Close</button>
              </div>
            </div>
          )
        : null}
    </div>
  );
};
