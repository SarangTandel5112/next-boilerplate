import type { AdminNavigationId, AdminRoutePath } from './admin-navigation.type';

export type HomeKpiItem = {
  label: string;
  value: string;
  trend: string;
};

export type HomeQuickAction = {
  id: AdminNavigationId;
  label: string;
  href: AdminRoutePath;
  note: string;
};

export type HomeActivityItem = {
  title: string;
  details: string;
  status: 'Healthy' | 'Attention' | 'Upcoming';
  time: string;
};

export type HomeHighlightItem = {
  title: string;
  summary: string;
};
