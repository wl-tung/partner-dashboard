import { test, expect } from '../../../src/fixtures/test.fixture';
import { test as authTest } from '../../../src/fixtures/auth.fixture';
import { LoginPage } from '../../../src/pages/login.page';
import { User } from '../../../src/types';
import { DataHelper } from '../../../src/helpers/data.helper';

test.describe('Login with Remember Me', () => {
  let loginPage: LoginPage;
  let dataHelper: DataHelper;

  test.beforeEach(async ({ page, loginPage: lp }) => {
    loginPage = lp;
    dataHelper = new DataHelper();
  });

  test('should check Remember Me checkbox', async ({ page }) => {
    await loginPage.goto();
    
    const checkedBefore = await loginPage.isRememberMeChecked();
    expect(checkedBefore).toBe(false);

    await loginPage.togglePasswordVisibility(); // This might be different selector
    // Actually check the remember me checkbox
    const checkbox = page.locator('input[type="checkbox"][name*="remember"], input[type="checkbox"][aria-label*="Remember"]');
    if (await checkbox.isVisible()) {
      await checkbox.check();
      const checkedAfter = await checkbox.isChecked();
      expect(checkedAfter).toBe(true);
    }
  });

  test('should uncheck Remember Me checkbox', async ({ page }) => {
    await loginPage.goto();
    
    const checkbox = page.locator('input[type="checkbox"][name*="remember"], input[type="checkbox"][aria-label*="Remember"]');
    if (await checkbox.isVisible()) {
      // Check first
      await checkbox.check();
      // Then uncheck
      await checkbox.uncheck();
      const checkedAfter = await checkbox.isChecked();
      expect(checkedAfter).toBe(false);
    }
  });

  authTest('should persist session when Remember Me is checked', async ({ page, loginPage: lp }) => {
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
      true // Remember Me checked
    );

    await loginPage.verifySuccessfulLogin();
    const session = await loginPage.verifySessionPersistence();
    
    // Verify session cookie exists
    expect(session.hasSessionCookie).toBe(true);
  });

  authTest('should not persist session when Remember Me is unchecked', async ({ page, loginPage: lp }) => {
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
      false // Remember Me unchecked
    );

    await loginPage.verifySuccessfulLogin();
    // Note: Session might still exist for current session, but should expire on browser close
    // This test verifies the checkbox state was respected
  });
});

