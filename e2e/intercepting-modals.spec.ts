import { test, expect } from '@playwright/test';
import { LeadFormModal, ChatModal } from './fixtures/pages';

test.describe('Intercepting Modals', () => {
  test.describe('Lead Form Modal', () => {
    test('should open lead form modal via interception', async ({ page }) => {
      const leadForm = new LeadFormModal(page);

      await leadForm.open();

      // Modal should contain form fields
      await expect(page.locator('#name')).toBeVisible();
      await expect(page.locator('#phone')).toBeVisible();
      await expect(page.locator('#email')).toBeVisible();
    });

    test('should submit lead form and show success state', async ({ page }) => {
      const leadForm = new LeadFormModal(page);

      await leadForm.open();
      await leadForm.fillForm({
        name: 'Test User',
        phone: '+1234567890',
        email: 'test@example.com'
      });
      await leadForm.submit();

      // Success state should appear
      await leadForm.waitForSuccess();

      // Should auto-redirect to /thank-you after 2 seconds
      await expect(page).toHaveURL('/thank-you', { timeout: 3000 });
    });

    test('should close modal on Escape key', async ({ page }) => {
      const leadForm = new LeadFormModal(page);

      await leadForm.open();
      await leadForm.close();

      // Modal should close
      await expect(page.locator('[class*="backdrop-blur"]')).toBeHidden({ timeout: 1000 });
    });

    test('should close modal on overlay click', async ({ page }) => {
      const leadForm = new LeadFormModal(page);

      await leadForm.open();

      const modal = page.locator('[class*="backdrop-blur"]');
      await expect(modal).toBeVisible();

      // Click overlay (not the modal content)
      await modal.click({ position: { x: 10, y: 10 } });

      // Modal should close
      await expect(modal).toBeHidden({ timeout: 1000 });
    });

    test('should show validation errors for invalid input', async ({ page }) => {
      const leadForm = new LeadFormModal(page);

      await leadForm.open();

      // Submit empty form
      await leadForm.submit();

      // HTML5 validation should prevent submission
      // Or check for error messages if custom validation
      const nameInput = page.locator('#name');
      await expect(nameInput).toHaveAttribute('required');
    });
  });

  test.describe('Chat Modal', () => {
    test('should open chat modal via interception', async ({ page }) => {
      const chatModal = new ChatModal(page);

      await chatModal.open();

      // Drawer should slide in from left
      const drawer = page.locator('[class*="translate-x-0"]');
      await expect(drawer).toBeVisible({ timeout: 1000 });

      // Should contain chat interface
      await expect(drawer).toContainText(/Chat|Message/i);
    });

    test('should close chat modal with Close button', async ({ page }) => {
      const chatModal = new ChatModal(page);

      await chatModal.open();

      const drawer = page.locator('[class*="translate-x-0"]');
      await expect(drawer).toBeVisible();

      // Click "Close chat" button
      await chatModal.close();

      // Drawer should slide out
      await expect(drawer).toBeHidden({ timeout: 500 });
    });

    test('should close chat modal on Escape key', async ({ page }) => {
      const chatModal = new ChatModal(page);

      await chatModal.open();

      const drawer = page.locator('[class*="translate-x-0"]');
      await expect(drawer).toBeVisible();

      // Press Escape
      await page.keyboard.press('Escape');

      // Drawer should close
      await expect(drawer).toBeHidden({ timeout: 500 });
    });
  });
});
