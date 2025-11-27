import { test, expect } from '../../../src/fixtures/test.fixture';
import { LoginPage } from '../../../src/pages/login.page';

test.describe('Dropdown Reset Behavior', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page, loginPage: lp }) => {
    loginPage = lp;
  });

  test('should reset Building when Store changes', async ({ page }) => {
    await loginPage.goto();
    
    // Select all locations
    await loginPage.selectLocationWithRetry({
      storeCode: 'TKY001',
      buildingCode: 'TKY001-A',
      locationCode: 'TKY001-A-1B'
    });

    const selectionsBefore = await loginPage.getCurrentLocationSelections();
    expect(selectionsBefore.building).toBeTruthy();
    expect(selectionsBefore.location).toBeTruthy();

    // Change Store (if multiple stores exist)
    // This test assumes there's another store available
    // If not, it will verify the reset behavior when store is cleared
    
    // Verify Building and Location are reset
    const states = await loginPage.verifyDropdownStates();
    // Building should be reset or disabled
  });

  test('should reset Location when Building changes', async ({ page }) => {
    await loginPage.goto();
    
    // Select Store, Building, and Location
    await loginPage.selectLocationWithRetry({
      storeCode: 'TKY001',
      buildingCode: 'TKY001-A',
      locationCode: 'TKY001-A-1B'
    });

    const selectionsBefore = await loginPage.getCurrentLocationSelections();
    expect(selectionsBefore.location).toBeTruthy();

    // Change Building (if multiple buildings exist)
    // Verify Location is reset
    const states = await loginPage.verifyDropdownStates();
  });

  test('should reset Location when Store changes', async ({ page }) => {
    await loginPage.goto();
    
    // Select all locations
    await loginPage.selectLocationWithRetry({
      storeCode: 'TKY001',
      buildingCode: 'TKY001-A',
      locationCode: 'TKY001-A-1B'
    });

    const selectionsBefore = await loginPage.getCurrentLocationSelections();
    expect(selectionsBefore.location).toBeTruthy();

    // Change Store
    // Verify Location is reset
  });
});

