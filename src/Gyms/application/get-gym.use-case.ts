import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { GYM_REPOSITORY, IGymRepository } from '../domain/IGym.repository';
import { Gym } from '../domain/gym.entity';

@Injectable()
export class GetGymUseCase {
  constructor(
    @Inject(GYM_REPOSITORY)
    private readonly gymRepository: IGymRepository,
  ) {}

  async execute(id: number): Promise<Gym> {
    const gym = await this.gymRepository.findById(id);
    if (!gym) {
      throw new NotFoundException(`Gym con ID ${id} no encontrado`);
    }
    return gym;
  }
}
