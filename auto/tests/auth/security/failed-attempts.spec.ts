import { test, expect } from '../../../src/fixtures/test.fixture';
import { LoginPage } from '../../../src/pages/login.page';

test.describe('Failed Login Attempts', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page, loginPage: lp }) => {
    loginPage = lp;
  });

  test('should handle single failed login attempt', async ({ page }) => {
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

    await loginPage.verifyErrorMessage();
    await expect(page).toHaveURL(/.*\/auth\/login/);
  });

  test('should handle multiple consecutive failed attempts', async ({ page }) => {
    await loginPage.goto();
    
    for (let i = 1; i <= 3; i++) {
      await loginPage.loginWithEmail(
        'wrong@example.com',
        `wrong${i}`,
        {
          storeCode: 'TKY001',
          buildingCode: 'TKY001-A',
          locationCode: 'TKY001-A-1B'
        }
      );
      await loginPage.verifyErrorMessage();
      await page.waitForTimeout(500);
    }

    // Should still be on login page
    await expect(page).toHaveURL(/.*\/auth\/login/);
  });

  test('should show appropriate error message after failed attempts', async ({ page }) => {
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

    const errorElement = page.locator('.error, .MuiAlert-root, [role="alert"]');
    await expect(errorElement).toBeVisible();
    
    const errorText = await errorElement.textContent();
    expect(errorText).toBeTruthy();
  });

  test('should allow retry after failed attempt', async ({ page }) => {
    await loginPage.goto();
    
    // First failed attempt
    await loginPage.loginWithEmail(
      'wrong@example.com',
      'wrongpassword',
      {
        storeCode: 'TKY001',
        buildingCode: 'TKY001-A',
        locationCode: 'TKY001-A-1B'
      }
    );
    await loginPage.verifyErrorMessage();

    // Should be able to try again
    await loginPage.verifyLoginPage();
    const states = await loginPage.verifyDropdownStates();
    expect(states.storeEnabled).toBe(true);
  });
});

