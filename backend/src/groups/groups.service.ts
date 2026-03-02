import {
  Injectable,
  ConflictException,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import {
  CreateGroupDto,
  GroupResponse,
  InviteUrlResponse,
} from '@shared/schemas/group.schema.js';
import { MAX_GROUP_MEMBERS_FREE } from '@shared/constants/limits.js';
import { MemberRole } from '../../generated/prisma/client.js';

@Injectable()
export class GroupsService {
  constructor(private readonly prisma: PrismaService) { }

  async createGroup(
    userId: string,
    data: CreateGroupDto,
  ): Promise<GroupResponse> {
    const existingGroupMember = await this.prisma.db.groupMember.findFirst({
      where: { userId },
    });

    if (existingGroupMember) {
      throw new ConflictException({
        statusCode: 409,
        error: 'ALREADY_IN_GROUP',
        message: "L'utilisateur appartient déjà à un groupe",
      });
    }

    const group = await this.prisma.db.group.create({
      data: {
        name: data.name,
        members: {
          create: {
            userId,
            role: MemberRole.creator_admin,
          },
        },
      },
    });

    return {
      id: group.id,
      name: group.name,
      createdAt: group.createdAt.toISOString(),
      updatedAt: group.updatedAt.toISOString(),
      role: MemberRole.creator_admin,
      memberCount: 1,
    };
  }

  async getGroups(userId: string): Promise<GroupResponse[]> {
    const memberships = await this.prisma.db.groupMember.findMany({
      where: { userId },
      include: {
        group: {
          include: {
            _count: { select: { members: true } },
          },
        },
      },
    });

    return memberships.map((m) => ({
      id: m.group.id,
      name: m.group.name,
      createdAt: m.group.createdAt.toISOString(),
      updatedAt: m.group.updatedAt.toISOString(),
      role: m.role as any,
      memberCount: m.group._count.members,
    }));
  }

  async generateInvite(
    userId: string,
    groupId: string,
  ): Promise<InviteUrlResponse> {
    // Expiration default to 7 days
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const invite = await this.prisma.db.groupInvite.create({
      data: {
        groupId,
        expiresAt,
      },
    });

    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:4200';
    return {
      url: `${baseUrl}/invite/${invite.token}`,
      token: invite.token,
      expiresAt: invite.expiresAt.toISOString(),
    };
  }

  async joinGroup(
    userId: string,
    token: string,
  ): Promise<{ message: string; groupId: string }> {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(token)) {
      throw new NotFoundException({
        statusCode: 404,
        error: 'NOT_FOUND',
        message: "Le lien d'invitation est introuvable ou invalide",
      });
    }

    const invite = await this.prisma.db.groupInvite.findUnique({
      where: { token },
    });

    if (!invite) {
      throw new NotFoundException({
        statusCode: 404,
        error: 'NOT_FOUND',
        message: "Le lien d'invitation est introuvable ou invalide",
      });
    }

    if (invite.expiresAt < new Date()) {
      throw new ConflictException({
        statusCode: 409,
        error: 'EXPIRED_INVITE',
        message: "Le lien d'invitation a expiré",
      });
    }

    const existingMembership = await this.prisma.db.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId: invite.groupId,
          userId,
        },
      },
    });

    if (existingMembership) {
      return {
        message: 'Vous êtes déjà membre de ce groupe',
        groupId: invite.groupId,
      };
    }

    const activeMembersCount = await this.prisma.db.groupMember.count({
      where: { groupId: invite.groupId },
    });

    if (activeMembersCount >= MAX_GROUP_MEMBERS_FREE) {
      throw new ForbiddenException({
        statusCode: 403,
        error: 'GROUP_FULL',
        message: 'Groupe plein — 6 membres maximum en plan Free',
      });
    }

    await this.prisma.db.groupMember.create({
      data: {
        groupId: invite.groupId,
        userId,
        role: MemberRole.member,
      },
    });

    return {
      message: 'Vous avez rejoint le groupe avec succès',
      groupId: invite.groupId,
    };
  }

  async removeMember(
    groupId: string,
    userId: string,
    requesterId: string,
  ): Promise<void> {
    if (userId === requesterId) {
      throw new BadRequestException({
        statusCode: 400,
        error: 'CANNOT_REMOVE_SELF',
        message:
          'Vous ne pouvez pas vous supprimer vous-même du groupe via cette action',
      });
    }

    const memberToRemove = await this.prisma.db.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId,
          userId,
        },
      },
    });

    if (!memberToRemove) {
      throw new NotFoundException({
        statusCode: 404,
        error: 'NOT_FOUND',
        message: 'Le membre est introuvable dans ce groupe',
      });
    }

    await this.prisma.db.$transaction(async (tx) => {
      // 1. Hard delete des humeurs
      await tx.mood.deleteMany({
        where: { groupId, userId },
      });

      // 2. Anonymisation des messages (set user_id to null)
      await tx.message.updateMany({
        where: { groupId, userId },
        data: { userId: null },
      });

      // 3. Suppression de la membership
      await tx.groupMember.delete({
        where: {
          groupId_userId: {
            groupId,
            userId,
          },
        },
      });
    });
  }

  async getGroupMembers(groupId: string) {
    const members = await this.prisma.db.groupMember.findMany({
      where: { groupId },
      include: { user: true },
      orderBy: { joinedAt: 'asc' },
    });

    return members.map((m) => ({
      id: m.userId,
      name: m.user.name,
      email: m.user.email,
      avatarUrl: m.user.avatarUrl,
      role: m.role,
      joinedAt: m.joinedAt.toISOString(),
    }));
  }

  async leaveGroup(groupId: string, userId: string): Promise<void> {
    const membership = await this.prisma.db.groupMember.findUnique({
      where: {
        groupId_userId: { groupId, userId },
      },
    });

    if (!membership) {
      throw new NotFoundException({
        statusCode: 404,
        error: 'NOT_FOUND',
        message: "Vous n'êtes pas membre de ce groupe",
      });
    }

    if (membership.role === MemberRole.creator_admin) {
      throw new BadRequestException({
        statusCode: 400,
        error: 'CANNOT_LEAVE_AS_CREATOR',
        message:
          "Vous ne pouvez pas quitter le groupe, vous êtes le créateur. Transférez le rôle d'administrateur à un autre membre ou supprimez le groupe.",
      });
    }

    await this.prisma.db.$transaction(async (tx) => {
      // 1. Hard delete des humeurs
      await tx.mood.deleteMany({
        where: { groupId, userId },
      });

      // 2. Anonymisation des messages (set user_id to null)
      await tx.message.updateMany({
        where: { groupId, userId },
        data: { userId: null },
      });

      // 3. Suppression de la membership
      await tx.groupMember.delete({
        where: {
          groupId_userId: { groupId, userId },
        },
      });
    });

    // TODO: When FilesService handles Group media, perform cleanup of R2 media for this member in this group
  }

  async deleteGroup(groupId: string, userId: string): Promise<void> {
    const membership = await this.prisma.db.groupMember.findUnique({
      where: {
        groupId_userId: { groupId, userId },
      },
    });

    if (!membership) {
      throw new NotFoundException({
        statusCode: 404,
        error: 'NOT_FOUND',
        message: "Vous n'êtes pas membre de ce groupe",
      });
    }

    if (membership.role !== MemberRole.creator_admin) {
      throw new ForbiddenException({
        statusCode: 403,
        error: 'FORBIDDEN',
        message: 'Seul le créateur peut supprimer le groupe',
      });
    }

    const activeMembersCount = await this.prisma.db.groupMember.count({
      where: { groupId },
    });

    if (activeMembersCount > 1) {
      throw new BadRequestException({
        statusCode: 400,
        error: 'CANNOT_DELETE_GROUP_WITH_MEMBERS',
        message: 'Vous devez être le seul membre pour supprimer le groupe.',
      });
    }

    await this.prisma.db.group.delete({
      where: { id: groupId },
    });

    // TODO: Cascading takes care of GroupMember and GroupInvite. Will need to add File deletion for R2 group folder here in the future.
  }
}
