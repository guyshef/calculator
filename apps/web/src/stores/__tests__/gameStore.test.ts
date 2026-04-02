import { describe, it, expect, beforeEach } from 'vitest';
import { act } from '@testing-library/react';
import { useGameStore } from '../gameStore';
import { AvatarType } from '@calculator/types';

const CHILD = {
  id: 'c1',
  name: 'Dana',
  avatar: AvatarType.CAT_1,
  coins: 10,
  currentLevel: 2,
  token: 'jwt-token',
};

describe('gameStore', () => {
  beforeEach(() => {
    // Reset store to initial state between tests
    useGameStore.setState({
      activeChild: null,
      parentToken: null,
      levels: [],
      pendingSessions: [],
    });
  });

  it('setActiveChild stores the child', () => {
    act(() => useGameStore.getState().setActiveChild(CHILD));
    expect(useGameStore.getState().activeChild).toEqual(CHILD);
  });

  it('addCoins increments the coin count', () => {
    act(() => {
      useGameStore.getState().setActiveChild(CHILD);
      useGameStore.getState().addCoins(5);
    });
    expect(useGameStore.getState().activeChild?.coins).toBe(15);
  });

  it('addCoins does nothing when no active child', () => {
    act(() => useGameStore.getState().addCoins(5));
    expect(useGameStore.getState().activeChild).toBeNull();
  });

  it('initLevels sets correct statuses', () => {
    act(() => {
      useGameStore.getState().setActiveChild(CHILD); // currentLevel: 2
      useGameStore.getState().initLevels(5, 2, [1]);
    });
    const levels = useGameStore.getState().levels;
    expect(levels[0].status).toBe('completed'); // level 1
    expect(levels[1].status).toBe('current');   // level 2
    expect(levels[2].status).toBe('locked');    // level 3
    expect(levels[4].status).toBe('locked');    // level 5
  });

  it('unlockNextLevel advances currentLevel and updates map', () => {
    act(() => {
      useGameStore.getState().setActiveChild(CHILD); // currentLevel: 2
      useGameStore.getState().initLevels(5, 2, [1]);
      useGameStore.getState().unlockNextLevel();
    });
    const state = useGameStore.getState();
    expect(state.activeChild?.currentLevel).toBe(3);
    expect(state.levels.find((l) => l.level === 2)?.status).toBe('completed');
    expect(state.levels.find((l) => l.level === 3)?.status).toBe('current');
  });

  it('queueSession appends to pendingSessions', () => {
    const session = {
      childId: 'c1', level: 2, coinsEarned: 3, accuracy: 0.8,
      completedAt: new Date().toISOString(),
      attempts: [{ exerciseId: 'e1', correct: true, answeredAt: new Date().toISOString() }],
    };
    act(() => useGameStore.getState().queueSession(session));
    expect(useGameStore.getState().pendingSessions).toHaveLength(1);
    expect(useGameStore.getState().pendingSessions[0]).toEqual(session);
  });

  it('clearPendingSessions empties the queue', () => {
    const session = {
      childId: 'c1', level: 1, coinsEarned: 1, accuracy: 1,
      completedAt: new Date().toISOString(), attempts: [],
    };
    act(() => {
      useGameStore.getState().queueSession(session);
      useGameStore.getState().clearPendingSessions();
    });
    expect(useGameStore.getState().pendingSessions).toHaveLength(0);
  });

  it('logout clears activeChild and parentToken', () => {
    act(() => {
      useGameStore.getState().setActiveChild(CHILD);
      useGameStore.getState().setParentToken('parent-jwt');
      useGameStore.getState().logout();
    });
    const state = useGameStore.getState();
    expect(state.activeChild).toBeNull();
    expect(state.parentToken).toBeNull();
  });
});
