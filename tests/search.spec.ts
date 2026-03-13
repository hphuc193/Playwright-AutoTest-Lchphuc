import { test, expect, Page } from '@playwright/test';
import searchData from '../test-data/search.json';

const BASE_URL = 'https://opensource-demo.orangehrmlive.com';

// LOGIN
async function login(page: Page) {
  await page.goto(BASE_URL);
  
  // Dùng locator chuẩn HTML attribute để chống lỗi đa ngôn ngữ (i18n)
  await page.locator('input[name="username"]').fill('Admin');
  await page.locator('input[name="password"]').fill('admin123');
  await page.locator('button[type="submit"]').click();
  
  await page.waitForURL('**/dashboard/**');
}

// VALID SEARCH
for (const item of searchData.validSearch) {
  test(`Search thành công - ${item.description}`, async ({ page }) => {
    await login(page);
    
    // Điều hướng theo Codegen
    await page.getByRole('link', { name: 'PIM' }).click();

    // Khởi tạo đối tượng ô search từ Codegen
    const searchInput = page.getByRole('textbox', { name: 'Type for hints...' }).first();
    await searchInput.waitFor({ state: 'visible' });
    
    // Áp dụng kỹ thuật bôi đen/clear data trước khi nhập
    await searchInput.click();
    await searchInput.press('ControlOrMeta+a');
    await searchInput.fill(item.employeeName);

    await page.getByRole('button', { name: 'Search' }).click();

    // Dùng Regex /Records? Found/ để khớp cả 2 trường hợp: "Record Found" (số ít) và "Records Found" (số nhiều)
    const recordFoundText = page.getByText(/Records? Found/i);
    await expect(recordFoundText).toBeVisible({ timeout: 10000 });
  });
}

// INVALID SEARCH
for (const item of searchData.invalidSearch) {
  test(`Search không có kết quả - ${item.description}`, async ({ page }) => {
    await login(page);
    
    await page.getByRole('link', { name: 'PIM' }).click();

    const searchInput = page.getByRole('textbox', { name: 'Type for hints...' }).first();
    await searchInput.waitFor({ state: 'visible' });
    
    await searchInput.click();
    await searchInput.press('ControlOrMeta+a');
    await searchInput.fill(item.employeeName);

    await page.getByRole('button', { name: 'Search' }).click();

    // Dùng chính xác locator Toast Message từ Codegen
    const toastMessage = page.locator('#oxd-toaster_1').getByText(item.expectedMessage);
    await expect(toastMessage).toBeVisible({ timeout: 10000 });
  });
}