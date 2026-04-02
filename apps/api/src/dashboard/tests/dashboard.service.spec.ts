import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { DashboardService } from '../dashboard.service';
import { PrismaService } from '../../common/prisma.service';
import { prismaMock } from '../../common/prisma.mock';

const makeSession = (daysAgo: number, correct: number, total: number, type = 'addition') => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  const attempts = Array.from({ length: total }, (_, i) => ({
    correct: i < correct,
    exercise: { type },
  }));
  return { completedAt: date, attempts };
};

describe('DashboardService', () => {
  let service: DashboardService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();
    service = module.get<DashboardService>(DashboardService);
  });

  it('throws NotFoundException for unknown child', async () => {
    prismaMock.child.findUnique.mockResolvedValue(null);
    await expect(service.getDashboard('ghost-id')).rejects.toThrow(NotFoundException);
  });

  it('returns correct totalCoins and currentLevel', async () => {
    prismaMock.child.findUnique.mockResolvedValue({ id: 'c1', coins: 42, currentLevel: 3 });
    prismaMock.session.findMany.mockResolvedValue([]);

    const result = await service.getDashboard('c1');
    expect(result.totalCoins).toBe(42);
    expect(result.currentLevel).toBe(3);
  });

  it('returns empty arrays when no sessions', async () => {
    prismaMock.child.findUnique.mockResolvedValue({ id: 'c1', coins: 0, currentLevel: 1 });
    prismaMock.session.findMany.mockResolvedValue([]);

    const result = await service.getDashboard('c1');
    expect(result.dailyProgress).toHaveLength(0);
    expect(result.topicErrorRates).toHaveLength(0);
    expect(result.weakAreas).toHaveLength(0);
  });

  it('identifies weak areas when error rate > 40%', async () => {
    prismaMock.child.findUnique.mockResolvedValue({ id: 'c1', coins: 10, currentLevel: 2 });
    // 1 correct, 4 wrong → 80% error rate
    prismaMock.session.findMany.mockResolvedValue([makeSession(1, 1, 5, 'addition')]);

    const result = await service.getDashboard('c1');
    expect(result.weakAreas).toContain('addition');
  });

  it('does not flag strong topics as weak areas', async () => {
    prismaMock.child.findUnique.mockResolvedValue({ id: 'c1', coins: 10, currentLevel: 2 });
    // 9 correct, 1 wrong → 10% error rate — below 40% threshold
    prismaMock.session.findMany.mockResolvedValue([makeSession(1, 9, 10, 'addition')]);

    const result = await service.getDashboard('c1');
    expect(result.weakAreas).not.toContain('addition');
  });

  it('aggregates daily progress by date', async () => {
    prismaMock.child.findUnique.mockResolvedValue({ id: 'c1', coins: 5, currentLevel: 1 });
    prismaMock.session.findMany.mockResolvedValue([
      makeSession(0, 3, 4),
      makeSession(0, 2, 3),
    ]);

    const result = await service.getDashboard('c1');
    // Both sessions are today — should be merged into one daily entry
    expect(result.dailyProgress).toHaveLength(1);
    expect(result.dailyProgress[0].correctAnswers).toBe(5);
    expect(result.dailyProgress[0].totalAnswers).toBe(7);
  });
});
