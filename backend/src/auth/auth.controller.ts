import {
  Body,
  Controller,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UsePipes,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Throttle } from '@nestjs/throttler';
import { ERROR_CODES } from '@shared/constants/errors.js';
import {
  RATE_LIMIT_AUTH,
  TOKEN_EXPIRY_REFRESH_MS,
} from '@shared/constants/limits.js';
import type { LoginInput, RegisterInput } from '@shared/schemas/auth.schema.js';
import { LoginSchema, RegisterSchema } from '@shared/schemas/auth.schema.js';
import type { Request, Response } from 'express';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe.js';
import { AuthService } from './auth.service.js';

@Controller('api/v1/auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Post('register')
  @Throttle({ default: { limit: RATE_LIMIT_AUTH, ttl: 60000 } })
  @UsePipes(new ZodValidationPipe(RegisterSchema))
  async register(
    @Body() dto: RegisterInput,
    @Res({ passthrough: true }) response: Response,
  ) {
    const { accessToken, refreshToken, user } =
      await this.authService.register(dto);

    this.setRefreshCookie(response, refreshToken);

    return { accessToken, user };
  }

  @Post('login')
  @Throttle({ default: { limit: RATE_LIMIT_AUTH, ttl: 60000 } })
  @UsePipes(new ZodValidationPipe(LoginSchema))
  async login(
    @Body() dto: LoginInput,
    @Res({ passthrough: true }) response: Response,
  ) {
    const { accessToken, refreshToken, user } =
      await this.authService.login(dto);

    this.setRefreshCookie(response, refreshToken);

    return { accessToken, user };
  }

  @Post('refresh')
  async refresh(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const oldRefreshToken = request.cookies?.['refresh_token'] as
      | string
      | undefined;

    if (!oldRefreshToken) {
      throw new UnauthorizedException({
        statusCode: 401,
        error: ERROR_CODES.UNAUTHORIZED,
        message: 'Token de rafraîchissement manquant',
        timestamp: new Date().toISOString(),
      });
    }

    const { accessToken, refreshToken, user } =
      await this.authService.refresh(oldRefreshToken);

    this.setRefreshCookie(response, refreshToken);

    return { accessToken, user };
  }

  @Post('logout')
  async logout(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const refreshToken = request.cookies?.['refresh_token'] as
      | string
      | undefined;

    if (refreshToken) {
      await this.authService.logout(refreshToken);
    }

    response.clearCookie('refresh_token', {
      httpOnly: true,
      secure: this.configService.get<string>('NODE_ENV') === 'production',
      sameSite: 'strict',
      path: '/api/v1/auth',
    });

    return { message: 'Déconnexion réussie' };
  }

  private setRefreshCookie(response: Response, refreshToken: string) {
    response.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: this.configService.get<string>('NODE_ENV') === 'production',
      sameSite: 'strict',
      path: '/api/v1/auth',
      maxAge: TOKEN_EXPIRY_REFRESH_MS,
    });
  }
}
