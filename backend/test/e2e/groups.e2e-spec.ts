import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module.js';
import { GlobalExceptionFilter } from '../../src/common/filters/global-exception.filter.js';
import { ResponseWrapperInterceptor } from '../../src/common/interceptors/response-wrapper.interceptor.js';
import { PrismaService } from '../../src/prisma/prisma.service.js';

describe('Groups (e2e)', () => {
    let app: INestApplication;
    let prismaService: PrismaService;
    let creatorToken: string;
    let userToken: string;
    let createdGroupId: string;
    let inviteTokenId: string;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        // app.useGlobalFilters(new GlobalExceptionFilter());
        app.useGlobalInterceptors(new ResponseWrapperInterceptor());
        await app.init();

        prismaService = app.get(PrismaService);

        // Clean up
        await prismaService.db.user.deleteMany({
            where: { email: { in: ['creator@e2e.com', 'user@e2e.com'] } }
        });

        // Register creator
        const resCreator = await request.default(app.getHttpServer())
            .post('/api/v1/auth/register')
            .send({ name: 'Creator', email: 'creator@e2e.com', password: 'password', gdprConsent: true });
        creatorToken = resCreator.body.data.accessToken;

        // Register normal user
        const resUser = await request.default(app.getHttpServer())
            .post('/api/v1/auth/register')
            .send({ name: 'User', email: 'user@e2e.com', password: 'password', gdprConsent: true });
        userToken = resUser.body.data.accessToken;

        // Create Group
        const resGroup = await request.default(app.getHttpServer())
            .post('/api/v1/groups')
            .set('Authorization', `Bearer ${creatorToken}`)
            .send({ name: 'Test E2E Group' });
        if (resGroup.status !== 201) {
            console.log('CREATE GROUP ERROR:', resGroup.body);
        }
        expect(resGroup.status).toBe(201);
        createdGroupId = resGroup.body.data.id;
    });

    afterAll(async () => {
        await prismaService.db.user.deleteMany({
            where: { email: { in: ['creator@e2e.com', 'user@e2e.com'] } }
        });
        await app.close();
    });

    describe('POST /api/v1/groups/:groupId/invite', () => {
        it('should generate an invite link for a group as creator_admin', async () => {
            const res = await request.default(app.getHttpServer())
                .post(`/api/v1/groups/${createdGroupId}/invite`)
                .set('Authorization', `Bearer ${creatorToken}`)
                .expect(201);

            expect(res.body.data.token).toBeDefined();
            expect(res.body.data.url).toBeDefined();
            expect(res.body.data.expiresAt).toBeDefined();
            inviteTokenId = res.body.data.token;
        });

        it('should reject generation if user is not creator_admin', async () => {
            await request.default(app.getHttpServer())
                .post(`/api/v1/groups/${createdGroupId}/invite`)
                .set('Authorization', `Bearer ${userToken}`)
                .expect(403);
        });
    });

    describe('POST /api/v1/groups/join/:token', () => {
        it('should join the group with a valid token as connected user', async () => {
            const res = await request.default(app.getHttpServer())
                .post(`/api/v1/groups/join/${inviteTokenId}`)
                .set('Authorization', `Bearer ${userToken}`)
                .expect(201);

            expect(res.body.data.message).toBeDefined();

            // verify membership
            const groups = await request.default(app.getHttpServer())
                .get('/api/v1/groups/me')
                .set('Authorization', `Bearer ${userToken}`)
                .expect(200);

            expect(groups.body.data.length).toBe(1);
            expect(groups.body.data[0].id).toBe(createdGroupId);
        });

        it('should return success if already member', async () => {
            const res = await request.default(app.getHttpServer())
                .post(`/api/v1/groups/join/${inviteTokenId}`)
                .set('Authorization', `Bearer ${userToken}`)
                .expect(201);

            expect(res.body.data.message).toBe("Vous êtes déjà membre de ce groupe");
        });

        it('should return 404 for invalid token', async () => {
            await request.default(app.getHttpServer())
                .post(`/api/v1/groups/join/invalid-or-fake-uuid`)
                .set('Authorization', `Bearer ${userToken}`)
                .expect(404);
        });
    });
});
