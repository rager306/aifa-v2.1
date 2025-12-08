import { Page } from '@playwright/test';

export class LeadFormModal {
  constructor(private page: Page) {}

  async open() {
    await this.page.click('a[href="/interception_modal/lead-form"]');
    await this.page.waitForSelector('[class*="backdrop-blur"]', { state: 'visible' });
  }

  async fillForm(data: { name: string; phone: string; email: string }) {
    await this.page.fill('#name', data.name);
    await this.page.fill('#phone', data.phone);
    await this.page.fill('#email', data.email);
  }

  async submit() {
    await this.page.click('button[type="submit"]');
  }

  async close() {
    await this.page.keyboard.press('Escape');
  }

  async waitForSuccess() {
    await this.page.waitForSelector('text=Lead Form Submitted', { state: 'visible' });
  }
}

export class ChatModal {
  constructor(private page: Page) {}

  async open() {
    await this.page.click('a[href="/chat"]');
    await this.page.waitForSelector('[class*="translate-x-0"]', { state: 'visible' });
  }

  async close() {
    await this.page.click('button:has-text("Close chat")');
  }
}

export class ParallelRoutes {
  constructor(private page: Page) {}

  async getLeftSlot() {
    return this.page.locator('[class*="md:flex"][class*="lg:w-[50%]"]');
  }

  async getRightStaticSlot() {
    return this.page.locator('main');
  }

  async getRightDynamicSlot() {
    return this.page.locator('[class*="absolute"][class*="inset-0"]');
  }
}
