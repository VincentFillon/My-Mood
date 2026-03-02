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
      where: { email: { in: ['creator@e2e.com', 'user@e2e.com'] } },
    });

    // Register creator
    const resCreator = await request
      .default(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({
        name: 'Creator',
        email: 'creator@e2e.com',
        password: 'password',
        gdprConsent: true,
      });
    creatorToken = resCreator.body.data.accessToken;

    // Register normal user
    const resUser = await request
      .default(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({
        name: 'User',
        email: 'user@e2e.com',
        password: 'password',
        gdprConsent: true,
      });
    userToken = resUser.body.data.accessToken;

    // Create Group
    const resGroup = await request
      .default(app.getHttpServer())
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
      where: { email: { in: ['creator@e2e.com', 'user@e2e.com'] } },
    });
    await app.close();
  });

  describe('POST /api/v1/groups/:groupId/invite', () => {
    it('should generate an invite link for a group as creator_admin', async () => {
      const res = await request
        .default(app.getHttpServer())
        .post(`/api/v1/groups/${createdGroupId}/invite`)
        .set('Authorization', `Bearer ${creatorToken}`)
        .expect(201);

      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.url).toBeDefined();
      expect(res.body.data.expiresAt).toBeDefined();
      inviteTokenId = res.body.data.token;
    });

    it('should reject generation if user is not creator_admin', async () => {
      await request
        .default(app.getHttpServer())
        .post(`/api/v1/groups/${createdGroupId}/invite`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
    });
  });

  describe('POST /api/v1/groups/join/:token', () => {
    it('should join the group with a valid token as connected user', async () => {
      const res = await request
        .default(app.getHttpServer())
        .post(`/api/v1/groups/join/${inviteTokenId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(201);

      expect(res.body.data.message).toBeDefined();

      // verify membership
      const groups = await request
        .default(app.getHttpServer())
        .get('/api/v1/groups/me')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(groups.body.data.length).toBe(1);
      expect(groups.body.data[0].id).toBe(createdGroupId);
    });

    it('should return success if already member', async () => {
      const res = await request
        .default(app.getHttpServer())
        .post(`/api/v1/groups/join/${inviteTokenId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(201);

      expect(res.body.data.message).toBe('Vous êtes déjà membre de ce groupe');
    });

    it('should return 404 for invalid token', async () => {
      await request
        .default(app.getHttpServer())
        .post(`/api/v1/groups/join/invalid-or-fake-uuid`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(404);
    });

    it('should return 403 GROUP_FULL when trying to join a full group', async () => {
      // we already have 1 member (creator_admin) and 1 from the previous tests (userToken). That's 2 members.
      // We need to add 4 more members directly to the DB to reach 6.
      const newUsersData = Array.from({ length: 4 }).map((_, i) => ({
        id: `00000000-0000-0000-0000-${i.toString().padStart(12, '0')}`,
        name: `Filler User ${i}`,
        email: `filler${i}@e2e.com`,
        passwordHash: 'dummy',
        gdprConsentAt: new Date(),
      }));

      await prismaService.db.user.createMany({ data: newUsersData });

      const newMembersData = newUsersData.map((u) => ({
        groupId: createdGroupId,
        userId: u.id,
        role: 'member' as any,
      }));
      await prismaService.db.groupMember.createMany({ data: newMembersData });

      // Now group has 6 members. Let's create another user and try to join.
      const resOverflowUser = await request
        .default(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          name: 'OverflowUser',
          email: 'overflow@e2e.com',
          password: 'password',
          gdprConsent: true,
        });
      const overflowToken = resOverflowUser.body.data.accessToken;

      const resJoin = await request
        .default(app.getHttpServer())
        .post(`/api/v1/groups/join/${inviteTokenId}`)
        .set('Authorization', `Bearer ${overflowToken}`)
        .expect(403);

      expect(resJoin.body.error).toBe('GROUP_FULL');

      // Cleanup
      await prismaService.db.user.deleteMany({
        where: { email: { startsWith: 'filler' } },
      });
      await prismaService.db.user.delete({
        where: { email: 'overflow@e2e.com' },
      });
    });
  });

  describe('DELETE /api/v1/groups/:groupId/members/:userId', () => {
    let userToRemoveToken: string;
    let userToRemoveId: string;

    beforeAll(async () => {
      // Register another user to remove
      const resUser = await request
        .default(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          name: 'UserToRemove',
          email: 'remove_me@e2e.com',
          password: 'password',
          gdprConsent: true,
        });
      userToRemoveToken = resUser.body.data.accessToken;

      // Join group using token from previous test suite
      await request
        .default(app.getHttpServer())
        .post(`/api/v1/groups/join/${inviteTokenId}`)
        .set('Authorization', `Bearer ${userToRemoveToken}`)
        .expect(201);

      // Fetch the user ID based on email
      const userToRemoveRecord = await prismaService.db.user.findUnique({
        where: { email: 'remove_me@e2e.com' },
      });
      userToRemoveId = userToRemoveRecord!.id;
    });

    afterAll(async () => {
      await prismaService.db.user.delete({
        where: { email: 'remove_me@e2e.com' },
      });
    });

    it('should return 403 if a regular member tries to remove another member', async () => {
      await request
        .default(app.getHttpServer())
        .delete(`/api/v1/groups/${createdGroupId}/members/${userToRemoveId}`)
        .set('Authorization', `Bearer ${userToken}`) // Normal user
        .expect(403);
    });

    it('should return 400 if creator_admin tries to remove themselves', async () => {
      const creatorUserRecord = await prismaService.db.user.findUnique({
        where: { email: 'creator@e2e.com' },
      });
      const creatorId = creatorUserRecord!.id;

      await request
        .default(app.getHttpServer())
        .delete(`/api/v1/groups/${createdGroupId}/members/${creatorId}`)
        .set('Authorization', `Bearer ${creatorToken}`) // Creator admin
        .expect(400);
    });

    it('should remove a member successfully if user is creator_admin', async () => {
      await request
        .default(app.getHttpServer())
        .delete(`/api/v1/groups/${createdGroupId}/members/${userToRemoveId}`)
        .set('Authorization', `Bearer ${creatorToken}`) // Creator admin
        .expect(200);

      // Verify member was removed
      const groupMembers = await prismaService.db.groupMember.findMany({
        where: { groupId: createdGroupId, userId: userToRemoveId },
      });
      expect(groupMembers.length).toBe(0);
    });
    describe('DELETE /api/v1/groups/:groupId/leave', () => {
      let leaveUserToken: string;
      let leaveUserId: string;

      beforeAll(async () => {
        // Register a user to test leaving
        const resUser = await request
          .default(app.getHttpServer())
          .post('/api/v1/auth/register')
          .send({
            name: 'LeaveUser',
            email: 'leave_me@e2e.com',
            password: 'password',
            gdprConsent: true,
          });
        leaveUserToken = resUser.body.data.accessToken;

        // Join group using token
        await request
          .default(app.getHttpServer())
          .post(`/api/v1/groups/join/${inviteTokenId}`)
          .set('Authorization', `Bearer ${leaveUserToken}`)
          .expect(201);

        const userRecord = await prismaService.db.user.findUnique({
          where: { email: 'leave_me@e2e.com' },
        });
        leaveUserId = userRecord!.id;
      });

      afterAll(async () => {
        await prismaService.db.user.delete({
          where: { email: 'leave_me@e2e.com' },
        });
      });

      it('should return 400 if creator_admin tries to leave the group', async () => {
        await request
          .default(app.getHttpServer())
          .delete(`/api/v1/groups/${createdGroupId}/leave`)
          .set('Authorization', `Bearer ${creatorToken}`)
          .expect(400);
      });

      it('should return 404 if user not in group tries to leave', async () => {
        const fakeGroupId = '00000000-0000-0000-0000-000000000000';
        await request
          .default(app.getHttpServer())
          .delete(`/api/v1/groups/${fakeGroupId}/leave`)
          .set('Authorization', `Bearer ${leaveUserToken}`)
          .expect(403);
      });

      it('should allow normal member to leave group successfully and anonymize messages', async () => {
        // 1. Create a dummy message from this user in the DB before they leave
        const dummyMessage = await prismaService.db.message.create({
          data: {
            userId: leaveUserId,
            groupId: createdGroupId,
            content: 'Goodbye everyone!',
          }
        });

        // 2. Member leaves the group
        await request
          .default(app.getHttpServer())
          .delete(`/api/v1/groups/${createdGroupId}/leave`)
          .set('Authorization', `Bearer ${leaveUserToken}`)
          .expect(204);

        // 3. Verify member was removed
        const groupMembers = await prismaService.db.groupMember.findMany({
          where: { groupId: createdGroupId, userId: leaveUserId },
        });
        expect(groupMembers.length).toBe(0);

        // 4. Verify message still exists but user_id is null (anonymized)
        const checkMessage = await prismaService.db.message.findUnique({
          where: { id: dummyMessage.id }
        });
        expect(checkMessage).toBeDefined();
        expect(checkMessage?.userId).toBeNull();
        expect(checkMessage?.content).toBe('Goodbye everyone!');
      });
    });

    describe('DELETE /api/v1/groups/:groupId', () => {
      let tempGroupId: string;
      let tempCreatorToken: string;

      beforeAll(async () => {
        // Register a new user to create a group
        const resUser = await request
          .default(app.getHttpServer())
          .post('/api/v1/auth/register')
          .send({
            name: 'TempCreator',
            email: 'temp_creator@e2e.com',
            password: 'password',
            gdprConsent: true,
          });
        tempCreatorToken = resUser.body.data.accessToken;

        // Create a group specifically for deletion testing
        const resGroup = await request
          .default(app.getHttpServer())
          .post('/api/v1/groups')
          .set('Authorization', `Bearer ${tempCreatorToken}`)
          .send({ name: 'Delete Group' });
        tempGroupId = resGroup.body.data.id;
      });

      afterAll(async () => {
        await prismaService.db.user.delete({
          where: { email: 'temp_creator@e2e.com' },
        });
      });

      it('should return 403 if normal member tries to delete group', async () => {
        await request
          .default(app.getHttpServer())
          .delete(`/api/v1/groups/${createdGroupId}`)
          .set('Authorization', `Bearer ${userToken}`)
          .expect(403);
      });

      it('should return 400 if creator_admin tries to delete a group with other members', async () => {
        // createdGroupId has userToken as a member
        await request
          .default(app.getHttpServer())
          .delete(`/api/v1/groups/${createdGroupId}`)
          .set('Authorization', `Bearer ${creatorToken}`)
          .expect(400);
      });

      it('should allow creator_admin to delete group if they are the only member', async () => {
        await request
          .default(app.getHttpServer())
          .delete(`/api/v1/groups/${tempGroupId}`)
          .set('Authorization', `Bearer ${tempCreatorToken}`)
          .expect(204);

        // Verify group was deleted
        const group = await prismaService.db.group.findUnique({
          where: { id: tempGroupId },
        });
        expect(group).toBeNull();
      });
    });
  });
});
