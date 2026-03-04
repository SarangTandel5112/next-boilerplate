import { z } from 'zod';

export const createCategorySlug = (value: string) => {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
};

export const categoryFormSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(120, 'Name is too long'),
  slug: z.string().trim().min(1, 'Slug is required').max(140, 'Slug is too long').regex(/^[a-z0-9-]+$/, 'Slug can include lowercase letters, numbers and hyphens only'),
  description: z.string().trim().max(800, 'Description is too long').optional().default(''),
  parentCategoryId: z.string().uuid('Invalid parent category').optional(),
  isActive: z.boolean().default(true),
  sortOrder: z.coerce.number().int().min(0, 'Sort order must be 0 or more').default(0),
});

export const categoryIdSchema = z.string().uuid('Invalid category id');
