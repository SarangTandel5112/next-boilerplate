'use client';

import type { AdminNavigationItem } from '../types';
import { usePathname } from 'next/navigation';
import { useMemo } from 'react';

const isActiveRoute = (pathname: string, itemPath: string): boolean => {
  if (itemPath === '/') {
    return pathname === '/';
  }

  return pathname === itemPath || pathname.startsWith(`${itemPath}/`);
};

export type UseSidebarResult = {
  pathname: string;
  activeItem?: AdminNavigationItem;
};

export const useSidebar = (navigation: AdminNavigationItem[]): UseSidebarResult => {
  const pathname = usePathname();

  const activeItem = useMemo(
    () => navigation.find(item => isActiveRoute(pathname, item.path)),
    [navigation, pathname],
  );

  return {
    pathname,
    activeItem,
  };
};
