'use client';

import type { UseFormReturn } from 'react-hook-form';
import type { ProductFormValues } from '../types/product.types';
import { Button, Input, Label } from '@/modules/common';

export type ProductFormFieldsProps = {
  form: UseFormReturn<ProductFormValues>;
};

const sectionClassName = 'rounded-xl border border-neutral-800 bg-neutral-900/60 p-5';
const titleClassName = 'mb-4 text-base font-semibold text-neutral-100';
const gridClassName = 'grid grid-cols-1 gap-4 md:grid-cols-2';
const errorClassName = 'mt-1 text-xs text-red-300';
const buildDynamicRowKey = (prefix: string, value: string, position: number) => `${prefix}-${value || 'empty'}-${position}`;

const renderError = (message?: string) => {
  if (!message) {
    return null;
  }

  return <p className={errorClassName}>{message}</p>;
};

export const ProductFormFields = (props: ProductFormFieldsProps) => {
  const oemApprovals = props.form.watch('oemApprovals') ?? [];
  const tierPricing = props.form.watch('tierPricing') ?? [];

  return (
    <div className="space-y-5">
      <section className={sectionClassName}>
        <h3 className={titleClassName}>Basic info</h3>
        <div className={gridClassName}>
          <div>
            <Label htmlFor="name">Name</Label>
            <Input id="name" {...props.form.register('name')} />
            {renderError(props.form.formState.errors.name?.message)}
          </div>
          <div>
            <Label htmlFor="sku">SKU</Label>
            <Input id="sku" {...props.form.register('sku')} />
            {renderError(props.form.formState.errors.sku?.message)}
          </div>
          <div>
            <Label htmlFor="category">Category</Label>
            <Input id="category" {...props.form.register('category')} />
            {renderError(props.form.formState.errors.category?.message)}
          </div>
          <div>
            <Label htmlFor="brand">Brand</Label>
            <Input id="brand" {...props.form.register('brand')} />
            {renderError(props.form.formState.errors.brand?.message)}
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              className="min-h-[110px] w-full rounded-md border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-neutral-100"
              {...props.form.register('description')}
            />
            {renderError(props.form.formState.errors.description?.message)}
          </div>
        </div>
      </section>

      <section className={sectionClassName}>
        <h3 className={titleClassName}>Technical specifications</h3>
        <div className={gridClassName}>
          <div>
            <Label htmlFor="sae">SAE</Label>
            <Input id="sae" {...props.form.register('sae')} />
          </div>
          <div>
            <Label htmlFor="api">API</Label>
            <Input id="api" {...props.form.register('api')} />
          </div>
          <div>
            <Label htmlFor="acea">ACEA</Label>
            <Input id="acea" {...props.form.register('acea')} />
          </div>
          <div>
            <Label htmlFor="viscosity">Viscosity</Label>
            <Input id="viscosity" {...props.form.register('viscosity')} />
          </div>
          <div>
            <Label htmlFor="baseOilType">Base oil type</Label>
            <Input id="baseOilType" {...props.form.register('baseOilType')} />
          </div>
        </div>

        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between">
            <Label>OEM approvals</Label>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                props.form.setValue('oemApprovals', [...oemApprovals, ''], {
                  shouldDirty: true,
                });
              }}
            >
              Add approval
            </Button>
          </div>
          {oemApprovals.map((approval, index) => (
            <div key={buildDynamicRowKey('oem-approval', approval, index)} className="flex gap-2">
              <Input {...props.form.register(`oemApprovals.${index}`)} />
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  props.form.setValue(
                    'oemApprovals',
                    oemApprovals.filter((__, itemIndex) => itemIndex !== index),
                    { shouldDirty: true },
                  );
                }}
              >
                Remove
              </Button>
            </div>
          ))}
          {renderError(props.form.formState.errors.oemApprovals?.message)}
        </div>
      </section>

      <section className={sectionClassName}>
        <h3 className={titleClassName}>Packaging and pricing</h3>
        <div className={gridClassName}>
          <div>
            <Label htmlFor="packSize">Pack size</Label>
            <Input id="packSize" {...props.form.register('packSize')} />
          </div>
          <div>
            <Label htmlFor="unit">Unit</Label>
            <Input id="unit" {...props.form.register('unit')} />
          </div>
          <div>
            <Label htmlFor="minimumOrderQty">Minimum order qty</Label>
            <Input id="minimumOrderQty" type="number" {...props.form.register('minimumOrderQty')} />
            {renderError(props.form.formState.errors.minimumOrderQty?.message)}
          </div>
          <div>
            <Label htmlFor="basePrice">Base price</Label>
            <Input id="basePrice" type="number" step="0.01" {...props.form.register('basePrice')} />
            {renderError(props.form.formState.errors.basePrice?.message)}
          </div>
        </div>

        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between">
            <Label>Tier pricing</Label>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                props.form.setValue('tierPricing', [...tierPricing, { tierName: '', minQty: 1, price: 0 }], {
                  shouldDirty: true,
                });
              }}
            >
              Add tier
            </Button>
          </div>

          {tierPricing.map((tier, index) => (
            <div key={buildDynamicRowKey('tier-pricing', tier.tierName, index)} className="grid grid-cols-1 gap-2 rounded-md border border-neutral-800 bg-neutral-950/70 p-3 md:grid-cols-4">
              <Input placeholder="Tier name" {...props.form.register(`tierPricing.${index}.tierName`)} />
              <Input type="number" placeholder="Min qty" {...props.form.register(`tierPricing.${index}.minQty`)} />
              <Input type="number" step="0.01" placeholder="Price" {...props.form.register(`tierPricing.${index}.price`)} />
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  props.form.setValue(
                    'tierPricing',
                    tierPricing.filter((__, itemIndex) => itemIndex !== index),
                    { shouldDirty: true },
                  );
                }}
              >
                Remove
              </Button>
            </div>
          ))}
          {renderError(props.form.formState.errors.tierPricing?.message as string | undefined)}
        </div>
      </section>

      <section className={sectionClassName}>
        <h3 className={titleClassName}>Status</h3>
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <label className="flex items-center gap-2 text-sm text-neutral-200">
            <input type="checkbox" className="h-4 w-4" {...props.form.register('isActive')} />
            Active
          </label>
          <label className="flex items-center gap-2 text-sm text-neutral-200">
            <input type="checkbox" className="h-4 w-4" {...props.form.register('isFeatured')} />
            Featured
          </label>
        </div>
      </section>
    </div>
  );
};
