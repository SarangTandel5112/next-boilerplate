import type { AdminNavigationItem } from '../../types';
import Link from 'next/link';
import { buttonVariants, cn } from '@/modules/common';

export type SidebarItemProps = {
  item: AdminNavigationItem;
  isActive: boolean;
};

export const SidebarItem = (props: SidebarItemProps) => {
  const { item, isActive } = props;

  return (
    <Link
      href={item.path}
      className={cn(
        buttonVariants({ variant: isActive ? 'default' : 'ghost' }),
        'w-full justify-start text-neutral-100',
      )}
      aria-current={isActive ? 'page' : undefined}
    >
      {item.label}
    </Link>
  );
};
