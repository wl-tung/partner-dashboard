import { test, expect } from '../../../src/fixtures/test.fixture';
import { LoginPage } from '../../../src/pages/login.page';

test.describe('Input Edge Cases', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page, loginPage: lp }) => {
    loginPage = lp;
  });

  test('should handle very long email input', async ({ page }) => {
    await loginPage.goto();
    
    const longEmail = 'a'.repeat(200) + '@example.com';
    await loginPage.fill('input[type="email"], input[name="email"]', longEmail);
    
    const value = await page.locator('input[type="email"], input[name="email"]').inputValue();
    expect(value.length).toBeGreaterThan(0);
  });

  test('should handle very long password input', async ({ page }) => {
    await loginPage.goto();
    
    const longPassword = 'a'.repeat(500);
    await loginPage.fill('input[type="password"]', longPassword);
    
    const isMasked = await loginPage.verifyPasswordMasked();
    expect(isMasked).toBe(true);
  });

  test('should handle special characters in email', async ({ page }) => {
    await loginPage.goto();
    
    const specialEmails = [
      'test+tag@example.com',
      'user.name@example.co.jp',
      'user_name@example.com'
    ];

    for (const email of specialEmails) {
      await loginPage.fill('input[type="email"], input[name="email"]', email);
      const value = await page.locator('input[type="email"], input[name="email"]').inputValue();
      expect(value).toContain('@');
      await page.locator('input[type="email"], input[name="email"]').clear();
    }
  });

  test('should handle Unicode characters', async ({ page }) => {
    await loginPage.goto();
    
    const unicodeEmail = 'テスト@example.com';
    await loginPage.fill('input[type="email"], input[name="email"]', unicodeEmail);
    
    const value = await page.locator('input[type="email"], input[name="email"]').inputValue();
    expect(value.length).toBeGreaterThan(0);
  });

  test('should handle whitespace in inputs', async ({ page }) => {
    await loginPage.goto();
    
    // Leading/trailing whitespace
    await loginPage.fill('input[type="email"], input[name="email"]', '  test@example.com  ');
    const emailValue = await page.locator('input[type="email"], input[name="email"]').inputValue();
    expect(emailValue).toBeTruthy();
    
    await loginPage.fill('input[type="password"]', '  password123  ');
    const isMasked = await loginPage.verifyPasswordMasked();
    expect(isMasked).toBe(true);
  });

  test('should handle case sensitivity in credentials', async ({ page }) => {
    await loginPage.goto();
    
    // Test case sensitivity (depends on backend implementation)
    const testEmail = 'Test@Example.com';
    await loginPage.fill('input[type="email"], input[name="email"]', testEmail);
    const value = await page.locator('input[type="email"], input[name="email"]').inputValue();
    expect(value).toBeTruthy();
  });

  test('should handle empty string inputs', async ({ page }) => {
    await loginPage.goto();
    
    await loginPage.fill('input[type="email"], input[name="email"]', '');
    await loginPage.fill('input[type="password"]', '');
    
    const emailValue = await page.locator('input[type="email"], input[name="email"]').inputValue();
    const passwordValue = await page.locator('input[type="password"]').inputValue();
    
    expect(emailValue).toBe('');
    expect(passwordValue).toBe('');
  });
});

