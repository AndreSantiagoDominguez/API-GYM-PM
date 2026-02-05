import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { USER_REPOSITORY, IUserRepository } from '../domain/IUser.repository';
import { User } from '../domain/user.entity';

@Injectable()
export class GetUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(id: number): Promise<User> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }
    return user;
  }

  async executeByGym(gymId: number): Promise<User[]> {
    return this.userRepository.findByGymId(gymId);
  }
}
