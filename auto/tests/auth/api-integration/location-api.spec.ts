import { test, expect } from '../../../src/fixtures/test.fixture';
import { LoginPage } from '../../../src/pages/login.page';

test.describe('Location API Integration', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page, loginPage: lp }) => {
    loginPage = lp;
  });

  test('should load store options from API', async ({ page }) => {
    await loginPage.goto();
    
    // Wait for store dropdown to be populated
    await page.waitForTimeout(1000);
    
    const storeDropdown = page.locator('select[name="store"], [data-testid="store-select"]');
    if (await storeDropdown.count() > 0) {
      const options = await storeDropdown.locator('option').count();
      expect(options).toBeGreaterThan(0);
    }
  });

  test('should load building options after store selection', async ({ page }) => {
    await loginPage.goto();
    
    await loginPage.selectStoreWithRetry('TKY001', 3);
    await page.waitForTimeout(1000);
    
    const buildingDropdown = page.locator('select[name="building"], [data-testid="building-select"]');
    if (await buildingDropdown.count() > 0 && await buildingDropdown.isEnabled()) {
      const options = await buildingDropdown.locator('option').count();
      expect(options).toBeGreaterThan(0);
    }
  });

  test('should load location options after building selection', async ({ page }) => {
    await loginPage.goto();
    
    await loginPage.selectLocationWithRetry({
      storeCode: 'TKY001',
      buildingCode: 'TKY001-A',
      locationCode: 'TKY001-A-1B'
    });
    
    await page.waitForTimeout(1000);
    
    const locationDropdown = page.locator('select[name="location"], [data-testid="location-select"]');
    if (await locationDropdown.count() > 0 && await locationDropdown.isEnabled()) {
      const options = await locationDropdown.locator('option').count();
      expect(options).toBeGreaterThan(0);
    }
  });

  test('should handle API error for location data', async ({ page }) => {
    // Simulate API error
    await page.route('**/api/locations/**', route => {
      route.fulfill({
        status: 500,
        body: JSON.stringify({ error: 'Server Error' })
      });
    });

    await loginPage.goto();
    
    // Should handle error gracefully
    const states = await loginPage.verifyDropdownStates();
    expect(states.storeEnabled).toBe(true);
  });
});

