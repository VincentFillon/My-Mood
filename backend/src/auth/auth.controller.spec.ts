import { jest } from '@jest/globals';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: jest.Mocked<Partial<AuthService>>;

  const mockResponse = () => {
    const res = {
      cookie: jest.fn(),
      clearCookie: jest.fn(),
    } as unknown as import('express').Response;
    return res;
  };

  const mockRequest = (cookies: Record<string, string> = {}) =>
    ({ cookies }) as unknown as import('express').Request;

  beforeEach(async () => {
    authService = {
      register: jest.fn(),
      login: jest.fn(),
      refresh: jest.fn(),
      logout: jest.fn(),
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

  const mockAuthResult = {
    accessToken: 'access-token',
    refreshToken: 'refresh-token',
    user: { id: 'uuid-1', name: 'Test', email: 'test@example.com' },
  };

  describe('register', () => {
    it('should return accessToken and user on success', async () => {
      authService.register!.mockResolvedValue(mockAuthResult);
      const res = mockResponse();

      const result = await controller.register(
        {
          name: 'Test',
          email: 'test@example.com',
          password: 'password123',
          gdprConsent: true as const,
        },
        res,
      );

      expect(result).toEqual({
        accessToken: 'access-token',
        user: { id: 'uuid-1', name: 'Test', email: 'test@example.com' },
      });
    });

    it('should set refresh token cookie on success', async () => {
      authService.register!.mockResolvedValue(mockAuthResult);
      const res = mockResponse();

      await controller.register(
        {
          name: 'Test',
          email: 'test@example.com',
          password: 'password123',
          gdprConsent: true as const,
        },
        res,
      );

      expect(res.cookie).toHaveBeenCalledWith(
        'refresh_token',
        'refresh-token',
        expect.objectContaining({
          httpOnly: true,
          sameSite: 'strict',
          path: '/api/v1/auth',
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
      const res = mockResponse();

      await expect(
        controller.register(
          {
            name: 'Test',
            email: 'test@example.com',
            password: 'password123',
            gdprConsent: true as const,
          },
          res,
        ),
      ).rejects.toThrow(ConflictException);

      expect(res.cookie).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('should return accessToken and user on success', async () => {
      authService.login!.mockResolvedValue(mockAuthResult);
      const res = mockResponse();

      const result = await controller.login(
        { email: 'test@example.com', password: 'password123' },
        res,
      );

      expect(result).toEqual({
        accessToken: 'access-token',
        user: { id: 'uuid-1', name: 'Test', email: 'test@example.com' },
      });
    });

    it('should set refresh token cookie on success', async () => {
      authService.login!.mockResolvedValue(mockAuthResult);
      const res = mockResponse();

      await controller.login(
        { email: 'test@example.com', password: 'password123' },
        res,
      );

      expect(res.cookie).toHaveBeenCalledWith(
        'refresh_token',
        'refresh-token',
        expect.objectContaining({
          httpOnly: true,
          sameSite: 'strict',
          path: '/api/v1/auth',
        }),
      );
    });

    it('should propagate UnauthorizedException from service', async () => {
      authService.login!.mockRejectedValue(new UnauthorizedException());
      const res = mockResponse();

      await expect(
        controller.login({ email: 'test@example.com', password: 'wrong' }, res),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('refresh', () => {
    it('should refresh tokens and set new cookie', async () => {
      authService.refresh!.mockResolvedValue(mockAuthResult);
      const req = mockRequest({ refresh_token: 'old-token' });
      const res = mockResponse();

      const result = await controller.refresh(req, res);

      expect(result).toEqual({
        accessToken: 'access-token',
        user: { id: 'uuid-1', name: 'Test', email: 'test@example.com' },
      });
      expect(res.cookie).toHaveBeenCalledWith(
        'refresh_token',
        'refresh-token',
        expect.objectContaining({ httpOnly: true }),
      );
    });

    it('should throw UnauthorizedException when no cookie present', async () => {
      const req = mockRequest({});
      const res = mockResponse();

      await expect(controller.refresh(req, res)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('logout', () => {
    it('should clear refresh cookie and call service logout', async () => {
      authService.logout!.mockResolvedValue(undefined);
      const req = mockRequest({ refresh_token: 'some-token' });
      const res = mockResponse();

      const result = await controller.logout(req, res);

      expect(authService.logout).toHaveBeenCalledWith('some-token');
      expect(res.clearCookie).toHaveBeenCalledWith(
        'refresh_token',
        expect.objectContaining({
          httpOnly: true,
          sameSite: 'strict',
          path: '/api/v1/auth',
        }),
      );
      expect(result).toEqual({ message: 'Déconnexion réussie' });
    });

    it('should clear cookie even without refresh token', async () => {
      const req = mockRequest({});
      const res = mockResponse();

      const result = await controller.logout(req, res);

      expect(authService.logout).not.toHaveBeenCalled();
      expect(res.clearCookie).toHaveBeenCalled();
      expect(result).toEqual({ message: 'Déconnexion réussie' });
    });
  });
});
