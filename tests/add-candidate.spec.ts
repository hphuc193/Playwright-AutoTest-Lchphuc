import { test, expect, Page } from '@playwright/test';
import candidateData from '../test-data/add-candidate.json';

const BASE_URL = 'https://opensource-demo.orangehrmlive.com';

// LOGIN HELPER
async function login(page: Page) {
  await page.goto(BASE_URL);
  
  await page.locator('input[name="username"]').fill('Admin');
  await page.locator('input[name="password"]').fill('admin123');
  // Dùng locator chuẩn để tránh lỗi hiển thị đa ngôn ngữ
  await page.locator('button[type="submit"]').click();
  
  await page.waitForURL('**/dashboard/**');
}

// NAVIGATE HELPER
// Hàm hỗ trợ di chuyển đến đúng trang Add Candidate để code gọn gàng hơn
async function goToAddCandidatePage(page: Page) {
  await page.getByRole('link', { name: 'Recruitment' }).click();
  // Nút Add đôi khi chứa icon, dùng getByRole button với regex để bắt an toàn
  await page.getByRole('button', { name: /Add/i }).click();
  
  // Đợi form load xong bằng cách chờ ô First Name xuất hiện
  await page.getByRole('textbox', { name: 'First Name' }).waitFor({ state: 'visible' });
}

// VALID TEST CASES
for (const item of candidateData.validCandidates) {
  test(`Thêm ứng viên thành công - ${item.description}`, async ({ page }) => {
    await login(page);
    await goToAddCandidatePage(page);

    // Nhập Tên
    if (item.firstName) await page.getByRole('textbox', { name: 'First Name' }).fill(item.firstName);
    if (item.middleName) await page.getByRole('textbox', { name: 'Middle Name' }).fill(item.middleName);
    if (item.lastName) await page.getByRole('textbox', { name: 'Last Name' }).fill(item.lastName);

    // Nhập Email và Contact (Dùng getByPlaceholder thay vì getByRole cho các ô "Type here" để chính xác hơn)
    const typeHereInputs = page.getByPlaceholder('Type here');
    if (item.email) await typeHereInputs.first().fill(item.email);
    if (item.contactNumber) await typeHereInputs.nth(1).fill(item.contactNumber);

    await page.getByRole('button', { name: 'Save' }).click();

    // Xác nhận Toast message báo lưu thành công
    const toastMessage = page.locator('#oxd-toaster_1').getByText(item.expectedMessage);
    await expect(toastMessage).toBeVisible({ timeout: 10000 });
  });
}

// INVALID TEST CASES
for (const item of candidateData.invalidCandidates) {
  test(`Thêm ứng viên thất bại - ${item.description}`, async ({ page }) => {
    await login(page);
    await goToAddCandidatePage(page);

    // Điền dữ liệu giả định bị thiếu hoặc sai theo file JSON
    if (item.firstName) await page.getByRole('textbox', { name: 'First Name' }).fill(item.firstName);
    if (item.lastName) await page.getByRole('textbox', { name: 'Last Name' }).fill(item.lastName);
    
    if (item.email) {
      await page.getByPlaceholder('Type here').first().fill(item.email);
    }

    await page.getByRole('button', { name: 'Save' }).click();

    // Kỹ thuật kiểm tra lỗi hiển thị dưới ô input
    // Dùng getByText() bắt thông báo lỗi động từ JSON
    const errorMessage = page.getByText(item.expectedError).first();
    await expect(errorMessage).toBeVisible();
  });
}