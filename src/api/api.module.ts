import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { EmailModule } from 'src/@core/email/email.module';
import { HttpLoggingMiddleware } from 'src/@core/middleware/http-logger.middleware';
import { ResponseMiddleware } from 'src/@core/middleware/response.middleware';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { CommonModule } from './common/common.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [AuthModule, UserModule, PrismaModule, EmailModule, CommonModule],
})
export class ApiModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(ResponseMiddleware).forRoutes('*');
    consumer.apply(HttpLoggingMiddleware).forRoutes('*');
  }
}
