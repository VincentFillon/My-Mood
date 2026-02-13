import {
  BadRequestException,
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { JwtPayload } from '../auth/decorators/current-user.decorator.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { UsersService } from '../users/users.service.js';
import type { UploadedFile as UploadedFileType } from './files.service.js';
import { FilesService } from './files.service.js';

@Controller('api/v1/users')
@UseGuards(JwtAuthGuard)
export class FilesController {
  constructor(
    private readonly filesService: FilesService,
    private readonly usersService: UsersService,
  ) {}

  @Post('me/avatar')
  @UseInterceptors(FileInterceptor('file'))
  async uploadAvatar(
    @CurrentUser() user: JwtPayload,
    @UploadedFile() file: UploadedFileType,
  ) {
    if (!file) {
      throw new BadRequestException('Aucun fichier fourni');
    }
    const key = await this.filesService.uploadAvatar(user.userId, file);
    await this.usersService.updateAvatarUrl(user.userId, key);
    const signedUrl = await this.filesService.getSignedUrl(key);

    return {
      avatarUrl: signedUrl,
    };
  }
}
