import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('should login and show @rightDynamic overlay', async ({ page }) => {
    await page.goto('/login');

    // Fill login form (adjust selectors based on actual LoginForm component)
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');

    // Should redirect to /chat
    await expect(page).toHaveURL('/chat', { timeout: 5000 });

    // @rightDynamic overlay should appear (authenticated state)
    const rightDynamicSlot = page.locator('[class*="absolute"][class*="inset-0"]');
    await expect(rightDynamicSlot).toBeVisible();

    // Chat should be visible in @left slot
    const leftSlot = page.locator('[class*="md:flex"]');
    await expect(leftSlot).toContainText(/Chat|Message/i);
  });

  test('should logout and hide @rightDynamic overlay', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/chat');

    // Logout (adjust selector based on actual logout button)
    await page.click('button:has-text("Logout")');

    // @rightDynamic overlay should disappear
    const rightDynamicSlot = page.locator('[class*="absolute"][class*="inset-0"]');
    await expect(rightDynamicSlot).toBeHidden();

    // Should show @rightStatic content
    const rightStaticSlot = page.locator('main');
    await expect(rightStaticSlot).toBeVisible();
  });
});
