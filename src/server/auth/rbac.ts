export const RBAC_ROLES = {
  admin: 'admin',
} as const;

export type RbacRole = (typeof RBAC_ROLES)[keyof typeof RBAC_ROLES];

export const hasRequiredRole = (role: string | undefined, requiredRole: RbacRole) => {
  return role === requiredRole;
};
