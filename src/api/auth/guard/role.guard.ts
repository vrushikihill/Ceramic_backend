import { CanActivate, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Roles } from 'src/constants/roles';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  matchRoles(userRole: Roles, requiredRole: Roles): boolean {
    const currentRole = Roles[userRole];
    const required = Roles[requiredRole];

    if (!currentRole || !required) {
      return false;
    }

    return currentRole <= required;
  }

  canActivate(context: any): boolean {
    const requiredRole = this.reflector.get<string>(
      'requiredRole',
      context.getHandler(),
    );

    if (!requiredRole) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    return this.matchRoles(user.role, Roles[requiredRole]);
  }
}
