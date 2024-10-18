// cache-invalidator.decorator.js
import { SetMetadata } from '@nestjs/common';

type Args = {
  strategies?: string[];
};

export const CacheInvalidator = (args: Args) =>
  SetMetadata('cacheInvalidator', args);
