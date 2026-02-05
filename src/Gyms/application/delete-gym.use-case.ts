import { Injectable, Inject, ForbiddenException, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { GYM_REPOSITORY, IGymRepository } from '../domain/IGym.repository';
import { User } from '../../Users/domain/user.entity';

@Injectable()
export class DeleteGymUseCase {
  constructor(
    @Inject(GYM_REPOSITORY)
    private readonly gymRepository: IGymRepository,
    private readonly dataSource: DataSource,
  ) {}

  async execute(id: number, currentUser: User): Promise<void> {
    if (currentUser.rol.nombre !== 'super_admin') {
      throw new ForbiddenException('Solo super administradores pueden eliminar gimnasios');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const gym = await this.gymRepository.findById(id);
      if (!gym) {
        throw new NotFoundException(`Gym con ID ${id} no encontrado`);
      }

      await this.gymRepository.delete(id);
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
