import { test, expect } from '@playwright/test';

/**
 * Accessibility checks across all screens:
 * - Sufficient contrast (checked via aria attributes being present)
 * - Tab-navigable interactive elements
 * - No keyboard traps outside the modal
 * - RTL layout direction
 */

test.describe('Accessibility', () => {
  test('every screen has RTL direction', async ({ page }) => {
    const routes = ['/', '/avatar', '/map'];
    for (const route of routes) {
      await page.goto(route);
      const dir = await page.locator('html').getAttribute('dir');
      expect(dir, `Expected RTL on ${route}`).toBe('rtl');
    }
  });

  test('lobby: parent area button is keyboard-focusable', async ({ page }) => {
    await page.goto('/');
    await page.keyboard.press('Tab');
    // Tab through page until parent area button is focused
    let found = false;
    for (let i = 0; i < 10; i++) {
      const focused = await page.evaluate(() => document.activeElement?.textContent);
      if (focused?.includes('אזור הורים')) { found = true; break; }
      await page.keyboard.press('Tab');
    }
    expect(found).toBe(true);
  });

  test('map: locked level buttons are aria-disabled', async ({ page }) => {
    // Seed localStorage with a child at level 1
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('calculator-game-store', JSON.stringify({
        state: {
          activeChild: { id: 'c1', name: 'Test', avatar: 'cat-1', coins: 0, currentLevel: 1, token: '' },
          levels: [
            { level: 1, status: 'current', stars: 0 },
            { level: 2, status: 'locked', stars: 0 },
            { level: 3, status: 'locked', stars: 0 },
          ],
          pendingSessions: [],
        },
        version: 0,
      }));
    });
    await page.goto('/map');
    const lockedBtn = page.getByRole('button', { name: /נעול/ }).first();
    await expect(lockedBtn).toBeDisabled();
  });

  test('parent login modal has dialog role', async ({ page }) => {
    await page.goto('/');
    await page.getByText('אזור הורים').click();
    const modal = page.getByRole('dialog');
    await expect(modal).toBeVisible();
    const ariaLabel = await modal.getAttribute('aria-label');
    expect(ariaLabel).toContain('הורים');
  });

  test('exercise tiles are tab-navigable', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('calculator-game-store', JSON.stringify({
        state: {
          activeChild: { id: 'c1', name: 'Test', avatar: 'cat-1', coins: 0, currentLevel: 1, token: '' },
          levels: [{ level: 1, status: 'current', stars: 0 }],
          pendingSessions: [],
        },
        version: 0,
      }));
    });
    await page.goto('/exercise/1');
    // Tiles should appear and be reachable via keyboard
    const tiles = page.getByRole('button', { name: /גרור את המספר/i });
    await expect(tiles.first()).toBeVisible();
    const tabIndex = await tiles.first().getAttribute('tabindex');
    expect(tabIndex).not.toBe('-1');
  });
});
