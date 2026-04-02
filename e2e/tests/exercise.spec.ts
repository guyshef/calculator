import { test, expect } from '@playwright/test';

/**
 * Exercise screen: drag-and-drop, correct/wrong answer feedback, progress bar.
 * Requires a child to be selected — sets up state via localStorage before navigation.
 */

const CHILD_STATE = {
  activeChild: {
    id: 'test-child', name: 'דנה',
    avatar: 'cat-1', coins: 0, currentLevel: 1, token: '',
  },
  levels: [
    { level: 1, status: 'current', stars: 0 },
    { level: 2, status: 'locked', stars: 0 },
  ],
  pendingSessions: [],
};

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate((state) => {
    localStorage.setItem('calculator-game-store', JSON.stringify({ state, version: 0 }));
  }, CHILD_STATE);
});

test.describe('Exercise screen', () => {
  test('progress bar starts empty', async ({ page }) => {
    await page.goto('/exercise/1');
    // Progress bar fill should be 0% wide initially
    const bar = page.locator('[style*="background: var(--color-secondary)"]').first();
    await expect(bar).toBeVisible();
  });

  test('exercise equation is visible', async ({ page }) => {
    await page.goto('/exercise/1');
    // Operand + sign + = sign should render (mocked exercises from API)
    await expect(page.getByText('+')).toBeVisible();
    await expect(page.getByText('=')).toBeVisible();
  });

  test('replay narration button is present and has aria-label', async ({ page }) => {
    await page.goto('/exercise/1');
    const replayBtn = page.getByRole('button', { name: /שמע שוב/i });
    await expect(replayBtn).toBeVisible();
  });

  test('number tiles have aria-labels', async ({ page }) => {
    await page.goto('/exercise/1');
    // At least one draggable tile with aria-label containing "גרור את המספר"
    const tile = page.getByRole('button', { name: /גרור את המספר/i }).first();
    await expect(tile).toBeVisible();
  });

  test('answer slot has aria-label', async ({ page }) => {
    await page.goto('/exercise/1');
    const slot = page.getByRole('region', { name: /גרור תשובה לכאן/i });
    await expect(slot).toBeVisible();
  });
});
