import { Injectable, Inject, ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { USER_REPOSITORY, IUserRepository } from '../domain/IUser.repository';
import { User } from '../domain/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UpdateUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    private readonly dataSource: DataSource,
  ) {}

  async execute(id: number, dto: UpdateUserDto, currentUser: User): Promise<User> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
 
      // Hash password si se proporciona
      const dataToUpdate: Partial<User> = { ...dto };
      if (dto.password) {
        dataToUpdate.password = await bcrypt.hash(dto.password, 10);
      }

      const updatedUser = await this.userRepository.update(id, dataToUpdate);
      await queryRunner.commitTransaction();
      return updatedUser;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  private validatePermissions(currentUser: User, targetUser: User): void {
    const role = currentUser.rol.nombre;

    if (role === 'super_admin') return;

    if (role === 'admin') {
      if (targetUser.gym_id !== currentUser.gym_id) {
        throw new ForbiddenException('No puedes modificar usuarios de otro gimnasio');
      }
      if (targetUser.rol.nombre === 'super_admin' || targetUser.rol.nombre === 'admin') {
        throw new ForbiddenException('No puedes modificar este usuario');
      }
      return;
    }

    if (role === 'empleado') {
      if (targetUser.gym_id !== currentUser.gym_id || targetUser.rol.nombre !== 'cliente') {
        throw new ForbiddenException('Solo puedes modificar clientes de tu gimnasio');
      }
      return;
    }

    if (role === 'cliente' && targetUser.id !== currentUser.id) {
      throw new ForbiddenException('Solo puedes modificar tu información');
    }
  }
}
