import { test, expect } from '@playwright/test';

/**
 * Auth flow: parent login modal, child PIN modal, and unauthenticated guard.
 * Tests that hit the real API use test.setTimeout(15000).
 */

test.describe('Parent login modal', () => {
  // Run serially to avoid parallel workers both hitting the auth throttle (5–10 req/min)
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('lobby shows "אזור הורים" button', async ({ page }) => {
    await expect(page.getByRole('button', { name: /אזור הורים/i })).toBeVisible();
  });

  test('clicking "אזור הורים" opens modal with role="dialog"', async ({ page }) => {
    await page.getByRole('button', { name: /אזור הורים/i }).click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
  });

  test('parent login modal closes on backdrop click', async ({ page }) => {
    await page.getByRole('button', { name: /אזור הורים/i }).click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();

    // Click the backdrop (the dialog overlay itself, outside the inner panel)
    await page.mouse.click(10, 10);
    await expect(dialog).not.toBeVisible();
  });

  test('wrong parent credentials show error message', async ({ page }) => {
    test.setTimeout(15000);

    await page.getByRole('button', { name: /אזור הורים/i }).click();
    await page.getByPlaceholder('אימייל').fill('wrong@example.com');
    await page.getByPlaceholder('סיסמה').fill('wrongpassword');
    await page.getByRole('button', { name: /כניסה/i }).click();

    await expect(page.getByText('אימייל או סיסמה שגויים')).toBeVisible();
  });

  test('correct parent credentials navigate to /parent', async ({ page }) => {
    test.setTimeout(15000);

    await page.getByRole('button', { name: /אזור הורים/i }).click();
    await page.getByPlaceholder('אימייל').fill('test@test.com');
    await page.getByPlaceholder('סיסמה').fill('password123');
    await page.getByRole('button', { name: /כניסה/i }).click();

    await expect(page).toHaveURL(/\/parent/, { timeout: 10000 });
  });
});

test.describe('Child selection and PIN flow', () => {
  // Mock auth endpoints to avoid hitting the throttle limit (5–10 req/min)
  // during parallel test runs. We're testing UI behaviour, not the real API.
  test.beforeEach(async ({ page }) => {
    await page.route('**/auth/parent/login', (route) =>
      route.fulfill({
        status: 201, contentType: 'application/json',
        body: JSON.stringify({ accessToken: 'mock-parent-token', expiresIn: 604800 }),
      }),
    );
    await page.route('**/auth/children', (route) =>
      route.fulfill({
        status: 200, contentType: 'application/json',
        body: JSON.stringify([{ id: 'mock-child-id', name: 'דני', avatar: 'cat-1', coins: 0, currentLevel: 1 }]),
      }),
    );
    await page.route('**/auth/child/login', async (route) => {
      const body = JSON.parse(route.request().postData() || '{}');
      if (body.pin === '1234') {
        route.fulfill({ status: 201, contentType: 'application/json',
          body: JSON.stringify({ accessToken: 'mock-child-token', expiresIn: 604800 }) });
      } else {
        route.fulfill({ status: 401, contentType: 'application/json',
          body: JSON.stringify({ message: 'Invalid PIN', statusCode: 401 }) });
      }
    });
    // Mock dashboard so the /parent screen doesn't throw while we navigate back
    await page.route('**/dashboard/**', (route) =>
      route.fulfill({
        status: 200, contentType: 'application/json',
        body: JSON.stringify({
          totalCoins: 0, currentLevel: 1, weeklyMinutes: 0,
          dailyProgress: [], topicErrorRates: [], weakAreas: [],
        }),
      }),
    );

    await page.goto('/');
    await page.getByRole('button', { name: /אזור הורים/i }).click();
    await page.getByPlaceholder('אימייל').fill('test@test.com');
    await page.getByPlaceholder('סיסמה').fill('password123');
    await page.getByRole('button', { name: /כניסה/i }).click();

    // After login the app navigates('/parent') — wait for that client-side navigation
    await page.waitForURL(/\/parent/, { timeout: 5000 });

    // Go back using browser history (client-side — no full reload, parentToken stays in memory)
    await page.goBack();
    // Confirm we're on the lobby
    await expect(page.getByRole('button', { name: /אזור הורים/i })).toBeVisible({ timeout: 5000 });
  });

  test('lobby shows child card with name "דני" after parent login', async ({ page }) => {
    await expect(page.locator('button', { hasText: 'דני' })).toBeVisible();
  });

  test('clicking child card shows PIN modal with password input', async ({ page }) => {
    await page.locator('button', { hasText: 'דני' }).click();

    // The PIN modal should appear with a password-type input
    const pinInput = page.locator('input[type="password"][inputmode="numeric"]');
    await expect(pinInput).toBeVisible();
  });

  test('wrong PIN "0000" shows error "קוד PIN שגוי"', async ({ page }) => {
    await page.locator('button', { hasText: 'דני' }).click();

    const pinInput = page.locator('input[type="password"][inputmode="numeric"]');
    await expect(pinInput).toBeVisible({ timeout: 3000 });
    await pinInput.fill('0000');
    await page.getByRole('button', { name: /כניסה/i }).last().click();

    await expect(page.getByText(/קוד PIN שגוי/)).toBeVisible();
  });

  test('correct PIN "1234" navigates to /map', async ({ page }) => {
    await page.locator('button', { hasText: 'דני' }).click();

    const pinInput = page.locator('input[type="password"][inputmode="numeric"]');
    await expect(pinInput).toBeVisible({ timeout: 3000 });
    await pinInput.fill('1234');
    await page.getByRole('button', { name: /כניסה/i }).last().click();

    await expect(page).toHaveURL(/\/map/, { timeout: 10000 });
  });
});

test.describe('Unauthenticated navigation guard', () => {
  test('direct navigation to /exercise/1 without token shows error screen — not infinite loading', async ({ page }) => {
    // Seed state with empty token so the API call returns 401
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('calculator-game-store', JSON.stringify({
        state: {
          activeChild: {
            id: 'unauth-child', name: 'ילד', avatar: 'cat-1',
            coins: 0, currentLevel: 1, token: '',
          },
          levels: [{ level: 1, status: 'current', stars: 0 }],
          pendingSessions: [],
        },
        version: 0,
      }));
    });

    await page.goto('/exercise/1');

    // Should show the error screen, NOT "טוען תרגילים..." forever
    await expect(page.getByText('שגיאה בטעינת תרגילים')).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('button', { name: /חזרה לדף הבית/i })).toBeVisible();
  });
});
