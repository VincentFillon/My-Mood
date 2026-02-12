import {
  Controller,
  Post,
  Body,
  Res,
  UsePipes,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import type { Response } from 'express';
import { AuthService } from './auth.service.js';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe.js';
import { RegisterSchema } from '@shared/schemas/auth.schema.js';
import type { RegisterInput } from '@shared/schemas/auth.schema.js';
import { TOKEN_EXPIRY_REFRESH_MS } from '@shared/constants/limits.js';

@Controller('api/v1/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @UsePipes(new ZodValidationPipe(RegisterSchema))
  async register(
    @Body() dto: RegisterInput,
    @Res({ passthrough: true }) response: Response,
  ) {
    const { accessToken, refreshToken, user } = await this.authService.register(dto);

    response.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env['NODE_ENV'] === 'production',
      sameSite: 'strict',
      path: '/api/v1/auth/refresh',
      maxAge: TOKEN_EXPIRY_REFRESH_MS,
    });

    return { accessToken, user };
  }
}
