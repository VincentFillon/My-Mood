import { Test, TestingModule } from '@nestjs/common';
import { PrismaService } from '../../src/prisma/prisma.service.js';
import { appContext } from '../../src/common/context/app.context.js';
import { PrismaModule } from '../../src/prisma/prisma.module.js';
import { MemberRole } from '../../../generated/prisma/client.js';

describe('Row-Level Security (RLS) Isolation', () => {
  let prismaService: PrismaService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [PrismaModule],
    }).compile();

    prismaService = module.get<PrismaService>(PrismaService);
    await prismaService.onModuleInit();
  });

  afterAll(async () => {
    await prismaService.onModuleDestroy();
  });

  it('should restrict data access strictly to the given group in the ALS context', async () => {
    // 1. Setup: Use the base client to bypass RLS for fixture creation
    const baseClient = (prismaService as any).client;

    const userEmailA = `a_${Date.now()}@example.com`;
    const userEmailB = `b_${Date.now()}@example.com`;

    const userA = await baseClient.user.create({
      data: {
        name: 'A',
        email: userEmailA,
        passwordHash: 'hash',
        gdprConsentAt: new Date(),
      },
    });
    const userB = await baseClient.user.create({
      data: {
        name: 'B',
        email: userEmailB,
        passwordHash: 'hash',
        gdprConsentAt: new Date(),
      },
    });

    const groupA = await baseClient.group.create({ data: { name: 'Group A' } });
    const groupB = await baseClient.group.create({ data: { name: 'Group B' } });

    await baseClient.groupMember.create({
      data: {
        groupId: groupA.id,
        userId: userA.id,
        role: MemberRole.creator_admin,
      },
    });
    await baseClient.groupMember.create({
      data: {
        groupId: groupB.id,
        userId: userB.id,
        role: MemberRole.creator_admin,
      },
    });

    // 2. Test: Query through RLS-extended database client
    const db = prismaService.db;

    await appContext.run({ groupId: groupA.id }, async () => {
      // Querying all groups should return ONLY Group A
      const groups = await db.group.findMany();
      expect(groups.length).toBe(1);
      expect(groups[0].id).toBe(groupA.id);

      // Querying group members should ONLY return members belonging to Group A
      const members = await db.groupMember.findMany();
      expect(members.length).toBeGreaterThan(0);
      expect(members.every((m) => m.groupId === groupA.id)).toBe(true);

      // Direct fetching of Group B data should return null
      const findGroupB = await db.group.findUnique({
        where: { id: groupB.id },
      });
      expect(findGroupB).toBeNull();
    });

    // 3. Cleanup
    await baseClient.groupMember.deleteMany({
      where: { groupId: { in: [groupA.id, groupB.id] } },
    });
    await baseClient.group.deleteMany({
      where: { id: { in: [groupA.id, groupB.id] } },
    });
    await baseClient.user.deleteMany({
      where: { id: { in: [userA.id, userB.id] } },
    });
  });
});
