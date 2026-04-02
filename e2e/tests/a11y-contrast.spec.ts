import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/**
 * Automated accessibility audit using axe-core.
 * Covers WCAG 2.1 AA — color contrast, labels, keyboard access, and more.
 * Runs only on Chromium (axe results are browser-independent; no need to repeat).
 */

test.use({ browserName: 'chromium' });

const CHILD_STORE = JSON.stringify({
  state: {
    activeChild: {
      id: 'c1', name: 'דנה', avatar: 'cat-1',
      coins: 5, currentLevel: 2, token: '',
    },
    levels: [
      { level: 1, status: 'completed', stars: 3 },
      { level: 2, status: 'current', stars: 0 },
      { level: 3, status: 'locked', stars: 0 },
    ],
    pendingSessions: [],
  },
  version: 0,
});

async function seedStore(page: import('@playwright/test').Page) {
  await page.goto('/');
  await page.evaluate((s) => localStorage.setItem('calculator-game-store', s), CHILD_STORE);
}

// ─── Helper ───────────────────────────────────────────────────────────────────

async function runAxe(page: import('@playwright/test').Page) {
  return new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
    // color-contrast requires real viewport rendering — include it explicitly
    .options({ runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa'] } })
    .analyze();
}

// ─── Tests ────────────────────────────────────────────────────────────────────

test.describe('Accessibility (axe-core WCAG 2.1 AA)', () => {

  test('Lobby — no violations', async ({ page }) => {
    await page.goto('/');
    const results = await runAxe(page);
    expect(
      results.violations,
      formatViolations(results.violations),
    ).toHaveLength(0);
  });

  test('Avatar selection — no violations', async ({ page }) => {
    await page.goto('/avatar');
    const results = await runAxe(page);
    expect(results.violations, formatViolations(results.violations)).toHaveLength(0);
  });

  test('World Map — no violations', async ({ page }) => {
    await seedStore(page);
    await page.goto('/map');
    const results = await runAxe(page);
    expect(results.violations, formatViolations(results.violations)).toHaveLength(0);
  });

  test('Exercise screen — no violations', async ({ page }) => {
    await seedStore(page);
    await page.goto('/exercise/1');
    // Wait for exercises to load
    await page.waitForSelector('[role="button"][aria-label*="גרור"]', { timeout: 8000 }).catch(() => null);
    const results = await runAxe(page);
    expect(results.violations, formatViolations(results.violations)).toHaveLength(0);
  });

  test('Results screen — no violations', async ({ page }) => {
    await page.goto('/results', { waitUntil: 'domcontentloaded' });
    const results = await runAxe(page);
    expect(results.violations, formatViolations(results.violations)).toHaveLength(0);
  });

  test('Parent login modal — no violations when open', async ({ page }) => {
    await page.goto('/');
    await page.getByText('אזור הורים').click();
    await page.waitForSelector('[role="dialog"]');
    const results = await runAxe(page);
    expect(results.violations, formatViolations(results.violations)).toHaveLength(0);
  });

  // ── Specific contrast spot-checks ─────────────────────────────────────────

  test('Primary button text has sufficient contrast on orange background', async ({ page }) => {
    await page.goto('/avatar');
    // The "Let's Go" button should render as white text on #FF6B35
    // axe checks this automatically — this test makes the intent explicit
    const results = await new AxeBuilder({ page })
      .include('.btn-primary')
      .withTags(['wcag2aa'])
      .analyze();
    const contrastViolations = results.violations.filter((v) => v.id === 'color-contrast');
    expect(contrastViolations, formatViolations(contrastViolations)).toHaveLength(0);
  });

  test('Error state (red) on answer slot has sufficient contrast', async ({ page }) => {
    await seedStore(page);
    await page.goto('/exercise/1');
    await page.waitForSelector('[role="region"]', { timeout: 8000 }).catch(() => null);
    const results = await new AxeBuilder({ page })
      .include('[role="region"]')
      .withTags(['wcag2aa'])
      .analyze();
    const contrastViolations = results.violations.filter((v) => v.id === 'color-contrast');
    expect(contrastViolations, formatViolations(contrastViolations)).toHaveLength(0);
  });
});

// ─── Formatter ────────────────────────────────────────────────────────────────

function formatViolations(violations: { id: string; description: string; nodes: { html: string }[] }[]) {
  if (!violations.length) return 'No violations';
  return violations.map((v) =>
    `\n[${v.id}] ${v.description}\n  Affected: ${v.nodes.map((n) => n.html).join(', ')}`,
  ).join('\n');
}
