'use client';

import type { ProductFormValues, ProductSubmitValues } from '../types/product.types';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { Button, cn } from '@/modules/common';
import { productSubmitSchema } from '../schemas/product.schema';
import { ProductFormFields } from './ProductFormFields';

export type ProductFormProps = {
  mode: 'create' | 'edit';
  defaultValues?: ProductFormValues;
  isSubmitting: boolean;
  onSubmit: (data: ProductSubmitValues) => Promise<void>;
};

const defaultFormValues: ProductFormValues = {
  name: '',
  sku: '',
  category: '',
  brand: '',
  description: '',
  sae: '',
  api: '',
  acea: '',
  oemApprovals: [],
  viscosity: '',
  baseOilType: '',
  packSize: '',
  unit: 'L',
  minimumOrderQty: 1,
  basePrice: 0,
  tierPricing: [],
  isActive: true,
  isFeatured: false,
};

export const ProductForm = (props: ProductFormProps) => {
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSubmitSchema),
    defaultValues: props.defaultValues ?? defaultFormValues,
  });

  return (
    <form
      className="flex flex-col gap-5"
      onSubmit={form.handleSubmit(async (data) => {
        const payload = productSubmitSchema.parse(data);
        await props.onSubmit(payload);
      })}
    >
      <ProductFormFields form={form} />

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={props.isSubmitting}>
          {props.isSubmitting ? 'Saving...' : props.mode === 'create' ? 'Create product' : 'Update product'}
        </Button>
        <Link
          href="/admin/products"
          className={cn('inline-flex h-9 items-center rounded-md border border-neutral-800 px-4 text-sm text-neutral-200 transition hover:border-neutral-700')}
        >
          Cancel
        </Link>
      </div>
    </form>
  );
};
