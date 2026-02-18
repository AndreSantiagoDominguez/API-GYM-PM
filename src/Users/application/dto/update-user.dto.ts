import {
  IsEmail, IsString, MinLength, MaxLength,
  IsOptional, IsDateString, IsNumber, IsBoolean, Matches,
  IsDate,
} from 'class-validator';
import { Type } from 'class-transformer'; 

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  nombres?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  apellidos?: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(100)
  email?: string;

  @IsOptional()
  @IsString()
  @MinLength(6)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: 'La contraseña debe tener mayúscula, minúscula y número',
  })
  password?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  telefono?: string;

  @IsOptional()
  @Type(() => Date) 
  @IsDateString()   
  fechaNacimiento?: String;

  @IsOptional()
  @IsNumber()
  rolId?: number;

  @IsOptional()
  @IsNumber()
  gymId?: number;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}
