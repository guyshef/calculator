import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Generates exercises for a given level.
 * Level 1: sums 1–5, Level 2: sums 1–10, etc.
 */
function generateExercises(level: number) {
  const maxNum = level * 5;
  const exercises = [];
  for (let a = 1; a <= maxNum; a++) {
    for (let b = 1; b <= maxNum - a; b++) {
      if (a + b <= maxNum) {
        exercises.push({
          level,
          type: 'addition',
          operandA: a,
          operandB: b,
          answer: a + b,
          narrationKey: `ex.addition.${a}.${b}`,
        });
      }
    }
  }
  // Return a random subset of 10 per level for seeding
  return exercises.slice(0, 10);
}

async function main() {
  console.log('Seeding exercises...');
  for (let level = 1; level <= 5; level++) {
    const exercises = generateExercises(level);
    await prisma.exercise.createMany({ data: exercises, skipDuplicates: true });
    console.log(`  Level ${level}: ${exercises.length} exercises`);
  }
  console.log('Seed complete.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
