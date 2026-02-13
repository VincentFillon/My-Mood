import { jest } from '@jest/globals';
import { ConflictException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { FilesService } from '../files/files.service.js';
import { UsersController } from './users.controller.js';
import { UsersService } from './users.service.js';

const mockUser = {
  id: 'user-uuid-1',
  name: 'Test User',
  email: 'test@example.com',
  avatarUrl: null,
};

const mockUsersService = {
  findById: jest.fn(),
  update: jest.fn(),
};

const mockFilesService = {
  getSignedUrl: jest.fn(),
};

describe('UsersController', () => {
  let controller: UsersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        { provide: UsersService, useValue: mockUsersService },
        { provide: FilesService, useValue: mockFilesService },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    jest.clearAllMocks();
  });

  describe('GET /users/me', () => {
    it('should return current user profile without avatar', async () => {
      mockUsersService.findById.mockResolvedValue(mockUser);
      const result = await controller.getProfile({
        userId: 'user-uuid-1',
        email: 'test@example.com',
      });
      expect(result).toEqual(mockUser);
      expect(mockUsersService.findById).toHaveBeenCalledWith('user-uuid-1');
      expect(mockFilesService.getSignedUrl).not.toHaveBeenCalled();
    });

    it('should return signed URL when user has avatar', async () => {
      const userWithAvatar = { ...mockUser, avatarUrl: 'users/user-uuid-1/avatar.png' };
      mockUsersService.findById.mockResolvedValue(userWithAvatar);
      mockFilesService.getSignedUrl.mockResolvedValue('https://signed-url.example.com/avatar.png');

      const result = await controller.getProfile({
        userId: 'user-uuid-1',
        email: 'test@example.com',
      });
      expect(result.avatarUrl).toBe('https://signed-url.example.com/avatar.png');
      expect(mockFilesService.getSignedUrl).toHaveBeenCalledWith('users/user-uuid-1/avatar.png');
    });
  });

  describe('PUT /users/me', () => {
    it('should update user profile successfully', async () => {
      const updated = { ...mockUser, name: 'New Name' };
      mockUsersService.update.mockResolvedValue(updated);
      const result = await controller.updateProfile(
        { userId: 'user-uuid-1', email: 'test@example.com' },
        { name: 'New Name', email: 'test@example.com' },
      );
      expect(result).toEqual(updated);
    });

    it('should propagate 409 ConflictException on duplicate email', async () => {
      mockUsersService.update.mockRejectedValue(
        new ConflictException('Cet email est déjà utilisé'),
      );
      await expect(
        controller.updateProfile(
          { userId: 'user-uuid-1', email: 'test@example.com' },
          { name: 'Test', email: 'taken@example.com' },
        ),
      ).rejects.toThrow(ConflictException);
    });
  });
});
