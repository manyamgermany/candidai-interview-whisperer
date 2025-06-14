
import { test, expect } from '@playwright/test';

test.describe('CandidAI Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should load the dashboard and display main components', async ({ page }) => {
    // Check if the main dashboard elements are present
    await expect(page.locator('text=CandidAI Dashboard')).toBeVisible();
    await expect(page.locator('text=Interview Session Control')).toBeVisible();
    await expect(page.locator('text=Start Interview')).toBeVisible();
  });

  test('should navigate between tabs', async ({ page }) => {
    // Test navigation to settings
    await page.click('text=Settings');
    await expect(page.locator('text=AI Provider Configuration')).toBeVisible();
    
    // Test navigation to analytics
    await page.click('text=Analytics');
    await expect(page.locator('text=Performance Analytics')).toBeVisible();
    
    // Test navigation to documents
    await page.click('text=Documents');
    await expect(page.locator('text=Document Management')).toBeVisible();
    
    // Navigate back to dashboard
    await page.click('text=Back');
    await expect(page.locator('text=Interview Session Control')).toBeVisible();
  });

  test('should start and stop interview session', async ({ page }) => {
    // Start interview session
    await page.click('text=Start Interview');
    
    // Check if session started
    await expect(page.locator('text=End Session')).toBeVisible();
    await expect(page.locator('text=Live Session')).toBeVisible();
    await expect(page.locator('text=Recording')).toBeVisible();
    
    // Check if live metrics are displayed
    await expect(page.locator('text=Live Performance Metrics')).toBeVisible();
    await expect(page.locator('text=WPM')).toBeVisible();
    await expect(page.locator('text=Filler Words')).toBeVisible();
    await expect(page.locator('text=Confidence')).toBeVisible();
    
    // End session
    await page.click('text=End Session');
    await expect(page.locator('text=Start Interview')).toBeVisible();
  });

  test('should toggle recording during session', async ({ page }) => {
    // Start session first
    await page.click('text=Start Interview');
    
    // Toggle recording off
    await page.click('text=Mute');
    await expect(page.locator('text=Paused')).toBeVisible();
    
    // Toggle recording back on
    await page.click('text=Unmute');
    await expect(page.locator('text=Recording')).toBeVisible();
    
    // Clean up - end session
    await page.click('text=End Session');
  });

  test('should display AI suggestions during session', async ({ page }) => {
    // Start session
    await page.click('text=Start Interview');
    
    // Check AI Assistant section
    await expect(page.locator('text=AI Assistant')).toBeVisible();
    await expect(page.locator('text=Real-time suggestions and coaching during your interview')).toBeVisible();
    
    // End session
    await page.click('text=End Session');
  });
});
