import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module.js';
import { GlobalExceptionFilter } from '../../src/common/filters/global-exception.filter.js';
import { ResponseWrapperInterceptor } from '../../src/common/interceptors/response-wrapper.interceptor.js';
import cookieParser from 'cookie-parser';
import { PrismaService } from '../../src/prisma/prisma.service.js';

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
      const res = await request.default(app.getHttpServer())
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
      const cookies = res.headers['set-cookie'];
      expect(cookies).toBeDefined();
      const refreshCookie = Array.isArray(cookies)
        ? cookies.find((c: string) => c.startsWith('refresh_token='))
        : cookies;
      expect(refreshCookie).toContain('HttpOnly');
      expect(refreshCookie).toContain('SameSite=Strict');
    });

    it('should return 409 for duplicate email', async () => {
      const res = await request.default(app.getHttpServer())
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
      const res = await request.default(app.getHttpServer())
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

    it('should return 429 after exceeding rate limit (AC5)', async () => {
      // Exhaust the 10 req/min rate limit on register endpoint
      // (previous tests already consumed some requests)
      for (let i = 0; i < 12; i++) {
        await request.default(app.getHttpServer())
          .post('/api/v1/auth/register')
          .send({ name: 'x', email: 'x', password: 'x', gdprConsent: true });
      }

      const res = await request.default(app.getHttpServer())
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
