import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { UsersController } from './users.controller.js';
import { UsersService } from './users.service.js';

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: {
    findUserByFilter: ReturnType<typeof vi.fn>;
    findUserById: ReturnType<typeof vi.fn>;
    removeUser: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    usersService = {
      findUserByFilter: vi.fn(),
      findUserById: vi.fn(),
      removeUser: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: UsersService, useValue: usersService }],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('deleteMe', () => {
    const request = {
      user: { id: 7, username: 'alice' },
    } as Request & { user: { id: number; username: string } };

    it('deletes the authenticated user account', async () => {
      usersService.removeUser.mockResolvedValue({ affected: 1 });

      await expect(controller.deleteMe(7, request)).resolves.toBeUndefined();
      expect(usersService.removeUser).toHaveBeenCalledWith(7);
    });

    it('does not allow deleting another user account', async () => {
      await expect(controller.deleteMe(8, request)).rejects.toThrow(
        ForbiddenException,
      );
      expect(usersService.removeUser).not.toHaveBeenCalled();
    });

    it('returns not found when the user does not exist', async () => {
      usersService.removeUser.mockResolvedValue({ affected: 0 });

      await expect(controller.deleteMe(7, request)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
