import { Injectable } from '@nestjs/common';
import { invoice_status, invoice_type } from '@prisma/client';
import { PaginationDto } from 'src/constants/dto/pagination.dto';
import { PrismaService } from 'src/prisma/prisma.service';

type FindArgs = {
  pagination: PaginationDto;
  search?: string;
  type?: invoice_type;
};

type CountArgs = {
  search?: string;
  type?: invoice_type;
};

type CreateArgs = {
  name: string;
  date: Date;
  dueDate: Date;
  invoiceNumber: string;
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
  status: invoice_status;
  paymentTerms?: string;
  type: invoice_type;
};

const defaultValue = {
  id: true,
  date: true,
  dueDate: true,
  invoiceNumber: true,
  adjustment: true,
  billingAddress: true,
  currency: true,
  customerNote: true,
  discount: true,
  name: true,
  paymentTerms: true,
  paymentType: true,
  products: true,
  shippingAddress: true,
  status: true,
  subTotal: true,
  tax: true,
  total: true,
  totalQuantity: true,
  type: true,
};

@Injectable()
export class InvoiceService {
  constructor(private readonly prisma: PrismaService) {}

  async find({ pagination, search, type }: FindArgs) {
    return await this.prisma.invoice.findMany({
      skip: pagination.page * pagination.pageSize,
      take: pagination.pageSize,
      select: defaultValue,
      where: {
        name: {
          contains: search,
        },
        type: {
          equals: type,
        },
      },
    });
  }

  async create(data: CreateArgs) {
    const invoice = await this.prisma.invoice.create({
      data: {
        name: data.name,
        date: data.date,
        dueDate: data.dueDate,
        invoiceNumber: data.invoiceNumber,
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
        type: data.type,
      },
      select: defaultValue,
    });

    if (invoice.type === 'INVOICE') {
      await this.prisma.order.create({
        data: {
          name: data.name,
          date: data.date,
          dueDate: data.dueDate,
          number: data.invoiceNumber,
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
          status: 'SUCCESS',
          paymentTerms: data.paymentTerms,
          products: data.products,
          invoice: {
            connect: {
              id: invoice.id,
            },
          },
        },
      });
    }
    return invoice;
  }

  async count({ search, type }: CountArgs) {
    return await this.prisma.invoice.count({
      where: {
        name: {
          contains: search,
        },
        type: {
          equals: type,
        },
      },
    });
  }
}
