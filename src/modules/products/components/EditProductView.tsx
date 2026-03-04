'use client';

import type { ProductSubmitValues } from '../types/product.types';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Badge, Card, CardContent } from '@/modules/common';
import { useProductById, useUpdateProduct } from '../hooks';
import { ProductForm } from './ProductForm';
import { ProductToast } from './ProductToast';

export type EditProductViewProps = {
  id: string;
};

export const EditProductView = (props: EditProductViewProps) => {
  const router = useRouter();
  const product = useProductById(props.id);
  const updateProduct = useUpdateProduct();
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

  if (product.isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <div className="h-8 w-56 animate-pulse rounded bg-neutral-800" />
        <Card className="border-neutral-800 bg-neutral-900/60">
          <CardContent className="space-y-3 p-6">
            {Array.from({ length: 8 }, (_, index) => <div key={`edit-loading-${index}`} className="h-10 animate-pulse rounded bg-neutral-800/70" />)}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (product.isError || !product.data) {
    return (
      <Card className="border-red-500/30 bg-red-500/10">
        <CardContent className="flex flex-col items-center gap-3 p-8">
          <p className="text-lg font-semibold text-red-200">Product not found</p>
          <p className="text-sm text-red-200/80">{product.errorMessage}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-2xl border border-neutral-800 bg-neutral-900/70 p-6 md:p-8">
        <Badge>Update product</Badge>
        <h2 className="mt-3 text-3xl font-semibold text-neutral-50 md:text-4xl">Edit product</h2>
        <p className="mt-2 text-sm text-neutral-300 md:text-base">Update product configuration, specs, and pricing safely.</p>
      </section>

      <ProductForm
        mode="edit"
        isSubmitting={updateProduct.isLoading}
        defaultValues={{
          name: product.data.name,
          sku: product.data.sku,
          category: product.data.category,
          brand: product.data.brand,
          description: product.data.description,
          sae: product.data.sae,
          api: product.data.api,
          acea: product.data.acea,
          oemApprovals: product.data.oemApprovals,
          viscosity: product.data.viscosity,
          baseOilType: product.data.baseOilType,
          packSize: product.data.packSize,
          unit: product.data.unit,
          minimumOrderQty: product.data.minimumOrderQty,
          basePrice: product.data.basePrice,
          tierPricing: product.data.tierPricing,
          isActive: product.data.isActive,
          isFeatured: product.data.isFeatured,
        }}
        onSubmit={async (data: ProductSubmitValues) => {
          try {
            await updateProduct.execute(props.id, data);
            setToast({ message: 'Product updated successfully', variant: 'success' });
            router.push('/admin/products');
          } catch (error) {
            setToast({ message: error instanceof Error ? error.message : 'Failed to update product', variant: 'error' });
          }
        }}
      />

      {toast ? <ProductToast message={toast.message} variant={toast.variant} onClose={() => setToast(undefined)} /> : null}
    </div>
  );
};
