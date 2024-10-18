// optional.decorator.ts
import { SetMetadata } from '@nestjs/common';

export const OptionalAuth = () => SetMetadata('isAuthOptional', true);
