import {
  ArrayMinSize,
  ArrayNotEmpty,
  IsArray,
  IsIn,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export type AnnouncementType = 'GENERAL' | 'URGENTE' | 'PROMOCION';

export class BroadcastDto {
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  title: string;

  @IsString()
  @MinLength(1)
  @MaxLength(500)
  message: string;

  @IsIn(['GENERAL', 'URGENTE', 'PROMOCION'])
  type: AnnouncementType;

  @IsArray()
  @ArrayNotEmpty()
  @ArrayMinSize(1)
  @IsString({ each: true })
  tokens: string[];
}
