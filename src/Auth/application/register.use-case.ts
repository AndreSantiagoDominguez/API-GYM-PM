import { Injectable, Inject, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { USER_REPOSITORY, IUserRepository } from '../../Users/domain/IUser.repository';
import { ROLE_REPOSITORY, IRoleRepository } from '../../Roles/domain/IRole.repository';
import { User } from '../../Users/domain/user.entity';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class RegisterUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(ROLE_REPOSITORY)
    private readonly roleRepository: IRoleRepository,
    private readonly jwtService: JwtService,
  ) { }

  async execute(dto: RegisterDto): Promise<{ user: User; token: string }> {
    const existingUser = await this.userRepository.findByEmail(dto.email);
    if (existingUser) {
      throw new ConflictException('El email ya está registrado');
    }

    const superAdminRole = await this.roleRepository.findByNombre('super_admin');
    if (!superAdminRole) {
      throw new Error('Rol super_admin no encontrado. Ejecuta el script SQL primero.');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const newUser = await this.userRepository.create({
      ...dto,
      password: hashedPassword,
      rol_id: superAdminRole.id,
      gym_id: null,
      activo: true,
      fecha_nacimiento: dto.fechaNacimiento,
    });

    const payload = {
      sub: newUser.id,
      email: newUser.email,
      rol: newUser.rol?.nombre,
      gymId: newUser.gym_id,
    };

    const token = this.jwtService.sign(payload);
    const { password: _, ...userWithoutPassword } = newUser;

    return { user: userWithoutPassword as User, token };
  }
}
