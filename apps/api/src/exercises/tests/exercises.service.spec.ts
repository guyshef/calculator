import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ExercisesService } from '../exercises.service';
import { PrismaService } from '../../common/prisma.service';
import { prismaMock } from '../../common/prisma.mock';

const MOCK_EXERCISES = [
  { id: 'e1', level: 1, type: 'addition', operandA: 1, operandB: 2, answer: 3, narrationKey: 'ex.addition.1.2' },
  { id: 'e2', level: 1, type: 'addition', operandA: 2, operandB: 3, answer: 5, narrationKey: 'ex.addition.2.3' },
  { id: 'e3', level: 1, type: 'addition', operandA: 1, operandB: 1, answer: 2, narrationKey: 'ex.addition.1.1' },
];

describe('ExercisesService', () => {
  let service: ExercisesService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExercisesService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();
    service = module.get<ExercisesService>(ExercisesService);
  });

  describe('getByLevel', () => {
    it('returns exercises with 5 options each (answer included)', async () => {
      prismaMock.exercise.findMany.mockResolvedValue(MOCK_EXERCISES);

      const result = await service.getByLevel(1);

      expect(result.level).toBe(1);
      expect(result.exercises).toHaveLength(3);
      result.exercises.forEach((ex) => {
        expect(ex.options).toHaveLength(5);
        expect(ex.options).toContain(ex.answer);
      });
    });

    it('throws NotFoundException when no exercises found', async () => {
      prismaMock.exercise.findMany.mockResolvedValue([]);
      await expect(service.getByLevel(99)).rejects.toThrow(NotFoundException);
    });

    it('each exercise has required fields', async () => {
      prismaMock.exercise.findMany.mockResolvedValue(MOCK_EXERCISES);
      const { exercises } = await service.getByLevel(1);
      exercises.forEach((ex) => {
        expect(ex).toHaveProperty('id');
        expect(ex).toHaveProperty('operandA');
        expect(ex).toHaveProperty('operandB');
        expect(ex).toHaveProperty('answer');
        expect(ex).toHaveProperty('options');
        expect(ex).toHaveProperty('narrationKey');
      });
    });

    it('options never contain duplicates', async () => {
      prismaMock.exercise.findMany.mockResolvedValue(MOCK_EXERCISES);
      const { exercises } = await service.getByLevel(1);
      exercises.forEach((ex) => {
        const unique = new Set(ex.options);
        expect(unique.size).toBe(ex.options.length);
      });
    });
  });

  describe('getAllLevels', () => {
    it('returns available level numbers', async () => {
      prismaMock.exercise.groupBy.mockResolvedValue([{ level: 1 }, { level: 2 }, { level: 3 }]);
      const levels = await service.getAllLevels();
      expect(levels).toEqual([1, 2, 3]);
    });
  });
});
