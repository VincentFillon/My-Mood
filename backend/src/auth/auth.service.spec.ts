import { jest } from '@jest/globals';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import * as argon2 from 'argon2';
import { PrismaService } from '../prisma/prisma.service.js';
import { UsersService } from '../users/users.service.js';
import { AuthService } from './auth.service.js';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: jest.Mocked<Partial<UsersService>>;
  let jwtService: jest.Mocked<Partial<JwtService>>;
  let prismaService: { db: Record<string, Record<string, jest.Mock>> };

  beforeEach(async () => {
    usersService = {
      findByEmail: jest.fn(),
      findByEmailWithCredentials: jest.fn(),
      create: jest.fn(),
    };

    jwtService = {
      signAsync: jest.fn(),
      verifyAsync: jest.fn(),
    };

    prismaService = {
      db: {
        refreshToken: {
          create: jest.fn<() => Promise<unknown>>().mockResolvedValue({}),
          findUnique: jest.fn<() => Promise<unknown>>().mockResolvedValue(null),
          update: jest.fn<() => Promise<unknown>>().mockResolvedValue({}),
          updateMany: jest
            .fn<() => Promise<unknown>>()
            .mockResolvedValue({ count: 0 }),
        },
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: jwtService },
        {
          provide: ConfigService,
          useValue: { get: jest.fn().mockReturnValue('test-refresh-secret') },
        },
        { provide: PrismaService, useValue: prismaService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  const validRegisterDto = {
    name: 'Test User',
    email: 'test@example.com',
    password: 'password123',
    gdprConsent: true as const,
  };

  const validLoginDto = {
    email: 'test@example.com',
    password: 'password123',
  };

  const mockUser = {
    id: 'uuid-1',
    name: 'Test User',
    email: 'test@example.com',
  };

  const mockUserWithCredentials = {
    ...mockUser,
    passwordHash: '', // Will be set in tests
  };

  describe('register', () => {
    it('should register a new user successfully', async () => {
      usersService.findByEmail!.mockResolvedValue(null);
      usersService.create!.mockResolvedValue(mockUser);
      jwtService
        .signAsync!.mockResolvedValueOnce('access-token')
        .mockResolvedValueOnce('refresh-token');

      const result = await service.register(validRegisterDto);

      expect(result.accessToken).toBe('access-token');
      expect(result.refreshToken).toBe('refresh-token');
      expect(result.user).toEqual(mockUser);
    });

    it('should throw ConflictException if email already exists', async () => {
      usersService.findByEmail!.mockResolvedValue(mockUser);

      await expect(service.register(validRegisterDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should hash password with Argon2id', async () => {
      usersService.findByEmail!.mockResolvedValue(null);
      usersService.create!.mockResolvedValue(mockUser);
      jwtService.signAsync!.mockResolvedValue('token');

      await service.register(validRegisterDto);

      const createCall = usersService.create!.mock.calls[0][0];
      expect(createCall.passwordHash).toMatch(/^\$argon2id\$/);
      expect(await argon2.verify(createCall.passwordHash, 'password123')).toBe(
        true,
      );
    });

    it('should store GDPR consent timestamp', async () => {
      const before = new Date();
      usersService.findByEmail!.mockResolvedValue(null);
      usersService.create!.mockResolvedValue(mockUser);
      jwtService.signAsync!.mockResolvedValue('token');

      await service.register(validRegisterDto);

      const createCall = usersService.create!.mock.calls[0][0];
      expect(createCall.gdprConsentAt).toBeInstanceOf(Date);
      expect(createCall.gdprConsentAt.getTime()).toBeGreaterThanOrEqual(
        before.getTime(),
      );
    });

    it('should persist refresh token in database', async () => {
      usersService.findByEmail!.mockResolvedValue(null);
      usersService.create!.mockResolvedValue(mockUser);
      jwtService
        .signAsync!.mockResolvedValueOnce('access-token')
        .mockResolvedValueOnce('refresh-token');

      await service.register(validRegisterDto);

      expect(prismaService.db.refreshToken.create).toHaveBeenCalledTimes(1);
      const createArg = prismaService.db.refreshToken.create.mock
        .calls[0][0] as {
        data: { token: string; userId: string; expiresAt: Date };
      };
      expect(createArg.data.userId).toBe('uuid-1');
      expect(createArg.data.token).toBeDefined();
      expect(createArg.data.expiresAt).toBeInstanceOf(Date);
    });
  });

  describe('login', () => {
    it('should login successfully with valid credentials', async () => {
      const passwordHash = await argon2.hash('password123', {
        type: argon2.argon2id,
      });
      usersService.findByEmailWithCredentials!.mockResolvedValue({
        ...mockUserWithCredentials,
        passwordHash,
      });
      jwtService
        .signAsync!.mockResolvedValueOnce('access-token')
        .mockResolvedValueOnce('refresh-token');

      const result = await service.login(validLoginDto);

      expect(result.accessToken).toBe('access-token');
      expect(result.refreshToken).toBe('refresh-token');
      expect(result.user).toEqual(mockUser);
    });

    it('should throw UnauthorizedException for wrong password', async () => {
      const passwordHash = await argon2.hash('different-password', {
        type: argon2.argon2id,
      });
      usersService.findByEmailWithCredentials!.mockResolvedValue({
        ...mockUserWithCredentials,
        passwordHash,
      });

      await expect(service.login(validLoginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException for unknown email (timing safe)', async () => {
      usersService.findByEmailWithCredentials!.mockResolvedValue(null);

      await expect(service.login(validLoginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should persist refresh token on successful login', async () => {
      const passwordHash = await argon2.hash('password123', {
        type: argon2.argon2id,
      });
      usersService.findByEmailWithCredentials!.mockResolvedValue({
        ...mockUserWithCredentials,
        passwordHash,
      });
      jwtService
        .signAsync!.mockResolvedValueOnce('access-token')
        .mockResolvedValueOnce('refresh-token');

      await service.login(validLoginDto);

      expect(prismaService.db.refreshToken.create).toHaveBeenCalledTimes(1);
    });
  });

  describe('refresh', () => {
    it('should rotate tokens successfully', async () => {
      (jwtService.verifyAsync as jest.Mock).mockResolvedValue({
        sub: 'uuid-1',
        email: 'test@example.com',
      });
      prismaService.db.refreshToken.findUnique.mockResolvedValue({
        id: 'token-id',
        token: 'hashed',
        userId: 'uuid-1',
        revokedAt: null,
        expiresAt: new Date(Date.now() + 86400000),
      });
      jwtService
        .signAsync!.mockResolvedValueOnce('new-access-token')
        .mockResolvedValueOnce('new-refresh-token');
      usersService.findByEmail!.mockResolvedValue(mockUser);

      const result = await service.refresh('old-refresh-token');

      expect(result.accessToken).toBe('new-access-token');
      expect(result.refreshToken).toBe('new-refresh-token');
      expect(prismaService.db.refreshToken.update).toHaveBeenCalled();
      expect(prismaService.db.refreshToken.create).toHaveBeenCalled();
    });

    it('should throw UnauthorizedException for expired JWT', async () => {
      (jwtService.verifyAsync as jest.Mock).mockRejectedValue(
        new Error('jwt expired'),
      );

      await expect(service.refresh('expired-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException for revoked token and revoke all user tokens', async () => {
      (jwtService.verifyAsync as jest.Mock).mockResolvedValue({
        sub: 'uuid-1',
        email: 'test@example.com',
      });
      prismaService.db.refreshToken.findUnique.mockResolvedValue({
        id: 'token-id',
        token: 'hashed',
        userId: 'uuid-1',
        revokedAt: new Date(), // Already revoked
        expiresAt: new Date(Date.now() + 86400000),
      });

      await expect(service.refresh('stolen-token')).rejects.toThrow(
        UnauthorizedException,
      );
      expect(prismaService.db.refreshToken.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ userId: 'uuid-1', revokedAt: null }),
        }),
      );
    });

    it('should throw UnauthorizedException for token not found in DB', async () => {
      (jwtService.verifyAsync as jest.Mock).mockResolvedValue({
        sub: 'uuid-1',
        email: 'test@example.com',
      });
      prismaService.db.refreshToken.findUnique.mockResolvedValue(null);

      await expect(service.refresh('unknown-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('logout', () => {
    it('should revoke the refresh token', async () => {
      await service.logout('some-refresh-token');

      expect(prismaService.db.refreshToken.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ revokedAt: expect.any(Date) }),
        }),
      );
    });
  });
});
