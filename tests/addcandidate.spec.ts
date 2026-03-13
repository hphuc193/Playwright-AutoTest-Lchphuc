import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('https://opensource-demo.orangehrmlive.com/');

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/OrangeHRM/);

  await page.fill('input[name="username"]', 'Admin');
  await page.fill('input[name="password"]', 'admin123');
  await page.click('button[type="submit"]');

  await expect(page).toHaveURL(/dashboard/);

await page.click('a[href*="recruitment"]');
});