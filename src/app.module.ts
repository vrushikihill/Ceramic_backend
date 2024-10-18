import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { JwtModule } from '@nestjs/jwt';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { CacheInterceptor } from './@core/cache/cache.interceptor';
import { CustomCacheModule } from './@core/cache/cache.module';
import { CacheService } from './@core/cache/cache.service';
import { GlobalLoggerModule } from './@core/logging/GlobalLogger.module';
import { ApiModule } from './api/api.module';
import { config } from './@core/config';
import { PuppeteerModule } from './puppeteer/puppeteer.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [config],
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
      serveRoot: '/public/',
      serveStaticOptions: {
        dotfiles: 'allow',
      },
    }),
    BullModule.forRoot('redis-config', {
      redis: {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT as any as number,
      },
    }),
    EventEmitterModule.forRoot(),
    PuppeteerModule,
    CustomCacheModule,
    GlobalLoggerModule,
    JwtModule.register({
      global: true,
    }),
    ApiModule,
  ],
  providers: [CacheInterceptor, CacheService],
})
export class AppModule {}
