import { jest } from '@jest/globals';
import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from '../users/users.service.js';
import { FilesController } from './files.controller.js';
import { FilesService } from './files.service.js';

const mockFilesService = {
  uploadAvatar: jest.fn(),
  getSignedUrl: jest.fn(),
};

const mockUsersService = {
  updateAvatarUrl: jest.fn(),
};

describe('FilesController', () => {
  let controller: FilesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FilesController],
      providers: [
        { provide: FilesService, useValue: mockFilesService },
        { provide: UsersService, useValue: mockUsersService },
      ],
    }).compile();

    controller = module.get<FilesController>(FilesController);
    jest.clearAllMocks();
  });

  describe('POST /users/me/avatar', () => {
    const jwtPayload = { userId: 'user-uuid-1', email: 'test@example.com' };
    const mockFile = {
      buffer: Buffer.from('image data'),
      mimetype: 'image/png',
      size: 1024,
      originalname: 'avatar.png',
    };

    it('should upload avatar successfully', async () => {
      mockFilesService.uploadAvatar.mockResolvedValue(
        'users/user-uuid-1/avatar.png',
      );
      mockUsersService.updateAvatarUrl.mockResolvedValue({});
      mockFilesService.getSignedUrl.mockResolvedValue(
        'https://signed-url.example.com/avatar.png',
      );

      const result = await controller.uploadAvatar(jwtPayload, mockFile);

      expect(result).toEqual({
        avatarUrl: 'https://signed-url.example.com/avatar.png',
      });
      expect(mockFilesService.uploadAvatar).toHaveBeenCalledWith(
        'user-uuid-1',
        mockFile,
      );
      expect(mockUsersService.updateAvatarUrl).toHaveBeenCalledWith(
        'user-uuid-1',
        'users/user-uuid-1/avatar.png',
      );
    });

    it('should reject oversized files', async () => {
      mockFilesService.uploadAvatar.mockRejectedValue(
        new BadRequestException('Le fichier ne doit pas dépasser 10 Mo'),
      );

      await expect(
        controller.uploadAvatar(jwtPayload, {
          ...mockFile,
          size: 11 * 1024 * 1024,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject unsupported formats', async () => {
      mockFilesService.uploadAvatar.mockRejectedValue(
        new BadRequestException('Format non supporté'),
      );

      await expect(
        controller.uploadAvatar(jwtPayload, {
          ...mockFile,
          mimetype: 'application/pdf',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
