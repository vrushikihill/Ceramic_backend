import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GetAuthToken = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();

    if (!request.headers.authorization) {
      return null;
    }

    return request.headers.authorization.split(' ')[1].trim();
  },
);
