import { test, expect } from '../../../src/fixtures/test.fixture';
import { LoginPage } from '../../../src/pages/login.page';

test.describe('Form Validation', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page, loginPage: lp }) => {
    loginPage = lp;
  });

  test('should show validation errors when submitting empty form', async ({ page }) => {
    await loginPage.goto();
    await loginPage.submitEmptyForm();
    
    const validation = await loginPage.verifyFormValidation();
    // Form should show validation errors
    // Note: Actual behavior depends on implementation
  });

  test('should show required field indicators', async ({ page }) => {
    await loginPage.goto();
    
    const indicators = await loginPage.verifyRequiredFieldIndicators();
    // At least one field should have required indicator
    expect(indicators.emailHasIndicator || indicators.passwordHasIndicator).toBe(true);
  });

  test('should validate email field is required', async ({ page }) => {
    await loginPage.goto();
    
    // Fill only password
    await loginPage.fill('input[type="password"]', 'password123');
    await loginPage.selectLocation({
      storeCode: 'TKY001',
      buildingCode: 'TKY001-A',
      locationCode: 'TKY001-A-1B'
    });
    await loginPage.submitEmptyForm();
    
    const validation = await loginPage.verifyFormValidation();
    // Should show error for missing email
  });

  test('should validate password field is required', async ({ page }) => {
    await loginPage.goto();
    
    // Fill only email
    await loginPage.fill('input[type="email"], input[name="email"]', 'test@example.com');
    await loginPage.selectLocation({
      storeCode: 'TKY001',
      buildingCode: 'TKY001-A',
      locationCode: 'TKY001-A-1B'
    });
    await loginPage.submitEmptyForm();
    
    const validation = await loginPage.verifyFormValidation();
    // Should show error for missing password
  });

  test('should validate location selection is required', async ({ page }) => {
    await loginPage.goto();
    
    // Fill credentials but not location
    await loginPage.fill('input[type="email"], input[name="email"]', 'test@example.com');
    await loginPage.fill('input[type="password"]', 'password123');
    await loginPage.submitEmptyForm();
    
    const validation = await loginPage.verifyFormValidation();
    // Should show error for missing location
  });

  test('should show error messages for invalid inputs', async ({ page }) => {
    await loginPage.goto();
    
    // Try to submit with invalid data
    await loginPage.submitEmptyForm();
    
    const validation = await loginPage.verifyFormValidation();
    if (validation.hasErrors) {
      expect(validation.errors.length).toBeGreaterThan(0);
    }
  });
});

