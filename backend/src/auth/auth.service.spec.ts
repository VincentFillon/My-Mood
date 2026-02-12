import { jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as argon2 from 'argon2';
import { AuthService } from './auth.service.js';
import { UsersService } from '../users/users.service.js';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: jest.Mocked<Partial<UsersService>>;
  let jwtService: jest.Mocked<Partial<JwtService>>;

  beforeEach(async () => {
    usersService = {
      findByEmail: jest.fn(),
      create: jest.fn(),
    };

    jwtService = {
      signAsync: jest.fn(),
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
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  const validDto = {
    name: 'Test User',
    email: 'test@example.com',
    password: 'password123',
    gdprConsent: true as const,
  };

  describe('register', () => {
    it('should register a new user successfully', async () => {
      usersService.findByEmail!.mockResolvedValue(null);
      usersService.create!.mockResolvedValue({
        id: 'uuid-1',
        name: 'Test User',
        email: 'test@example.com',
      });
      jwtService.signAsync!
        .mockResolvedValueOnce('access-token')
        .mockResolvedValueOnce('refresh-token');

      const result = await service.register(validDto);

      expect(result.accessToken).toBe('access-token');
      expect(result.refreshToken).toBe('refresh-token');
      expect(result.user).toEqual({
        id: 'uuid-1',
        name: 'Test User',
        email: 'test@example.com',
      });
    });

    it('should throw ConflictException if email already exists', async () => {
      usersService.findByEmail!.mockResolvedValue({
        id: 'uuid-1',
        name: 'Existing',
        email: 'test@example.com',
        passwordHash: 'hash',
      });

      await expect(service.register(validDto)).rejects.toThrow(ConflictException);
    });

    it('should hash password with Argon2id', async () => {
      usersService.findByEmail!.mockResolvedValue(null);
      usersService.create!.mockResolvedValue({
        id: 'uuid-1',
        name: 'Test User',
        email: 'test@example.com',
      });
      jwtService.signAsync!.mockResolvedValue('token');

      await service.register(validDto);

      const createCall = usersService.create!.mock.calls[0][0];
      expect(createCall.passwordHash).toMatch(/^\$argon2id\$/);
      expect(await argon2.verify(createCall.passwordHash, 'password123')).toBe(true);
    });

    it('should store GDPR consent timestamp', async () => {
      const before = new Date();
      usersService.findByEmail!.mockResolvedValue(null);
      usersService.create!.mockResolvedValue({
        id: 'uuid-1',
        name: 'Test User',
        email: 'test@example.com',
      });
      jwtService.signAsync!.mockResolvedValue('token');

      await service.register(validDto);

      const createCall = usersService.create!.mock.calls[0][0];
      expect(createCall.gdprConsentAt).toBeInstanceOf(Date);
      expect(createCall.gdprConsentAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
    });
  });
});
