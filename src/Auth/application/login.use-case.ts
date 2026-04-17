import { Injectable, Inject, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { USER_REPOSITORY, IUserRepository } from '../../Users/domain/IUser.repository';
import { User } from '../../Users/domain/user.entity';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class LoginUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    private readonly jwtService: JwtService,
  ) {}

  async execute(dto: LoginDto): Promise<{ user: User; token: string }> {
    const user = await this.userRepository.findByEmail(dto.email);

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    if (!user.activo) {
      throw new UnauthorizedException('Usuario desactivado');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      rol: user.rol?.nombre,
      gymId: user.gym_id,
    };

    const token = this.jwtService.sign(payload);
    const { password: _, ...userWithoutPassword } = user;

    return { user: userWithoutPassword as User, token };
  }
}
