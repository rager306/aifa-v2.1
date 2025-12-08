import { test, expect } from '@playwright/test';

test.describe('Setup Verification', () => {
  test('should verify Playwright is properly configured', async ({ page }) => {
    await page.goto('/');

    // Verify page loads
    await expect(page).toHaveTitle(/AIFA/i);

    // Verify basic structure
    const main = page.getByTestId('main-content');
    await expect(main).toBeVisible();

    // Verify at least one navigation link exists
    const navLinks = page.locator('nav a');
    await expect(navLinks).toHaveCountGreaterThan(0);
  });

  test('should verify dev server is running', async ({ page }) => {
    // This test verifies the dev server configuration
    await page.goto('/');
    // Use flexible URL check to avoid fragility with redirects
    await expect(page).toHaveURL(/localhost:3000.*/);
  });
});

