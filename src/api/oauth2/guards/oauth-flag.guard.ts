import {
  CanActivate,
  ExecutionContext,
  mixin,
  NotFoundException,
  Type,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { isNull } from 'src/@core/utils';
import { IClient } from '../interfaces/client.interface';
import { OAuthProvidersEnum } from 'src/constants/types';

export const OAuthFlagGuard = (
  provider: OAuthProvidersEnum,
): Type<CanActivate> => {
  class OAuthFlagGuardClass implements CanActivate {
    constructor(private readonly configService: ConfigService) {}

    public canActivate(context: ExecutionContext): boolean {
      const client = this.configService.get<IClient | null>(
        `oauth2.${provider}`,
      );

      if (isNull(client)) {
        const request = context.switchToHttp().getRequest<Request>();
        throw new NotFoundException(`Cannot ${request.method} ${request.url}`);
      }

      return true;
    }
  }

  return mixin(OAuthFlagGuardClass);
};
