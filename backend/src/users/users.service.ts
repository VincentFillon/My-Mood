import { Injectable } from '@nestjs/common';
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
