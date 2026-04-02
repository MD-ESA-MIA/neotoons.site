export const ROLES = ['owner', 'admin', 'member'] as const;

export type UserRole = (typeof ROLES)[number];

export const PERMISSIONS = {
  USER_READ: 'user:read',
  USER_UPDATE: 'user:update',
  USER_BAN: 'user:ban',
  DASHBOARD_READ: 'dashboard:read',
  ACTIVITY_READ: 'activity:read',
  SYSTEM_READ: 'system:read',
  AI_READ: 'ai:read',
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS] | '*';

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  owner: ['*'],
  admin: [
    PERMISSIONS.USER_READ,
    PERMISSIONS.USER_UPDATE,
    PERMISSIONS.USER_BAN,
    PERMISSIONS.DASHBOARD_READ,
    PERMISSIONS.ACTIVITY_READ,
    PERMISSIONS.SYSTEM_READ,
    PERMISSIONS.AI_READ,
  ],
  member: [],
};

export function hasPermission(role: UserRole, permission: Permission): boolean {
  const perms = ROLE_PERMISSIONS[role] || [];
  return perms.includes('*') || perms.includes(permission);
}
