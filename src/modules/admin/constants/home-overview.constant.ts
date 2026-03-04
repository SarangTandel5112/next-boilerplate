import type { HomeActivityItem, HomeHighlightItem, HomeKpiItem } from '../types';

export const HOME_KPI_ITEMS: HomeKpiItem[] = [
  {
    label: 'Total products',
    value: '1,247',
    trend: '+42 added this month',
  },
  {
    label: 'Categories',
    value: '48',
    trend: '12 active',
  },
  {
    label: 'Brands',
    value: '24',
    trend: 'Catalog coverage 94%',
  },
];

export const HOME_ACTIVITY_ITEMS: HomeActivityItem[] = [
  {
    title: 'Catalog sync complete',
    details: 'Product data refreshed from source. 12 updates applied.',
    status: 'Healthy',
    time: '5 minutes ago',
  },
  {
    title: 'New products pending review',
    details: '4 products added and awaiting category assignment.',
    status: 'Attention',
    time: '18 minutes ago',
  },
  {
    title: 'Brand update available',
    details: 'Acme Lubricants logo and details updated.',
    status: 'Upcoming',
    time: '1 hour ago',
  },
];

export const HOME_HIGHLIGHTS: HomeHighlightItem[] = [
  {
    title: 'Catalog growth',
    summary: 'Product count increased by 8% this month.',
  },
  {
    title: 'Category coverage',
    summary: '97% of products have category assignments.',
  },
  {
    title: 'Brand consistency',
    summary: '4 brand profiles updated with latest assets.',
  },
];

export const HOME_QUICK_ACTION_IDS = ['products', 'categories', 'brands'] as const;
