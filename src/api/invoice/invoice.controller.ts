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
import { CreateInvoiceDto } from './dto/create.dto';
import { InvoiceService } from './invoice.service';
import { invoice_type } from '@prisma/client';

const PREFIX = 'INVOICE';

@Controller('invoice')
@UseInterceptors(CacheInterceptor)
export class InvoiceController {
  constructor(private readonly invoiceService: InvoiceService) {}

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
    @Query('type') type?: invoice_type,
  ) {
    const [invoices, count] = await Promise.all([
      this.invoiceService.find({
        pagination: {
          pageSize: +pageSize || 10,
          page: +page || 0,
        },
        search: search,
        type: type,
      }),
      this.invoiceService.count({
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
  async create(@Body() data: CreateInvoiceDto) {
    return this.invoiceService.create(data);
  }
}
