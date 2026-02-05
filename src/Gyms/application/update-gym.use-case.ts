import { Injectable, Inject, ForbiddenException, NotFoundException, ConflictException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { GYM_REPOSITORY, IGymRepository } from '../domain/IGym.repository';
import { Gym } from '../domain/gym.entity';
import { UpdateGymDto } from './dto/update-gym.dto';
import { User } from '../../Users/domain/user.entity';

@Injectable()
export class UpdateGymUseCase {
  constructor(
    @Inject(GYM_REPOSITORY)
    private readonly gymRepository: IGymRepository,
    private readonly dataSource: DataSource,
  ) {}

  async execute(id: number, dto: UpdateGymDto, currentUser: User): Promise<Gym> {
    if (currentUser.rol.nombre !== 'super_admin') {
      throw new ForbiddenException('Solo super administradores pueden modificar gimnasios');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const gym = await this.gymRepository.findById(id);
      if (!gym) {
        throw new NotFoundException(`Gym con ID ${id} no encontrado`);
      }

      if (dto.nombre && dto.nombre !== gym.nombre) {
        const existingGym = await this.gymRepository.findByNombre(dto.nombre);
        if (existingGym) {
          throw new ConflictException('Ya existe un gimnasio con este nombre');
        }
      }

      const updatedGym = await this.gymRepository.update(id, dto);
      await queryRunner.commitTransaction();
      return updatedGym;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
