import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AvatarType, LevelNode } from '@calculator/types';

interface ChildState {
  id: string;
  name: string;
  avatar: AvatarType;
  coins: number;
  currentLevel: number;
  token: string;
}

interface GameState {
  // Active session
  activeChild: ChildState | null;
  parentToken: string | null;

  // Map state
  levels: LevelNode[];

  // Offline sync queue
  pendingSessions: Array<{
    childId: string;
    level: number;
    coinsEarned: number;
    accuracy: number;
    completedAt: string;
    attempts: Array<{ exerciseId: string; correct: boolean; answeredAt: string }>;
  }>;

  // Actions
  setActiveChild: (child: ChildState) => void;
  setParentToken: (token: string | null) => void;
  addCoins: (amount: number) => void;
  unlockNextLevel: () => void;
  initLevels: (totalLevels: number, currentLevel: number, completedLevels: number[]) => void;
  queueSession: (session: GameState['pendingSessions'][0]) => void;
  clearPendingSessions: () => void;
  logout: () => void;
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      activeChild: null,
      parentToken: null,
      levels: [],
      pendingSessions: [],

      setActiveChild: (child) => set({ activeChild: child }),
      setParentToken: (token) => set({ parentToken: token }),

      addCoins: (amount) =>
        set((s) => ({
          activeChild: s.activeChild
            ? { ...s.activeChild, coins: s.activeChild.coins + amount }
            : null,
        })),

      unlockNextLevel: () =>
        set((s) => {
          if (!s.activeChild) return s;
          const next = s.activeChild.currentLevel + 1;
          return {
            activeChild: { ...s.activeChild, currentLevel: next },
            levels: s.levels.map((l) =>
              l.level === s.activeChild!.currentLevel
                ? { ...l, status: 'completed' as const }
                : l.level === next
                  ? { ...l, status: 'current' as const }
                  : l,
            ),
          };
        }),

      initLevels: (totalLevels, currentLevel, completedLevels) => {
        const levels: LevelNode[] = Array.from({ length: totalLevels }, (_, i) => {
          const level = i + 1;
          return {
            level,
            status: completedLevels.includes(level)
              ? 'completed'
              : level === currentLevel
                ? 'current'
                : 'locked',
            stars: completedLevels.includes(level) ? 3 : 0,
          } as LevelNode;
        });
        set({ levels });
      },

      queueSession: (session) =>
        set((s) => ({ pendingSessions: [...s.pendingSessions, session] })),

      clearPendingSessions: () => set({ pendingSessions: [] }),

      logout: () => set({ activeChild: null, parentToken: null }),
    }),
    {
      name: 'calculator-game-store',
      partialize: (s) => ({
        activeChild: s.activeChild,
        levels: s.levels,
        pendingSessions: s.pendingSessions,
      }),
    },
  ),
);
