import { Injectable, Inject, UnauthorizedException } from '@nestjs/common';
import { USER_REPOSITORY, IUserRepository } from '../../Users/domain/IUser.repository';
import { User } from '../../Users/domain/user.entity';

@Injectable()
export class ValidateUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(userId: number): Promise<User> {
    const user = await this.userRepository.findById(userId);

    if (!user || !user.activo) {
      throw new UnauthorizedException('Usuario no válido');
    }

    return user;
  }
}
