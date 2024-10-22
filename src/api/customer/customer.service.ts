import { Injectable } from '@nestjs/common';
import { customer_type } from '@prisma/client';
import { PaginationDto } from 'src/constants/dto/pagination.dto';
import { PrismaService } from 'src/prisma/prisma.service';

type FindArgs = {
  pagination: PaginationDto;
  search?: string;
  type?: customer_type;
};

type CountArgs = {
  search?: string;
  type?: customer_type;
};

type CreateArgs = {
  salutation: string;
  firstName: string;
  lastName: string;
  companyName?: string;
  displayName: string;
  email?: string;
  businessPhone: string;
  mobile?: string;
  gstIn?: string;
  pan?: string;
  currency: string;
  paymentTerms?: string;
  creditLimit?: string;
  panCardImage?: any;
  billingAddress?: any;
  shippingAddress?: any;
  remarks?: string;
  type: customer_type;
};

const defaultValues = {
  billingAddress: true,
  businessPhone: true,
  companyName: true,
  creditLimit: true,
  currency: true,
  displayName: true,
  email: true,
  firstName: true,
  gstIn: true,
  id: true,
  lastName: true,
  mobile: true,
  pan: true,
  panCardImage: true,
  paymentTerms: true,
  remarks: true,
  salutation: true,
  shippingAddress: true,
  type: true,
};

@Injectable()
export class CustomerService {
  constructor(private readonly prisma: PrismaService) {}

  async find({ pagination, search, type }: FindArgs) {
    return await this.prisma.customer.findMany({
      skip: pagination.page * pagination.pageSize,
      take: pagination.pageSize,
      select: defaultValues,
      where: {
        displayName: {
          contains: search,
        },
        type: {
          equals: type,
        },
      },
    });
  }

  async create(data: CreateArgs) {
    return await this.prisma.customer.create({
      data,
    });
  }

  async count({ search, type }: CountArgs) {
    return await this.prisma.customer.count({
      where: {
        displayName: {
          contains: search,
        },
        type: {
          equals: type,
        },
      },
    });
  }
}
