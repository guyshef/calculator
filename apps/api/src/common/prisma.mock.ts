/**
 * Reusable mock for PrismaService used across all unit tests.
 * Each model method is a jest.fn() that tests can override with mockResolvedValue / mockReturnValue.
 */
export const prismaMock = {
  parent: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
  child: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  exercise: {
    findMany: jest.fn(),
    groupBy: jest.fn(),
    createMany: jest.fn(),
  },
  session: {
    findMany: jest.fn(),
    create: jest.fn(),
  },
  attempt: {},
  $connect: jest.fn(),
  $disconnect: jest.fn(),
  $transaction: jest.fn(),
};
