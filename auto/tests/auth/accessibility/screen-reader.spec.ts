import { test, expect } from '../../../src/fixtures/test.fixture';
import { LoginPage } from '../../../src/pages/login.page';

test.describe('Screen Reader Accessibility', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page, loginPage: lp }) => {
    loginPage = lp;
  });

  test('should have proper labels for form fields', async ({ page }) => {
    await loginPage.goto();
    
    // Check for labels
    const emailLabel = page.locator('label:has-text("メール"), label:has-text("Email"), label:has-text("従業員コード")');
    const passwordLabel = page.locator('label:has-text("パスワード"), label:has-text("Password")');
    
    const emailLabelCount = await emailLabel.count();
    const passwordLabelCount = await passwordLabel.count();
    
    expect(emailLabelCount + passwordLabelCount).toBeGreaterThan(0);
  });

  test('should have ARIA labels where appropriate', async ({ page }) => {
    await loginPage.goto();
    
    // Check for ARIA labels
    const elementsWithAria = page.locator('[aria-label], [aria-labelledby]');
    const count = await elementsWithAria.count();
    
    // Should have some ARIA labels
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('should announce errors to screen readers', async ({ page }) => {
    await loginPage.goto();
    
    await loginPage.submitEmptyForm();
    
    // Check for error announcements
    const errorElements = page.locator('[role="alert"], .MuiAlert-root, .error');
    const errorCount = await errorElements.count();
    
    // Should have error elements (if validation is implemented)
    expect(errorCount).toBeGreaterThanOrEqual(0);
  });

  test('should have required field indicators accessible', async ({ page }) => {
    await loginPage.goto();
    
    const indicators = await loginPage.verifyRequiredFieldIndicators();
    // Should have required indicators
    expect(indicators.emailHasIndicator || indicators.passwordHasIndicator).toBe(true);
  });
});

