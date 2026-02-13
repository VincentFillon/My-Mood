import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ERROR_CODES } from '@shared/constants/errors.js';
import type { UpdateProfileInput } from '@shared/schemas/user.schema.js';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string) {
    return this.prisma.db.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });
  }

  async findByEmailWithCredentials(email: string) {
    return this.prisma.db.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        passwordHash: true,
      },
    });
  }

  async findById(id: string) {
    const user = await this.prisma.db.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
      },
    });

    if (!user) {
      throw new NotFoundException({
        statusCode: 404,
        error: ERROR_CODES.NOT_FOUND,
        message: 'Utilisateur non trouvé',
        timestamp: new Date().toISOString(),
      });
    }

    return user;
  }

  async update(id: string, data: UpdateProfileInput) {
    try {
      return await this.prisma.db.user.update({
        where: { id },
        data: {
          name: data.name,
          email: data.email,
        },
        select: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true,
        },
      });
    } catch (error: unknown) {
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        (error as { code: string }).code === 'P2002'
      ) {
        throw new ConflictException({
          statusCode: 409,
          error: ERROR_CODES.EMAIL_ALREADY_EXISTS,
          message: 'Cet email est déjà utilisé',
          timestamp: new Date().toISOString(),
        });
      }
      throw error;
    }
  }

  async updateAvatarUrl(id: string, avatarUrl: string) {
    return this.prisma.db.user.update({
      where: { id },
      data: { avatarUrl },
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
      },
    });
  }

  async create(data: {
    name: string;
    email: string;
    passwordHash: string;
    gdprConsentAt: Date;
  }) {
    return this.prisma.db.user.create({
      data,
      select: {
        id: true,
        name: true,
        email: true,
      },
    });
  }
}
