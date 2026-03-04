import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ADMIN_NAVIGATION, AdminLayout } from '@/modules/admin';
import { hasRequiredRole, RBAC_ROLES } from '@/server/auth/rbac';
import { SESSION_COOKIE_NAME, verifySessionToken } from '@/server/auth/session';

export default async function AdminRouteLayout(props: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const session = await verifySessionToken(token);

  if (!session || !hasRequiredRole(session.role, RBAC_ROLES.admin)) {
    redirect('/login?next=/admin');
  }

  return (
    <AdminLayout navigation={ADMIN_NAVIGATION}>
      {props.children}
    </AdminLayout>
  );
}
