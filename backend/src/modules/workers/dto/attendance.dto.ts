import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class AttendanceCheckInDto {
  @IsNumber()
  @IsNotEmpty()
  latitude: number;

  @IsNumber()
  @IsNotEmpty()
  longitude: number;
}
