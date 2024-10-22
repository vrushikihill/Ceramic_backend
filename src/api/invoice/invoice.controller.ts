import {
  Body,
  Controller,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CacheInterceptor } from 'src/@core/cache/cache.interceptor';
import { CacheInvalidator } from 'src/@core/cache/decorator/cache-invalidator.decorator';
import { Roles } from 'src/constants/roles';
import { Role } from '../auth/decorator/role.decorator';
import { JwtGuard } from '../auth/guard/jwt.guard';
import { RoleGuard } from '../auth/guard/role.guard';
import { CreateInvoiceDto } from './dto/create.dto';
import { InvoiceService } from './invoice.service';

const PREFIX = 'INVOICE';

@Controller('invoice')
@UseInterceptors(CacheInterceptor)
export class InvoiceController {
  constructor(private readonly invoiceService: InvoiceService) {}

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
