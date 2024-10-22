import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { EmailModule } from 'src/@core/email/email.module';
import { HttpLoggingMiddleware } from 'src/@core/middleware/http-logger.middleware';
import { ResponseMiddleware } from 'src/@core/middleware/response.middleware';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { CommonModule } from './common/common.module';
import { UserModule } from './user/user.module';
import { OrderModule } from './order/order.module';
import { InvoiceModule } from './invoice/invoice.module';
import { CustomerModule } from './customer/customer.module';

@Module({
  imports: [
    AuthModule,
    UserModule,
    PrismaModule,
    EmailModule,
    CommonModule,
    OrderModule,
    InvoiceModule,
    CustomerModule,
  ],
})
export class ApiModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(ResponseMiddleware).forRoutes('*');
    consumer.apply(HttpLoggingMiddleware).forRoutes('*');
  }
}
