'use client';

import type { CategoryFormValues, CategorySubmitValues } from '../types/category.types';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button, Input, Label } from '@/modules/common';
import { categoryFormSchema, createCategorySlug } from '../schemas';

export type CategoryFormProps = {
  title: string;
  submitLabel: string;
  defaultValues?: CategoryFormValues;
  parentOptions: Array<{ id: string; name: string }>;
  isSubmitting: boolean;
  onSubmit: (data: CategorySubmitValues) => Promise<void>;
  onCancel: () => void;
};

const defaultValues: CategoryFormValues = {
  name: '',
  slug: '',
  description: '',
  parentCategoryId: undefined,
  isActive: true,
  sortOrder: 0,
};

export const CategoryForm = (props: CategoryFormProps) => {
  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: props.defaultValues ?? defaultValues,
  });

  const name = form.watch('name');
  const isSlugEdited = Boolean(form.formState.dirtyFields.slug);

  useEffect(() => {
    if (isSlugEdited) {
      return;
    }

    form.setValue('slug', createCategorySlug(name), {
      shouldDirty: true,
    });
  }, [form, isSlugEdited, name]);

  useEffect(() => {
    form.reset(props.defaultValues ?? defaultValues);
  }, [form, props.defaultValues]);

  return (
    <form
      className="space-y-4"
      onSubmit={form.handleSubmit(async (data) => {
        const payload = categoryFormSchema.parse(data);
        await props.onSubmit(payload);
      })}
    >
      <h3 className="text-lg font-semibold text-neutral-100">{props.title}</h3>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <Label htmlFor="category-name">Name</Label>
          <Input id="category-name" {...form.register('name')} />
          {form.formState.errors.name?.message ? <p className="mt-1 text-xs text-red-300">{form.formState.errors.name.message}</p> : null}
        </div>

        <div>
          <Label htmlFor="category-slug">Slug</Label>
          <Input
            id="category-slug"
            {...form.register('slug')}
            onChange={(event) => {
              form.setValue('slug', event.target.value, {
                shouldDirty: true,
              });
            }}
          />
          {form.formState.errors.slug?.message ? <p className="mt-1 text-xs text-red-300">{form.formState.errors.slug.message}</p> : null}
        </div>

        <div className="md:col-span-2">
          <Label htmlFor="category-description">Description</Label>
          <textarea
            id="category-description"
            className="min-h-[96px] w-full rounded-md border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-neutral-100"
            {...form.register('description')}
          />
          {form.formState.errors.description?.message ? <p className="mt-1 text-xs text-red-300">{form.formState.errors.description.message}</p> : null}
        </div>

        <div>
          <Label htmlFor="category-parent">Parent category</Label>
          <select
            id="category-parent"
            className="h-9 w-full rounded-md border border-neutral-800 bg-neutral-950 px-3 text-sm text-neutral-100"
            value={form.watch('parentCategoryId') ?? ''}
            onChange={(event) => {
              const value = event.target.value.trim();
              form.setValue('parentCategoryId', value || undefined, {
                shouldDirty: true,
              });
            }}
          >
            <option value="">No parent</option>
            {props.parentOptions.map(option => (
              <option key={option.id} value={option.id}>{option.name}</option>
            ))}
          </select>
          {form.formState.errors.parentCategoryId?.message ? <p className="mt-1 text-xs text-red-300">{form.formState.errors.parentCategoryId.message}</p> : null}
        </div>

        <div>
          <Label htmlFor="category-sortOrder">Sort order</Label>
          <Input id="category-sortOrder" type="number" {...form.register('sortOrder')} />
          {form.formState.errors.sortOrder?.message ? <p className="mt-1 text-xs text-red-300">{form.formState.errors.sortOrder.message}</p> : null}
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm text-neutral-200">
        <input type="checkbox" className="h-4 w-4" {...form.register('isActive')} />
        Active
      </label>

      <div className="flex items-center gap-2">
        <Button type="submit" disabled={props.isSubmitting}>{props.isSubmitting ? 'Saving...' : props.submitLabel}</Button>
        <Button variant="outline" onClick={props.onCancel}>Cancel</Button>
      </div>
    </form>
  );
};
