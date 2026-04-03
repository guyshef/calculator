import { test, expect } from '@playwright/test';
import { mockExercisesApi, seedAuthenticatedChild, seedUnauthenticatedChild, MOCK_EXERCISES } from './helpers';

/**
 * Exercise screen: drag-and-drop, correct/wrong answer feedback, progress bar.
 *
 * Uses mockExercisesApi so exercise requests never need a real token,
 * and seedAuthenticatedChild to supply a valid child JWT for progress saves.
 */

test.describe('Exercise screen — rendering', () => {
  test.beforeEach(async ({ page }) => {
    test.setTimeout(20000);
    await mockExercisesApi(page);
    await seedAuthenticatedChild(page);
    await page.goto('/exercise/1');
    // Wait until at least one tile is visible to confirm exercises loaded
    await page.getByRole('button', { name: /גרור את המספר/i }).first().waitFor({ state: 'visible' });
  });

  test('exercise equation renders operands, operator and equals sign', async ({ page }) => {
    // MOCK_EXERCISES[0]: 3 + 4 =
    await expect(page.getByText(`${MOCK_EXERCISES[0].operandA}`).first()).toBeVisible();
    await expect(page.getByText('+')).toBeVisible();
    await expect(page.getByText(`${MOCK_EXERCISES[0].operandB}`).first()).toBeVisible();
    await expect(page.getByText('=')).toBeVisible();
  });

  test('number tiles are visible and have aria-labels', async ({ page }) => {
    const tile = page.getByRole('button', { name: /גרור את המספר/i }).first();
    await expect(tile).toBeVisible();
  });

  test('answer slot is visible with aria region label', async ({ page }) => {
    const slot = page.getByRole('region', { name: /גרור תשובה לכאן/i });
    await expect(slot).toBeVisible();
  });

  test('progress bar is visible', async ({ page }) => {
    // The progress bar fill element has a specific inline background style
    const bar = page.locator('[style*="background: var(--color-secondary)"]').first();
    await expect(bar).toBeVisible();
  });

  test('replay narration button is present with aria-label', async ({ page }) => {
    const replayBtn = page.getByRole('button', { name: /שמע שוב/i });
    await expect(replayBtn).toBeVisible();
  });
});

test.describe('Exercise screen — drag and drop feedback', () => {
  test.beforeEach(async ({ page }) => {
    test.setTimeout(20000);
    await mockExercisesApi(page);
    await seedAuthenticatedChild(page);
    await page.goto('/exercise/1');
    await page.getByRole('button', { name: /גרור את המספר/i }).first().waitFor({ state: 'visible' });
  });

  test('dragging correct answer tile produces success feedback (green border on slot)', async ({ page }) => {
    const correctAnswer = MOCK_EXERCISES[0].answer; // 7
    const correctTile = page.getByRole('button', { name: `גרור את המספר ${correctAnswer}` });
    const answerSlot = page.getByRole('region', { name: /גרור תשובה לכאן/i });

    await expect(correctTile).toBeVisible();
    await expect(answerSlot).toBeVisible();

    const tileBbox = await correctTile.boundingBox();
    const slotBbox = await answerSlot.boundingBox();

    if (!tileBbox || !slotBbox) throw new Error('Could not get bounding boxes for drag');

    // Perform drag
    await page.mouse.move(tileBbox.x + tileBbox.width / 2, tileBbox.y + tileBbox.height / 2);
    await page.mouse.down();
    await page.mouse.move(slotBbox.x + slotBbox.width / 2, slotBbox.y + slotBbox.height / 2, { steps: 10 });
    await page.mouse.up();

    // After correct drop the slot aria-label changes to "תשובה נכונה"
    await expect(page.getByRole('region', { name: 'תשובה נכונה' })).toBeVisible({ timeout: 3000 });
  });

  test('dragging wrong answer tile produces error feedback and clears after ~1s', async ({ page }) => {
    const correctAnswer = MOCK_EXERCISES[0].answer; // 7
    // Pick any option that is not the correct answer
    const wrongAnswer = MOCK_EXERCISES[0].options.find((o) => o !== correctAnswer)!;
    const wrongTile = page.getByRole('button', { name: `גרור את המספר ${wrongAnswer}` });
    const answerSlot = page.getByRole('region', { name: /גרור תשובה לכאן/i });

    await expect(wrongTile).toBeVisible();
    await expect(answerSlot).toBeVisible();

    const tileBbox = await wrongTile.boundingBox();
    const slotBbox = await answerSlot.boundingBox();

    if (!tileBbox || !slotBbox) throw new Error('Could not get bounding boxes for drag');

    // Perform drag
    await page.mouse.move(tileBbox.x + tileBbox.width / 2, tileBbox.y + tileBbox.height / 2);
    await page.mouse.down();
    await page.mouse.move(slotBbox.x + slotBbox.width / 2, slotBbox.y + slotBbox.height / 2, { steps: 10 });
    await page.mouse.up();

    // Slot should briefly show error state
    await expect(page.getByRole('region', { name: 'תשובה שגויה' })).toBeVisible({ timeout: 3000 });

    // After ~800 ms the slot resets back to the default drop target label
    await expect(page.getByRole('region', { name: /גרור תשובה לכאן/i })).toBeVisible({ timeout: 3000 });
  });

  test('completing all 3 mock exercises navigates to /results', async ({ page }) => {
    test.setTimeout(30000);

    // Intercept progress save — pattern must match full URL path segment
    await page.route(/\/progress$/, (route) =>
      route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({ sessionId: 'mock-session', accuracy: 1, coinsEarned: 3 }),
      }),
    );

    for (let i = 0; i < MOCK_EXERCISES.length; i++) {
      const correctAnswer = MOCK_EXERCISES[i].answer;

      // Wait for the drop slot to be ready (default label) and a correct tile to appear
      await page.getByRole('region', { name: /גרור תשובה לכאן/i }).waitFor({ state: 'visible', timeout: 5000 });
      const correctTile = page.getByRole('button', { name: `גרור את המספר ${correctAnswer}` }).first();
      await correctTile.waitFor({ state: 'visible' });

      const answerSlot = page.getByRole('region', { name: /גרור תשובה לכאן/i });
      const tileBbox = await correctTile.boundingBox();
      const slotBbox = await answerSlot.boundingBox();
      if (!tileBbox || !slotBbox) throw new Error(`Missing bounding box on exercise ${i + 1}`);

      await page.mouse.move(tileBbox.x + tileBbox.width / 2, tileBbox.y + tileBbox.height / 2);
      await page.mouse.down();
      await page.mouse.move(slotBbox.x + slotBbox.width / 2, slotBbox.y + slotBbox.height / 2, { steps: 10 });
      await page.mouse.up();

      // Confirm the drop was accepted (slot shows success state)
      await expect(page.getByRole('region', { name: 'תשובה נכונה' })).toBeVisible({ timeout: 3000 });
    }

    // finishLevel() fires after 1200 ms then navigate('/results') is called
    await expect(page).toHaveURL(/\/results/, { timeout: 10000 });
  });
});

test.describe('Exercise screen — unauthenticated state', () => {
  test('token="" → shows "שגיאה בטעינת תרגילים" error and back button', async ({ page }) => {
    await seedUnauthenticatedChild(page);
    // Do NOT mock the exercises API — the real API should return 401
    await page.goto('/exercise/1');

    await expect(page.getByText('שגיאה בטעינת תרגילים')).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('button', { name: /חזרה לדף הבית/i })).toBeVisible();
  });
});
