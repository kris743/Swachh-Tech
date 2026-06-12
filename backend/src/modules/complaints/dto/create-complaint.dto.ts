import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { ComplaintType } from '../../../common/prisma-enums';;

export class CreateComplaintDto {
  @IsEnum(ComplaintType)
  @IsNotEmpty()
  type: ComplaintType;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNumber()
  @IsNotEmpty()
  gpsLatitude: number;

  @IsNumber()
  @IsNotEmpty()
  gpsLongitude: number;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  imageUrl?: string;
}
