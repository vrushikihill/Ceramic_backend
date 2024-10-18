import { isUndefined } from '../utils';
import { IConfig } from './interfaces/config.interface';

export function config(): IConfig {
  return {
    port: parseInt(process.env.PORT, 10),
    host: process.env.HOST,
    url: process.env.URL,
    appUrl: process.env.APP_URL,
    jwtApiSecret: process.env.JWT_API_SECRET,
    authSecret: process.env.AUTH_SECRET,
    databaseUrl: process.env.DATABASE_URL,
    redisHost: process.env.REDIS_HOST,
    redisPort: parseInt(process.env.REDIS_PORT, 10),
    smtpHost: process.env.SMTP_HOST,
    smtpPort: parseInt(process.env.SMTP_PORT, 10),
    smtpNoreplyUser: process.env.SMTP_NOREPLY_USER,
    smtpNoreplyPass: process.env.SMTP_NOREPLY_PASS,
    googleClientId: process.env.GOOGLE_CLIENT_ID,
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
    microsoftClientId: process.env.MICROSOFT_CLIENT_ID,
    microsoftClientSecret: process.env.MICROSOFT_CLIENT_SECRET,
    oauth2: {
      microsoft:
        isUndefined(process.env.MICROSOFT_CLIENT_ID) ||
        isUndefined(process.env.MICROSOFT_CLIENT_SECRET)
          ? null
          : {
              id: process.env.MICROSOFT_CLIENT_ID,
              secret: process.env.MICROSOFT_CLIENT_SECRET,
            },
      google:
        isUndefined(process.env.GOOGLE_CLIENT_ID) ||
        isUndefined(process.env.GOOGLE_CLIENT_SECRET)
          ? null
          : {
              id: process.env.GOOGLE_CLIENT_ID,
              secret: process.env.GOOGLE_CLIENT_SECRET,
            },
    },
    appName: process.env.APP_NAME,
  };
}
