import { test, expect } from '../../../src/fixtures/test.fixture';
import { LoginPage } from '../../../src/pages/login.page';

test.describe('Login Page Visual Regression', () => {
    let loginPage: LoginPage;

    test.beforeEach(async ({ page, loginPage: lp }) => {
        loginPage = lp;
        await loginPage.goto();
    });

    test('should match initial login page snapshot', async ({ page }) => {
        await expect(page).toHaveScreenshot('login-page-initial.png', {
            fullPage: true,
            maxDiffPixelRatio: 0.05 // Allow small rendering differences
        });
    });

    test('should match filled login form snapshot', async ({ page }) => {
        await loginPage.fillWithVerificationSafe(loginPage.emailInput, 'test@example.com');
        await loginPage.fillWithVerificationSafe(loginPage.passwordInput, 'password123');

        // Wait for animations to settle
        await page.waitForTimeout(500);

        await expect(page).toHaveScreenshot('login-page-filled.png', {
            fullPage: true,
            mask: [loginPage.emailInput, loginPage.passwordInput] // Mask inputs as cursor might blink
        });
    });

    test('should match error state snapshot', async ({ page }) => {
        // Trigger error
        await loginPage.loginWithEmail('wrong@example.com', 'wrong', {
            storeCode: 'TKY001',
            buildingCode: 'TKY001-A',
            locationCode: 'TKY001-A-1B'
        });

        await loginPage.verifyErrorMessage();

        // Wait for error animation
        await page.waitForTimeout(500);

        await expect(page).toHaveScreenshot('login-page-error.png', {
            fullPage: true
        });
    });
});
