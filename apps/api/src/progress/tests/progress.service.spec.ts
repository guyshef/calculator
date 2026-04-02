import { Test, TestingModule } from '@nestjs/testing';
import { ProgressService } from '../progress.service';
import { PrismaService } from '../../common/prisma.service';
import { prismaMock } from '../../common/prisma.mock';

const NOW = '2024-01-15T10:00:00.000Z';

const makeDto = (overrides = {}) => ({
  childId: 'child-1',
  level: 2,
  coinsEarned: 7,
  completedAt: NOW,
  attempts: [
    { exerciseId: 'e1', correct: true, answeredAt: NOW },
    { exerciseId: 'e2', correct: true, answeredAt: NOW },
    { exerciseId: 'e3', correct: false, answeredAt: NOW },
    { exerciseId: 'e4', correct: true, answeredAt: NOW },
  ],
  ...overrides,
});

describe('ProgressService', () => {
  let service: ProgressService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProgressService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();
    service = module.get<ProgressService>(ProgressService);
  });

  describe('saveSession', () => {
    beforeEach(() => {
      prismaMock.$transaction.mockImplementation(async (fn: (tx: typeof prismaMock) => Promise<unknown>) => {
        prismaMock.session.create.mockResolvedValue({ id: 'session-1' });
        prismaMock.child.update.mockResolvedValue({});
        return fn(prismaMock);
      });
    });

    it('computes accuracy from attempts', async () => {
      const dto = makeDto(); // 3/4 correct → 0.75
      const result = await service.saveSession(dto);
      expect(result.accuracy).toBeCloseTo(0.75);
    });

    it('returns session id and coinsEarned', async () => {
      const result = await service.saveSession(makeDto());
      expect(result.sessionId).toBe('session-1');
      expect(result.coinsEarned).toBe(7);
    });

    it('accuracy is 0 when no attempts', async () => {
      const dto = makeDto({ attempts: [] });
      const result = await service.saveSession(dto);
      expect(result.accuracy).toBe(0);
    });

    it('accuracy is 1.0 when all correct', async () => {
      const dto = makeDto({
        attempts: [
          { exerciseId: 'e1', correct: true, answeredAt: NOW },
          { exerciseId: 'e2', correct: true, answeredAt: NOW },
        ],
      });
      const result = await service.saveSession(dto);
      expect(result.accuracy).toBe(1);
    });
  });

  describe('getSessionsForChild', () => {
    it('returns sessions ordered by completedAt desc', async () => {
      const sessions = [
        { id: 's2', level: 2, coinsEarned: 5, accuracy: 0.9, completedAt: new Date('2024-01-15') },
        { id: 's1', level: 1, coinsEarned: 3, accuracy: 0.7, completedAt: new Date('2024-01-14') },
      ];
      prismaMock.session.findMany.mockResolvedValue(sessions);

      const result = await service.getSessionsForChild('child-1');

      expect(prismaMock.session.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { childId: 'child-1' }, orderBy: { completedAt: 'desc' } }),
      );
      expect(result).toHaveLength(2);
    });
  });
});
