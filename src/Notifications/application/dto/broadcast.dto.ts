import { IsString, IsNotEmpty, IsOptional, IsIn, MaxLength } from 'class-validator';

export type AnnouncementType = 'GENERAL' | 'URGENTE' | 'PROMOCION';

export class BroadcastDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  title: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  message: string;

  @IsOptional()
  @IsIn(['GENERAL', 'URGENTE', 'PROMOCION'])
  type?: AnnouncementType;
}
