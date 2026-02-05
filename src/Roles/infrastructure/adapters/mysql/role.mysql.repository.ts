import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from '../../../domain/role.entity';
import { IRoleRepository } from '../../../domain/IRole.repository';

@Injectable()
export class RoleMySqlRepository implements IRoleRepository {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}

  async findAll(): Promise<Role[]> {
    return this.roleRepository.find({ order: { id: 'ASC' } });
  }

  async findById(id: number): Promise<Role | null> {
    return this.roleRepository.findOne({ where: { id } });
  }

  async findByNombre(nombre: string): Promise<Role | null> {
    return this.roleRepository.findOne({ where: { nombre } });
  }
}
