import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ERROR_CODES } from '@shared/constants/errors.js';

export interface UploadedFile {
  buffer: Buffer;
  mimetype: string;
  size: number;
  originalname: string;
}

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 Mo

@Injectable()
export class FilesService {
  private readonly s3: S3Client;
  private readonly bucketName: string;
  private readonly logger = new Logger(FilesService.name);

  constructor(private readonly configService: ConfigService) {
    this.s3 = new S3Client({
      endpoint: `https://${this.configService.get<string>('R2_ACCOUNT_ID')}.r2.cloudflarestorage.com`,
      region: 'auto',
      credentials: {
        accessKeyId: this.configService.get<string>('R2_ACCESS_KEY_ID') ?? '',
        secretAccessKey:
          this.configService.get<string>('R2_SECRET_ACCESS_KEY') ?? '',
      },
    });
    this.bucketName = this.configService.get<string>('R2_BUCKET_NAME') ?? '';

    if (!this.bucketName) {
      this.logger.warn(
        'R2_BUCKET_NAME is not configured — file uploads will fail',
      );
    }
  }

  async uploadAvatar(userId: string, file: UploadedFile): Promise<string> {
    this.validateFile(file);

    const extension = this.getExtension(file.mimetype);
    const key = `users/${userId}/avatar.${extension}`;

    try {
      await this.s3.send(
        new PutObjectCommand({
          Bucket: this.bucketName,
          Key: key,
          Body: file.buffer,
          ContentType: file.mimetype,
        }),
      );

      return key;
    } catch (error) {
      this.logger.error('Failed to upload avatar to R2', error);
      throw new InternalServerErrorException({
        statusCode: 500,
        error: ERROR_CODES.AVATAR_UPLOAD_FAILED,
        message: "Échec de l'upload de l'avatar",
        timestamp: new Date().toISOString(),
      });
    }
  }

  async getSignedUrl(key: string): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    return getSignedUrl(this.s3, command, { expiresIn: 3600 });
  }

  private validateFile(file: UploadedFile): void {
    if (file.size > MAX_FILE_SIZE) {
      throw new BadRequestException({
        statusCode: 400,
        error: ERROR_CODES.AVATAR_UPLOAD_FAILED,
        message: 'Le fichier ne doit pas dépasser 10 Mo',
        timestamp: new Date().toISOString(),
      });
    }

    if (
      !ALLOWED_MIME_TYPES.includes(
        file.mimetype as (typeof ALLOWED_MIME_TYPES)[number],
      )
    ) {
      throw new BadRequestException({
        statusCode: 400,
        error: ERROR_CODES.AVATAR_UPLOAD_FAILED,
        message: 'Format non supporté. Formats acceptés : JPEG, PNG, WebP',
        timestamp: new Date().toISOString(),
      });
    }
  }

  private getExtension(mimetype: string): string {
    const map: Record<string, string> = {
      'image/jpeg': 'jpg',
      'image/png': 'png',
      'image/webp': 'webp',
    };
    return map[mimetype] ?? 'jpg';
  }
}
