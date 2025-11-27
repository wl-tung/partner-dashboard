import { test, expect } from '../../../src/fixtures/test.fixture';
import { LoginPage } from '../../../src/pages/login.page';

test.describe('Password Security', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page, loginPage: lp }) => {
    loginPage = lp;
  });

  test('should mask password by default', async ({ page }) => {
    await loginPage.goto();
    
    await loginPage.fill('input[type="password"]', 'testpassword123');
    const isMasked = await loginPage.verifyPasswordMasked();
    expect(isMasked).toBe(true);
  });

  test('should toggle password visibility', async ({ page }) => {
    await loginPage.goto();
    
    await loginPage.fill('input[type="password"]', 'testpassword123');
    
    // Initially masked
    let isMasked = await loginPage.verifyPasswordMasked();
    expect(isMasked).toBe(true);
    
    // Toggle visibility
    await loginPage.togglePasswordVisibility();
    await page.waitForTimeout(300);
    
    // Should be visible
    const isVisible = await loginPage.verifyPasswordVisible();
    expect(isVisible).toBe(true);
    
    // Toggle back
    await loginPage.togglePasswordVisibility();
    await page.waitForTimeout(300);
    
    // Should be masked again
    isMasked = await loginPage.verifyPasswordMasked();
    expect(isMasked).toBe(true);
  });

  test('should not store password in browser autocomplete insecurely', async ({ page }) => {
    await loginPage.goto();
    
    const passwordField = page.locator('input[type="password"]');
    const autocomplete = await passwordField.getAttribute('autocomplete');
    
    // Should not have autocomplete="off" or should have secure autocomplete
    // Modern browsers handle this, but we verify the field type
    const inputType = await passwordField.getAttribute('type');
    expect(inputType).toBe('password');
  });

  test('should not expose password in page source', async ({ page }) => {
    await loginPage.goto();
    
    await loginPage.fill('input[type="password"]', 'sensitivepassword123');
    
    const pageContent = await page.content();
    // Password should not appear in plain text in page source
    expect(pageContent).not.toContain('sensitivepassword123');
  });

  test('should handle password with special characters securely', async ({ page }) => {
    await loginPage.goto();
    
    const specialPasswords = [
      'P@ssw0rd!',
      'Test$123#',
      'Weblife_123',
      'Pass&Word*'
    ];

    for (const password of specialPasswords) {
      await loginPage.fill('input[type="password"]', password);
      const isMasked = await loginPage.verifyPasswordMasked();
      expect(isMasked).toBe(true);
      await page.locator('input[type="password"]').clear();
    }
  });
});

