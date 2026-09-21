import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';


export const Roles = (...roles: ('NASABAH' | 'ADMIN')[]) =>
  SetMetadata(ROLES_KEY, roles);