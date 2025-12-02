import { test, expect } from '../../../src/fixtures/auth.fixture';
import { DashboardPage } from '../../../src/pages/dashboard.page';

test.describe('Dashboard Visual Regression', () => {
    let dashboardPage: DashboardPage;

    test.beforeEach(async ({ page, dashboardPage: dp }) => {
        dashboardPage = dp;
        // Note: authenticatedPage fixture is not used here because we want manual control 
        // over the login process if needed, or we can use the auth fixture but we need 
        // to be careful about dynamic content.
        // For visual tests, using the auth fixture is fine as long as we wait for stability.
    });

    test('should match dashboard initial state snapshot', async ({ authenticatedPage, dashboardPage: dp }) => {
        dashboardPage = dp;
        await dashboardPage.goto();

        // Wait for any animations or data loading
        await dp.page.waitForTimeout(2000);

        // Mask dynamic elements like dates or specific numbers if they change frequently
        // For now, we'll capture the full page but might need to mask the activity feed or specific KPIs
        await expect(dp.page).toHaveScreenshot('dashboard-initial.png', {
            fullPage: true,
            maxDiffPixelRatio: 0.05,
            mask: [
                dp.page.locator('.activity-feed'), // Mask activity feed as it might change
                dp.page.locator('text=Last Login') // Mask last login time
            ]
        });
    });

    test('should match navigation menu expanded snapshot', async ({ authenticatedPage, dashboardPage: dp }) => {
        dashboardPage = dp;
        await dashboardPage.goto();

        // Expand Order Management
        await dp.ordersButton.click();
        await dp.page.waitForTimeout(500);

        await expect(dp.page).toHaveScreenshot('dashboard-menu-expanded.png', {
            fullPage: true,
            maxDiffPixelRatio: 0.05,
            mask: [
                dp.page.locator('.activity-feed'),
                dp.page.locator('text=Last Login')
            ]
        });
    });
});
