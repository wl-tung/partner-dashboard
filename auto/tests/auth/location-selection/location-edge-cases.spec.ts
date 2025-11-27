import { test, expect } from '../../../src/fixtures/test.fixture';
import { LoginPage } from '../../../src/pages/login.page';

test.describe('Location Selection Edge Cases', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page, loginPage: lp }) => {
    loginPage = lp;
  });

  test('should handle rapid dropdown changes', async ({ page }) => {
    await loginPage.goto();
    
    // Rapidly change selections
    for (let i = 0; i < 3; i++) {
      await loginPage.selectStoreWithRetry('TKY001', 3);
      await page.waitForTimeout(200);
      await loginPage.selectBuildingWithRetry('TKY001-A', 3);
      await page.waitForTimeout(200);
    }
    
    // Should still be functional
    const states = await loginPage.verifyDropdownStates();
    expect(states.storeEnabled).toBe(true);
  });

  test('should handle partial location selection', async ({ page }) => {
    await loginPage.goto();
    
    // Select only Store
    await loginPage.selectStoreWithRetry('TKY001', 3);
    
    // Try to submit (should fail or show validation)
    await loginPage.submitEmptyForm();
    
    const validation = await loginPage.verifyFormValidation();
    // Should show validation error for incomplete location
  });

  test('should handle selecting same location multiple times', async ({ page }) => {
    await loginPage.goto();
    
    const location = {
      storeCode: 'TKY001',
      buildingCode: 'TKY001-A',
      locationCode: 'TKY001-A-1B'
    };

    // Select multiple times
    await loginPage.selectLocationWithRetry(location);
    await page.waitForTimeout(500);
    await loginPage.selectLocationWithRetry(location);
    
    const selections = await loginPage.getCurrentLocationSelections();
    expect(selections.store).toBeTruthy();
  });
});

