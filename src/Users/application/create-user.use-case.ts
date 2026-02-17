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
      // --- PASO CRÍTICO: Asegurar que el currentUser tenga el Rol cargado ---
      let userWithPermissions = currentUser;
      if (!currentUser.rol || !currentUser.rol.nombre) {
        const found = await this.userRepository.findById(currentUser.id);
        if (!found || !found.rol) {
          throw new ForbiddenException('No se pudo verificar el rol del usuario actual');
        }
        userWithPermissions = found;
      }

      // 1. Verificar si el email ya existe
      const existingUser = await this.userRepository.findByEmail(dto.email);
      if (existingUser) {
        throw new ConflictException('El email ya está registrado');
      }

      // 2. Verificar existencia del rol que se quiere asignar al nuevo usuario
      const roleToAssign = await this.roleRepository.findById(dto.rol_id);
      if (!roleToAssign) {
        throw new NotFoundException('El rol solicitado no existe');
      }

      // 3. Validar permisos (Usando el usuario que ya confirmamos que tiene rol)
      this.validatePermissions(userWithPermissions, roleToAssign.nombre);

      // 4. Verificar Gym si viene en el DTO
      if (dto.gym_id) {
        const gym = await this.gymRepository.findById(dto.gym_id);
        if (!gym) {
          throw new NotFoundException('El gimnasio no existe');
        }
      }

      // 5. Determinar Gym final
      // Si es super_admin usa el del DTO, si no, usa el del usuario que está creando
      const finalGymId = userWithPermissions.rol.nombre === 'super_admin' 
        ? dto.gym_id 
        : (userWithPermissions.gym_id || userWithPermissions.gym_id);

      const hashedPassword = await bcrypt.hash(dto.password, 10);

      // 6. Creación
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
      // Solo hacemos rollback si la transacción sigue activa
      if (queryRunner.isTransactionActive) {
        await queryRunner.rollbackTransaction();
      }
      console.error("ERROR EN CREATE_USER_USE_CASE:", error.message);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  private validatePermissions(user: User, targetRoleName: string): void {
    // Aquí usamos 'user' que ya sabemos que tiene la propiedad 'rol'
    const myRole = user.rol.nombre;

    if (myRole === 'super_admin') return;

    if (myRole === 'admin') {
      if (targetRoleName === 'super_admin' || targetRoleName === 'admin') {
        throw new ForbiddenException('No tienes permisos para crear usuarios con este rango');
      }
      return;
    }

    if (myRole === 'empleado') {
      if (targetRoleName !== 'cliente') {
        throw new ForbiddenException('Como empleado solo puedes registrar clientes');
      }
      return;
    }

    throw new ForbiddenException('No tienes permisos para realizar esta operación');
  }
}