'use client';

import type { ProductSubmitValues } from '../types/product.types';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Badge } from '@/modules/common';
import { useCreateProduct } from '../hooks';
import { ProductForm } from './ProductForm';
import { ProductToast } from './ProductToast';

export const CreateProductView = () => {
  const router = useRouter();
  const createProduct = useCreateProduct();
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

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-2xl border border-neutral-800 bg-neutral-900/70 p-6 md:p-8">
        <Badge>Create product</Badge>
        <h2 className="mt-3 text-3xl font-semibold text-neutral-50 md:text-4xl">Add product</h2>
        <p className="mt-2 text-sm text-neutral-300 md:text-base">Create a new product with technical specs, packaging, and tier pricing.</p>
      </section>

      <ProductForm
        mode="create"
        isSubmitting={createProduct.isLoading}
        onSubmit={async (data: ProductSubmitValues) => {
          try {
            await createProduct.execute(data);
            setToast({ message: 'Product created successfully', variant: 'success' });
            router.push('/admin/products');
          } catch (error) {
            setToast({ message: error instanceof Error ? error.message : 'Failed to create product', variant: 'error' });
          }
        }}
      />

      {toast ? <ProductToast message={toast.message} variant={toast.variant} onClose={() => setToast(undefined)} /> : null}
    </div>
  );
};
