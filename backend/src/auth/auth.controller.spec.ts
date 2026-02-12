import { jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: jest.Mocked<Partial<AuthService>>;

  beforeEach(async () => {
    authService = {
      register: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: authService },
        {
          provide: ConfigService,
          useValue: { get: jest.fn().mockReturnValue('test') },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  describe('register', () => {
    it('should return accessToken and user on success', async () => {
      const mockResult = {
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        user: { id: 'uuid-1', name: 'Test', email: 'test@example.com' },
      };
      authService.register!.mockResolvedValue(mockResult);

      const mockResponse = {
        cookie: jest.fn(),
      } as unknown as import('express').Response;

      const result = await controller.register(
        {
          name: 'Test',
          email: 'test@example.com',
          password: 'password123',
          gdprConsent: true as const,
        },
        mockResponse,
      );

      expect(result).toEqual({
        accessToken: 'access-token',
        user: { id: 'uuid-1', name: 'Test', email: 'test@example.com' },
      });
    });

    it('should set refresh token cookie on success', async () => {
      const mockResult = {
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        user: { id: 'uuid-1', name: 'Test', email: 'test@example.com' },
      };
      authService.register!.mockResolvedValue(mockResult);

      const mockResponse = {
        cookie: jest.fn(),
      } as unknown as import('express').Response;

      await controller.register(
        {
          name: 'Test',
          email: 'test@example.com',
          password: 'password123',
          gdprConsent: true as const,
        },
        mockResponse,
      );

      expect(mockResponse.cookie).toHaveBeenCalledWith(
        'refresh_token',
        'refresh-token',
        expect.objectContaining({
          httpOnly: true,
          sameSite: 'strict',
          path: '/api/v1/auth/refresh',
        }),
      );
    });

    it('should propagate ConflictException from service', async () => {
      authService.register!.mockRejectedValue(
        new ConflictException({
          statusCode: 409,
          error: 'CONFLICT',
          message: 'Cet email est déjà utilisé',
          timestamp: new Date().toISOString(),
        }),
      );

      const mockResponse = {
        cookie: jest.fn(),
      } as unknown as import('express').Response;

      await expect(
        controller.register(
          {
            name: 'Test',
            email: 'test@example.com',
            password: 'password123',
            gdprConsent: true as const,
          },
          mockResponse,
        ),
      ).rejects.toThrow(ConflictException);

      expect(mockResponse.cookie).not.toHaveBeenCalled();
    });
  });
});
