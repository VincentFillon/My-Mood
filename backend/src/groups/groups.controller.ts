import { Controller, Post, Get, Body, UseGuards, UseInterceptors } from '@nestjs/common';
import { GroupsService } from './groups.service.js';
import { CreateGroupSchema } from '@shared/schemas/group.schema.js';
import type { CreateGroupDto } from '@shared/schemas/group.schema.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { ResponseWrapperInterceptor } from '../common/interceptors/response-wrapper.interceptor.js';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';

@Controller('v1/groups')
@UseGuards(JwtAuthGuard)
@UseInterceptors(ResponseWrapperInterceptor)
export class GroupsController {
    constructor(private readonly groupsService: GroupsService) { }

    @Post()
    async createGroup(
        @CurrentUser('id') userId: string,
        @Body(new ZodValidationPipe(CreateGroupSchema)) createGroupDto: CreateGroupDto,
    ) {
        return this.groupsService.createGroup(userId, createGroupDto);
    }

    @Get('/me')
    async getGroups(@CurrentUser('id') userId: string) {
        return this.groupsService.getGroups(userId);
    }
}
