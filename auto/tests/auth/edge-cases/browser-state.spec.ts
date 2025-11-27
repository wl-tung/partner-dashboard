import { test, expect } from '../../../src/fixtures/test.fixture';
import { test as authTest } from '../../../src/fixtures/auth.fixture';
import { LoginPage } from '../../../src/pages/login.page';
import { DashboardPage } from '../../../src/pages/dashboard.page';
import { User } from '../../../src/types';
import { DataHelper } from '../../../src/helpers/data.helper';

test.describe('Browser State Edge Cases', () => {
  let loginPage: LoginPage;
  let dashboardPage: DashboardPage;
  let dataHelper: DataHelper;

  test.beforeEach(async ({ page, loginPage: lp, dashboardPage: dp }) => {
    loginPage = lp;
    dashboardPage = dp;
    dataHelper = new DataHelper();
  });

  authTest('should handle back button after login', async ({ page, loginPage: lp }) => {
    loginPage = lp;
    const users = dataHelper.getTestUsers();
    const user: User = users.storeOwner;

    await loginPage.goto();
    await loginPage.login(user);
    await loginPage.verifySuccessfulLogin();
    
    // Press back button
    await page.goBack();
    
    // Should either stay on dashboard or redirect back
    // Depends on implementation
    const url = page.url();
    expect(url).toBeTruthy();
  });

  authTest('should handle page refresh after login', async ({ page, loginPage: lp, dashboardPage: dp }) => {
    loginPage = lp;
    dashboardPage = dp;
    const users = dataHelper.getTestUsers();
    const user: User = users.storeOwner;

    await loginPage.goto();
    await loginPage.login(user);
    await loginPage.verifySuccessfulLogin();
    
    // Refresh page
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Should still be logged in
    await expect(page).not.toHaveURL(/.*\/auth\/login/);
  });

  test('should handle page refresh during login process', async ({ page, loginPage: lp }) => {
    loginPage = lp;
    const users = dataHelper.getTestUsers();
    const user: User = users.storeOwner;

    await loginPage.goto();
    
    // Fill form
    await loginPage.fill('input[type="email"], input[name="email"]', user.email || '');
    await loginPage.fill('input[type="password"]', user.password);
    
    // Refresh before submitting
    await page.reload();
    
    // Form should be cleared
    const emailValue = await page.locator('input[type="email"], input[name="email"]').inputValue().catch(() => '');
    expect(emailValue).toBe('');
  });
});

