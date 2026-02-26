import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateGroupDto, GroupResponse, InviteUrlResponse } from '@shared/schemas/group.schema.js';
import { MemberRole } from '../../generated/prisma/client.js';

@Injectable()
export class GroupsService {
    constructor(private readonly prisma: PrismaService) { }

    async createGroup(userId: string, data: CreateGroupDto): Promise<GroupResponse> {
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
        };
    }

    async getGroups(userId: string): Promise<GroupResponse[]> {
        const memberships = await this.prisma.db.groupMember.findMany({
            where: { userId },
            include: { group: true },
        });

        return memberships.map(m => ({
            id: m.group.id,
            name: m.group.name,
            createdAt: m.group.createdAt.toISOString(),
            updatedAt: m.group.updatedAt.toISOString(),
        }));
    }

    async generateInvite(userId: string, groupId: string): Promise<InviteUrlResponse> {
        // Expiration default to 7 days
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);

        const invite = await this.prisma.db.groupInvite.create({
            data: {
                groupId,
                expiresAt,
            }
        });

        const baseUrl = process.env.FRONTEND_URL || 'http://localhost:4200';
        return {
            url: `${baseUrl}/invite/${invite.token}`,
            token: invite.token,
            expiresAt: invite.expiresAt.toISOString(),
        };
    }

    async joinGroup(userId: string, token: string): Promise<{ message: string, groupId: string }> {
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
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
                message: "Vous êtes déjà membre de ce groupe",
                groupId: invite.groupId,
            };
        }

        await this.prisma.db.groupMember.create({
            data: {
                groupId: invite.groupId,
                userId,
                role: MemberRole.member,
            },
        });

        return {
            message: "Vous avez rejoint le groupe avec succès",
            groupId: invite.groupId,
        };
    }
}
