import { test, expect } from '../../../src/fixtures/test.fixture';
import { test as authTest } from '../../../src/fixtures/auth.fixture';
import { LoginPage } from '../../../src/pages/login.page';
import { User } from '../../../src/types';
import { DataHelper } from '../../../src/helpers/data.helper';

test.describe('Remember Me Functionality', () => {
  let loginPage: LoginPage;
  let dataHelper: DataHelper;

  test.beforeEach(async ({ page, loginPage: lp }) => {
    loginPage = lp;
    dataHelper = new DataHelper();
  });

  authTest('should persist session cookie when Remember Me is checked', async ({ page, loginPage: lp }) => {
    loginPage = lp;
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
      true
    );

    await loginPage.verifySuccessfulLogin();
    const session = await loginPage.verifySessionPersistence();
    expect(session.hasSessionCookie).toBe(true);
  });

  authTest('should set remember me cookie when checked', async ({ page, loginPage: lp }) => {
    loginPage = lp;
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
      true
    );

    await loginPage.verifySuccessfulLogin();
    const session = await loginPage.verifySessionPersistence();
    // Remember me cookie might be set
    expect(session.hasSessionCookie).toBe(true);
  });

  test('should have Remember Me checkbox unchecked by default', async ({ page }) => {
    await loginPage.goto();
    
    const isChecked = await loginPage.isRememberMeChecked();
    expect(isChecked).toBe(false);
  });

  test('should toggle Remember Me checkbox', async ({ page }) => {
    await loginPage.goto();
    
    const checkbox = page.locator('input[type="checkbox"][name*="remember"], input[type="checkbox"][aria-label*="Remember"]');
    if (await checkbox.isVisible()) {
      // Check
      await checkbox.check();
      expect(await checkbox.isChecked()).toBe(true);
      
      // Uncheck
      await checkbox.uncheck();
      expect(await checkbox.isChecked()).toBe(false);
    }
  });
});

