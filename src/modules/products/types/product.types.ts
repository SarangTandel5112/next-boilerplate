import type * as z from 'zod';
import type { productSubmitSchema } from '../schemas/product.schema';

export type TierPricing = {
  tierName: string;
  minQty: number;
  price: number;
};

export type ProductEntity = {
  id: string;
  name: string;
  sku: string;
  category: string;
  brand: string;
  description: string;
  sae: string;
  api: string;
  acea: string;
  oemApprovals: string[];
  viscosity: string;
  baseOilType: string;
  packSize: string;
  unit: string;
  minimumOrderQty: number;
  basePrice: number;
  tierPricing: TierPricing[];
  isActive: boolean;
  isFeatured: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  imageUrl: string;
};

export type ProductFormValues = z.input<typeof productSubmitSchema>;

export type ProductSubmitValues = z.output<typeof productSubmitSchema>;

export type ProductListFilters = {
  search: string;
  category: string;
  brand: string;
  status: 'all' | 'active' | 'inactive';
};

export type ProductListQuery = {
  page: number;
  pageSize: number;
  filters: ProductListFilters;
};

export type ProductListResult = {
  items: ProductEntity[];
  total: number;
  page: number;
  pageSize: number;
};

export type ProductMutationResult = {
  product: ProductEntity;
  message: string;
};
