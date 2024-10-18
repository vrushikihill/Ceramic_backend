import { CacheModule } from '@nestjs/cache-manager';
import { Global, Module } from '@nestjs/common';
import * as redisStore from 'cache-manager-redis-store';
import { CacheInterceptor } from './cache.interceptor';
import { CacheService } from './cache.service';
import { GenerateCacheKeyService } from './generate-cache-key.service';
import { ConfigModule } from '@nestjs/config';

@Global()
@Module({
  providers: [CacheService, CacheInterceptor, GenerateCacheKeyService],
  exports: [CacheInterceptor, CacheService, GenerateCacheKeyService],
  imports: [
    ConfigModule.forRoot(),
    CacheModule.register({
      isGlobal: true,
      store: redisStore,
      host: process.env['REDIS_HOST'],
      port: process.env['REDIS_PORT'],
    }),
  ],
})
export class CustomCacheModule {}
