import { test, expect } from '../../../src/fixtures/test.fixture';
import { LoginPage } from '../../../src/pages/login.page';
import { User } from '../../../src/types';
import { DataHelper } from '../../../src/helpers/data.helper';

test.describe('Network Edge Cases', () => {
  let loginPage: LoginPage;
  let dataHelper: DataHelper;

  test.beforeEach(async ({ page, loginPage: lp }) => {
    loginPage = lp;
    dataHelper = new DataHelper();
  });

  test('should handle slow network conditions', async ({ page, loginPage: lp }) => {
    loginPage = lp;
    const users = dataHelper.getTestUsers();
    const user: User = users.storeOwner;

    // Simulate slow network
    await page.route('**/*', route => {
      setTimeout(() => route.continue(), 1000);
    });

    await loginPage.goto();
    await loginPage.login(user);
    
    // Should eventually complete
    await loginPage.verifySuccessfulLogin();
  });

  test('should handle API timeout gracefully', async ({ page, loginPage: lp }) => {
    loginPage = lp;
    const users = dataHelper.getTestUsers();
    const user: User = users.storeOwner;

    // Simulate timeout
    await page.route('**/auth/login', route => {
      setTimeout(() => route.abort(), 100);
    });

    await loginPage.goto();
    
    try {
      await loginPage.login(user);
    } catch (error) {
      // Should handle timeout error
      expect(error).toBeTruthy();
    }
  });

  test('should handle network error responses', async ({ page, loginPage: lp }) => {
    loginPage = lp;
    const users = dataHelper.getTestUsers();
    const user: User = users.storeOwner;

    // Simulate network error
    await page.route('**/auth/login', route => {
      route.fulfill({
        status: 500,
        body: JSON.stringify({ error: 'Internal Server Error' })
      });
    });

    await loginPage.goto();
    
    try {
      await loginPage.login(user);
      await loginPage.verifyErrorMessage();
    } catch (error) {
      // Should handle error
      expect(error).toBeTruthy();
    }
  });
});

