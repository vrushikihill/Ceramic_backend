import { Injectable } from '@nestjs/common';
import { order_status } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

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

@Injectable()
export class OrderService {
  constructor(private readonly prisma: PrismaService) {}

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
}
