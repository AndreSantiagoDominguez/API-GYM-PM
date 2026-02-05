import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { ROLE_REPOSITORY, IRoleRepository } from '../domain/IRole.repository';
import { Role } from '../domain/role.entity';

@Injectable()
export class GetRoleUseCase {
  constructor(
    @Inject(ROLE_REPOSITORY)
    private readonly roleRepository: IRoleRepository,
  ) {}

  async execute(id: number): Promise<Role> {
    const role = await this.roleRepository.findById(id);
    if (!role) {
      throw new NotFoundException(`Rol con ID ${id} no encontrado`);
    }
    return role;
  }
}
