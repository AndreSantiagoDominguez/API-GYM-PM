import {
  IsEmail, IsNotEmpty, IsString, MinLength, MaxLength, IsOptional, IsDateString, Matches,
} from 'class-validator';

export class RegisterDto {
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
  fechaNacimiento?: string;
}
