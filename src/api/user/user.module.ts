import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { AuthModule } from '../auth/auth.module';
import { UserListener } from './listeners/user.listener';

@Module({
  imports: [AuthModule],
  providers: [UserService, UserListener],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}
