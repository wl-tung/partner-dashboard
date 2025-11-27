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

  test('should handle multiple failed login attempts', async ({ page }) => {
    await loginPage.goto();
    
    // Attempt 1
    await loginPage.loginWithEmail(
      'test@example.com',
      'wrong1',
      {
        storeCode: 'TKY001',
        buildingCode: 'TKY001-A',
        locationCode: 'TKY001-A-1B'
      }
    );
    await loginPage.verifyErrorMessage();

    // Attempt 2
    await loginPage.loginWithEmail(
      'test@example.com',
      'wrong2',
      {
        storeCode: 'TKY001',
        buildingCode: 'TKY001-A',
        locationCode: 'TKY001-A-1B'
      }
    );
    await loginPage.verifyErrorMessage();

    // Attempt 3
    await loginPage.loginWithEmail(
      'test@example.com',
      'wrong3',
      {
        storeCode: 'TKY001',
        buildingCode: 'TKY001-A',
        locationCode: 'TKY001-A-1B'
      }
    );
    await loginPage.verifyErrorMessage();

    // Verify still on login page
    await expect(page).toHaveURL(/.*\/auth\/login/);
  });
});

