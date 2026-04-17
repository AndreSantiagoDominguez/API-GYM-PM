import {
  Injectable,
  Inject,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { USER_REPOSITORY, IUserRepository } from '../domain/IUser.repository';
import { User } from '../domain/user.entity';

@Injectable()
export class UpdateFcmTokenUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(userId: number, token: string, currentUser: User): Promise<void> {
    const targetUser = await this.userRepository.findById(userId);
    if (!targetUser) {
      throw new NotFoundException(`Usuario con ID ${userId} no encontrado`);
    }

    if (currentUser.id !== userId && currentUser.rol.nombre !== 'super_admin') {
      throw new ForbiddenException('Solo puedes actualizar tu propio token FCM');
    }

    await this.userRepository.updateFcmToken(userId, token);
  }
}
