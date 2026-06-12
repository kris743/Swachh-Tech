import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

export class EarnRewardDto {
  @IsString()
  @IsNotEmpty()
  action: string;

  @IsInt()
  @Min(1)
  points: number;

  @IsString()
  @IsNotEmpty()
  description: string;
}
