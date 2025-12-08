import { test, expect } from '@playwright/test';

test.describe('Intercepting Modals', () => {
  test.describe('Lead Form Modal', () => {
    test('should open lead form modal via interception', async ({ page }) => {
      await page.goto('/');

      // Click link that triggers modal interception
      // Adjust selector based on actual trigger element
      await page.click('a[href="/interception_modal/lead-form"]');

      // Modal should appear with backdrop
      const modal = page.locator('[class*="backdrop-blur"]');
      await expect(modal).toBeVisible({ timeout: 5000 });

      // Modal should contain form fields
      await expect(page.locator('#name')).toBeVisible();
      await expect(page.locator('#phone')).toBeVisible();
      await expect(page.locator('#email')).toBeVisible();
    });

    test('should submit lead form and show success state', async ({ page }) => {
      await page.goto('/');
      await page.click('a[href="/interception_modal/lead-form"]');

      // Fill form
      await page.fill('#name', 'Test User');
      await page.fill('#phone', '+1234567890');
      await page.fill('#email', 'test@example.com');

      // Submit form
      await page.click('button[type="submit"]');

      // Success state should appear
      await expect(page.locator('text=Lead Form Submitted')).toBeVisible({ timeout: 5000 });
      await expect(page.locator('[class*="CheckCircle"]')).toBeVisible();

      // Should auto-redirect to /thank-you after 2 seconds
      await expect(page).toHaveURL('/thank-you', { timeout: 3000 });
    });

    test('should close modal on Escape key', async ({ page }) => {
      await page.goto('/');
      await page.click('a[href="/interception_modal/lead-form"]');

      const modal = page.locator('[class*="backdrop-blur"]');
      await expect(modal).toBeVisible();

      // Press Escape
      await page.keyboard.press('Escape');

      // Modal should close
      await expect(modal).toBeHidden({ timeout: 1000 });
    });

    test('should close modal on overlay click', async ({ page }) => {
      await page.goto('/');
      await page.click('a[href="/interception_modal/lead-form"]');

      const modal = page.locator('[class*="backdrop-blur"]');
      await expect(modal).toBeVisible();

      // Click overlay (not the modal content)
      await modal.click({ position: { x: 10, y: 10 } });

      // Modal should close
      await expect(modal).toBeHidden({ timeout: 1000 });
    });

    test('should show validation errors for invalid input', async ({ page }) => {
      await page.goto('/');
      await page.click('a[href="/interception_modal/lead-form"]');

      // Submit empty form
      await page.click('button[type="submit"]');

      // HTML5 validation should prevent submission
      // Or check for error messages if custom validation
      const nameInput = page.locator('#name');
      await expect(nameInput).toHaveAttribute('required');
    });
  });

  test.describe('Chat Modal', () => {
    test('should open chat modal via interception', async ({ page }) => {
      await page.goto('/');

      // Click link that triggers chat modal
      await page.click('a[href="/chat"]');

      // Drawer should slide in from left
      const drawer = page.locator('[class*="translate-x-0"]');
      await expect(drawer).toBeVisible({ timeout: 1000 });

      // Should contain chat interface
      await expect(drawer).toContainText(/Chat|Message/i);
    });

    test('should close chat modal with Close button', async ({ page }) => {
      await page.goto('/');
      await page.click('a[href="/chat"]');

      const drawer = page.locator('[class*="translate-x-0"]');
      await expect(drawer).toBeVisible();

      // Click "Close chat" button
      await page.click('button:has-text("Close chat")');

      // Drawer should slide out
      await expect(drawer).toBeHidden({ timeout: 500 });
    });

    test('should close chat modal on Escape key', async ({ page }) => {
      await page.goto('/');
      await page.click('a[href="/chat"]');

      const drawer = page.locator('[class*="translate-x-0"]');
      await expect(drawer).toBeVisible();

      // Press Escape
      await page.keyboard.press('Escape');

      // Drawer should close
      await expect(drawer).toBeHidden({ timeout: 500 });
    });
  });
});
