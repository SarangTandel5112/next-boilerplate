import type { AdminNavigationItem } from '../../types';
import { AppLogo } from '@/modules/common';
import { SidebarItem } from './sidebar-item';

const isPathActive = (pathname: string, itemPath: string): boolean => {
  if (itemPath === '/') {
    return pathname === '/';
  }

  return pathname === itemPath || pathname.startsWith(`${itemPath}/`);
};

export type SidebarProps = {
  navigation: AdminNavigationItem[];
  activePath: string;
};

export const Sidebar = (props: SidebarProps) => {
  const { activePath, navigation } = props;

  return (
    <aside className="hidden h-full w-64 shrink-0 flex-col border-r border-neutral-800 bg-neutral-950 px-4 py-6 lg:flex">
      <div className="px-2">
        <AppLogo />
      </div>

      <nav className="mt-8 flex flex-1 flex-col gap-2" aria-label="Admin navigation">
        {navigation.map(item => (
          <SidebarItem key={item.id} item={item} isActive={isPathActive(activePath, item.path)} />
        ))}
      </nav>

      <div className="mt-6 rounded-lg border border-neutral-800 bg-neutral-900 p-4 text-xs text-neutral-400">
        Admin Panel
        <div className="mt-1 text-[11px]">Version 1.0</div>
      </div>
    </aside>
  );
};
