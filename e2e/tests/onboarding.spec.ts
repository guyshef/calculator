import { test, expect } from '@playwright/test';

/**
 * Journey 1: First-time child onboarding
 * Lobby → Avatar creation → World Map → Exercise → Results
 */
test.describe('Child onboarding flow', () => {
  test('lobby renders in RTL with add-child button', async ({ page }) => {
    await page.goto('/');
    // HTML direction must be RTL
    const dir = await page.locator('html').getAttribute('dir');
    expect(dir).toBe('rtl');
    // Add-child card is visible
    await expect(page.getByText('+ הוסף ילד')).toBeVisible();
  });

  test('avatar screen: cannot start without selecting avatar and name', async ({ page }) => {
    await page.goto('/avatar');
    const startBtn = page.getByText('בואו נתחיל! ▶');
    await expect(startBtn).toBeDisabled();
  });

  test('avatar screen: enabling start button after selecting avatar and typing name', async ({ page }) => {
    await page.goto('/avatar');
    // Pick first avatar
    await page.locator('button').first().click();
    // Type name
    await page.getByPlaceholder('מה שמך?').fill('דנה');
    await expect(page.getByText('בואו נתחיל! ▶')).toBeEnabled();
  });

  test('navigates from avatar to map after clicking start', async ({ page }) => {
    await page.goto('/avatar');
    await page.locator('button').first().click();
    await page.getByPlaceholder('מה שמך?').fill('דנה');
    await page.getByText('בואו נתחיל! ▶').click();
    await expect(page).toHaveURL(/\/map/);
  });
});
