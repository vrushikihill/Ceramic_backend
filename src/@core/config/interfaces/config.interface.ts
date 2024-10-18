import { IOAuth2 } from './oauth2.interface';

export interface IConfig {
  readonly port: number;
  readonly host: string;
  readonly url: string;
  readonly appUrl: string;
  readonly jwtApiSecret: string;
  readonly authSecret: string;
  readonly databaseUrl: string;
  readonly redisHost: string;
  readonly redisPort: number;
  readonly smtpHost: string;
  readonly smtpPort: number;
  readonly smtpNoreplyUser: string;
  readonly smtpNoreplyPass: string;
  readonly googleClientId: string;
  readonly googleClientSecret: string;
  readonly microsoftClientId: string;
  readonly microsoftClientSecret: string;
  readonly appName: string;
  readonly oauth2: IOAuth2;
}
