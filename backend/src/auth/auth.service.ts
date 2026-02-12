import { Injectable, ConflictException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as argon2 from 'argon2';
import { UsersService } from '../users/users.service.js';
import { ERROR_CODES } from '@shared/constants/errors.js';
import { TOKEN_EXPIRY_REFRESH_MS } from '@shared/constants/limits.js';
import type { RegisterInput } from '@shared/schemas/auth.schema.js';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(dto: RegisterInput) {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException({
        statusCode: 409,
        error: ERROR_CODES.CONFLICT,
        message: 'Cet email est déjà utilisé',
        timestamp: new Date().toISOString(),
      });
    }

    const passwordHash = await argon2.hash(dto.password, {
      type: argon2.argon2id,
      memoryCost: 65536,
      timeCost: 3,
      parallelism: 1,
    });

    const user = await this.usersService.create({
      name: dto.name,
      email: dto.email,
      passwordHash,
      gdprConsentAt: new Date(),
    });

    this.logger.log(`User registered: ${user.id}`);

    const { accessToken, refreshToken } = await this.generateTokens(user.id, user.email);

    return {
      accessToken,
      refreshToken,
      user,
    };
  }

  private async generateTokens(userId: string, email: string) {
    const payload = { sub: userId, email };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: `${TOKEN_EXPIRY_REFRESH_MS}ms`,
      }),
    ]);

    return { accessToken, refreshToken };
  }
}
