import type { AdminNavigationItem } from '../types';

export const ADMIN_NAVIGATION: AdminNavigationItem[] = [
  {
    id: 'home',
    label: 'Home',
    path: '/admin',
    description: 'Operational summary and quick actions',
  },
  {
    id: 'products',
    label: 'Products',
    path: '/admin/products',
    description: 'Manage product catalog and lifecycle',
  },
  {
    id: 'categories',
    label: 'Categories',
    path: '/admin/categories',
    description: 'Organize product categories',
  },
  {
    id: 'brands',
    label: 'Brands',
    path: '/admin/brands',
    description: 'Maintain brand details',
  },
];
