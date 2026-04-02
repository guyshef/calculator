import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { SaveProgressDto } from './progress.dto';

@Injectable()
export class ProgressService {
  constructor(private prisma: PrismaService) {}

  async saveSession(dto: SaveProgressDto) {
    const total = dto.attempts.length;
    const correct = dto.attempts.filter((a) => a.correct).length;
    const accuracy = total > 0 ? correct / total : 0;

    const session = await this.prisma.$transaction(async (tx) => {
      const s = await tx.session.create({
        data: {
          childId: dto.childId,
          level: dto.level,
          coinsEarned: dto.coinsEarned,
          accuracy,
          completedAt: new Date(dto.completedAt),
          attempts: {
            create: dto.attempts.map((a) => ({
              exerciseId: a.exerciseId,
              correct: a.correct,
              answeredAt: new Date(a.answeredAt),
            })),
          },
        },
      });

      // Update child coins and unlock next level
      await tx.child.update({
        where: { id: dto.childId },
        data: {
          coins: { increment: dto.coinsEarned },
          currentLevel: { increment: accuracy >= 0.7 ? 1 : 0 },
        },
      });

      return s;
    });

    return { sessionId: session.id, accuracy, coinsEarned: dto.coinsEarned };
  }

  async getSessionsForChild(childId: string) {
    return this.prisma.session.findMany({
      where: { childId },
      orderBy: { completedAt: 'desc' },
      take: 50,
      select: {
        id: true,
        level: true,
        coinsEarned: true,
        accuracy: true,
        completedAt: true,
      },
    });
  }
}
