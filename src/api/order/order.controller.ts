import {
  Body,
  Controller,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CacheInterceptor } from 'src/@core/cache/cache.interceptor';
import { OrderService } from './order.service';
import { Role } from '../auth/decorator/role.decorator';
import { Roles } from 'src/constants/roles';
import { JwtGuard } from '../auth/guard/jwt.guard';
import { RoleGuard } from '../auth/guard/role.guard';
import { CacheInvalidator } from 'src/@core/cache/decorator/cache-invalidator.decorator';
import { CreateOrderDto } from './dto/create.dto';

const PREFIX = 'ORDER';

@Controller('orders')
@UseInterceptors(CacheInterceptor)
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post('')
  @Role(Roles.ADMIN)
  @UseGuards(JwtGuard, RoleGuard)
  @CacheInvalidator({
    strategies: [`${PREFIX}::{URL}`],
  })
  async create(@Body() data: CreateOrderDto) {
    return this.orderService.create(data);
  }
}
