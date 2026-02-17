import { Injectable, Inject, ForbiddenException, NotFoundException } from '@nestjs/common';
import { USER_REPOSITORY, IUserRepository } from '../domain/IUser.repository';
import { User } from '../domain/user.entity';

@Injectable()
export class ToggleUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(id: number, currentUser: User): Promise<User> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    const role = currentUser.rol.nombre;

    if (role !== 'super_admin' && role !== 'admin') {
      throw new ForbiddenException('No tienes permisos para esta acción');
    }

    if (role === 'admin' && user.gym_id !== currentUser.gym_id) {
      throw new ForbiddenException('No puedes modificar usuarios de otro gimnasio');
    }

    return this.userRepository.update(id, { activo: !user.activo });
  }
}
