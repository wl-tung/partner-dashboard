import { test, expect } from '../../../src/fixtures/test.fixture';
import { LoginPage } from '../../../src/pages/login.page';

test.describe('Keyboard Navigation', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page, loginPage: lp }) => {
    loginPage = lp;
  });

  test('should navigate form fields with Tab key', async ({ page }) => {
    await loginPage.goto();
    
    // Start from email field
    await page.locator('input[type="email"], input[name="email"]').focus();
    
    // Tab to password
    await page.keyboard.press('Tab');
    // Verify focus moved (check if password field is focused)
    const passwordField = page.locator('input[type="password"]');
    await expect(passwordField).toBeFocused();
    
    // Tab to next element
    await page.keyboard.press('Tab');
  });

  test('should submit form with Enter key', async ({ page }) => {
    await loginPage.goto();
    
    // Fill form
    await loginPage.fill('input[type="email"], input[name="email"]', 'test@example.com');
    await loginPage.fill('input[type="password"]', 'password123');
    await loginPage.selectLocationWithRetry({
      storeCode: 'TKY001',
      buildingCode: 'TKY001-A',
      locationCode: 'TKY001-A-1B'
    });
    
    // Focus login button and press Enter
    await page.locator('button[type="submit"], button:has-text("ログイン")').focus();
    await page.keyboard.press('Enter');
    
    // Should attempt to submit
    await page.waitForTimeout(1000);
  });

  test('should navigate dropdowns with keyboard', async ({ page }) => {
    await loginPage.goto();
    
    // Focus store dropdown
    const storeDropdown = page.locator('select[name="store"], [data-testid="store-select"]');
    if (await storeDropdown.count() > 0) {
      await storeDropdown.focus();
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('Enter');
    }
  });
});

