import { jest } from '@jest/globals';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service.js';
import { UsersService } from './users.service.js';

const mockUser = {
  id: 'user-uuid-1',
  name: 'Test User',
  email: 'test@example.com',
  avatarUrl: null,
};

const mockPrisma = {
  db: {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
    },
  },
};

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    jest.clearAllMocks();
  });

  describe('findById', () => {
    it('should return user when found', async () => {
      mockPrisma.db.user.findUnique.mockResolvedValue(mockUser);
      const result = await service.findById('user-uuid-1');
      expect(result).toEqual(mockUser);
      expect(mockPrisma.db.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-uuid-1' },
        select: { id: true, name: true, email: true, avatarUrl: true },
      });
    });

    it('should throw NotFoundException when user not found', async () => {
      mockPrisma.db.user.findUnique.mockResolvedValue(null);
      await expect(service.findById('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update user profile successfully', async () => {
      const updated = { ...mockUser, name: 'New Name' };
      mockPrisma.db.user.update.mockResolvedValue(updated);

      const result = await service.update('user-uuid-1', {
        name: 'New Name',
        email: 'test@example.com',
      });

      expect(result).toEqual(updated);
      expect(mockPrisma.db.user.update).toHaveBeenCalledWith({
        where: { id: 'user-uuid-1' },
        data: { name: 'New Name', email: 'test@example.com' },
        select: { id: true, name: true, email: true, avatarUrl: true },
      });
    });

    it('should throw ConflictException on P2002 unique constraint', async () => {
      const prismaError = new Error('Unique constraint violation');
      Object.assign(prismaError, { code: 'P2002' });
      mockPrisma.db.user.update.mockRejectedValue(prismaError);

      await expect(
        service.update('user-uuid-1', {
          name: 'Test',
          email: 'taken@example.com',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('should rethrow non-P2002 errors', async () => {
      const genericError = new Error('DB connection failed');
      mockPrisma.db.user.update.mockRejectedValue(genericError);

      await expect(
        service.update('user-uuid-1', {
          name: 'Test',
          email: 'test@example.com',
        }),
      ).rejects.toThrow('DB connection failed');
    });
  });
});
