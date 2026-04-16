import { Inject, Injectable, Logger } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { BroadcastDto } from './dto/broadcast.dto';
import { FIREBASE_ADMIN } from '../infrastructure/firebase/firebase-admin.provider';

export interface BroadcastResult {
  sentCount: number;
  failedCount: number;
  sentAt: number;
}

@Injectable()
export class BroadcastAnnouncementUseCase {
  private readonly logger = new Logger(BroadcastAnnouncementUseCase.name);
  private readonly CHUNK_SIZE = 500;

  constructor(
    @Inject(FIREBASE_ADMIN)
    private readonly firebaseApp: admin.app.App,
  ) {}

  async execute(dto: BroadcastDto, adminName: string): Promise<BroadcastResult> {
    const sentAt = Date.now();
    let sentCount = 0;
    let failedCount = 0;

    for (let i = 0; i < dto.tokens.length; i += this.CHUNK_SIZE) {
      const chunk = dto.tokens.slice(i, i + this.CHUNK_SIZE);

      const fcmMessage: admin.messaging.MulticastMessage = {
        notification: {
          title: dto.title,
          body: dto.message,
        },
        data: {
          action: 'gym_announcement',
          announcementTitle: dto.title,
          announcementBody: dto.message,
          announcementType: dto.type,
          sentAt: sentAt.toString(),
          sentBy: adminName,
        },
        android: {
          priority: 'high',
        },
        tokens: chunk,
      };

      try {
        const resp = await this.firebaseApp
          .messaging()
          .sendEachForMulticast(fcmMessage);

        sentCount += resp.successCount;
        failedCount += resp.failureCount;

        resp.responses.forEach((r, idx) => {
          if (!r.success) {
            this.logger.warn(
              `FCM falló para token ${chunk[idx].slice(0, 12)}...: ${r.error?.message}`,
            );
          }
        });
      } catch (err) {
        this.logger.error('Error enviando chunk FCM', err as Error);
        failedCount += chunk.length;
      }
    }

    this.logger.log(
      `Broadcast "${dto.title}" por ${adminName}: ${sentCount} enviados, ${failedCount} fallidos`,
    );

    return { sentCount, failedCount, sentAt };
  }
}
