import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);

export const RoleNames = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  EMPLEADO: 'empleado',
  CLIENTE: 'cliente',
} as const;
