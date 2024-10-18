// cacheable.decorator.js
import { SetMetadata } from '@nestjs/common';

type Args = {
  ttl?: number;
  strategy?: string;
};

export const Cacheable = (args: Args = {}) => {
  const { ttl, strategy } = args;

  return SetMetadata('cacheable', {
    ttl,
    strategy,
  });
};
