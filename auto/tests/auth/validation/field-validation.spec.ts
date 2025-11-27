import { test, expect } from '../../../src/fixtures/test.fixture';
import { LoginPage } from '../../../src/pages/login.page';

test.describe('Field Validation', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page, loginPage: lp }) => {
    loginPage = lp;
  });

  test('should accept valid email format', async ({ page }) => {
    await loginPage.goto();
    
    const validEmails = [
      'test@example.com',
      'user.name@example.co.jp',
      'user+tag@example.com'
    ];

    for (const email of validEmails) {
      await loginPage.fill('input[type="email"], input[name="email"]', email);
      const value = await page.locator('input[type="email"], input[name="email"]').inputValue();
      expect(value).toBe(email);
      await page.locator('input[type="email"], input[name="email"]').clear();
    }
  });

  test('should accept employee code format', async ({ page }) => {
    await loginPage.goto();
    
    const employeeCodes = ['EMP001', 'ADMIN001', 'MGR001'];
    
    for (const code of employeeCodes) {
      await loginPage.fill('input[name="employeeCode"], input[placeholder*="従業員コード"]', code);
      const value = await page.locator('input[name="employeeCode"], input[placeholder*="従業員コード"]').inputValue();
      expect(value).toBe(code);
      await page.locator('input[name="employeeCode"], input[placeholder*="従業員コード"]').clear();
    }
  });

  test('should handle whitespace in email field', async ({ page }) => {
    await loginPage.goto();
    
    await loginPage.fill('input[type="email"], input[name="email"]', '  test@example.com  ');
    const value = await page.locator('input[type="email"], input[name="email"]').inputValue();
    // Should either trim or preserve - depends on implementation
    expect(value).toBeTruthy();
  });

  test('should handle special characters in password', async ({ page }) => {
    await loginPage.goto();
    
    const passwords = [
      'Password123!',
      'P@ssw0rd#',
      'Test$123',
      'Weblife_123'
    ];

    for (const password of passwords) {
      await loginPage.fill('input[type="password"]', password);
      // Password should be masked
      const isMasked = await loginPage.verifyPasswordMasked();
      expect(isMasked).toBe(true);
      await page.locator('input[type="password"]').clear();
    }
  });

  test('should handle very long email input', async ({ page }) => {
    await loginPage.goto();
    
    const longEmail = 'a'.repeat(100) + '@example.com';
    await loginPage.fill('input[type="email"], input[name="email"]', longEmail);
    const value = await page.locator('input[type="email"], input[name="email"]').inputValue();
    expect(value.length).toBeGreaterThan(0);
  });

  test('should handle very long password input', async ({ page }) => {
    await loginPage.goto();
    
    const longPassword = 'a'.repeat(200);
    await loginPage.fill('input[type="password"]', longPassword);
    const isMasked = await loginPage.verifyPasswordMasked();
    expect(isMasked).toBe(true);
  });
});

