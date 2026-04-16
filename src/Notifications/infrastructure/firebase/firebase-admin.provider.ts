import { Logger, Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';
import * as fs from 'fs';
import * as path from 'path';

export const FIREBASE_ADMIN = 'FIREBASE_ADMIN';

export const FirebaseAdminProvider: Provider = {
  provide: FIREBASE_ADMIN,
  inject: [ConfigService],
  useFactory: (configService: ConfigService): admin.app.App => {
    const logger = new Logger('FirebaseAdmin');

    if (admin.apps.length > 0) {
      logger.log('Firebase Admin ya estaba inicializado, reutilizando instancia');
      return admin.app();
    }

    const serviceAccountPath = configService.get<string>(
      'FIREBASE_SERVICE_ACCOUNT_PATH',
    );

    if (!serviceAccountPath) {
      throw new Error(
        'FIREBASE_SERVICE_ACCOUNT_PATH no está definido en variables de entorno',
      );
    }

    const resolvedPath = path.isAbsolute(serviceAccountPath)
      ? serviceAccountPath
      : path.resolve(process.cwd(), serviceAccountPath);

    if (!fs.existsSync(resolvedPath)) {
      throw new Error(
        `No se encontró el service account en: ${resolvedPath}`,
      );
    }

    const serviceAccount = JSON.parse(
      fs.readFileSync(resolvedPath, 'utf8'),
    );

    const app = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });

    logger.log(
      `Firebase Admin inicializado (project: ${serviceAccount.project_id})`,
    );

    return app;
  },
};
