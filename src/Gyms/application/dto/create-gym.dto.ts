import { IsNotEmpty, IsString, MaxLength, IsOptional, IsEmail, IsBoolean } from 'class-validator';

export class CreateGymDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre es requerido' })
  @MaxLength(100)
  nombre: string;

  @IsString()
  @IsNotEmpty({ message: 'La ubicación es requerida' })
  @MaxLength(255)
  ubicacion: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  telefono?: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(100)
  email?: string;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}
