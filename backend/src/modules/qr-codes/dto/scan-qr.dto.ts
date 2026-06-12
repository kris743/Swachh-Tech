import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { WasteType } from '../../../common/prisma-enums';;

export class ScanQrDto {
  @IsString()
  @IsNotEmpty()
  code: string;

  @IsNumber()
  @IsNotEmpty()
  gpsLatitude: number;

  @IsNumber()
  @IsNotEmpty()
  gpsLongitude: number;

  @IsEnum(WasteType)
  @IsNotEmpty()
  wasteType: WasteType;

  @IsNumber()
  @IsOptional()
  weight?: number;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsString()
  @IsOptional()
  imageUrl?: string;
}
