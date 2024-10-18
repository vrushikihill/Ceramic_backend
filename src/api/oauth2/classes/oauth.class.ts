import { randomBytes } from 'crypto';
import { AuthorizationCode } from 'simple-oauth2';
import { IAuthParams } from '../interfaces/auth-params.interface';
import { IClient } from '../interfaces/client.interface';
import { IProvider } from '../interfaces/provider.interface';
import { OAuthProvidersEnum } from 'src/constants/types';

export class OAuthClass {
  private static readonly [OAuthProvidersEnum.MICROSOFT]: IProvider = {
    authorizeHost: 'https://login.microsoftonline.com',
    authorizePath: '/common/oauth2/v2.0/authorize',
    tokenHost: 'https://login.microsoftonline.com',
    tokenPath: '/common/oauth2/v2.0/token',
  };
  private static readonly [OAuthProvidersEnum.GOOGLE]: IProvider = {
    authorizeHost: 'https://accounts.google.com',
    authorizePath: '/o/oauth2/v2/auth',
    tokenHost: 'https://www.googleapis.com',
    tokenPath: '/oauth2/v4/token',
  };

  private static userDataUrls: Record<OAuthProvidersEnum, string> = {
    [OAuthProvidersEnum.GOOGLE]:
      'https://www.googleapis.com/oauth2/v3/userinfo',
    [OAuthProvidersEnum.MICROSOFT]: 'https://graph.microsoft.com/v1.0/me',
    [OAuthProvidersEnum.LOCAL]: '',
  };

  private readonly code: AuthorizationCode;
  private readonly authorization: IAuthParams;
  private readonly userDataUrl: string;

  constructor(
    private readonly provider: OAuthProvidersEnum,
    private readonly client: IClient,
    private readonly url: string,
  ) {
    if (this.provider === OAuthProvidersEnum.LOCAL) {
      throw new Error('Invalid provider');
    }

    this.code = new AuthorizationCode({
      client: this.client,
      auth: OAuthClass[this.provider],
    });
    this.authorization = OAuthClass.genAuthorization(this.provider, this.url);
    this.userDataUrl = OAuthClass.userDataUrls[this.provider];
  }

  public get state(): string {
    return this.authorization.state;
  }

  public get dataUrl(): string {
    return this.userDataUrl;
  }

  public get authorizationUrl(): string {
    return this.code.authorizeURL(this.authorization);
  }

  private static genAuthorization(
    provider: OAuthProvidersEnum,
    url: string,
  ): IAuthParams {
    const redirect_uri = `${url}/v2/auth/${provider}/callback`;
    const state = randomBytes(16).toString('hex');

    switch (provider) {
      case OAuthProvidersEnum.GOOGLE:
        return {
          state,
          redirect_uri,
          scope: [
            'https://www.googleapis.com/auth/userinfo.email',
            'https://www.googleapis.com/auth/userinfo.profile',
          ],
        };
      case OAuthProvidersEnum.MICROSOFT:
        return {
          state,
          redirect_uri,
          scope: [
            'openid',
            'profile',
            'email',
            'https://graph.microsoft.com/User.Read',
          ],
        };
    }
  }

  public async getToken(code: string): Promise<string> {
    const result = await this.code.getToken({
      code,
      redirect_uri: this.authorization.redirect_uri,
      scope: this.authorization.scope,
    });
    return result.token.access_token as string;
  }
}
