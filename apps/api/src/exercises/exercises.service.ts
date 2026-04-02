import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

function generateOptions(answer: number): number[] {
  const distractors = new Set<number>();
  while (distractors.size < 4) {
    const offset = Math.floor(Math.random() * 5) + 1;
    const candidate = answer + (Math.random() > 0.5 ? offset : -offset);
    if (candidate > 0 && candidate !== answer) distractors.add(candidate);
  }
  return shuffle([answer, ...Array.from(distractors)]);
}

@Injectable()
export class ExercisesService {
  constructor(private prisma: PrismaService) {}

  async getByLevel(level: number) {
    const exercises = await this.prisma.exercise.findMany({
      where: { level },
      take: 10,
    });

    if (!exercises.length) {
      throw new NotFoundException(`No exercises found for level ${level}`);
    }

    return {
      level,
      exercises: shuffle(exercises).map((ex) => ({
        id: ex.id,
        level: ex.level,
        type: ex.type,
        operandA: ex.operandA,
        operandB: ex.operandB,
        answer: ex.answer,
        options: generateOptions(ex.answer),
        narrationKey: ex.narrationKey,
      })),
    };
  }

  async getAllLevels() {
    const levels = await this.prisma.exercise.groupBy({
      by: ['level'],
      orderBy: { level: 'asc' },
    });
    return levels.map((l) => l.level);
  }
}
