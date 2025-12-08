import { test, expect } from '@playwright/test';

test.describe('Parallel Routes Architecture', () => {
  test('should render all three parallel slots simultaneously', async ({ page, isMobile }) => {
    await page.goto('/');

    // @rightStatic slot: Static content in <main>
    const rightStaticSlot = page.getByTestId('main-content');
    await expect(rightStaticSlot).toBeVisible();
    await expect(rightStaticSlot).toContainText(/AIFA|Home|About/i);

    // @left slot: Chat interface - check visibility based on mobile context
    if (!isMobile) {
      // On desktop, @left slot should be visible
      const leftSlot = page.getByTestId('left-slot');
      await expect(leftSlot).toBeVisible({ timeout: 10000 });
    }
    // On mobile, @left slot is hidden (tested in responsive layout test)

    // @rightDynamic slot: Should be hidden initially (not authenticated)
    // Will be tested in authentication flow
  });

  test('should navigate between pages while maintaining parallel slots', async ({ page }) => {
    await page.goto('/');

    // Navigate to /about-aifa
    await page.click('a[href="/about-aifa"]');
    await expect(page).toHaveURL('/about-aifa');

    // @left slot should still be visible (desktop only)
    const leftSlot = page.getByTestId('left-slot');
    await expect(leftSlot).toBeVisible();

    // @rightStatic should show new content
    const rightStaticSlot = page.getByTestId('main-content');
    await expect(rightStaticSlot).toContainText(/About/i);
  });

  test('should handle responsive layout (mobile vs desktop)', async ({ page, isMobile }) => {
    await page.goto('/');

    const leftSlot = page.getByTestId('left-slot');

    if (isMobile) {
      // @left slot hidden on mobile
      await expect(leftSlot).toBeHidden();
    } else {
      // @left slot visible on desktop
      await expect(leftSlot).toBeVisible();
    }

    // @rightStatic always visible
    const rightStaticSlot = page.getByTestId('main-content');
    await expect(rightStaticSlot).toBeVisible();
  });

  test.skip(({ isMobile }) => isMobile, 'Chat not visible on mobile without modal', async ({ page }) => {
    await page.goto('/chat');

    // Chat interface should be in @left slot
    const leftSlot = page.getByTestId('left-slot');
    await expect(leftSlot).toBeVisible();

    // Should contain chat-related elements
    // Adjust selectors based on actual ChatExample component
    await expect(leftSlot).toContainText(/Chat|Message|Send/i);
  });
});
