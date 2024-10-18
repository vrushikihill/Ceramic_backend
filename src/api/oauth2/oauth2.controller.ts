import { Controller, Get, HttpStatus, Query, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { OAuthProvidersEnum } from 'src/constants/types';
import { ICallbackQuery } from './interfaces/callback-query.interface';
import {
  IGoogleUser,
  IMicrosoftUser,
} from './interfaces/user-response.interface';
import { Oauth2Service } from './oauth2.service';

@Controller({
  version: '2',
  path: 'auth',
})
export class OAuth2Controller {
  private readonly url: string;

  constructor(
    private readonly oauth2Service: Oauth2Service,
    private readonly configService: ConfigService,
  ) {
    this.url = this.configService.get<string>('appUrl');
  }

  @Get('google/callback')
  public async googleCallback(
    @Res() res: Response,
    @Query() cbQuery: ICallbackQuery,
  ) {
    const provider = OAuthProvidersEnum.GOOGLE;
    const { name, email } = await this.oauth2Service.getUserData<IGoogleUser>(
      provider,
      cbQuery,
    );
    return this.loginAndRedirect(res, provider, email, name);
  }

  @Get('microsoft/callback')
  public async microsoftCallback(
    @Res() res: Response,
    @Query() cbQuery: ICallbackQuery,
  ) {
    const provider = OAuthProvidersEnum.MICROSOFT;
    return this.oauth2Service
      .getUserData<IMicrosoftUser>(provider, cbQuery)
      .then(({ displayName, mail }) =>
        this.loginAndRedirect(res, provider, mail, displayName),
      );
  }

  @Get('google')
  public google(@Res() res: Response) {
    return this.startRedirect(res, OAuthProvidersEnum.GOOGLE);
  }

  @Get('microsoft')
  public microsoft(@Res() res: Response) {
    return this.startRedirect(res, OAuthProvidersEnum.MICROSOFT);
  }

  private startRedirect(res: Response, provider: OAuthProvidersEnum): void {
    return res
      .status(HttpStatus.TEMPORARY_REDIRECT)
      .redirect(this.oauth2Service.getAuthorizationUrl(provider));
  }

  private async loginAndRedirect(
    res: Response,
    provider: OAuthProvidersEnum,
    email: string,
    name: string,
  ) {
    const accessToken = await this.oauth2Service.login(provider, email, name);

    return res
      .status(HttpStatus.PERMANENT_REDIRECT)
      .redirect(`${this.url}?access_token=${accessToken}`);
  }
}
