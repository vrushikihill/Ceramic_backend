import { Module, Global, Logger } from '@nestjs/common';

@Global()
@Module({
  providers: [
    {
      provide: Logger,
      useValue: new Logger(),
    },
    // Other global providers...
  ],
  exports: [Logger /* Other exports if needed */],
})
export class GlobalLoggerModule {}
