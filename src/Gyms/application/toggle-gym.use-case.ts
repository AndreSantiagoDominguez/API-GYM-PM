import { Injectable, Inject, ForbiddenException, NotFoundException } from '@nestjs/common';
import { GYM_REPOSITORY, IGymRepository } from '../domain/IGym.repository';
import { Gym } from '../domain/gym.entity';
import { User } from '../../Users/domain/user.entity';

@Injectable()
export class ToggleGymUseCase {
  constructor(
    @Inject(GYM_REPOSITORY)
    private readonly gymRepository: IGymRepository,
  ) {}

  async execute(id: number, currentUser: User): Promise<Gym> {
    if (currentUser.rol.nombre !== 'super_admin') {
      throw new ForbiddenException('Solo super administradores pueden activar/desactivar gimnasios');
    }

    const gym = await this.gymRepository.findById(id);
    if (!gym) {
      throw new NotFoundException(`Gym con ID ${id} no encontrado`);
    }

    return this.gymRepository.update(id, { activo: !gym.activo });
  }
}
