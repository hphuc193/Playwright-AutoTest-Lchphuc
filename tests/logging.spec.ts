import { test, expect } from '@playwright/test';
import loginData from '../test-data/loginData.json';

test.describe('OrangeHRM Login - Data Driven', () => {

  loginData.forEach((data) => {

    test(data.name, async ({ page }) => {

      // mở trang login
      await page.goto(
        'https://opensource-demo.orangehrmlive.com/',
        { waitUntil: 'domcontentloaded' }
      );

      // nhập username
      await page.locator('input[name="username"]').fill(data.input.username);

      // nhập password
      await page.locator('input[name="password"]').fill(data.input.password);

      // click login
      await page.getByRole('button', { name: 'Login' }).click();

      // SUCCESS CASE
      if (data.expect.result === 'success') {

        await page.waitForURL('**/dashboard/**', { timeout: 10000 });
        await expect(page).toHaveURL(/dashboard/);

        if (data.expect.visibleSelector) {
            await expect(
                page.locator(data.expect.visibleSelector)
            ).toBeVisible();
        }

      }

      //VALIDATION CASE
      else if (data.expect.result === 'validation') {

        const errors = page.locator('.oxd-input-field-error-message');

        if (data.expect.errorCount !== undefined) {
            await expect(errors).toHaveCount(data.expect.errorCount);
        }

      }

      //ERROR CASE
      else if (data.expect.result === 'error') {

        if (data.expect.message) {
            const errorAlert = page.locator('.oxd-alert-content-text');
            if (await errorAlert.count() > 0) {
                await expect(errorAlert).toContainText(data.expect.message);
            } 
            else {
                await expect(page).toHaveURL(/auth\/login/);
            }
        }

      }

    });

  });

});