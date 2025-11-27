import { test, expect } from '../../../src/fixtures/test.fixture';
import { LoginPage } from '../../../src/pages/login.page';

test.describe('Cascading Dropdowns', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page, loginPage: lp }) => {
    loginPage = lp;
  });

  test('should enable Building dropdown after Store selection', async ({ page }) => {
    await loginPage.goto();
    
    const statesBefore = await loginPage.verifyDropdownStates();
    expect(statesBefore.buildingEnabled).toBe(false);
    expect(statesBefore.locationEnabled).toBe(false);

    // Select Store
    await loginPage.selectLocationWithRetry({
      storeCode: 'TKY001',
      buildingCode: 'TKY001-A',
      locationCode: 'TKY001-A-1B'
    });

    await page.waitForTimeout(500);
    const statesAfter = await loginPage.verifyDropdownStates();
    expect(statesAfter.buildingEnabled).toBe(true);
  });

  test('should enable Location dropdown after Building selection', async ({ page }) => {
    await loginPage.goto();
    
    // Select Store and Building
    await loginPage.selectLocationWithRetry({
      storeCode: 'TKY001',
      buildingCode: 'TKY001-A',
      locationCode: 'TKY001-A-1B'
    });

    await page.waitForTimeout(500);
    const states = await loginPage.verifyDropdownStates();
    expect(states.locationEnabled).toBe(true);
  });

  test('should disable Building dropdown initially', async ({ page }) => {
    await loginPage.goto();
    
    const states = await loginPage.verifyDropdownStates();
    expect(states.buildingEnabled).toBe(false);
  });

  test('should disable Location dropdown initially', async ({ page }) => {
    await loginPage.goto();
    
    const states = await loginPage.verifyDropdownStates();
    expect(states.locationEnabled).toBe(false);
  });

  test('should disable Location dropdown when only Store is selected', async ({ page }) => {
    await loginPage.goto();
    
    // Select only Store
    await loginPage.selectStoreWithRetry('TKY001', 3);
    
    await page.waitForTimeout(500);
    const states = await loginPage.verifyDropdownStates();
    expect(states.locationEnabled).toBe(false);
  });

  test('should load Building options based on selected Store', async ({ page }) => {
    await loginPage.goto();
    
    await loginPage.selectStoreWithRetry('TKY001', 3);
    await page.waitForTimeout(500);
    
    const states = await loginPage.verifyDropdownStates();
    expect(states.buildingEnabled).toBe(true);
  });

  test('should load Location options based on selected Building', async ({ page }) => {
    await loginPage.goto();
    
    await loginPage.selectLocationWithRetry({
      storeCode: 'TKY001',
      buildingCode: 'TKY001-A',
      locationCode: 'TKY001-A-1B'
    });
    
    await page.waitForTimeout(500);
    const states = await loginPage.verifyDropdownStates();
    expect(states.locationEnabled).toBe(true);
  });
});

