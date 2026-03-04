import { z } from 'zod';

const tierPricingSchema = z.object({
  tierName: z.string().trim().min(1, 'Tier name is required').max(50, 'Tier name is too long'),
  minQty: z.coerce.number().int().min(1, 'Minimum quantity must be at least 1'),
  price: z.coerce.number().min(0, 'Price must be 0 or more'),
});

export const productFormSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(120, 'Name is too long'),
  sku: z.string().trim().min(1, 'SKU is required').max(64, 'SKU is too long'),
  category: z.string().trim().max(80, 'Category is too long').optional().default(''),
  brand: z.string().trim().max(80, 'Brand is too long').optional().default(''),
  description: z.string().trim().max(2000, 'Description is too long').optional().default(''),
  sae: z.string().trim().max(40, 'SAE is too long').optional().default(''),
  api: z.string().trim().max(40, 'API is too long').optional().default(''),
  acea: z.string().trim().max(40, 'ACEA is too long').optional().default(''),
  oemApprovals: z.array(z.string().trim().min(1, 'Approval cannot be empty').max(100, 'Approval is too long')).default([]),
  viscosity: z.string().trim().max(80, 'Viscosity is too long').optional().default(''),
  baseOilType: z.string().trim().max(80, 'Base oil type is too long').optional().default(''),
  packSize: z.string().trim().max(40, 'Pack size is too long').optional().default(''),
  unit: z.string().trim().max(20, 'Unit is too long').optional().default(''),
  minimumOrderQty: z.coerce.number().int().min(1, 'Minimum order quantity must be at least 1').default(1),
  basePrice: z.coerce.number().min(0, 'Base price must be 0 or more').default(0),
  tierPricing: z.array(tierPricingSchema).default([]),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
});

export const productIdSchema = z.string().uuid('Invalid product id');

export const productSubmitSchema = productFormSchema.superRefine((value, context) => {
  const cleanedTiers = value.tierPricing.filter(item => item.tierName.trim());
  const names = new Set<string>();

  for (const tier of cleanedTiers) {
    const key = tier.tierName.toLowerCase();
    if (names.has(key)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Tier names must be unique',
        path: ['tierPricing'],
      });
      break;
    }

    names.add(key);
  }
});
