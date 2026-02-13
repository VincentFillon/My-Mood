import {
  Body,
  Controller,
  Get,
  Put,
  UseGuards
} from '@nestjs/common';
import type { UpdateProfileInput } from '@shared/schemas/user.schema.js';
import { UpdateProfileSchema } from '@shared/schemas/user.schema.js';
import type { JwtPayload } from '../auth/decorators/current-user.decorator.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe.js';
import { FilesService } from '../files/files.service.js';
import { UsersService } from './users.service.js';

@Controller('api/v1/users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly filesService: FilesService,
  ) {}

  @Get('me')
  async getProfile(@CurrentUser() user: JwtPayload) {
    const profile = await this.usersService.findById(user.userId);
    if (profile.avatarUrl) {
      return {
        ...profile,
        avatarUrl: await this.filesService.getSignedUrl(profile.avatarUrl),
      };
    }
    return profile;
  }

  @Put('me')
  async updateProfile(
    @CurrentUser() user: JwtPayload,
    @Body(new ZodValidationPipe(UpdateProfileSchema)) dto: UpdateProfileInput,
  ) {
    const updated = await this.usersService.update(user.userId, dto);
    if (updated.avatarUrl) {
      return {
        ...updated,
        avatarUrl: await this.filesService.getSignedUrl(updated.avatarUrl),
      };
    }
    return updated;
  }
}
