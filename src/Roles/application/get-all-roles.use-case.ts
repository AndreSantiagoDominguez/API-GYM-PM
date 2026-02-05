import { Injectable, Inject } from '@nestjs/common';
import { ROLE_REPOSITORY, IRoleRepository } from '../domain/IRole.repository';
import { Role } from '../domain/role.entity';
import { User } from '../../Users/domain/user.entity';

@Injectable()
export class GetAllRolesUseCase {
  constructor(
    @Inject(ROLE_REPOSITORY)
    private readonly roleRepository: IRoleRepository,
  ) {}

  async execute(currentUser: User): Promise<Role[]> {
    // Super admin ve todos los roles
    if (currentUser.rol.nombre === 'super_admin') {
      return this.roleRepository.findAll();
    }

    const allRoles = await this.roleRepository.findAll();

    // Admin ve: empleado, cliente
    if (currentUser.rol.nombre === 'admin') {
      return allRoles.filter(r => r.nombre === 'empleado' || r.nombre === 'cliente');
    }

    // Empleado ve: cliente
    if (currentUser.rol.nombre === 'empleado') {
      return allRoles.filter(r => r.nombre === 'cliente');
    }

    return [];
  }
}
