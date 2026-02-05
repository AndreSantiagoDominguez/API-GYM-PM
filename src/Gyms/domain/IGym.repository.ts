import { Gym } from './gym.entity';

export interface IGymRepository {
  findAll(): Promise<Gym[]>;
  findById(id: number): Promise<Gym | null>;
  findByNombre(nombre: string): Promise<Gym | null>;
  findActive(): Promise<Gym[]>;
  create(gym: Partial<Gym>): Promise<Gym>;
  update(id: number, gym: Partial<Gym>): Promise<Gym>;
  delete(id: number): Promise<void>;
}

export const GYM_REPOSITORY = 'GYM_REPOSITORY';
