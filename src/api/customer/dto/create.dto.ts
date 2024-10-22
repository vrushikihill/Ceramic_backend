import { customer_type } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsDefined,
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsNotEmptyObject,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

class PanCardImage {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  type: string;

  @IsString()
  @IsNotEmpty()
  url: string;
}

class BillingAddress {
  @IsString()
  @IsOptional()
  fullName?: string;

  @IsString()
  @IsOptional()
  street1?: string;

  @IsString()
  @IsOptional()
  street2?: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  pinCode?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  state?: string;

  @IsString()
  @IsOptional()
  country?: string;
}

export class CreateCustomerDto {
  @IsString()
  @IsNotEmpty()
  salutation: string;

  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsString()
  @IsOptional()
  companyName?: string;

  @IsString()
  @IsNotEmpty()
  displayName: string;

  @IsString()
  @IsOptional()
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  businessPhone: string;

  @IsString()
  @IsOptional()
  mobile?: string;

  @IsString()
  @IsOptional()
  gstIn?: string;

  @IsString()
  @IsOptional()
  pan?: string;

  @IsString()
  @IsNotEmpty()
  currency: string;

  @IsString()
  @IsOptional()
  paymentTerms?: string;

  @IsString()
  @IsOptional()
  creditLimit?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PanCardImage)
  @ArrayNotEmpty()
  panCardImage: PanCardImage[];

  @IsObject()
  @IsDefined()
  @ValidateNested()
  @IsNotEmptyObject()
  @Type(() => BillingAddress)
  billingAddress: BillingAddress;

  @IsObject()
  @IsDefined()
  @ValidateNested()
  @IsNotEmptyObject()
  @Type(() => BillingAddress)
  shippingAddress: BillingAddress;

  @IsString()
  @IsOptional()
  remarks?: string;

  @IsString()
  @IsIn(['CUSTOMER', 'VENDORS'])
  type: customer_type;
}
