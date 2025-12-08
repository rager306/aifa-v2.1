import { test, expect } from '@playwright/test';

test.describe('No-JS Scenarios (SEO Pages)', () => {
  test.use({ javaScriptEnabled: false });

  test('should render static home page without JavaScript', async ({ page }) => {
    await page.goto('/');

    // Static content should be visible
    const main = page.locator('main');
    await expect(main).toBeVisible();
    await expect(main).toContainText(/AIFA|Home/i);

    // No-JS banner should be visible
    const noscriptBanner = page.locator('text=JavaScript is disabled');
    await expect(noscriptBanner).toBeVisible();
  });

  test('should render about page without JavaScript', async ({ page }) => {
    await page.goto('/about-aifa');

    const main = page.locator('main');
    await expect(main).toBeVisible();
    await expect(main).toContainText(/About/i);

    // Links should work (server-side navigation)
    await page.click('a[href="/"]');
    await expect(page).toHaveURL('/');
  });

  test('should render features pages without JavaScript', async ({ page }) => {
    await page.goto('/features');

    const main = page.locator('main');
    await expect(main).toBeVisible();
    await expect(main).toContainText(/Features/i);
  });

  test('should have accessible navigation without JavaScript', async ({ page }) => {
    await page.goto('/');

    // Navigation links should be present
    const nav = page.locator('nav');
    await expect(nav).toBeVisible();

    // Links should be clickable
    const aboutLink = page.locator('a[href="/about-aifa"]');
    await expect(aboutLink).toBeVisible();
  });

  test('should have proper SEO metadata without JavaScript', async ({ page }) => {
    await page.goto('/');

    // Check meta tags
    await expect(page).toHaveTitle(/AIFA/i);
    const metaDescription = page.locator('meta[name="description"]');
    await expect(metaDescription).toHaveAttribute('content', /.+/);

    // Check JSON-LD schema
    const jsonLd = page.locator('script[type="application/ld+json"]');
    await expect(jsonLd).toHaveCount(2); // WebSite + Organization schemas
  });
});
