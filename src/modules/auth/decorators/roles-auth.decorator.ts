import { SetMetadata } from '@nestjs/common';

import { ROLES_KEY } from '../constants';

export const RolesAuth = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
