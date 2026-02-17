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
    // Usamos el manager de la transacción para asegurar atomicidad
    return await this.dataSource.transaction(async (manager) => {
      
      // 1. Verificar email único
      const existingUser = await this.userRepository.findByEmail(dto.email);
      if (existingUser) {
        throw new ConflictException('El email ya está registrado');
      }

      // 2. Verificar existencia del rol
      const role = await this.roleRepository.findById(dto.rol_id);
      if (!role) {
        throw new NotFoundException('Rol no encontrado');
      }

      // 3. Validar permisos (Importante: currentUser debe tener el rol cargado)
      if (!currentUser.rol || !currentUser.rol.nombre) {
        throw new ForbiddenException('El usuario actual no tiene un rol asignado o cargado');
      }
      this.validatePermissions(currentUser, role.nombre);

      // 4. Verificar gym si se proporciona uno en el DTO
      if (dto.gym_id) {
        const gym = await this.gymRepository.findById(dto.gym_id);
        if (!gym) {
          throw new NotFoundException('Gym no encontrado');
        }
      }

      // 5. Determinar gymId final basado en jerarquía
      let finalGymId = dto.gym_id;
      if (currentUser.rol.nombre !== 'super_admin') {
        // Si no es super_admin, se le asigna obligatoriamente el gym del creador
        finalGymId = currentUser.gymId || currentUser.gymId; 
      }

      // 6. Hash del password
      const hashedPassword = await bcrypt.hash(dto.password, 10);

      // 7. Mapeo y Creación
      // Nota: Asegúrate que los nombres de los campos coincidan con tu Entidad (snake_case vs camelCase)
      try {
        const newUser = await this.userRepository.create({
          ...dto,
          password: hashedPassword,
          gymId: finalGymId, // Usamos el nombre que TypeORM espera en la BD según tu log
          activo: dto.activo ?? true,
          fechaNacimiento: dto.fecha_nacimiento ? new Date(dto.fecha_nacimiento) : undefined,
        });

        return newUser;
      } catch (dbError) {
        // Esto atrapará errores de base de datos no controlados (ej. FK fails)
        throw new ConflictException('Error al guardar el usuario en la base de datos');
      }
    });
  }

  private validatePermissions(currentUser: User, targetRoleName: string): void {
    const myRole = currentUser.rol.nombre;

    if (myRole === 'super_admin') return;

    if (myRole === 'admin') {
      // El admin no puede crear otros admins ni super_admins
      if (targetRoleName === 'super_admin' || targetRoleName === 'admin') {
        throw new ForbiddenException('No tienes permisos para asignar este rol');
      }
      return;
    }

    if (myRole === 'empleado') {
      // El empleado solo puede crear clientes
      if (targetRoleName !== 'cliente') {
        throw new ForbiddenException('Un empleado solo puede registrar clientes');
      }
      return;
    }

    throw new ForbiddenException('No tienes permisos suficientes para realizar esta acción');
  }
}