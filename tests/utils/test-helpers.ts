
import { Page, expect } from '@playwright/test';

export class DashboardHelper {
  constructor(private page: Page) {}

  async navigateToTab(tabName: 'Settings' | 'Analytics' | 'Documents') {
    await this.page.click(`text=${tabName}`);
  }

  async startInterview() {
    await this.page.click('text=Start Interview');
    await expect(this.page.locator('text=Live Session')).toBeVisible();
  }

  async endInterview() {
    await this.page.click('text=End Session');
    await expect(this.page.locator('text=Start Interview')).toBeVisible();
  }

  async toggleRecording() {
    const muteButton = this.page.locator('text=Mute');
    const unmuteButton = this.page.locator('text=Unmute');
    
    if (await muteButton.isVisible()) {
      await muteButton.click();
    } else if (await unmuteButton.isVisible()) {
      await unmuteButton.click();
    }
  }

  async waitForSessionToStart() {
    await expect(this.page.locator('text=Live Performance Metrics')).toBeVisible();
  }
}

export class ExtensionHelper {
  static async loadExtension(context: any, extensionPath: string = './dist') {
    // Helper for loading extension in tests
    return context;
  }

  static async checkWidgetInjection(page: Page, shouldBeVisible: boolean = true) {
    const widget = page.locator('#candidai-widget');
    if (shouldBeVisible) {
      await expect(widget).toBeVisible();
    } else {
      await expect(widget).not.toBeVisible();
    }
  }
}
