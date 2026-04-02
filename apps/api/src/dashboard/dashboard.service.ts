import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getDashboard(childId: string) {
    const child = await this.prisma.child.findUnique({
      where: { id: childId },
      select: { id: true, coins: true, currentLevel: true },
    });
    if (!child) throw new NotFoundException('Child not found');

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const sessions = await this.prisma.session.findMany({
      where: { childId, completedAt: { gte: thirtyDaysAgo } },
      include: { attempts: { include: { exercise: true } } },
      orderBy: { completedAt: 'asc' },
    });

    // Daily progress (last 30 days)
    const dailyMap = new Map<string, { correct: number; total: number }>();
    for (const session of sessions) {
      const date = session.completedAt.toISOString().split('T')[0];
      const entry = dailyMap.get(date) ?? { correct: 0, total: 0 };
      for (const attempt of session.attempts) {
        entry.total++;
        if (attempt.correct) entry.correct++;
      }
      dailyMap.set(date, entry);
    }
    const dailyProgress = Array.from(dailyMap.entries()).map(([date, v]) => ({
      date,
      correctAnswers: v.correct,
      totalAnswers: v.total,
    }));

    // Error rate by exercise type
    const typeMap = new Map<string, { errors: number; total: number }>();
    for (const session of sessions) {
      for (const attempt of session.attempts) {
        const type = attempt.exercise.type;
        const entry = typeMap.get(type) ?? { errors: 0, total: 0 };
        entry.total++;
        if (!attempt.correct) entry.errors++;
        typeMap.set(type, entry);
      }
    }
    const topicErrorRates = Array.from(typeMap.entries()).map(([type, v]) => ({
      type,
      errorRate: v.total > 0 ? v.errors / v.total : 0,
    }));

    // Weak areas: topics with error rate > 40%
    const weakAreas = topicErrorRates
      .filter((t) => t.errorRate > 0.4)
      .map((t) => t.type);

    // Weekly minutes (rough: 2 min per session)
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const weekSessions = sessions.filter((s) => s.completedAt >= oneWeekAgo);
    const weeklyMinutes = weekSessions.length * 2;

    return {
      childId,
      totalCoins: child.coins,
      currentLevel: child.currentLevel,
      weeklyMinutes,
      weakAreas,
      dailyProgress,
      topicErrorRates,
    };
  }
}
