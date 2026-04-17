import {
  IsEmail, IsNotEmpty, IsString, MinLength, MaxLength,
  IsOptional, IsDateString, IsNumber, IsBoolean, Matches,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty({ message: 'Los nombres son requeridos' })
  @MaxLength(100)
  nombres: string;

  @IsString()
  @IsNotEmpty({ message: 'Los apellidos son requeridos' })
  @MaxLength(100)
  apellidos: string;

  @IsEmail()
  @IsNotEmpty({ message: 'El email es requerido' })
  @MaxLength(100)
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'La contraseña es requerida' })
  @MinLength(6)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: 'La contraseña debe tener mayúscula, minúscula y número',
  })
  password: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  telefono?: string;

  @IsOptional()
  @IsDateString()
  fecha_nacimiento?: string;


  @IsOptional()
  @IsBoolean()
  activo?: boolean;

  @IsOptional()
  @IsNumber()
  @IsNotEmpty({ message: 'El rol es requerido' })
  rol_id: number;

  @IsOptional()
  @IsNumber()
  gym_id?: number;

}
