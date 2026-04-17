import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as admin from 'firebase-admin';
import * as path from 'path';

const SERVICE_ACCOUNT_PATH = path.join(
  __dirname,
  '..',
  'gymsync-5708f-bd2d5dccefd5.json',
);

@Injectable()
export class FirebaseService implements OnModuleInit {
  private readonly logger = new Logger(FirebaseService.name);

  onModuleInit() {
    if (admin.apps.length) return;

    admin.initializeApp({
      credential: admin.credential.cert(SERVICE_ACCOUNT_PATH),
    });

    this.logger.log('Firebase Admin SDK initialized');
  }

  async sendPushNotification(
    tokens: string[],
    title: string,
    body: string,
    data?: Record<string, string>,
  ): Promise<{ successCount: number; failedTokens: string[] }> {
    if (!tokens.length) return { successCount: 0, failedTokens: [] };

    const message: admin.messaging.MulticastMessage = {
      tokens,
      notification: { title, body },
      android: {
        priority: 'high',
        notification: { sound: 'default' },
      },
      ...(data && { data }),
    };

    const response = await admin.messaging().sendEachForMulticast(message);
    this.logger.log(
      `FCM: ${response.successCount} sent, ${response.failureCount} failed of ${tokens.length}`,
    );

    const failedTokens: string[] = [];
    response.responses.forEach((resp, idx) => {
      if (!resp.success) {
        const code = resp.error?.code ?? 'unknown';
        this.logger.warn(`FCM failure token[${idx}]: ${code}`);
        if (
          code === 'messaging/registration-token-not-registered' ||
          code === 'messaging/invalid-registration-token'
        ) {
          failedTokens.push(tokens[idx]);
        }
      }
    });

    return { successCount: response.successCount, failedTokens };
  }
}
