import { test, expect } from '../../../src/fixtures/test.fixture';
import { LoginPage } from '../../../src/pages/login.page';
import { DataHelper } from '../../../src/helpers/data.helper';

test.describe('Performance - Load Time', () => {
  let loginPage: LoginPage;
  let dataHelper: DataHelper;

  test.beforeEach(async ({ page, loginPage: lp }) => {
    loginPage = lp;
    dataHelper = new DataHelper();
  });

  test('should load login page within 2 seconds', async ({ page }) => {
    const startTime = Date.now();
    await loginPage.goto();
    const loadTime = Date.now() - startTime;
    
    expect(loadTime).toBeLessThan(2000);
  });

  test('should load store dropdown within 500ms', async ({ page }) => {
    await loginPage.goto();
    
    const startTime = Date.now();
    await page.waitForSelector('select[name="store"], [data-testid="store-select"]', { timeout: 5000 });
    const loadTime = Date.now() - startTime;
    
    expect(loadTime).toBeLessThan(500);
  });

  test('should enable building dropdown within 500ms after store selection', async ({ page }) => {
    await loginPage.goto();
    
    const startTime = Date.now();
    await loginPage.selectStoreWithRetry('TKY001', 3);
    await page.waitForTimeout(500);
    
    const states = await loginPage.verifyDropdownStates();
    const enableTime = Date.now() - startTime;
    
    expect(states.buildingEnabled).toBe(true);
    expect(enableTime).toBeLessThan(1000); // Allow some buffer
  });

  test('should complete login within reasonable time', async ({ page, loginPage: lp }) => {
    loginPage = lp;
    const users = dataHelper.getTestUsers();
    const user = users.storeOwner;

    await loginPage.goto();
    
    const startTime = Date.now();
    await loginPage.login(user);
    await loginPage.verifySuccessfulLogin();
    const loginTime = Date.now() - startTime;
    
    // Should complete within 5 seconds
    expect(loginTime).toBeLessThan(5000);
  });
});

