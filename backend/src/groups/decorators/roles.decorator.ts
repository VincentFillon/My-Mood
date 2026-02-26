import { SetMetadata } from '@nestjs/common';
import { MemberRole } from '../../../generated/prisma/client.js';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: MemberRole[]) => SetMetadata(ROLES_KEY, roles);
