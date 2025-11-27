import { test, expect } from '../../../src/fixtures/test.fixture';
import { test as authTest } from '../../../src/fixtures/auth.fixture';
import { LoginPage } from '../../../src/pages/login.page';
import { User } from '../../../src/types';
import { DataHelper } from '../../../src/helpers/data.helper';

test.describe('Session Lifecycle', () => {
  let loginPage: LoginPage;
  let dataHelper: DataHelper;

  test.beforeEach(async ({ page, loginPage: lp }) => {
    loginPage = lp;
    dataHelper = new DataHelper();
  });

  authTest('should create session on successful login', async ({ page, loginPage: lp }) => {
    loginPage = lp;
    const users = dataHelper.getTestUsers();
    const user: User = users.storeOwner;

    await loginPage.goto();
    await loginPage.login(user);
    
    const session = await loginPage.verifySessionPersistence();
    expect(session.hasSessionCookie).toBe(true);
  });

  authTest('should maintain session across page navigation', async ({ page, loginPage: lp }) => {
    loginPage = lp;
    const users = dataHelper.getTestUsers();
    const user: User = users.storeOwner;

    await loginPage.goto();
    await loginPage.login(user);
    await loginPage.verifySuccessfulLogin();

    // Navigate to different page
    await page.goto('/orders');
    await expect(page).not.toHaveURL(/.*\/auth\/login/);
    
    // Session should still be valid
    const session = await loginPage.verifySessionPersistence();
    expect(session.hasSessionCookie).toBe(true);
  });

  authTest('should redirect to login when accessing protected page without session', async ({ page, loginPage: lp }) => {
    loginPage = lp;
    
    // Clear cookies/session
    await page.context().clearCookies();
    
    // Try to access protected page
    await page.goto('/orders');
    
    // Should redirect to login
    await expect(page).toHaveURL(/.*\/auth\/login/);
  });
});

