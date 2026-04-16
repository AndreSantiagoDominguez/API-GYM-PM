import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { NotificationsController } from './controllers/notifications.controller';
import { BroadcastAnnouncementUseCase } from '../application/broadcast-announcement.use-case';
import { FirebaseAdminProvider } from './firebase/firebase-admin.provider';

@Module({
  imports: [ConfigModule],
  controllers: [NotificationsController],
  providers: [FirebaseAdminProvider, BroadcastAnnouncementUseCase],
  exports: [FirebaseAdminProvider],
})
export class NotificationsModule {}
