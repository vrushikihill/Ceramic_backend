import { Module } from '@nestjs/common';
import { OAuth2Controller } from './oauth2.controller';
import { Oauth2Service } from './oauth2.service';
import { UserModule } from '../user/user.module';
import { HttpModule } from '@nestjs/axios';

@Module({
  controllers: [OAuth2Controller],
  providers: [Oauth2Service],
  imports: [
    UserModule,
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
  ],
})
export class OAuth2Module {}
