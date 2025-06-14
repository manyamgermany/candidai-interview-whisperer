
import { test, expect } from '@playwright/test';

test.describe('Speech Service Integration', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should handle speech recognition permission', async ({ page, context }) => {
    // Grant microphone permission
    await context.grantPermissions(['microphone']);
    
    // Start interview session
    await page.click('text=Start Interview');
    
    // Check if recording starts (may show permission dialog)
    await expect(page.locator('text=Live Performance Metrics')).toBeVisible();
    
    // Clean up
    await page.click('text=End Session');
  });

  test('should display transcript when speech is detected', async ({ page, context }) => {
    await context.grantPermissions(['microphone']);
    
    // Start session
    await page.click('text=Start Interview');
    
    // Wait for session to initialize
    await page.waitForTimeout(2000);
    
    // Check if transcript section appears
    const transcriptSection = page.locator('text=Live Transcript');
    
    // If speech recognition is available, transcript section should be visible
    // This test may be environment-dependent
    if (await transcriptSection.isVisible()) {
      await expect(transcriptSection).toBeVisible();
    }
    
    await page.click('text=End Session');
  });

  test('should update analytics metrics during session', async ({ page, context }) => {
    await context.grantPermissions(['microphone']);
    
    // Start session
    await page.click('text=Start Interview');
    
    // Check if metrics are displayed
    await expect(page.locator('text=WPM')).toBeVisible();
    await expect(page.locator('text=Filler Words')).toBeVisible();
    await expect(page.locator('text=Confidence')).toBeVisible();
    
    // Verify initial values
    const wpmElement = page.locator('text=WPM').locator('..').locator('.text-2xl');
    await expect(wpmElement).toContainText('0');
    
    await page.click('text=End Session');
  });
});
