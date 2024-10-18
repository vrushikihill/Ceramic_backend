import { HttpService } from '@nestjs/axios';
import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AxiosError } from 'axios';
import { catchError, firstValueFrom } from 'rxjs';
import { OAuthClass } from './classes/oauth.class';
import { ICallbackQuery } from './interfaces/callback-query.interface';
import { IClient } from './interfaces/client.interface';
import { isNull } from 'src/@core/utils';
import { OAuthProvidersEnum } from 'src/constants/types';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';

type SignTokenArgs = {
  userId: string;
  email: string;
  role: string;
};

@Injectable()
export class Oauth2Service {
  private readonly [OAuthProvidersEnum.MICROSOFT]: OAuthClass | null;
  private readonly [OAuthProvidersEnum.GOOGLE]: OAuthClass | null;

  constructor(
    private readonly userService: UserService,
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly jwt: JwtService,
  ) {
    const url = configService.get<string>('url');
    this[OAuthProvidersEnum.MICROSOFT] = Oauth2Service.setOAuthClass(
      OAuthProvidersEnum.MICROSOFT,
      configService,
      url,
    );
    this[OAuthProvidersEnum.GOOGLE] = Oauth2Service.setOAuthClass(
      OAuthProvidersEnum.GOOGLE,
      configService,
      url,
    );
  }

  private static setOAuthClass(
    provider: OAuthProvidersEnum,
    config: ConfigService,
    url: string,
  ): OAuthClass | null {
    const client = config.get<IClient | null>(
      `oauth2.${provider.toLowerCase()}`,
    );

    if (isNull(client)) {
      return null;
    }

    return new OAuthClass(provider, client, url);
  }

  public getAuthorizationUrl(provider: OAuthProvidersEnum): string {
    return this.getOAuth(provider).authorizationUrl;
  }

  public async getUserData<T extends Record<string, any>>(
    provider: OAuthProvidersEnum,
    cbQuery: ICallbackQuery,
  ): Promise<T> {
    const { code, state } = cbQuery;
    const accessToken = await this.getAccessToken(provider, code, state);

    const dataUrl = this.getOAuth(provider).dataUrl;

    const userData = await firstValueFrom(
      this.httpService
        .get<T>(dataUrl, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
        })
        .pipe(
          catchError((error: AxiosError) => {
            throw new UnauthorizedException(error.message);
          }),
        ),
    );
    return userData.data;
  }

  public async login(
    provider: OAuthProvidersEnum,
    email: string,
    name: string,
  ) {
    const user = await this.userService.findOrCreate({
      email,
      name,
      role: 'ADMIN',
      provider: provider,
    });

    const { authToken } = await this.signToken({
      email: user.email,
      role: user.role,
      userId: user.id,
    });

    return authToken;
  }

  private getOAuth(provider: OAuthProvidersEnum): OAuthClass {
    const oauth = this[provider];

    if (isNull(oauth)) {
      throw new NotFoundException('Page not found');
    }

    return oauth;
  }

  private async getAccessToken(
    provider: OAuthProvidersEnum,
    code: string,
    state: string,
  ): Promise<string> {
    const oauth = this.getOAuth(provider);

    if (state !== oauth.state) {
      throw new UnauthorizedException('Corrupted state');
    }

    return await oauth.getToken(code);
  }

  private async signToken({
    userId,
    email,
    role,
  }: SignTokenArgs): Promise<{ authToken: string }> {
    const payload = {
      sub: userId,
      email,
      role,
    };
    const secret = this.configService.get<string>('jwtApiSecret');

    const token = await this.jwt.signAsync(payload, {
      expiresIn: '15d',
      secret: secret,
    });

    return {
      authToken: token,
    };
  }
}
