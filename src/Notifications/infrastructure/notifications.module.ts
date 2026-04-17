import { Module } from '@nestjs/common';
import { NotificationController } from './controllers/notification.controller';
import { BroadcastUseCase } from '../application/broadcast.use-case';
import { UsersModule } from '../../Users/infrastructure/users.module';

@Module({
  imports: [UsersModule],
  controllers: [NotificationController],
  providers: [BroadcastUseCase],
})
export class NotificationsModule {}
