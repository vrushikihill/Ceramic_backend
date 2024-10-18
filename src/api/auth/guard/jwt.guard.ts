import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';

export class JwtGuard extends AuthGuard('jwt') {
  private readonly reflector: Reflector;
  constructor() {
    super();
    this.reflector = new Reflector();
  }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const isAuthOptional = this.reflector.get<boolean>(
      'isAuthOptional',
      context.getHandler(),
    );

    const request = context.switchToHttp().getRequest();
    const authToken = request.headers.authorization;

    if (isAuthOptional && !authToken) {
      return true;
    }

    return super.canActivate(context);
  }
}
