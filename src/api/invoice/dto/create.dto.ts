import { Optional } from '@nestjs/common';
import { invoice_status, invoice_type } from '@prisma/client';
import { Transform, Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsDate,
  IsDefined,
  IsIn,
  IsNotEmpty,
  IsNotEmptyObject,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

class AddressDto {
  @IsString()
  @Optional()
  street?: string;

  @IsString()
  @Optional()
  street2?: string;

  @IsString()
  @Optional()
  city?: string;

  @IsString()
  @Optional()
  zipCode?: string;

  @IsString()
  @Optional()
  state?: string;

  @IsString()
  @Optional()
  country?: string;
}

export class ProductDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  quantity: string;

  @IsString()
  @IsNotEmpty()
  rate: string;

  @IsString()
  @IsNotEmpty()
  amount: string;
}

export class CreateInvoiceDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @Transform(({ value }) => new Date(value))
  @IsDate()
  @IsNotEmpty()
  date: Date;

  @Transform(({ value }) => new Date(value))
  @IsDate()
  @IsNotEmpty()
  dueDate: Date;

  @IsString()
  @IsNotEmpty()
  invoiceNumber: string;

  @IsString()
  @IsNotEmpty()
  currency: string;

  @IsObject()
  @IsDefined()
  @ValidateNested()
  @IsNotEmptyObject()
  @Type(() => AddressDto)
  billingAddress: AddressDto;

  @IsObject()
  @IsDefined()
  @ValidateNested()
  @IsNotEmptyObject()
  @Type(() => AddressDto)
  shippingAddress: AddressDto;

  @IsString()
  @IsOptional()
  paymentType?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductDto)
  @ArrayNotEmpty()
  products: ProductDto[];

  @IsString()
  @IsNotEmpty()
  subTotal: string;

  @IsString()
  @IsNotEmpty()
  totalQuantity: string;

  @IsString()
  @Optional()
  tax?: string;

  @IsString()
  @Optional()
  discount?: string;

  @IsString()
  @Optional()
  adjustment?: string;

  @IsString()
  @IsNotEmpty()
  total: string;

  @IsString()
  @IsOptional()
  customerNote: string;

  @IsString()
  @IsIn(['DRAFT', 'PUBLISH'])
  status: invoice_status;

  @IsString()
  @IsIn([
    'INVOICE',
    'ESTIMATE',
    'SALES_BILLS',
    'PURCHASE_ORDERS',
    'PURCHASE_BILL',
  ])
  type: invoice_type;

  @IsString()
  @IsOptional()
  paymentTerms?: string;
}
