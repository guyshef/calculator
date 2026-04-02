// ─── Enums ────────────────────────────────────────────────────────────────────

export enum AvatarType {
  CAT_1 = 'cat-1',
  CAT_2 = 'cat-2',
  HERO_1 = 'hero-1',
  HERO_2 = 'hero-2',
}

export enum ExerciseType {
  ADDITION = 'addition',
  SUBTRACTION = 'subtraction',
}

export enum DifficultyLevel {
  LEVEL_1 = 1,
  LEVEL_2 = 2,
  LEVEL_3 = 3,
  LEVEL_4 = 4,
  LEVEL_5 = 5,
}

// ─── Auth DTOs ────────────────────────────────────────────────────────────────

export interface ChildLoginDto {
  childId: string;
  pin: string;
}

export interface ParentLoginDto {
  email: string;
  password: string;
}

export interface AuthTokenResponse {
  accessToken: string;
  expiresIn: number;
}

// ─── Child / Parent ───────────────────────────────────────────────────────────

export interface ChildProfile {
  id: string;
  name: string;
  avatar: AvatarType;
  coins: number;
  currentLevel: number;
  parentId: string;
  createdAt: string;
}

export interface ParentProfile {
  id: string;
  email: string;
  children: ChildProfile[];
}

export interface CreateChildDto {
  name: string;
  avatar: AvatarType;
  pin: string;
}

// ─── Exercises ────────────────────────────────────────────────────────────────

export interface Exercise {
  id: string;
  level: number;
  type: ExerciseType;
  operandA: number;
  operandB: number;
  answer: number;
  /** Shuffled answer options including the correct one */
  options: number[];
  narrationKey: string;
}

export interface ExerciseSet {
  level: number;
  exercises: Exercise[];
}

// ─── Progress ─────────────────────────────────────────────────────────────────

export interface ExerciseAttempt {
  exerciseId: string;
  correct: boolean;
  answeredAt: string;
}

export interface SaveProgressDto {
  childId: string;
  level: number;
  attempts: ExerciseAttempt[];
  coinsEarned: number;
  completedAt: string;
}

export interface SessionRecord {
  id: string;
  childId: string;
  level: number;
  coinsEarned: number;
  accuracy: number;
  completedAt: string;
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export interface DailyProgress {
  date: string;
  correctAnswers: number;
  totalAnswers: number;
}

export interface TopicErrorRate {
  type: ExerciseType;
  errorRate: number;
}

export interface DashboardData {
  childId: string;
  totalCoins: number;
  currentLevel: number;
  weeklyMinutes: number;
  weakAreas: ExerciseType[];
  dailyProgress: DailyProgress[];
  topicErrorRates: TopicErrorRate[];
}

// ─── Map / Level State ────────────────────────────────────────────────────────

export type LevelStatus = 'completed' | 'current' | 'locked';

export interface LevelNode {
  level: number;
  status: LevelStatus;
  stars: 0 | 1 | 2 | 3;
}
