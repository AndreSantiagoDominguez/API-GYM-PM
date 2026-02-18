import { Injectable, Inject, ForbiddenException, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { USER_REPOSITORY, IUserRepository } from '../domain/IUser.repository';
import { User } from '../domain/user.entity';

@Injectable()
export class DeleteUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    private readonly dataSource: DataSource,
  ) {}

  async execute(id: number, currentUser: User): Promise<void> {
  const queryRunner = this.dataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    const userToDelete = await this.userRepository.findById(id);
    
    // VALIDACIÓN CRUCIAL: Si no hay usuario, lanza error y detén el proceso
    if (!userToDelete) {
      throw new NotFoundException(`El usuario con ID ${id} no existe`);
    }

    // No permitir borrarse a uno mismo
    if (userToDelete.id === currentUser.id) {
       throw new ForbiddenException('No puedes eliminar tu propia cuenta');
    }

    this.validatePermissions(currentUser, userToDelete);

    await this.userRepository.delete(id);
    await queryRunner.commitTransaction();

  } catch (error) {
    await queryRunner.rollbackTransaction();
    // ¡IMPORTANTE! Si no haces throw, NestJS cree que todo salió bien pero no devuelve nada
    console.error("ERROR EN USE CASE:", error.message);
    throw error; 
  } finally {
    await queryRunner.release();
  }
}

  private validatePermissions(currentUser: User, targetUser: User): void {
    const role = currentUser.rol.nombre;

    if (role === 'super_admin') {
      if (targetUser.rol.nombre === 'super_admin') {
        throw new ForbiddenException('No puedes eliminar a otro super administrador');
      }
      return;
    }

    if (role === 'admin') {
      if (targetUser.gym_id !== currentUser.gym_id) {
        throw new ForbiddenException('No puedes eliminar usuarios de otro gimnasio');
      }
      if (targetUser.rol.nombre === 'super_admin' || targetUser.rol.nombre === 'admin') {
        throw new ForbiddenException('No puedes eliminar este usuario');
      }
      return;
    }

    throw new ForbiddenException('No tienes permisos para eliminar usuarios');
  }
}
