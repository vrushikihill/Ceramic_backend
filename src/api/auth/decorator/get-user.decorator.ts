import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GetUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();

    if (!request.user) {
      return null;
    }

    if (data) {
      return (request.user as any)[data];
    }
    return request.user;
  },
);

export const GetUserRequest = (request: any, data?: string) => {
  if (!request.user) {
    return null;
  }
  if (data) {
    return (request.user as any)[data];
  }
  return request.user;
};
