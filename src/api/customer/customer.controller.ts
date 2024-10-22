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
import { CacheInvalidator } from 'src/@core/cache/decorator/cache-invalidator.decorator';
import { Cacheable } from 'src/@core/cache/decorator/cacheable.decorator';
import { Roles } from 'src/constants/roles';
import { Role } from '../auth/decorator/role.decorator';
import { JwtGuard } from '../auth/guard/jwt.guard';
import { RoleGuard } from '../auth/guard/role.guard';
import { customer_type } from '@prisma/client';
import { CreateCustomerDto } from './dto/create.dto';
import { CustomerService } from './customer.service';

const PREFIX = 'CUSTOMER';

@Controller('customer')
@UseInterceptors(CacheInterceptor)
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

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
    @Query('type') type?: customer_type,
  ) {
    const [invoices, count] = await Promise.all([
      this.customerService.find({
        pagination: {
          pageSize: +pageSize || 10,
          page: +page || 0,
        },
        search: search,
        type: type,
      }),
      this.customerService.count({
        search,
        type: type,
      }),
    ]);

    return { data: invoices, pagination: { count } };
  }

  @Post('')
  @Role(Roles.ADMIN)
  @UseGuards(JwtGuard, RoleGuard)
  @CacheInvalidator({
    strategies: [`${PREFIX}::{URL}`],
  })
  async create(@Body() data: CreateCustomerDto) {
    return this.customerService.create(data);
  }
}
