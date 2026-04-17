import {
  Injectable,
  Inject,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { USER_REPOSITORY, IUserRepository } from '../../Users/domain/IUser.repository';
import { FirebaseService } from '../../Firebase/firebase.service';
import { User } from '../../Users/domain/user.entity';
import { BroadcastDto } from './dto/broadcast.dto';

@Injectable()
export class BroadcastUseCase {
  private readonly logger = new Logger(BroadcastUseCase.name);

  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    private readonly firebaseService: FirebaseService,
  ) {}

  async execute(
    dto: BroadcastDto,
    adminUser: User,
  ): Promise<{ sent: number; message: string }> {
    if (!adminUser.gymId) {
      throw new BadRequestException('El admin no tiene un gimnasio asignado');
    }

    const gymUsers = await this.userRepository.findByGymId(adminUser.gymId);

    const eligibleUsers = gymUsers.filter(
      (u) => u.fcmToken && u.receivesNotifications && u.id !== adminUser.id,
    );

    if (!eligibleUsers.length) {
      return {
        sent: 0,
        message: 'No hay usuarios con notificaciones habilitadas en este gimnasio',
      };
    }

    const tokens = eligibleUsers.map((u) => u.fcmToken);

    const { successCount, failedTokens } =
      await this.firebaseService.sendPushNotification(tokens, dto.title, dto.message, {
        type: 'broadcast',
        gymId: String(adminUser.gymId),
      });

    if (failedTokens.length) {
      this.logger.warn(`Removing ${failedTokens.length} invalid FCM tokens`);
      const failedUsers = eligibleUsers.filter((u) =>
        failedTokens.includes(u.fcmToken),
      );
      await Promise.all(
        failedUsers.map((u) => this.userRepository.updateFcmToken(u.id, null)),
      );
    }

    return {
      sent: successCount,
      message: `Notificación enviada a ${successCount} de ${eligibleUsers.length} usuarios`,
    };
  }
}
