'use client';

import type { AdminLayoutProps } from '../../types';
import { useSidebar } from '../../hooks';
import { AdminHeader } from '../header/admin-header';
import { Sidebar } from '../sidebar/sidebar';
import { PageContainer } from './page-container';

export const AdminLayout = (props: AdminLayoutProps) => {
  const { children, navigation } = props;
  const { activeItem, pathname } = useSidebar(navigation);

  return (
    <div className="h-screen overflow-hidden bg-neutral-950">
      <div className="flex h-full">
        <Sidebar activePath={pathname} navigation={navigation} />
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <AdminHeader activeItem={activeItem} />
          <PageContainer>{children}</PageContainer>
        </div>
      </div>
    </div>
  );
};
