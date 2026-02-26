import { Injectable, CanActivate, ExecutionContext, ForbiddenException, NotFoundException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../prisma/prisma.service.js';
import { MemberRole } from '../../../generated/prisma/client.js';
import { ROLES_KEY } from '../decorators/roles.decorator.js';

@Injectable()
export class GroupMemberGuard implements CanActivate {
    constructor(private reflector: Reflector, private prisma: PrismaService) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const requiredRoles = this.reflector.getAllAndOverride<MemberRole[]>(ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        const request = context.switchToHttp().getRequest();
        const user = request.user;
        const groupId = request.params.groupId;

        if (!user || !user.userId || !groupId) {
            return false;
        }

        const membership = await this.prisma.db.groupMember.findUnique({
            where: {
                groupId_userId: {
                    groupId,
                    userId: user.userId,
                },
            },
        });

        if (!membership) {
            throw new ForbiddenException({
                statusCode: 403,
                error: 'FORBIDDEN',
                message: "Vous n'êtes pas membre de ce groupe",
            });
        }

        if (requiredRoles && requiredRoles.length > 0) {
            if (!requiredRoles.includes(membership.role)) {
                throw new ForbiddenException({
                    statusCode: 403,
                    error: 'FORBIDDEN',
                    message: "Vous n'avez pas les permissions nécessaires dans ce groupe",
                });
            }
        }

        // Attach membership to request for later use if needed
        request.groupMembership = membership;
        return true;
    }
}
