'use client';

import type { BrandFormValues, BrandSubmitValues } from '../types/brand.types';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button, Input, Label } from '@/modules/common';
import { brandFormSchema, createBrandSlug } from '../schemas';

export type BrandFormProps = {
  title: string;
  submitLabel: string;
  defaultValues?: BrandFormValues;
  isSubmitting: boolean;
  onSubmit: (data: BrandSubmitValues) => Promise<void>;
  onCancel: () => void;
};

const defaultValues: BrandFormValues = {
  name: '',
  slug: '',
  logoUrl: '',
  description: '',
  isActive: true,
  sortOrder: 0,
};

export const BrandForm = (props: BrandFormProps) => {
  const form = useForm<BrandFormValues>({
    resolver: zodResolver(brandFormSchema),
    defaultValues: props.defaultValues ?? defaultValues,
  });

  const name = form.watch('name');
  const isSlugEdited = Boolean(form.formState.dirtyFields.slug);

  useEffect(() => {
    if (isSlugEdited) {
      return;
    }

    form.setValue('slug', createBrandSlug(name), {
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
        const payload = brandFormSchema.parse(data);
        await props.onSubmit(payload);
      })}
    >
      <h3 className="text-lg font-semibold text-neutral-100">{props.title}</h3>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <Label htmlFor="brand-name">Name</Label>
          <Input id="brand-name" {...form.register('name')} />
          {form.formState.errors.name?.message ? <p className="mt-1 text-xs text-red-300">{form.formState.errors.name.message}</p> : null}
        </div>

        <div>
          <Label htmlFor="brand-slug">Slug</Label>
          <Input
            id="brand-slug"
            {...form.register('slug')}
            onChange={(event) => {
              form.setValue('slug', event.target.value, {
                shouldDirty: true,
              });
            }}
          />
          {form.formState.errors.slug?.message ? <p className="mt-1 text-xs text-red-300">{form.formState.errors.slug.message}</p> : null}
        </div>

        <div>
          <Label htmlFor="brand-logo">Logo URL</Label>
          <Input id="brand-logo" {...form.register('logoUrl')} />
          {form.formState.errors.logoUrl?.message ? <p className="mt-1 text-xs text-red-300">{form.formState.errors.logoUrl.message}</p> : null}
        </div>

        <div>
          <Label htmlFor="brand-sortOrder">Sort order</Label>
          <Input id="brand-sortOrder" type="number" {...form.register('sortOrder')} />
          {form.formState.errors.sortOrder?.message ? <p className="mt-1 text-xs text-red-300">{form.formState.errors.sortOrder.message}</p> : null}
        </div>

        <div className="md:col-span-2">
          <Label htmlFor="brand-description">Description</Label>
          <textarea
            id="brand-description"
            className="min-h-[96px] w-full rounded-md border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-neutral-100"
            {...form.register('description')}
          />
          {form.formState.errors.description?.message ? <p className="mt-1 text-xs text-red-300">{form.formState.errors.description.message}</p> : null}
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
