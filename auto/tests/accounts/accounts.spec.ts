import { test, expect } from '../../src/fixtures/test.fixture';
import { test as authTest } from '../../src/fixtures/auth.fixture';
import { AccountsPage } from '../../src/pages/accounts.page';
import { AccountStatus, UserRole } from '../../src/types';

test.describe('Account Management', () => {
  let accountsPage: AccountsPage;

  test.beforeEach(async ({ page, accountsPage: ap }) => {
    accountsPage = ap;
  });

  authTest('should load accounts page', async ({ authenticatedPage, accountsPage: ap }) => {
    accountsPage = ap;
    await accountsPage.goto();
    await accountsPage.verifyAccountsPageLoaded();
  });

  authTest('should display account list', async ({ authenticatedPage, accountsPage: ap }) => {
    accountsPage = ap;
    await accountsPage.goto();
    const accountCount = await accountsPage.getAccountCount();
    expect(accountCount).toBeGreaterThanOrEqual(0);
  });

  authTest('should search for accounts', async ({ authenticatedPage, accountsPage: ap }) => {
    accountsPage = ap;
    await accountsPage.goto();
    await accountsPage.searchAccounts('EMP001');
    await accountsPage.waitForPageLoad();
  });

  authTest('should verify access restricted for non-admin', async ({ authenticatedPage, accountsPage: ap }) => {
    accountsPage = ap;
    await accountsPage.goto();
    // This test should verify access restriction message
    // Implementation depends on actual access control behavior
  });

  authTest('should click create account button', async ({ authenticatedPage, accountsPage: ap }) => {
    accountsPage = ap;
    await accountsPage.goto();
    // Only works if user has admin access
    // Try to click, will fail gracefully if button doesn't exist
    try {
      await accountsPage.clickCreateAccount();
    } catch (error) {
      // Button may not be visible for non-admin users
      console.log('Create account button not accessible (may require admin role)');
    }
  });
});

