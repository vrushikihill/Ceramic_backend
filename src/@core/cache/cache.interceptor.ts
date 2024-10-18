// cache.interceptor.js
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, of, tap } from 'rxjs';
import { CacheService } from './cache.service';
import { GenerateCacheKeyService } from './generate-cache-key.service';

@Injectable()
export class CacheInterceptor implements NestInterceptor {
  logger = new Logger(CacheInterceptor.name);
  constructor(
    private cacheService: CacheService,
    private generateCacheKeyService: GenerateCacheKeyService,
    private readonly reflector: Reflector,
  ) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    try {
      // Get the request object
      const request = context.switchToHttp().getRequest();

      const url = request.url;

      const { cacheable, cacheKeyStrategies, cacheableTTL } =
        this.getMetadata(context);

      if (cacheable) {
        // Generate a unique cache key based on the route and request parameters
        const cacheKey = this.generateCacheKey({
          request,
          strategy: cacheKeyStrategies,
        });

        // Check cache
        const cachedData = await this.cacheService.get(cacheKey);

        if (cachedData) {
          this.logger.log({
            message: `Cache Hit! | Cache Key: ${cacheKey} | URL: ${url}`,
            level: 'debug',
          }); // If data is found in cache, return it immediately

          return of(cachedData);
        }

        return next.handle().pipe(
          tap((response) => {
            this.logger.log({
              message: `Cache Missed! | Cache Key: ${cacheKey} | URL: ${url}`,
              level: 'debug',
            });
            this.cacheService.set(cacheKey, response, cacheableTTL);
          }),
        );
      }

      this.handleInvalidateCache(context, request);

      return next.handle();
    } catch (error) {
      this.logger.error({
        level: 'error',
        stack: error.stack,
        message: `Error: ${error.message}`,
        error: error,
      });

      return next.handle();
    }
  }

  private getMetadata(context: ExecutionContext) {
    const methodHandler = context.getHandler();

    const cacheableMetadata = this.reflector.get('cacheable', methodHandler);

    if (!cacheableMetadata) {
      return {
        cacheable: false,
        cacheableTTL: undefined,
        cacheKeyStrategies: undefined,
      };
    }

    const { ttl, strategy } = cacheableMetadata;

    return {
      cacheable: true,
      cacheableTTL: ttl || 3600,
      cacheKeyStrategies: strategy,
    };
  }

  private async handleInvalidateCache(context: ExecutionContext, request: any) {
    try {
      // Check if cache invalidation is requested for this route
      const cacheInvalidator: {
        strategies?: string[];
      } = this.reflector.get('cacheInvalidator', context.getHandler());
      if (cacheInvalidator) {
        await Promise.all(
          cacheInvalidator.strategies.map((strategy) => {
            const cacheKey = this.generateCacheKey({
              request,
              strategy: strategy,
            });

            this.logger.log({
              message: `Cache Invalidated! | Cache Key: ${cacheKey} | URL: ${request.url}`,
              level: 'debug',
            });

            // Invalidate cache based on the provided cache key pattern
            return this.cacheService.deleteKeysByPattern(cacheKey);
          }),
        );
      }
    } catch (error) {
      this.logger.error({
        level: 'error',
        stack: error.stack,
        message: `Error: ${error.message}`,
        error: error,
      });
    }
  }

  private generateCacheKey({
    request,
    strategy,
  }: {
    request: any;
    strategy?: string;
  }) {
    return this.generateCacheKeyService.generateCacheKey({
      request,
      strategy,
    });
  }
}
