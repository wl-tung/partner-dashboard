import { test, expect } from '../../../src/fixtures/test.fixture';
import { test as authTest } from '../../../src/fixtures/auth.fixture';
import { LoginPage } from '../../../src/pages/login.page';
import { DashboardPage } from '../../../src/pages/dashboard.page';
import { User } from '../../../src/types';
import { DataHelper } from '../../../src/helpers/data.helper';

test.describe('Post-Login Behavior', () => {
  let loginPage: LoginPage;
  let dashboardPage: DashboardPage;
  let dataHelper: DataHelper;

  test.beforeEach(async ({ page, loginPage: lp, dashboardPage: dp }) => {
    loginPage = lp;
    dashboardPage = dp;
    dataHelper = new DataHelper();
  });

  authTest('should redirect to dashboard after login', async ({ page, loginPage: lp, dashboardPage: dp }) => {
    loginPage = lp;
    dashboardPage = dp;
    const users = dataHelper.getTestUsers();
    const user: User = users.storeOwner;

    await loginPage.goto();
    await loginPage.login(user);
    
    await loginPage.verifySuccessfulLogin();
    await expect(page).toHaveURL(/.*\/$/);
    await dashboardPage.verifyDashboardLoaded();
  });

  authTest('should display user information on dashboard', async ({ page, loginPage: lp, dashboardPage: dp }) => {
    loginPage = lp;
    dashboardPage = dp;
    const users = dataHelper.getTestUsers();
    const user: User = users.storeOwner;

    await loginPage.goto();
    await loginPage.login(user);
    await dashboardPage.goto();
    
    await dashboardPage.verifyUserInfo(user.storeCode);
  });

  authTest('should allow navigation to other modules after login', async ({ page, loginPage: lp }) => {
    loginPage = lp;
    const users = dataHelper.getTestUsers();
    const user: User = users.storeOwner;

    await loginPage.goto();
    await loginPage.login(user);
    
    // Navigate to orders
    await page.goto('/orders');
    await expect(page).toHaveURL(/.*\/orders/);
    
    // Navigate to customers
    await page.goto('/customers');
    await expect(page).toHaveURL(/.*\/customers/);
  });
});

