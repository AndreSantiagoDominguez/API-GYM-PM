import { Injectable, Inject, ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { USER_REPOSITORY, IUserRepository } from '../domain/IUser.repository';
import { ROLE_REPOSITORY, IRoleRepository } from '../../Roles/domain/IRole.repository';
import { GYM_REPOSITORY, IGymRepository } from '../../Gyms/domain/IGym.repository';
import { User } from '../domain/user.entity';
import { CreateUserDto } from './dto/create-user.dto';

// ... (imports iguales)

@Injectable()
export class CreateUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository,
    @Inject(ROLE_REPOSITORY) private readonly roleRepository: IRoleRepository,
    @Inject(GYM_REPOSITORY) private readonly gymRepository: IGymRepository,
    private readonly dataSource: DataSource,
  ) { }

  async execute(dto: CreateUserDto, currentUser: User): Promise<User> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Verificar si el email ya existe
      const existingUser = await this.userRepository.findByEmail(dto.email);
      if (existingUser) {
        throw new ConflictException('El email ya está registrado');
      }

      // 2. Verificar existencia del rol que se quiere asignar
      const roleToAssign = await this.roleRepository.findById(dto.rol_id);
      if (!roleToAssign) {
        throw new NotFoundException('El rol solicitado no existe');
      }



      // 4. Verificar Gym
      if (dto.gym_id) {
        const gym = await this.gymRepository.findById(dto.gym_id);
        if (!gym) {
          throw new NotFoundException('El gimnasio no existe');
        }
      }

      // 5. Determinar Gym final (usa snake_case si así está en tu DB)
      const finalGymId = currentUser.rol.nombre === 'super_admin' 
        ? dto.gym_id 
        : (currentUser.gym_id || currentUser.gym_id);

      const hashedPassword = await bcrypt.hash(dto.password, 10);

      // 6. Creación (Usa los nombres de campo exactos de tu entidad)
      const newUser = await this.userRepository.create({
        nombres: dto.nombres,
        apellidos: dto.apellidos,
        email: dto.email,
        password: hashedPassword,
        telefono: dto.telefono,
        fecha_nacimiento: dto.fecha_nacimiento ? new Date(dto.fecha_nacimiento) : undefined,
        rol_id: dto.rol_id,
        gym_id: finalGymId,
        activo: dto.activo ?? true,
      });

      await queryRunner.commitTransaction();
      return newUser;

    } catch (error) {
      await queryRunner.rollbackTransaction();
      // IMPORTANTE: Imprime el error real en consola para ver qué falló exactamente
      console.error("ERROR EN CREATE_USER_USE_CASE:", error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  private validatePermissions(currentUser: User, targetRoleName: string): void {
    const myRole = currentUser.rol.nombre;

    if (myRole === 'super_admin') return;

    if (myRole === 'admin') {
      if (targetRoleName === 'super_admin' || targetRoleName === 'admin') {
        throw new ForbiddenException('No puedes crear usuarios con rango superior o igual al tuyo');
      }
      return;
    }

    if (myRole === 'empleado') {
      if (targetRoleName !== 'cliente') {
        throw new ForbiddenException('Solo puedes registrar clientes');
      }
      return;
    }

    throw new ForbiddenException('No tienes permisos para crear usuarios');
  }
}