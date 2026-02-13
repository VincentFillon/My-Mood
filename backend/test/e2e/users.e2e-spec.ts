import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import cookieParser from 'cookie-parser';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module.js';
import { GlobalExceptionFilter } from '../../src/common/filters/global-exception.filter.js';
import { ResponseWrapperInterceptor } from '../../src/common/interceptors/response-wrapper.interceptor.js';
import { PrismaService } from '../../src/prisma/prisma.service.js';

describe('Users Profile (e2e)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  let accessToken: string;
  const testEmail = `e2e-test-profile-${Date.now()}@example.com`;

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

    // Register a test user to get an access token
    const res = await request
      .default(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({
        name: 'Profile Test User',
        email: testEmail,
        password: 'password123',
        gdprConsent: true,
      });

    accessToken = res.body.data.accessToken;
  });

  afterAll(async () => {
    await prismaService.db.user.deleteMany({
      where: { email: { startsWith: 'e2e-test-profile-' } },
    });
    await app.close();
  });

  describe('GET /api/v1/users/me', () => {
    it('should return current user profile', async () => {
      const res = await request
        .default(app.getHttpServer())
        .get('/api/v1/users/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(res.body.data).toBeDefined();
      expect(res.body.data.email).toBe(testEmail);
      expect(res.body.data.name).toBe('Profile Test User');
      expect(res.body.data.avatarUrl).toBeNull();
      // Should not expose passwordHash
      expect(res.body.data.passwordHash).toBeUndefined();
    });

    it('should return 401 without token', async () => {
      await request
        .default(app.getHttpServer())
        .get('/api/v1/users/me')
        .expect(401);
    });
  });

  describe('PUT /api/v1/users/me', () => {
    it('should update user name', async () => {
      const res = await request
        .default(app.getHttpServer())
        .put('/api/v1/users/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ name: 'Updated Name', email: testEmail })
        .expect(200);

      expect(res.body.data.name).toBe('Updated Name');
      expect(res.body.data.email).toBe(testEmail);
    });

    it('should update user email', async () => {
      const newEmail = `e2e-test-profile-updated-${Date.now()}@example.com`;
      const res = await request
        .default(app.getHttpServer())
        .put('/api/v1/users/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ name: 'Updated Name', email: newEmail })
        .expect(200);

      expect(res.body.data.email).toBe(newEmail);

      // Revert email for cleanup
      await request
        .default(app.getHttpServer())
        .put('/api/v1/users/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ name: 'Updated Name', email: testEmail });
    });

    it('should return 409 for duplicate email', async () => {
      // Create another user
      const otherEmail = `e2e-test-profile-other-${Date.now()}@example.com`;
      await request
        .default(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          name: 'Other User',
          email: otherEmail,
          password: 'password123',
          gdprConsent: true,
        });

      const res = await request
        .default(app.getHttpServer())
        .put('/api/v1/users/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ name: 'Updated Name', email: otherEmail })
        .expect(409);

      expect(res.body.error).toBe('EMAIL_ALREADY_EXISTS');
    });

    it('should return 400 for invalid data', async () => {
      await request
        .default(app.getHttpServer())
        .put('/api/v1/users/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ name: '', email: 'not-email' })
        .expect(400);
    });

    it('should return 401 without token', async () => {
      await request
        .default(app.getHttpServer())
        .put('/api/v1/users/me')
        .send({ name: 'Test', email: 'test@test.com' })
        .expect(401);
    });
  });

  describe('POST /api/v1/users/me/avatar', () => {
    it('should return 401 without token', async () => {
      await request
        .default(app.getHttpServer())
        .post('/api/v1/users/me/avatar')
        .expect(401);
    });

    it('should return 400 without file', async () => {
      await request
        .default(app.getHttpServer())
        .post('/api/v1/users/me/avatar')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(400);
    });
  });
});
