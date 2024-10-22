import {
  Body,
  Controller,
  Get,
  Post,
  Query,
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
import { Cacheable } from 'src/@core/cache/decorator/cacheable.decorator';

const PREFIX = 'ORDER';

@Controller('orders')
@UseInterceptors(CacheInterceptor)
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Get('')
  @Role(Roles.ADMIN)
  @UseGuards(JwtGuard, RoleGuard)
  @Cacheable({
    strategy: `${PREFIX}::{URL}`,
  })
  async findAll(
    @Query('pageSize') pageSize?: string,
    @Query('page') page?: string,
    @Query('search') search?: string,
  ) {
    const [order, count] = await Promise.all([
      this.orderService.find({
        pagination: {
          pageSize: +pageSize || 10,
          page: +page || 0,
        },
        search: search,
      }),
      this.orderService.count({
        search,
      }),
    ]);

    return { data: order, pagination: { count } };
  }

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
