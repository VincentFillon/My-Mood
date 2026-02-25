import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateGroupDto, GroupResponse } from '@shared/schemas/group.schema.js';
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
}
