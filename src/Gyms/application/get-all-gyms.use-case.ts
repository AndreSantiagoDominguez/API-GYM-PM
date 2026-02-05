import { Injectable, Inject } from '@nestjs/common';
import { GYM_REPOSITORY, IGymRepository } from '../domain/IGym.repository';
import { Gym } from '../domain/gym.entity';

@Injectable()
export class GetAllGymsUseCase {
  constructor(
    @Inject(GYM_REPOSITORY)
    private readonly gymRepository: IGymRepository,
  ) {}

  async execute(): Promise<Gym[]> {
    return this.gymRepository.findAll();
  }

  async executeActive(): Promise<Gym[]> {
    return this.gymRepository.findActive();
  }
}
