import {
  ConflictException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { ERROR_CODES } from '@shared/constants/errors.js';
import { TOKEN_EXPIRY_REFRESH_MS } from '@shared/constants/limits.js';
import type { LoginInput, RegisterInput } from '@shared/schemas/auth.schema.js';
import * as argon2 from 'argon2';
import { createHash, randomUUID } from 'crypto';
import { PrismaService } from '../prisma/prisma.service.js';
import { UsersService } from '../users/users.service.js';

// Pre-computed dummy hash for timing side-channel prevention
const DUMMY_HASH =
  '$argon2id$v=19$m=65536,t=3,p=1$c29tZXNhbHQ$RdescudvJCsgt3ub+b+daw';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly prismaService: PrismaService,
  ) {}

  async register(dto: RegisterInput) {
    const passwordHash = await argon2.hash(dto.password, {
      type: argon2.argon2id,
      memoryCost: 65536,
      timeCost: 3,
      parallelism: 1,
    });

    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException({
        statusCode: 409,
        error: ERROR_CODES.CONFLICT,
        message: 'Cet email est déjà utilisé',
        timestamp: new Date().toISOString(),
      });
    }

    const user = await this.usersService.create({
      name: dto.name,
      email: dto.email,
      passwordHash,
      gdprConsentAt: new Date(),
    });

    this.logger.log(`User registered: ${user.id}`);

    const { accessToken, refreshToken } = await this.generateTokens(
      user.id,
      user.email,
    );
    await this.persistRefreshToken(refreshToken, user.id);

    return {
      accessToken,
      refreshToken,
      user: { id: user.id, name: user.name, email: user.email },
    };
  }

  async login(dto: LoginInput) {
    const user = await this.usersService.findByEmailWithCredentials(dto.email);

    // Always execute argon2.verify to prevent timing side-channel attacks
    const isValid = user
      ? await argon2.verify(user.passwordHash, dto.password)
      : await argon2.verify(DUMMY_HASH, dto.password);

    if (!user || !isValid) {
      throw new UnauthorizedException({
        statusCode: 401,
        error: ERROR_CODES.UNAUTHORIZED,
        message: 'Email ou mot de passe incorrect',
        timestamp: new Date().toISOString(),
      });
    }

    const { accessToken, refreshToken } = await this.generateTokens(
      user.id,
      user.email,
    );
    await this.persistRefreshToken(refreshToken, user.id);

    this.logger.log(`User logged in: ${user.id}`);

    return {
      accessToken,
      refreshToken,
      user: { id: user.id, name: user.name, email: user.email },
    };
  }

  async refresh(oldRefreshToken: string) {
    let payload: { sub: string; email: string };
    try {
      payload = await this.jwtService.verifyAsync<{
        sub: string;
        email: string;
      }>(oldRefreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });
    } catch {
      throw new UnauthorizedException({
        statusCode: 401,
        error: ERROR_CODES.TOKEN_EXPIRED,
        message: 'Token de rafraîchissement invalide ou expiré',
        timestamp: new Date().toISOString(),
      });
    }

    const tokenHash = this.hashToken(oldRefreshToken);

    const storedToken = await this.prismaService.db.refreshToken.findUnique({
      where: { token: tokenHash },
    });

    if (
      !storedToken ||
      storedToken.revokedAt ||
      storedToken.expiresAt < new Date()
    ) {
      // If token was already revoked, this could be a token theft attempt
      if (storedToken?.revokedAt) {
        this.logger.warn(
          `Potential token theft detected for user: ${payload.sub}`,
        );
        // Revoke ALL tokens for this user
        await this.prismaService.db.refreshToken.updateMany({
          where: { userId: payload.sub, revokedAt: null },
          data: { revokedAt: new Date() },
        });
      }

      throw new UnauthorizedException({
        statusCode: 401,
        error: ERROR_CODES.TOKEN_EXPIRED,
        message: 'Token de rafraîchissement invalide ou expiré',
        timestamp: new Date().toISOString(),
      });
    }

    // Revoke old token
    await this.prismaService.db.refreshToken.update({
      where: { id: storedToken.id },
      data: { revokedAt: new Date() },
    });

    // Generate new tokens
    const { accessToken, refreshToken } = await this.generateTokens(
      payload.sub,
      payload.email,
    );
    await this.persistRefreshToken(refreshToken, payload.sub);

    // Get user info
    const user = await this.usersService.findByEmail(payload.email);

    this.logger.log(`Token refreshed for user: ${payload.sub}`);

    return {
      accessToken,
      refreshToken,
      user,
    };
  }

  async logout(refreshToken: string) {
    const tokenHash = this.hashToken(refreshToken);

    await this.prismaService.db.refreshToken.updateMany({
      where: { token: tokenHash, revokedAt: null },
      data: { revokedAt: new Date() },
    });

    this.logger.log('User logged out');
  }

  private async generateTokens(userId: string, email: string) {
    const payload = { sub: userId, email, jti: randomUUID() };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload),
      this.jwtService.signAsync({ ...payload, jti: randomUUID() }, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: `${TOKEN_EXPIRY_REFRESH_MS}ms`,
      }),
    ]);

    return { accessToken, refreshToken };
  }

  private async persistRefreshToken(refreshToken: string, userId: string) {
    const tokenHash = this.hashToken(refreshToken);

    await this.prismaService.db.refreshToken.create({
      data: {
        token: tokenHash,
        userId,
        expiresAt: new Date(Date.now() + TOKEN_EXPIRY_REFRESH_MS),
      },
    });
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }
}
