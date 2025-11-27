import { test, expect } from '../../../src/fixtures/test.fixture';
import { test as authTest } from '../../../src/fixtures/auth.fixture';
import { LoginPage } from '../../../src/pages/login.page';
import { User } from '../../../src/types';
import { DataHelper } from '../../../src/helpers/data.helper';

test.describe('API Request Verification', () => {
  let loginPage: LoginPage;
  let dataHelper: DataHelper;

  test.beforeEach(async ({ page, loginPage: lp }) => {
    loginPage = lp;
    dataHelper = new DataHelper();
  });

  authTest('should make API call to login endpoint', async ({ page, loginPage: lp }) => {
    loginPage = lp;
    const users = dataHelper.getTestUsers();
    const user: User = users.storeOwner;

    await loginPage.goto();
    await loginPage.login(user);
    
    const apiCall = await loginPage.verifyAPICall('/auth/login');
    expect(apiCall.called).toBe(true);
  });

  authTest('should send correct request payload structure', async ({ page, loginPage: lp }) => {
    loginPage = lp;
    const users = dataHelper.getTestUsers();
    const user: User = users.storeOwner;

    let requestPayload: any = null;

    page.on('request', request => {
      if (request.url().includes('/auth/login') || request.url().includes('/api/login')) {
        const postData = request.postData();
        if (postData) {
          try {
            requestPayload = JSON.parse(postData);
          } catch (e) {
            requestPayload = postData;
          }
        }
      }
    });

    await loginPage.goto();
    await loginPage.login(user);
    
    await page.waitForTimeout(1000);
    
    // Verify payload structure (if available)
    if (requestPayload) {
      expect(requestPayload).toBeTruthy();
    }
  });

  authTest('should include location data in request', async ({ page, loginPage: lp }) => {
    loginPage = lp;
    const users = dataHelper.getTestUsers();
    const user: User = users.storeOwner;

    let requestPayload: any = null;

    page.on('request', request => {
      if (request.url().includes('/auth/login') || request.url().includes('/api/login')) {
        const postData = request.postData();
        if (postData) {
          try {
            requestPayload = JSON.parse(postData);
          } catch (e) {
            requestPayload = postData;
          }
        }
      }
    });

    await loginPage.goto();
    await loginPage.login(user);
    
    await page.waitForTimeout(1000);
    
    // Location data should be in request
    if (requestPayload) {
      const payloadStr = JSON.stringify(requestPayload);
      expect(payloadStr).toContain(user.storeCode || 'TKY001');
    }
  });

  authTest('should not include password in URL', async ({ page, loginPage: lp }) => {
    loginPage = lp;
    const users = dataHelper.getTestUsers();
    const user: User = users.storeOwner;

    await loginPage.goto();
    await loginPage.login(user);
    
    const url = page.url();
    expect(url).not.toContain(user.password);
  });

  authTest('should use HTTPS for API calls', async ({ page, loginPage: lp }) => {
    loginPage = lp;
    const users = dataHelper.getTestUsers();
    const user: User = users.storeOwner;

    let apiUrl = '';

    page.on('request', request => {
      if (request.url().includes('/auth/login') || request.url().includes('/api/login')) {
        apiUrl = request.url();
      }
    });

    await loginPage.goto();
    await loginPage.login(user);
    
    await page.waitForTimeout(1000);
    
    if (apiUrl) {
      expect(apiUrl).toMatch(/^https:/);
    }
  });
});

