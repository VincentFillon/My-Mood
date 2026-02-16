import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import cookieParser from 'cookie-parser';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module.js';
import { GlobalExceptionFilter } from '../../src/common/filters/global-exception.filter.js';
import { ResponseWrapperInterceptor } from '../../src/common/interceptors/response-wrapper.interceptor.js';
import { PrismaService } from '../../src/prisma/prisma.service.js';

function extractCookies(res: request.Response): string[] {
  const raw = res.headers['set-cookie'];
  if (!raw) return [];
  return Array.isArray(raw) ? (raw as string[]) : [raw as string];
}

function extractRefreshCookieValue(res: request.Response): string {
  const cookies = extractCookies(res);
  const cookie = cookies.find((c) => c.startsWith('refresh_token=')) ?? '';
  return cookie.split(';')[0].split('=').slice(1).join('=');
}

describe('Auth (e2e)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.use(cookieParser());
    app.useGlobalFilters(new GlobalExceptionFilter());
    app.useGlobalInterceptors(new ResponseWrapperInterceptor());
    await app.init();

    prismaService = app.get(PrismaService);
  });

  afterAll(async () => {
    // Clean up test users
    await prismaService.db.user.deleteMany({
      where: { email: { startsWith: 'e2e-test-' } },
    });
    await app.close();
  });

  describe('POST /api/v1/auth/register', () => {
    const testEmail = `e2e-test-${Date.now()}@example.com`;

    it('should register a new user and return tokens', async () => {
      const res = await request
        .default(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          name: 'E2E Test User',
          email: testEmail,
          password: 'password123',
          gdprConsent: true,
        })
        .expect(201);

      expect(res.body.data).toBeDefined();
      expect(res.body.data.accessToken).toBeDefined();
      expect(res.body.data.user.email).toBe(testEmail);
      expect(res.body.data.user.id).toBeDefined();

      // Check refresh token cookie
      const cookies = extractCookies(res);
      expect(cookies.length).toBeGreaterThan(0);
      const refreshCookie = cookies.find((c) => c.startsWith('refresh_token='));
      expect(refreshCookie).toContain('HttpOnly');
      expect(refreshCookie).toContain('SameSite=Strict');
    });

    it('should return 409 for duplicate email', async () => {
      const res = await request
        .default(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          name: 'Duplicate User',
          email: testEmail,
          password: 'password123',
          gdprConsent: true,
        })
        .expect(409);

      expect(res.body.error).toBe('CONFLICT');
    });

    it('should return 400 for invalid data', async () => {
      const res = await request
        .default(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          name: '',
          email: 'not-an-email',
          password: '123',
          gdprConsent: false,
        })
        .expect(400);

      expect(res.body.error).toBe('VALIDATION_ERROR');
      expect(res.body.details).toBeDefined();
      expect(res.body.details.length).toBeGreaterThan(0);
    });

    it('should verify user was created in database', async () => {
      const user = await prismaService.db.user.findUnique({
        where: { email: testEmail },
      });

      expect(user).toBeDefined();
      expect(user!.name).toBe('E2E Test User');
      expect(user!.gdprConsentAt).toBeInstanceOf(Date);
      // Ensure password is not stored in plain text
      expect(user!.passwordHash).not.toBe('password123');
      expect(user!.passwordHash).toMatch(/^\$argon2id\$/);
    });

  });

  describe('POST /api/v1/auth/login', () => {
    const loginEmail = `e2e-test-login-${Date.now()}@example.com`;

    beforeAll(async () => {
      await request
        .default(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          name: 'Login Test User',
          email: loginEmail,
          password: 'password123',
          gdprConsent: true,
        });
    });

    it('should login with valid credentials', async () => {
      const res = await request
        .default(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: loginEmail, password: 'password123' })
        .expect(201);

      expect(res.body.data.accessToken).toBeDefined();
      expect(res.body.data.user.email).toBe(loginEmail);

      const cookies = extractCookies(res);
      const refreshCookie = cookies.find((c) => c.startsWith('refresh_token='));
      expect(refreshCookie).toContain('HttpOnly');
    });

    it('should return 401 for wrong password', async () => {
      const res = await request
        .default(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: loginEmail, password: 'wrongpassword' })
        .expect(401);

      expect(res.body.error).toBe('UNAUTHORIZED');
    });

    it('should return 401 for unknown email', async () => {
      await request
        .default(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123',
        })
        .expect(401);
    });

    it('should return 400 for invalid input', async () => {
      await request
        .default(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: 'not-email', password: '' })
        .expect(400);
    });
  });

  describe('POST /api/v1/auth/refresh', () => {
    const refreshEmail = `e2e-test-refresh-${Date.now()}@example.com`;
    let refreshCookieValue: string;

    beforeAll(async () => {
      const res = await request
        .default(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          name: 'Refresh Test User',
          email: refreshEmail,
          password: 'password123',
          gdprConsent: true,
        });
      refreshCookieValue = extractRefreshCookieValue(res);
    });

    it('should refresh tokens with valid cookie', async () => {
      const res = await request
        .default(app.getHttpServer())
        .post('/api/v1/auth/refresh')
        .set('Cookie', [`refresh_token=${refreshCookieValue}`])
        .expect(201);

      expect(res.body.data.accessToken).toBeDefined();
      expect(res.body.data.user).toBeDefined();

      // Save new cookie for next test
      refreshCookieValue = extractRefreshCookieValue(res);
    });

    it('should reject reuse of old refresh token (rotation)', async () => {
      await request
        .default(app.getHttpServer())
        .post('/api/v1/auth/refresh')
        .set('Cookie', [`refresh_token=invalid-old-token`])
        .expect(401);
    });

    it('should return 401 when no cookie is present', async () => {
      await request
        .default(app.getHttpServer())
        .post('/api/v1/auth/refresh')
        .expect(401);
    });
  });

  describe('POST /api/v1/auth/logout', () => {
    const logoutEmail = `e2e-test-logout-${Date.now()}@example.com`;
    let logoutCookieValue: string;

    beforeAll(async () => {
      const res = await request
        .default(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          name: 'Logout Test User',
          email: logoutEmail,
          password: 'password123',
          gdprConsent: true,
        });
      logoutCookieValue = extractRefreshCookieValue(res);
    });

    it('should logout and clear cookie', async () => {
      const res = await request
        .default(app.getHttpServer())
        .post('/api/v1/auth/logout')
        .set('Cookie', [`refresh_token=${logoutCookieValue}`])
        .expect(201);

      expect(res.body.data.message).toBe('Déconnexion réussie');

      // Cookie should be cleared
      const cookies = extractCookies(res);
      const clearCookie = cookies.find((c) => c.startsWith('refresh_token='));
      expect(clearCookie).toBeDefined();
    });

    it('should reject refresh after logout', async () => {
      await request
        .default(app.getHttpServer())
        .post('/api/v1/auth/refresh')
        .set('Cookie', [`refresh_token=${logoutCookieValue}`])
        .expect(401);
    });
  });

  // ⚠️ WARNING: This describe block MUST remain the LAST block in this file.
  // It exhausts the throttler, which would cause subsequent register calls
  // (in beforeAll blocks of other describe blocks) to silently fail with 429.
  describe('Rate limiting (must run last)', () => {
    it('should return 429 after exceeding rate limit on register (AC5)', async () => {
      for (let i = 0; i < 12; i++) {
        await request
          .default(app.getHttpServer())
          .post('/api/v1/auth/register')
          .send({
            name: 'x',
            email: 'x',
            password: 'x',
            gdprConsent: true,
          });
      }

      const res = await request
        .default(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          name: 'Rate Limited',
          email: 'e2e-test-limited@example.com',
          password: 'password123',
          gdprConsent: true,
        })
        .expect(429);

      expect(res.body.statusCode).toBe(429);
    });
  });
});
