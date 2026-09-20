import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';

// Pakai di controller: @Roles('ADMIN') atau @Roles('ADMIN', 'NASABAH')
export const Roles = (...roles: ('NASABAH' | 'ADMIN')[]) =>
  SetMetadata(ROLES_KEY, roles);