import { test, expect } from '../../src/fixtures/test.fixture';
import { LoginPage } from '../../src/pages/login.page';
import { User } from '../../src/types';
import { DataHelper } from '../../src/helpers/data.helper';

test.describe('Login Page', () => {
  let loginPage: LoginPage;
  let dataHelper: DataHelper;

  test.beforeEach(async ({ page, loginPage: lp }) => {
    loginPage = lp;
    dataHelper = new DataHelper();
  });

  test('should display login page', async () => {
    await loginPage.goto();
    await loginPage.verifyLoginPage();
  });

  test('should login successfully with email', async ({ page }) => {
    const users = dataHelper.getTestUsers();
    const user: User = users.storeOwner;

    await loginPage.goto();
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
  });

  test('should login successfully with employee code', async ({ page }) => {
    const users = dataHelper.getTestUsers();
    const user: User = users.storeOwner;

    await loginPage.goto();
    await loginPage.loginWithEmployeeCode(
      user.employeeCode || '',
      user.password,
      {
        storeCode: user.storeCode || 'TKY001',
        buildingCode: user.buildingCode || 'TKY001-A',
        locationCode: user.locationCode || 'TKY001-A-1B'
      }
    );
    await loginPage.verifySuccessfulLogin();
  });

  test('should show error with invalid credentials', async ({ page }) => {
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
  });

  test('should toggle password visibility', async ({ page }) => {
    await loginPage.goto();
    await loginPage.togglePasswordVisibility();
    // Verify password field type changed (implementation depends on actual behavior)
  });

  test('should remember me checkbox work', async ({ page }) => {
    await loginPage.goto();
    const users = dataHelper.getTestUsers();
    const user: User = users.storeOwner;

    await loginPage.loginWithEmail(
      user.email || '',
      user.password,
      {
        storeCode: user.storeCode || 'TKY001',
        buildingCode: user.buildingCode || 'TKY001-A',
        locationCode: user.locationCode || 'TKY001-A-1B'
      },
      true
    );
    // Verify session persistence (implementation depends on actual behavior)
  });
});

