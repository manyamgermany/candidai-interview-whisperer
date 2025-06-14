
import { test, expect, chromium } from '@playwright/test';

test.describe('Chrome Extension Tests', () => {
  test('should inject CandidAI widget on supported platforms', async () => {
    // Launch browser with extension
    const pathToExtension = './dist';
    const context = await chromium.launchPersistentContext('', {
      headless: false,
      args: [
        `--load-extension=${pathToExtension}`,
        `--disable-extensions-except=${pathToExtension}`,
      ],
    });

    const page = await context.newPage();
    
    // Navigate to a mock Google Meet URL
    await page.goto('https://meet.google.com/abc-defg-hij');
    
    // Wait for content script to inject
    await page.waitForTimeout(3000);
    
    // Check if CandidAI widget is injected
    const widget = page.locator('#candidai-widget');
    await expect(widget).toBeVisible();
    
    // Check widget styling
    await expect(widget).toHaveCSS('position', 'fixed');
    await expect(widget).toHaveCSS('z-index', '9999');
    
    await context.close();
  });

  test('should not inject widget on unsupported platforms', async () => {
    const pathToExtension = './dist';
    const context = await chromium.launchPersistentContext('', {
      headless: false,
      args: [
        `--load-extension=${pathToExtension}`,
        `--disable-extensions-except=${pathToExtension}`,
      ],
    });

    const page = await context.newPage();
    
    // Navigate to an unsupported platform
    await page.goto('https://example.com');
    
    // Wait for potential injection
    await page.waitForTimeout(3000);
    
    // Check that widget is NOT injected
    const widget = page.locator('#candidai-widget');
    await expect(widget).not.toBeVisible();
    
    await context.close();
  });
});
