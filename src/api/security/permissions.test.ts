import { describe, expect, it } from 'vitest';
import { PERMISSIONS, hasPermission, type UserRole } from './permissions.js';

describe('hasPermission', () => {
  it('admin can read users', () => {
    expect(hasPermission('admin', PERMISSIONS.USER_READ)).toBe(true);
  });

  it('member cannot ban users', () => {
    expect(hasPermission('member', PERMISSIONS.USER_BAN)).toBe(false);
  });

  it('owner can do everything via wildcard', () => {
    expect(hasPermission('owner', PERMISSIONS.USER_BAN)).toBe(true);
    expect(hasPermission('owner', PERMISSIONS.SYSTEM_READ)).toBe(true);
    expect(hasPermission('owner', '*')).toBe(true);
  });

  it('unknown role is denied when coerced to role type unsafely', () => {
    const invalidRole = 'superadmin' as UserRole;
    expect(hasPermission(invalidRole, PERMISSIONS.USER_READ)).toBe(false);
  });
});
