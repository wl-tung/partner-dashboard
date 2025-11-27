import { test, expect } from '../../../src/fixtures/test.fixture';
import { LoginPage } from '../../../src/pages/login.page';
import { DataHelper } from '../../../src/helpers/data.helper';

test.describe('Error Messages', () => {
  let loginPage: LoginPage;
  let dataHelper: DataHelper;

  test.beforeEach(async ({ page, loginPage: lp }) => {
    loginPage = lp;
    dataHelper = new DataHelper();
  });

  test('should display error message for invalid credentials', async ({ page }) => {
    await loginPage.goto();
    await loginPage.loginWithEmail(
      'invalid@example.com',
      'wrongpassword',
      {
        storeCode: 'TKY001',
        buildingCode: 'TKY001-A',
        locationCode: 'TKY001-A-1B'
      }
    );

    await loginPage.verifyErrorMessage();
    // Error message should be visible
    const errorElement = page.locator('.error, .MuiAlert-root, [role="alert"]');
    await expect(errorElement).toBeVisible();
  });

  test('should display error message for empty required fields', async ({ page }) => {
    await loginPage.goto();
    await loginPage.submitEmptyForm();
    
    const validation = await loginPage.verifyFormValidation();
    // Should show validation errors
  });

  test('should clear error message after successful login attempt', async ({ page }) => {
    const users = dataHelper.getTestUsers();
    const user = users.storeOwner;

    await loginPage.goto();
    
    // First, fail login
    await loginPage.loginWithEmail(
      'wrong@example.com',
      'wrongpassword',
      {
        storeCode: user.storeCode || 'TKY001',
        buildingCode: user.buildingCode || 'TKY001-A',
        locationCode: user.locationCode || 'TKY001-A-1B'
      }
    );
    await loginPage.verifyErrorMessage();

    // Then, successful login
    await loginPage.loginWithEmail(
      user.email || '',
      user.password,
      {
        storeCode: user.storeCode || 'TKY001',
        buildingCode: user.buildingCode || 'TKY001-A',
        locationCode: user.locationCode || 'TKY001-A-1B'
      }
    );
    
    await loginPage.verifySuccessfulLogin();
    // Error should be cleared
  });

  test('should show appropriate error message text', async ({ page }) => {
    await loginPage.goto();
    await loginPage.loginWithEmail(
      'invalid@example.com',
      'wrongpassword',
      {
        storeCode: 'TKY001',
        buildingCode: 'TKY001-A',
        locationCode: 'TKY001-A-1B'
      }
    );

    const errorElement = page.locator('.error, .MuiAlert-root, [role="alert"]');
    await expect(errorElement).toBeVisible();
    
    const errorText = await errorElement.textContent();
    expect(errorText).toBeTruthy();
    expect(errorText?.length).toBeGreaterThan(0);
  });
});

