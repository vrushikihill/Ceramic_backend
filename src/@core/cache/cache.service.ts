// cache.service.js
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cache } from 'cache-manager';

enum Status {
  SUCCESS,
  FAIL,
  PENDING,
}

@Injectable()
export class CacheService {
  status: Status = Status.PENDING;

  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {
    const client = (cacheManager.store as any)?.getClient();

    const logger = new Logger(CacheService.name);

    client.on('error', (error: Error) => {
      this.status = Status.FAIL;

      logger.error({
        level: 'error',
        stack: error.stack,
        message: `Error: ${error.message}`,
        error: error,
      });
    });

    client.on('connect', () => {
      this.status = Status.SUCCESS;

      logger.log({
        level: 'info',
        message: 'Redis client connected',
      });
    });
  }

  private checkStatusOrThrow() {
    if (this.status === Status.FAIL) {
      throw new Error('Redis client not connected');
    }
  }

  get(key: string) {
    this.checkStatusOrThrow();

    return this.cacheManager.get(key);
  }

  set(key: string, value: any, ttl: number) {
    this.checkStatusOrThrow();

    return this.cacheManager.set(key, value, ttl);
  }

  delete(key: string) {
    this.checkStatusOrThrow();

    return this.cacheManager.del(key);
  }

  async multipleDel(keys: string[]) {
    this.checkStatusOrThrow();

    return await Promise.all(
      keys.map(async (key) => {
        return this.delete(key);
      }),
    );
  }

  keys(pattern?: string) {
    this.checkStatusOrThrow();

    return new Promise<string[]>(async (resolve, reject) => {
      try {
        const keys = await this.cacheManager.store.keys('*' + pattern + '*');

        resolve(keys);
      } catch (error) {
        reject(error);
      }
    });
  }

  async deleteKeysByPattern(pattern: string): Promise<void> {
    this.checkStatusOrThrow();

    const keys = await this.keys(pattern);

    if (keys.length === 0) {
      return;
    }

    await this.multipleDel(keys);
  }
}
