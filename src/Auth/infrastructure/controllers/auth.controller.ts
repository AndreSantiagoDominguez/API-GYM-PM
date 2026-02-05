import { Controller, Post, Get, Body, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { LoginUseCase } from '../../application/login.use-case';
import { RegisterUseCase } from '../../application/register.use-case';
import { LoginDto } from '../../application/dto/login.dto';
import { RegisterDto } from '../../application/dto/register.dto';
import { JwtAuthGuard } from '../../../core/guards/jwt-auth.guard';
import { CurrentUser } from '../../../core/decorators/current-user.decorator';
import { User } from '../../../Users/domain/user.entity';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly loginUseCase: LoginUseCase,
    private readonly registerUseCase: RegisterUseCase,
  ) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto) {
    const result = await this.loginUseCase.execute(dto);
    return { success: true, message: 'Login exitoso', data: result };
  }

  @Post('register-super-admin')
  @HttpCode(HttpStatus.CREATED)
  async registerSuperAdmin(@Body() dto: RegisterDto) {
    const result = await this.registerUseCase.execute(dto);
    return { success: true, message: 'Super admin registrado', data: result };
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@CurrentUser() user: User) {
    const { password, ...userWithoutPassword } = user;
    return { success: true, message: 'Perfil obtenido', data: userWithoutPassword };
  }

  @Get('verify')
  @UseGuards(JwtAuthGuard)
  async verifyToken(@CurrentUser() user: User) {
    return {
      success: true,
      message: 'Token válido',
      data: { valid: true, userId: user.id, email: user.email, rol: user.rol?.nombre },
    };
  }
}
