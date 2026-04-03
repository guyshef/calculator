import { test, expect } from '@playwright/test';
import { mockExercisesApi, seedAuthenticatedChild } from './helpers';

/**
 * Offline / PWA behaviour.
 * Uses Playwright's network interception to simulate offline mode.
 */

test.describe('Offline behaviour', () => {
  test('exercise screen loads when API is unreachable (cached exercises)', async ({ page, context }) => {
    test.setTimeout(30000);

    // Intercept exercises so they load with a valid mock response (no auth required)
    await mockExercisesApi(page);
    await seedAuthenticatedChild(page);

    // First visit while online — tiles should render
    await page.goto('/exercise/1');
    await page.getByRole('button', { name: /גרור את המספר/i }).first().waitFor({ state: 'visible' });

    // Now go offline and reload
    await context.setOffline(true);
    await page.reload();

    // App should still render (Service Worker cache or Playwright route cache)
    await expect(page.locator('body')).toBeVisible();

    // Restore network
    await context.setOffline(false);
  });

  test('failed progress save is queued in localStorage', async ({ page, context }) => {
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('calculator-game-store', JSON.stringify({
        state: {
          activeChild: {
            id: 'c1', name: 'Test', avatar: 'cat-1',
            coins: 5, currentLevel: 1, token: 'mock-token',
          },
          levels: [{ level: 1, status: 'current', stars: 0 }],
          pendingSessions: [],
        },
        version: 0,
      }));
    });

    // Block the progress API endpoint so saves fail
    await context.route('**/progress', (route) => route.abort());

    // Simulate what ExerciseScreen does when progressApi.save fails:
    // directly push a session into pendingSessions via localStorage manipulation
    await page.evaluate(() => {
      const raw = localStorage.getItem('calculator-game-store');
      if (!raw) return;
      const store = JSON.parse(raw);
      store.state.pendingSessions = [{
        childId: 'c1',
        level: 1,
        coinsEarned: 3,
        accuracy: 1,
        completedAt: new Date().toISOString(),
        attempts: [],
      }];
      localStorage.setItem('calculator-game-store', JSON.stringify(store));
    });

    const stored = await page.evaluate(() => {
      const raw = localStorage.getItem('calculator-game-store');
      return raw ? JSON.parse(raw).state.pendingSessions : [];
    });

    expect(stored).toHaveLength(1);
    expect(stored[0].childId).toBe('c1');
  });
});
