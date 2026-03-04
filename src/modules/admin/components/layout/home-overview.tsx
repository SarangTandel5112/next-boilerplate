import type { AdminNavigationId, HomeQuickAction } from '../../types';
import Link from 'next/link';
import { Badge, buttonVariants, Card, CardContent, CardHeader, CardTitle, cn } from '@/modules/common';
import { ADMIN_NAVIGATION, HOME_ACTIVITY_ITEMS, HOME_HIGHLIGHTS, HOME_KPI_ITEMS, HOME_QUICK_ACTION_IDS } from '../../constants';

const resolveQuickActions = (): HomeQuickAction[] => {
  const ids = new Set<AdminNavigationId>(HOME_QUICK_ACTION_IDS);

  return ADMIN_NAVIGATION
    .filter(item => ids.has(item.id) && item.id !== 'home')
    .map(item => ({
      id: item.id,
      label: item.label,
      href: item.path,
      note: item.description,
    }));
};

const statusClassMap: Record<'Healthy' | 'Attention' | 'Upcoming', string> = {
  Healthy: 'text-emerald-300 border-emerald-500/20 bg-emerald-500/10',
  Attention: 'text-amber-300 border-amber-500/20 bg-amber-500/10',
  Upcoming: 'text-blue-300 border-blue-500/20 bg-blue-500/10',
};

export const HomeOverview = () => {
  const quickActions = resolveQuickActions();

  return (
    <div className="flex flex-col gap-6">
      <section className="relative overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900/70 p-6 md:p-8">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(37,99,235,0.22),_transparent_46%),radial-gradient(circle_at_bottom_left,_rgba(14,116,144,0.16),_transparent_45%)]" />

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl space-y-4">
            <Badge variant="default">East Coast Lubricant Admin</Badge>
            <h2 className="text-3xl leading-tight font-semibold text-neutral-50 md:text-4xl">
              Welcome back. Manage products, categories, and brands from your admin workspace.
            </h2>
            <p className="text-sm text-neutral-300 md:text-base">
              Your control center is ready with key metrics, outstanding actions, and latest platform activity.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link href="/admin/products" className={cn(buttonVariants({ variant: 'outline' }))}>
              Add product
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {HOME_KPI_ITEMS.map(item => (
          <Card key={item.label} className="border-neutral-800 bg-neutral-900/70">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-neutral-300">{item.label}</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-3xl font-semibold text-neutral-100">{item.value}</p>
              <p className="mt-2 text-xs text-neutral-400">{item.trend}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <Card className="border-neutral-800 bg-neutral-900/70">
          <CardHeader>
            <CardTitle>Operational pulse</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {HOME_ACTIVITY_ITEMS.map(item => (
              <article key={item.title} className="rounded-lg border border-neutral-800 bg-neutral-950/70 p-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium text-neutral-100">{item.title}</p>
                  <span className={cn('rounded-full border px-2 py-0.5 text-xs', statusClassMap[item.status])}>
                    {item.status}
                  </span>
                </div>
                <p className="mt-2 text-sm text-neutral-300">{item.details}</p>
                <p className="mt-2 text-xs text-neutral-500">{item.time}</p>
              </article>
            ))}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="border-neutral-800 bg-neutral-900/70">
            <CardHeader>
              <CardTitle>Quick actions</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-2">
              {quickActions.map(action => (
                <Link
                  key={action.id}
                  href={action.href}
                  className="rounded-md border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-neutral-200 transition hover:border-blue-500/40 hover:text-blue-200"
                >
                  {action.label}
                </Link>
              ))}
            </CardContent>
          </Card>

          <Card className="border-neutral-800 bg-neutral-900/70">
            <CardHeader>
              <CardTitle>Highlights</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {HOME_HIGHLIGHTS.map(item => (
                <div key={item.title} className="rounded-md border border-neutral-800 bg-neutral-950/70 p-3">
                  <p className="text-sm font-medium text-neutral-100">{item.title}</p>
                  <p className="mt-1 text-xs text-neutral-400">{item.summary}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};
