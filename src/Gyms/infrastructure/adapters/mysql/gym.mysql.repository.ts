import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Gym } from '../../../domain/gym.entity';
import { IGymRepository } from '../../../domain/IGym.repository';


@Injectable()
export class GymMySqlRepository implements IGymRepository {
  constructor(
    @InjectRepository(Gym)
    private readonly gymRepository: Repository<Gym>,
  ) {}

  async findAll(): Promise<Gym[]> {
    return this.gymRepository.find({ order: { nombre: 'ASC' } });
  }

  async findById(id: number): Promise<Gym | null> {
    return this.gymRepository.findOne({ where: { id } });
  }

  async findByNombre(nombre: string): Promise<Gym | null> {
    return this.gymRepository.findOne({ where: { nombre } });
  }

  async findActive(): Promise<Gym[]> {
    return this.gymRepository.find({ where: { activo: true }, order: { nombre: 'ASC' } });
  }

  async create(gym: Partial<Gym>): Promise<Gym> {
    const newGym = this.gymRepository.create(gym);
    return this.gymRepository.save(newGym);
  }

  async update(id: number, gym: Partial<Gym>): Promise<Gym> {
    await this.gymRepository.update(id, gym);
    return this.findById(id);
  }

  async delete(id: number): Promise<void> {
    await this.gymRepository.delete(id);
  }
}
