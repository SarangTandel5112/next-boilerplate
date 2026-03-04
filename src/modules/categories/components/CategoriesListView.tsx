'use client';

import type { CategoryEntity, CategoryListFilters, CategoryListResult, CategorySubmitValues } from '../types/category.types';
import { useEffect, useMemo, useState } from 'react';
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, Input, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/modules/common';
import { useCategoriesList, useCreateCategory, useDeleteCategory, useToggleCategory, useUpdateCategory } from '../hooks';
import { CategoryDeleteDialog } from './CategoryDeleteDialog';
import { CategoryForm } from './CategoryForm';

const selectClassName = 'h-9 rounded-md border border-neutral-800 bg-neutral-950 px-3 text-sm text-neutral-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500';

type FormDialogState = {
  mode: 'create' | 'edit';
  category?: CategoryEntity;
};

export const CategoriesListView = (props: {
  initialListData?: CategoryListResult;
  initialOptions?: Array<{ id: string; name: string }>;
  initialQuery?: {
    page: number;
    pageSize: number;
    filters: CategoryListFilters;
  };
}) => {
  const list = useCategoriesList({
    initialListData: props.initialListData,
    initialOptions: props.initialOptions,
    initialQuery: props.initialQuery,
  });
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();
  const toggleCategory = useToggleCategory();

  const [formDialog, setFormDialog] = useState<FormDialogState | undefined>();
  const [deleteDialog, setDeleteDialog] = useState<CategoryEntity | undefined>();
  const [toast, setToast] = useState<{ message: string; variant: 'success' | 'error' } | undefined>();

  const isFormSubmitting = createCategory.isLoading || updateCategory.isLoading;

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

  const parentOptions = useMemo(() => {
    return list.parentOptions.filter(option => option.id !== formDialog?.category?.id);
  }, [formDialog?.category?.id, list.parentOptions]);

  const currentPageTotal = list.data ? Math.max(1, Math.ceil(list.data.total / list.pageSize)) : 1;

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-2xl border border-neutral-800 bg-neutral-900/70 p-6 md:p-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <Badge>Master data</Badge>
            <h2 className="mt-3 text-3xl font-semibold text-neutral-50 md:text-4xl">Categories</h2>
            <p className="mt-2 text-sm text-neutral-300 md:text-base">Manage product category references with lightweight CRUD workflows.</p>
          </div>
          <Button onClick={() => setFormDialog({ mode: 'create' })}>Create category</Button>
        </div>
      </section>

      <Card className="border-neutral-800 bg-neutral-900/60">
        <CardContent className="space-y-4 p-4">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <Input value={list.searchInput} placeholder="Search category by name or slug" onChange={event => list.setSearchInput(event.target.value)} />
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
              {Array.from({ length: 6 }, (_, index) => <div key={`category-loading-${index}`} className="h-14 animate-pulse rounded-lg bg-neutral-800/70" />)}
            </div>
          )
        : null}

      {!list.isLoading && list.isError
        ? (
            <Card className="border-red-500/30 bg-red-500/10">
              <CardContent className="flex flex-col items-center gap-3 p-8">
                <p className="text-lg font-semibold text-red-200">Failed to load categories</p>
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
                <p className="text-lg font-semibold text-neutral-100">No categories found</p>
                <Button onClick={() => setFormDialog({ mode: 'create' })}>Create category</Button>
              </CardContent>
            </Card>
          )
        : null}

      {!list.isLoading && !list.isError && hasItems
        ? (
            <Card className="border-neutral-800 bg-neutral-900/60">
              <CardHeader>
                <CardTitle>Category list</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Slug</TableHead>
                      <TableHead>Parent</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Sort order</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {list.data?.items.map(item => (
                      <TableRow key={item.id} className="border-neutral-800">
                        <TableCell>
                          <div>
                            <p className="font-medium text-neutral-100">{item.name}</p>
                            <p className="text-xs text-neutral-400">{item.description || '-'}</p>
                          </div>
                        </TableCell>
                        <TableCell>{item.slug}</TableCell>
                        <TableCell>
                          {item.parentCategoryId
                            ? list.parentOptions.find(option => option.id === item.parentCategoryId)?.name ?? '-'
                            : '-'}
                        </TableCell>
                        <TableCell>
                          <Badge variant={item.isActive ? 'success' : 'muted'}>{item.isActive ? 'Active' : 'Inactive'}</Badge>
                        </TableCell>
                        <TableCell>{item.sortOrder}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap items-center gap-2">
                            <button type="button" className="text-sm text-blue-300 hover:text-blue-200" onClick={() => setFormDialog({ mode: 'edit', category: item })}>Edit</button>
                            <button
                              type="button"
                              className="text-sm text-amber-300 hover:text-amber-200"
                              onClick={async () => {
                                try {
                                  await toggleCategory.execute(item.id);
                                  setToast({ message: 'Category status updated', variant: 'success' });
                                } catch (error) {
                                  setToast({
                                    message: error instanceof Error ? error.message : 'Failed to toggle category',
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
                <CategoryForm
                  title={formDialog.mode === 'create' ? 'Create category' : 'Edit category'}
                  submitLabel={formDialog.mode === 'create' ? 'Create' : 'Update'}
                  isSubmitting={isFormSubmitting}
                  parentOptions={parentOptions}
                  defaultValues={formDialog.category
                    ? {
                        name: formDialog.category.name,
                        slug: formDialog.category.slug,
                        description: formDialog.category.description,
                        parentCategoryId: formDialog.category.parentCategoryId,
                        isActive: formDialog.category.isActive,
                        sortOrder: formDialog.category.sortOrder,
                      }
                    : undefined}
                  onCancel={() => setFormDialog(undefined)}
                  onSubmit={async (data: CategorySubmitValues) => {
                    try {
                      if (formDialog.mode === 'create') {
                        await createCategory.execute(data);
                        setToast({ message: 'Category created successfully', variant: 'success' });
                      } else if (formDialog.category) {
                        await updateCategory.execute(formDialog.category.id, data);
                        setToast({ message: 'Category updated successfully', variant: 'success' });
                      }

                      setFormDialog(undefined);
                    } catch (error) {
                      setToast({
                        message: error instanceof Error ? error.message : 'Failed to save category',
                        variant: 'error',
                      });
                    }
                  }}
                />
              </div>
            </div>
          )
        : null}

      <CategoryDeleteDialog
        isOpen={Boolean(deleteDialog)}
        categoryName={deleteDialog?.name ?? ''}
        isLoading={deleteCategory.isLoading}
        onClose={() => setDeleteDialog(undefined)}
        onConfirm={async () => {
          if (!deleteDialog) {
            return;
          }

          try {
            await deleteCategory.execute(deleteDialog.id);
            setToast({ message: 'Category deleted successfully', variant: 'success' });
            setDeleteDialog(undefined);
          } catch (error) {
            setToast({
              message: error instanceof Error ? error.message : 'Failed to delete category',
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
