import { test, expect } from '@playwright/test';
import { LeadFormModal, ChatModal, ParallelRoutes } from './fixtures';

test.describe('Example Tests with Page Object Model', () => {
  test('should open and submit lead form using POM', async ({ page }) => {
    const leadForm = new LeadFormModal(page);

    await leadForm.open();
    await leadForm.fillForm({
      name: 'John Doe',
      phone: '+1234567890',
      email: 'john@example.com',
    });
    await leadForm.submit();
    await leadForm.waitForSuccess();

    // Verify success
    await expect(page.locator('text=Lead Form Submitted')).toBeVisible();
  });

  test('should handle chat modal using POM', async ({ page }) => {
    const chatModal = new ChatModal(page);

    await chatModal.open();
    // Interact with chat if needed
    await chatModal.close();

    // Verify drawer is closed
    const drawer = page.locator('[class*="translate-x-0"]');
    await expect(drawer).toBeHidden();
  });

  test('should check parallel routes using POM', async ({ page }) => {
    const routes = new ParallelRoutes(page);

    await page.goto('/');

    // Check left slot visibility
    const leftSlot = await routes.getLeftSlot();
    await expect(leftSlot).toBeVisible();

    // Check right static slot
    const rightStaticSlot = await routes.getRightStaticSlot();
    await expect(rightStaticSlot).toBeVisible();
  });
});
