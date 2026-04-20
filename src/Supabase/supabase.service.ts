import {
  Injectable,
  Logger,
  OnModuleInit,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const BUCKET = 'GYMSYNC';

const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

const EXT_TO_MIME: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  gif: 'image/gif',
};

@Injectable()
export class SupabaseService implements OnModuleInit {
  private readonly logger = new Logger(SupabaseService.name);
  private client: SupabaseClient;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    const url = this.configService.get<string>('SUPABASE_URL');
    const key = this.configService.get<string>('SUPABASE_SERVICE_KEY');

    if (!url || !key) {
      this.logger.warn('Supabase credentials not configured. Image upload will be disabled.');
      return;
    }

    this.client = createClient(url, key);
    this.logger.log('Supabase client initialized');
  }

  async uploadProfileImage(file: Express.Multer.File): Promise<string> {
    if (!this.client) {
      throw new InternalServerErrorException('Supabase no está configurado');
    }

    const ext = file.originalname.split('.').pop()?.toLowerCase() ?? '';
    const isValidMime = ALLOWED_MIME_TYPES.includes(file.mimetype);
    const isValidExt = ALLOWED_EXTENSIONS.includes(ext);

    if (!isValidMime && !isValidExt) {
      throw new BadRequestException(
        'Tipo de archivo no permitido. Solo se aceptan: jpg, jpeg, png, webp, gif',
      );
    }

    if (file.size > MAX_SIZE_BYTES) {
      throw new BadRequestException('El archivo supera el tamaño máximo de 5 MB');
    }

    const contentType = isValidMime ? file.mimetype : (EXT_TO_MIME[ext] ?? 'image/jpeg');
    const filename = `${Date.now()}-${file.originalname}`;
    const path = `profiles/${filename}`;

    const { error } = await this.client.storage
      .from(BUCKET)
      .upload(path, file.buffer, { contentType, upsert: false });

    if (error) {
      this.logger.error(`Error subiendo imagen a Supabase: ${error.message}`);
      throw new InternalServerErrorException('No se pudo subir la imagen de perfil');
    }

    const { data } = this.client.storage.from(BUCKET).getPublicUrl(path);
    this.logger.log(`Imagen subida: ${data.publicUrl}`);
    return data.publicUrl;
  }

  async deleteProfileImage(publicUrl: string): Promise<void> {
    if (!this.client || !publicUrl) return;

    try {
      const url = new URL(publicUrl);
      const pathParts = url.pathname.split(`/${BUCKET}/`);
      if (pathParts.length < 2) return;

      const { error } = await this.client.storage
        .from(BUCKET)
        .remove([pathParts[1]]);

      if (error) {
        this.logger.warn(`No se pudo eliminar imagen anterior: ${error.message}`);
      }
    } catch {
      this.logger.warn('URL de imagen inválida al intentar eliminar');
    }
  }
}
