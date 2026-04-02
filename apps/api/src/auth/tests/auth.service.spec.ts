import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { PrismaService } from '../../common/prisma.service';
import { prismaMock } from '../../common/prisma.mock';
import * as bcrypt from 'bcrypt';
import { AvatarType } from '@calculator/types';

jest.mock('bcrypt');
const bcryptMock = bcrypt as jest.Mocked<typeof bcrypt>;

const jwtServiceMock = { sign: jest.fn().mockReturnValue('test-token') };

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: JwtService, useValue: jwtServiceMock },
      ],
    }).compile();
    service = module.get<AuthService>(AuthService);
  });

  // ─── registerParent ────────────────────────────────────────────────────────

  describe('registerParent', () => {
    it('creates a parent and returns a token', async () => {
      prismaMock.parent.findUnique.mockResolvedValue(null);
      (bcryptMock.hash as jest.Mock).mockResolvedValue('hashed-pw');
      prismaMock.parent.create.mockResolvedValue({ id: 'parent-1' });

      const result = await service.registerParent('test@example.com', 'password123');

      expect(prismaMock.parent.findUnique).toHaveBeenCalledWith({ where: { email: 'test@example.com' } });
      expect(bcryptMock.hash).toHaveBeenCalledWith('password123', 10);
      expect(result).toEqual({ accessToken: 'test-token', expiresIn: 604800 });
    });

    it('throws ConflictException if email already exists', async () => {
      prismaMock.parent.findUnique.mockResolvedValue({ id: 'existing' });
      await expect(service.registerParent('taken@example.com', 'pw')).rejects.toThrow(ConflictException);
    });
  });

  // ─── loginParent ──────────────────────────────────────────────────────────

  describe('loginParent', () => {
    it('returns token on valid credentials', async () => {
      prismaMock.parent.findUnique.mockResolvedValue({ id: 'p1', password: 'hashed' });
      (bcryptMock.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.loginParent({ email: 'a@b.com', password: 'pw' });
      expect(result.accessToken).toBe('test-token');
    });

    it('throws UnauthorizedException for unknown email', async () => {
      prismaMock.parent.findUnique.mockResolvedValue(null);
      await expect(service.loginParent({ email: 'x@y.com', password: 'pw' })).rejects.toThrow(UnauthorizedException);
    });

    it('throws UnauthorizedException for wrong password', async () => {
      prismaMock.parent.findUnique.mockResolvedValue({ id: 'p1', password: 'hashed' });
      (bcryptMock.compare as jest.Mock).mockResolvedValue(false);
      await expect(service.loginParent({ email: 'a@b.com', password: 'wrong' })).rejects.toThrow(UnauthorizedException);
    });
  });

  // ─── loginChild ───────────────────────────────────────────────────────────

  describe('loginChild', () => {
    it('returns token on valid PIN', async () => {
      prismaMock.child.findUnique.mockResolvedValue({ id: 'c1', pin: 'hashed-pin' });
      (bcryptMock.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.loginChild({ childId: 'c1', pin: '1234' });
      expect(result.accessToken).toBe('test-token');
    });

    it('throws UnauthorizedException for wrong PIN', async () => {
      prismaMock.child.findUnique.mockResolvedValue({ id: 'c1', pin: 'hashed-pin' });
      (bcryptMock.compare as jest.Mock).mockResolvedValue(false);
      await expect(service.loginChild({ childId: 'c1', pin: '0000' })).rejects.toThrow(UnauthorizedException);
    });

    it('throws UnauthorizedException if child not found', async () => {
      prismaMock.child.findUnique.mockResolvedValue(null);
      await expect(service.loginChild({ childId: 'ghost', pin: '1234' })).rejects.toThrow(UnauthorizedException);
    });
  });

  // ─── createChild ──────────────────────────────────────────────────────────

  describe('createChild', () => {
    it('hashes PIN and creates child record', async () => {
      (bcryptMock.hash as jest.Mock).mockResolvedValue('hashed-pin');
      prismaMock.child.create.mockResolvedValue({ id: 'c2', name: 'Dana', avatar: AvatarType.CAT_1, coins: 0, currentLevel: 1 });

      const result = await service.createChild('p1', { name: 'Dana', avatar: AvatarType.CAT_1, pin: '1234' });

      expect(bcryptMock.hash).toHaveBeenCalledWith('1234', 10);
      expect(result.name).toBe('Dana');
    });
  });
});
