import { Role } from './role.entity';

export interface IRoleRepository {
  findAll(): Promise<Role[]>;
  findById(id: number): Promise<Role | null>;
  findByNombre(nombre: string): Promise<Role | null>;
}

export const ROLE_REPOSITORY = 'ROLE_REPOSITORY';
