import { test, expect } from '../../../src/fixtures/test.fixture';
import { test as authTest } from '../../../src/fixtures/auth.fixture';
import { LoginPage } from '../../../src/pages/login.page';
import { DashboardPage } from '../../../src/pages/dashboard.page';
import { User } from '../../../src/types';
import { DataHelper } from '../../../src/helpers/data.helper';

test.describe('Successful Login Flow', () => {
  let loginPage: LoginPage;
  let dashboardPage: DashboardPage;
  let dataHelper: DataHelper;

  test.beforeEach(async ({ page, loginPage: lp, dashboardPage: dp }) => {
    loginPage = lp;
    dashboardPage = dp;
    dataHelper = new DataHelper();
  });

  test('should login successfully with email and all location fields', async ({ page }) => {
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
    await dashboardPage.verifyDashboardLoaded();
  });

  test('should login successfully with employee code and all location fields', async ({ page }) => {
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
    await dashboardPage.verifyDashboardLoaded();
  });

  authTest('should login with Remember Me checked and verify session persistence', async ({ authenticatedPage, loginPage: lp, dashboardPage: dp }) => {
    loginPage = lp;
    dashboardPage = dp;
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
      },
      true // Remember Me checked
    );

    await loginPage.verifySuccessfulLogin();
    const session = await loginPage.verifySessionPersistence();
    expect(session.hasSessionCookie).toBe(true);
  });

  authTest('should login with Remember Me unchecked', async ({ authenticatedPage, loginPage: lp, dashboardPage: dp }) => {
    loginPage = lp;
    dashboardPage = dp;
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
      },
      false // Remember Me unchecked
    );

    await loginPage.verifySuccessfulLogin();
    await dashboardPage.verifyDashboardLoaded();
  });

  authTest('should redirect to dashboard after successful login', async ({ authenticatedPage, loginPage: lp, dashboardPage: dp }) => {
    loginPage = lp;
    dashboardPage = dp;
    const users = dataHelper.getTestUsers();
    const user: User = users.storeOwner;

    await loginPage.goto();
    await loginPage.login(user);
    
    await loginPage.verifySuccessfulLogin();
    await expect(authenticatedPage).toHaveURL(/.*\/$/);
    await dashboardPage.verifyDashboardLoaded();
  });

  authTest('should display user information after login', async ({ authenticatedPage, loginPage: lp, dashboardPage: dp }) => {
    loginPage = lp;
    dashboardPage = dp;
    const users = dataHelper.getTestUsers();
    const user: User = users.storeOwner;

    await loginPage.goto();
    await loginPage.login(user);
    
    // Wait for navigation to dashboard after login
    await loginPage.verifySuccessfulLogin();
    
    // Verify dashboard is loaded (we should already be on dashboard after login)
    await dashboardPage.verifyDashboardLoaded();
    
    // Verify user info (simplified - just check we're on dashboard)
    await dashboardPage.verifyUserInfo(user.storeCode);
  });
});

