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

  authTest('should make API call to login endpoint with correct payload', async ({ page, loginPage: lp }) => {
    loginPage = lp;
    const users = dataHelper.getTestUsers();
    const user: User = users.storeOwner;

    await loginPage.goto();

    // Setup request waiter BEFORE action
    const requestPromise = page.waitForRequest(request =>
      (request.url().includes('/auth/login') || request.url().includes('/api/login')) &&
      request.method() === 'POST'
    );

    // Perform action
    await loginPage.login(user);

    // Wait for request
    const request = await requestPromise;
    expect(request).toBeTruthy();

    // Verify Payload Schema
    const postData = request.postDataJSON();
    expect(postData).toEqual(expect.objectContaining({
      employeeCode: expect.any(String), // Actual API uses employeeCode for email
      password: expect.any(String),
      storeCode: expect.any(String),
      building: expect.any(String),     // Actual API uses building
      location: expect.any(String),     // Actual API uses location
      rememberMe: expect.any(Boolean)
    }));

    // Verify Specific Values
    expect(postData.employeeCode).toBe(user.email);
    expect(postData.storeCode).toBe(user.storeCode);
  });

  authTest('should include correct headers', async ({ page, loginPage: lp }) => {
    loginPage = lp;
    const users = dataHelper.getTestUsers();
    const user: User = users.storeOwner;

    await loginPage.goto();

    const requestPromise = page.waitForRequest(request =>
      (request.url().includes('/auth/login') || request.url().includes('/api/login')) &&
      request.method() === 'POST'
    );

    await loginPage.login(user);
    const request = await requestPromise;

    // Verify Headers
    const headers = request.headers();
    expect(headers['content-type']).toContain('application/json');
    // Add other expected headers here (e.g., specific auth headers if any)
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

  authTest('should use HTTPS', async ({ page, loginPage: lp }) => {
    loginPage = lp;
    const users = dataHelper.getTestUsers();
    const user: User = users.storeOwner;

    await loginPage.goto();

    const requestPromise = page.waitForRequest(request =>
      (request.url().includes('/auth/login') || request.url().includes('/api/login'))
    );

    await loginPage.login(user);
    const request = await requestPromise;

    expect(request.url()).toMatch(/^https:/);
  });
});
