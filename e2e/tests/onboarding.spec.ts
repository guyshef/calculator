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
    // Add-child card is visible — the button renders the i18n key lobby.addChild = "+ הוסף ילד"
    await expect(page.getByText('+ הוסף ילד')).toBeVisible();
  });

  test('lobby shows "אזור הורים" button even without parent logged in', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('button', { name: /אזור הורים/i })).toBeVisible();
  });

  test('lobby shows no child cards (only add-child button) when no child is active', async ({ page }) => {
    await page.goto('/');
    // Clear any persisted state to guarantee no active child
    await page.evaluate(() => localStorage.removeItem('calculator-game-store'));
    await page.reload();

    // The add-child button should be present
    await expect(page.getByText('+ הוסף ילד')).toBeVisible();

    // There should be no child-name text rendered in the card grid
    // (child cards only appear when parent is logged in and children are fetched)
    // Verify the greeting "שלום" from PIN modal is absent — no child card was clicked
    await expect(page.getByText(/שלום,/)).not.toBeVisible();
  });

  test('avatar screen: cannot start without selecting avatar and name', async ({ page }) => {
    await page.goto('/avatar');
    const startBtn = page.getByText('בואו נתחיל! ▶');
    await expect(startBtn).toBeDisabled();
  });

  test('avatar screen: enabling start button after selecting avatar and typing name', async ({ page }) => {
    await page.goto('/avatar');
    // Click the first avatar card by its label (not the back-arrow button which is first)
    await page.getByRole('button', { name: 'חתול כחול' }).click();
    await page.getByPlaceholder('מה שמך?').fill('דנה');
    await expect(page.getByText('בואו נתחיל! ▶')).toBeEnabled();
  });

  test('navigates from avatar to map after clicking start', async ({ page }) => {
    await page.goto('/avatar');
    await page.getByRole('button', { name: 'חתול כחול' }).click();
    await page.getByPlaceholder('מה שמך?').fill('דנה');
    await page.getByText('בואו נתחיל! ▶').click();
    await expect(page).toHaveURL(/\/map/);
  });
});
