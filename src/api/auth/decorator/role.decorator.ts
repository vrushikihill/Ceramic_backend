import { SetMetadata } from '@nestjs/common';
import { Roles as RolesEnum } from 'src/constants/roles';

export const Role = (role: RolesEnum) => SetMetadata('requiredRole', role);
