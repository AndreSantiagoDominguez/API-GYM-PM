import { Injectable, Inject, ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { USER_REPOSITORY, IUserRepository } from '../domain/IUser.repository';
import { ROLE_REPOSITORY, IRoleRepository } from '../../Roles/domain/IRole.repository';
import { GYM_REPOSITORY, IGymRepository } from '../../Gyms/domain/IGym.repository';
import { User } from '../domain/user.entity';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class CreateUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(ROLE_REPOSITORY)
    private readonly roleRepository: IRoleRepository,
    @Inject(GYM_REPOSITORY)
    private readonly gymRepository: IGymRepository,
    private readonly dataSource: DataSource,
  ) { }

  async execute(dto: CreateUserDto, currentUser: User): Promise<User> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Verificar email único
      const existingUser = await this.userRepository.findByEmail(dto.email);
      if (existingUser) {
        throw new ConflictException('El email ya está registrado');
      }

      // Verificar rol
      const role = await this.roleRepository.findById(dto.rol_id);
      if (!role) {
        throw new NotFoundException('Rol no encontrado');
      }

      // Validar permisos
      this.validatePermissions(currentUser, role.nombre);

      // Verificar gym si aplica
      if (dto.gym_id) {
        const gym = await this.gymRepository.findById(dto.gym_id);
        if (!gym) {
          throw new NotFoundException('Gym no encontrado');
        }
      }

      // Determinar gymId
      let finalGymId = dto.gym_id;
      if (currentUser.rol.nombre !== 'super_admin') {
        finalGymId = currentUser.gymId;
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(dto.password, 10);

      const newUser = await this.userRepository.create({
        ...dto,
        password: hashedPassword,
        gymId: finalGymId,
        activo: dto.activo ?? true,
        // Convertimos el string a objeto Date
        fechaNacimiento: dto.fecha_nacimiento ? new Date(dto.fecha_nacimiento) : undefined,
      });

      await queryRunner.commitTransaction();
      return newUser;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  private validatePermissions(currentUser: User, targetRole: string): void {
    const role = currentUser.rol.nombre;

    if (role === 'super_admin') return;

    if (role === 'admin') {
      if (targetRole === 'super_admin' || targetRole === 'admin') {
        throw new ForbiddenException('No puedes crear usuarios con este rol');
      }
      return;
    }

    if (role === 'empleado') {
      if (targetRole !== 'cliente') {
        throw new ForbiddenException('Solo puedes crear clientes');
      }
      return;
    }

    throw new ForbiddenException('No tienes permisos para crear usuarios');
  }
}
