import { test, expect } from '../../../src/fixtures/test.fixture';
import { test as authTest } from '../../../src/fixtures/auth.fixture';
import { LoginPage } from '../../../src/pages/login.page';
import { User } from '../../../src/types';
import { DataHelper } from '../../../src/helpers/data.helper';

test.describe('API Mocking & Error Handling', () => {
    let loginPage: LoginPage;
    let dataHelper: DataHelper;

    test.beforeEach(async ({ page, loginPage: lp }) => {
        loginPage = lp;
        dataHelper = new DataHelper();
    });

    authTest('should handle 500 server error gracefully', async ({ page, loginPage: lp }) => {
        loginPage = lp;
        const users = dataHelper.getTestUsers();
        const user: User = users.storeOwner;

        // Mock 500 error ONLY for API requests (fetch/xhr)
        await page.route('**/auth/login', async route => {
            if (['fetch', 'xhr'].includes(route.request().resourceType())) {
                await route.fulfill({
                    status: 500,
                    body: JSON.stringify({ message: 'Internal Server Error' })
                });
            } else {
                await route.continue();
            }
        });

        // Also mock /api/login just in case
        await page.route('**/api/login', async route => {
            if (['fetch', 'xhr'].includes(route.request().resourceType())) {
                await route.fulfill({
                    status: 500,
                    body: JSON.stringify({ message: 'Internal Server Error' })
                });
            } else {
                await route.continue();
            }
        });

        await loginPage.goto();
        await loginPage.login(user);

        // Verify error message is displayed
        await loginPage.verifyErrorMessage();
    });

    authTest('should handle network connection failure', async ({ page, loginPage: lp }) => {
        loginPage = lp;
        const users = dataHelper.getTestUsers();
        const user: User = users.storeOwner;

        // Mock network failure ONLY for API requests
        await page.route('**/auth/login', async route => {
            if (['fetch', 'xhr'].includes(route.request().resourceType())) {
                await route.abort('failed');
            } else {
                await route.continue();
            }
        });
        await page.route('**/api/login', async route => {
            if (['fetch', 'xhr'].includes(route.request().resourceType())) {
                await route.abort('failed');
            } else {
                await route.continue();
            }
        });

        await loginPage.goto();
        await loginPage.login(user);

        // Verify error message is displayed
        await loginPage.verifyErrorMessage();
    });

    authTest('should handle slow API response', async ({ page, loginPage: lp }) => {
        loginPage = lp;
        const users = dataHelper.getTestUsers();
        const user: User = users.storeOwner;

        // Mock slow response (3 seconds) ONLY for API requests
        await page.route('**/auth/login', async route => {
            if (['fetch', 'xhr'].includes(route.request().resourceType())) {
                await new Promise(resolve => setTimeout(resolve, 3000));
                await route.fulfill({
                    status: 200,
                    body: JSON.stringify({ token: 'fake-token' })
                });
            } else {
                await route.continue();
            }
        });

        await loginPage.goto();
        await loginPage.login(user);

        // Verify loading state (if applicable) or eventual success/failure
        // This test ensures the app doesn't crash or timeout too quickly
        // For now, we just ensure it doesn't throw an unhandled error
    });
});
