/**
 * Page Object Models for E2E Tests
 */

import { Page, Locator } from '@playwright/test';

export class LeadFormModal {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async open() {
    await this.page.goto('/');
    await this.page.click('button:has-text("Get Started")').catch(() => {
      return this.page.click('a[href*="lead-form"]');
    });
  }

  async fillForm(data: { name: string; phone: string; email: string }) {
    await this.page.fill('#name', data.name);
    await this.page.fill('#phone', data.phone);
    await this.page.fill('#email', data.email);
  }

  async submit() {
    await this.page.click('button[type="submit"]');
  }

  async waitForSuccess() {
    await this.page.waitForSelector('text=Lead Form Submitted', { timeout: 5000 });
  }

  async close() {
    await this.page.keyboard.press('Escape');
  }
}

export class ChatModal {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async open() {
    await this.page.goto('/');
    await this.page.click('button:has-text("Chat")').catch(() => {
      return this.page.click('a[href*="chat"]');
    });
  }

  async close() {
    await this.page.click('button:has-text("Close chat")').catch(() => {
      return this.page.keyboard.press('Escape');
    });
  }
}

export class ParallelRoutes {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async getLeftSlot(): Promise<Locator> {
    return this.page.getByTestId('left-slot');
  }

  async getRightStaticSlot(): Promise<Locator> {
    return this.page.getByTestId('main-content');
  }

  async getRightDynamicSlot(): Promise<Locator> {
    return this.page.getByTestId('rightDynamic-slot');
  }
}
