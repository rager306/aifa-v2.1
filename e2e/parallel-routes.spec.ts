import { test, expect } from '@playwright/test';

test.describe('Parallel Routes Architecture', () => {
  test('should render all three parallel slots simultaneously', async ({ page }) => {
    await page.goto('/');

    // @left slot: Chat interface (hidden on mobile, visible on desktop)
    const leftSlot = page.locator('[class*="md:flex"][class*="lg:w-[50%]"]');
    await expect(leftSlot).toBeVisible({ timeout: 10000 });

    // @rightStatic slot: Static content in <main>
    const rightStaticSlot = page.locator('main');
    await expect(rightStaticSlot).toBeVisible();
    await expect(rightStaticSlot).toContainText(/AIFA|Home|About/i);

    // @rightDynamic slot: Should be hidden initially (not authenticated)
    // Will be tested in authentication flow
  });

  test('should navigate between pages while maintaining parallel slots', async ({ page }) => {
    await page.goto('/');

    // Navigate to /about-aifa
    await page.click('a[href="/about-aifa"]');
    await expect(page).toHaveURL('/about-aifa');

    // @left slot should still be visible
    const leftSlot = page.locator('[class*="md:flex"]');
    await expect(leftSlot).toBeVisible();

    // @rightStatic should show new content
    const rightStaticSlot = page.locator('main');
    await expect(rightStaticSlot).toContainText(/About/i);
  });

  test('should handle responsive layout (mobile vs desktop)', async ({ page, isMobile }) => {
    await page.goto('/');

    const leftSlot = page.locator('[class*="md:flex"]');

    if (isMobile) {
      // @left slot hidden on mobile
      await expect(leftSlot).toBeHidden();
    } else {
      // @left slot visible on desktop
      await expect(leftSlot).toBeVisible();
    }

    // @rightStatic always visible
    const rightStaticSlot = page.locator('main');
    await expect(rightStaticSlot).toBeVisible();
  });

  test('should render chat in @left slot', async ({ page, isMobile }) => {
    if (isMobile) {
      test.skip('Chat not visible on mobile without modal');
    }

    await page.goto('/chat');

    // Chat interface should be in @left slot
    const leftSlot = page.locator('[class*="md:flex"]');
    await expect(leftSlot).toBeVisible();

    // Should contain chat-related elements
    // Adjust selectors based on actual ChatExample component
    await expect(leftSlot).toContainText(/Chat|Message|Send/i);
  });
});
