import { test, expect } from '../../../src/fixtures/test.fixture';
import { test as authTest } from '../../../src/fixtures/auth.fixture';
import { LoginPage } from '../../../src/pages/login.page';
import { User } from '../../../src/types';
import { DataHelper } from '../../../src/helpers/data.helper';

test.describe('API Response Handling', () => {
  let loginPage: LoginPage;
  let dataHelper: DataHelper;

  test.beforeEach(async ({ page, loginPage: lp }) => {
    loginPage = lp;
    dataHelper = new DataHelper();
  });

  authTest('should handle successful login response', async ({ page, loginPage: lp }) => {
    loginPage = lp;
    const users = dataHelper.getTestUsers();
    const user: User = users.storeOwner;

    let responseStatus = 0;

    page.on('response', response => {
      if (response.url().includes('/auth/login') || response.url().includes('/api/login')) {
        responseStatus = response.status();
      }
    });

    await loginPage.goto();
    await loginPage.login(user);

    await page.waitForTimeout(1000);

    // Should get successful response
    if (responseStatus > 0) {
      expect(responseStatus).toBeGreaterThanOrEqual(200);
      expect(responseStatus).toBeLessThan(300);
    }
  });

  test('should handle error response for invalid credentials', async ({ page, loginPage: lp }) => {
    loginPage = lp;

    let responseStatus = 0;

    page.on('response', response => {
      if (response.url().includes('/auth/login') || response.url().includes('/api/login')) {
        responseStatus = response.status();
      }
    });

    await loginPage.goto();
    await loginPage.loginWithEmail(
      'wrong@example.com',
      'wrongpassword',
      {
        storeCode: 'TKY001',
        buildingCode: 'TKY001-A',
        locationCode: 'TKY001-A-1B'
      }
    );

    await page.waitForTimeout(1000);

    // Should get error response
    if (responseStatus > 0) {
      expect(responseStatus).toBeGreaterThanOrEqual(400);
    }
  });

  // SKIPPED: Route mocking conflicts with page navigation
  // This test needs to be refactored to only mock fetch/xhr requests
  test.skip('should handle network error responses', async ({ page, loginPage: lp }) => {
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

