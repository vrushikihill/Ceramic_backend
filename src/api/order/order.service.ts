import { Injectable } from '@nestjs/common';
import { order_status } from '@prisma/client';
import { PaginationDto } from 'src/constants/dto/pagination.dto';
import { PrismaService } from 'src/prisma/prisma.service';

type FindArgs = {
  pagination: PaginationDto;
  search?: string;
};

type CountArgs = {
  search?: string;
};

type CreateArgs = {
  name: string;
  date: Date;
  dueDate: Date;
  number: string;
  currency: string;
  billingAddress: any;
  shippingAddress: any;
  paymentType?: string;
  products: any;
  subTotal: string;
  totalQuantity: string;
  tax?: string;
  discount?: string;
  adjustment?: string;
  total: string;
  customerNote?: string;
  status: order_status;
  paymentTerms?: string;
};

const defaultValue = {
  adjustment: true,
  billingAddress: true,
  currency: true,
  customerNote: true,
  date: true,
  discount: true,
  dueDate: true,
  id: true,
  name: true,
  number: true,
  paymentTerms: true,
  paymentType: true,
  products: true,
  shippingAddress: true,
  status: true,
  subTotal: true,
  tax: true,
  total: true,
  totalQuantity: true,
  invoceId: true,
};

@Injectable()
export class OrderService {
  constructor(private readonly prisma: PrismaService) {}

  async find({ pagination, search }: FindArgs) {
    return await this.prisma.order.findMany({
      skip: pagination.page * pagination.pageSize,
      take: pagination.pageSize,
      select: defaultValue,
      where: {
        name: {
          contains: search,
        },
      },
    });
  }

  async create(data: CreateArgs) {
    const order = await this.prisma.order.create({
      data: {
        name: data.name,
        date: data.date,
        dueDate: data.dueDate,
        number: data.number,
        currency: data.currency,
        billingAddress: data.billingAddress,
        shippingAddress: data.shippingAddress,
        paymentType: data.paymentType,
        subTotal: data.subTotal,
        totalQuantity: data.totalQuantity,
        tax: data.tax,
        discount: data.discount,
        adjustment: data.adjustment,
        total: data.total,
        customerNote: data.customerNote,
        status: data.status,
        paymentTerms: data.paymentTerms,
        products: data.products,
      },
    });

    return order;
  }

  async count({ search }: CountArgs) {
    return await this.prisma.order.count({
      where: {
        name: {
          contains: search,
        },
      },
    });
  }
}
