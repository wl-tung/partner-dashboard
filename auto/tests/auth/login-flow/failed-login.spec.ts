import { test, expect } from '../../../src/fixtures/test.fixture';
import { LoginPage } from '../../../src/pages/login.page';
import { DataHelper } from '../../../src/helpers/data.helper';

test.describe('Failed Login Scenarios', () => {
  let loginPage: LoginPage;
  let dataHelper: DataHelper;

  test.beforeEach(async ({ page, loginPage: lp }) => {
    loginPage = lp;
    dataHelper = new DataHelper();
  });

  test('should show error with wrong password', async ({ page }) => {
    const users = dataHelper.getTestUsers();
    const user = users.storeOwner;

    await loginPage.goto();
    await loginPage.loginWithEmail(
      user.email || '',
      'wrongpassword',
      {
        storeCode: user.storeCode || 'TKY001',
        buildingCode: user.buildingCode || 'TKY001-A',
        locationCode: user.locationCode || 'TKY001-A-1B'
      }
    );

    await loginPage.verifyErrorMessage();
    await expect(page).toHaveURL(/.*\/auth\/login/);
  });

  test('should show error with wrong email', async ({ page }) => {
    const users = dataHelper.getTestUsers();
    const user = users.storeOwner;

    await loginPage.goto();
    await loginPage.loginWithEmail(
      'wrong@example.com',
      user.password,
      {
        storeCode: user.storeCode || 'TKY001',
        buildingCode: user.buildingCode || 'TKY001-A',
        locationCode: user.locationCode || 'TKY001-A-1B'
      }
    );

    await loginPage.verifyErrorMessage();
    await expect(page).toHaveURL(/.*\/auth\/login/);
  });

  test('should show error with non-existent user', async ({ page }) => {
    await loginPage.goto();
    await loginPage.loginWithEmail(
      'nonexistent@example.com',
      'password123',
      {
        storeCode: 'TKY001',
        buildingCode: 'TKY001-A',
        locationCode: 'TKY001-A-1B'
      }
    );

    await loginPage.verifyErrorMessage();
    await expect(page).toHaveURL(/.*\/auth\/login/);
  });

  test('should show error with wrong employee code', async ({ page }) => {
    const users = dataHelper.getTestUsers();
    const user = users.storeOwner;

    await loginPage.goto();
    await loginPage.loginWithEmployeeCode(
      'WRONG001',
      user.password,
      {
        storeCode: user.storeCode || 'TKY001',
        buildingCode: user.buildingCode || 'TKY001-A',
        locationCode: user.locationCode || 'TKY001-A-1B'
      }
    );

    await loginPage.verifyErrorMessage();
    await expect(page).toHaveURL(/.*\/auth\/login/);
  });

  // FIXED: Now uses enhanced fill method that triggers form validation events
  // This allows the login button to re-enable between attempts
  test('should handle multiple failed login attempts', async ({ page, loginPage: lp }) => {
    loginPage = lp;

    await loginPage.goto();

    const location = {
      storeCode: 'TKY001',
      buildingCode: 'TKY001-A',
      locationCode: 'TKY001-A-1B'
    };

    // Attempt 1
    await loginPage.fillWithVerificationSafe(loginPage.emailInput, 'test@example.com');
    await loginPage.fillWithVerificationSafe(loginPage.passwordInput, 'wrong1');
    await loginPage.selectLocationEnhanced(location);
    await loginPage.loginButton.click();
    await loginPage.verifyErrorMessage();

    // Attempt 2 - form validation will re-enable button when we fill with events
    await loginPage.fillWithVerificationSafe(loginPage.emailInput, 'test@example.com');
    await loginPage.fillWithVerificationSafe(loginPage.passwordInput, 'wrong2');
    await loginPage.loginButton.click();
    await loginPage.verifyErrorMessage();

    // Attempt 3
    await loginPage.fillWithVerificationSafe(loginPage.emailInput, 'test@example.com');
    await loginPage.fillWithVerificationSafe(loginPage.passwordInput, 'wrong3');
    await loginPage.loginButton.click();
    await loginPage.verifyErrorMessage();

    // Verify still on login page
    await expect(page).toHaveURL(/.*\/auth\/login/);
  });
});

