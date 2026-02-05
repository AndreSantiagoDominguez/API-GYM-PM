import { Injectable, Inject, ForbiddenException, ConflictException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { GYM_REPOSITORY, IGymRepository } from '../domain/IGym.repository';
import { Gym } from '../domain/gym.entity';
import { CreateGymDto } from './dto/create-gym.dto';
import { User } from '../../Users/domain/user.entity';

@Injectable()
export class CreateGymUseCase {
  constructor(
    @Inject(GYM_REPOSITORY)
    private readonly gymRepository: IGymRepository,
    private readonly dataSource: DataSource,
  ) {}

  async execute(dto: CreateGymDto, currentUser: User): Promise<Gym> {
    // Solo super_admin puede crear gyms
    if (currentUser.rol.nombre !== 'super_admin') {
      throw new ForbiddenException('Solo super administradores pueden crear gimnasios');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const existingGym = await this.gymRepository.findByNombre(dto.nombre);
      if (existingGym) {
        throw new ConflictException('Ya existe un gimnasio con este nombre');
      }

      const newGym = await this.gymRepository.create({
        ...dto,
        activo: dto.activo ?? true,
      });

      await queryRunner.commitTransaction();
      return newGym;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
