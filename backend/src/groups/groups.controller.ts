import { Controller, Post, Get, Delete, Body, Param, UseGuards, UseInterceptors } from '@nestjs/common';
import { GroupsService } from './groups.service.js';
import { CreateGroupSchema } from '@shared/schemas/group.schema.js';
import type { CreateGroupDto, InviteUrlResponse } from '@shared/schemas/group.schema.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { GroupMemberGuard } from './guards/group-member.guard.js';
import { Roles } from './decorators/roles.decorator.js';
import { MemberRole } from '../../generated/prisma/client.js';
import { ResponseWrapperInterceptor } from '../common/interceptors/response-wrapper.interceptor.js';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';

@Controller('api/v1/groups')
@UseGuards(JwtAuthGuard)
@UseInterceptors(ResponseWrapperInterceptor)
export class GroupsController {
    constructor(private readonly groupsService: GroupsService) { }

    @Post()
    async createGroup(
        @CurrentUser('userId') userId: string,
        @Body(new ZodValidationPipe(CreateGroupSchema)) createGroupDto: CreateGroupDto,
    ) {
        return this.groupsService.createGroup(userId, createGroupDto);
    }

    @Get('/me')
    async getGroups(@CurrentUser('userId') userId: string) {
        return this.groupsService.getGroups(userId);
    }

    @Post(':groupId/invite')
    @UseGuards(GroupMemberGuard)
    @Roles(MemberRole.creator_admin)
    async generateInvite(
        @Param('groupId') groupId: string,
        @CurrentUser('userId') userId: string,
    ) {
        return this.groupsService.generateInvite(userId, groupId);
    }

    @Post('join/:token')
    async joinGroup(
        @Param('token') token: string,
        @CurrentUser('userId') userId: string,
    ) {
        return this.groupsService.joinGroup(userId, token);
    }

    @Delete(':groupId/members/:userId')
    @UseGuards(GroupMemberGuard)
    @Roles(MemberRole.creator_admin)
    async removeMember(
        @Param('groupId') groupId: string,
        @Param('userId') targetUserId: string,
        @CurrentUser('userId') requesterId: string,
    ) {
        await this.groupsService.removeMember(groupId, targetUserId, requesterId);
        return { message: 'Membre révoqué avec succès' };
    }

    @Get(':groupId/members')
    @UseGuards(GroupMemberGuard)
    @Roles(MemberRole.creator_admin)
    async getGroupMembers(@Param('groupId') groupId: string) {
        return this.groupsService.getGroupMembers(groupId);
    }
}
