import { test, expect } from '../../src/fixtures/test.fixture';
import { test as authTest } from '../../src/fixtures/auth.fixture';
import { DashboardPage } from '../../src/pages/dashboard.page';

test.describe('Dashboard Navigation Menu Behavior', () => {
    let dashboardPage: DashboardPage;

    test.beforeEach(async ({ page, dashboardPage: dp }) => {
        dashboardPage = dp;
    });

    authTest('should expand and collapse Order Management menu', async ({ authenticatedPage, dashboardPage: dp }) => {
        dashboardPage = dp;
        await dashboardPage.goto();

        // Initial state: Sub-menu link should not be visible (or at least not interactable if hidden)
        // Note: Depending on implementation, it might be hidden via CSS or not in DOM. 
        // We'll check for visibility.
        const orderListLink = dp.page.getByRole('link', { name: /注文一覧|Order List/i });

        // If it's visible initially, we might be in a state where it's already expanded or the logic is different.
        // But based on observation, we need to click to expand.
        // Let's verify the button exists
        const ordersButton = dp.ordersButton;
        await expect(ordersButton).toBeVisible();

        // Click to expand
        await ordersButton.click();
        await dp.page.waitForTimeout(500); // Animation wait

        // Verify sub-link is visible
        await expect(orderListLink).toBeVisible();

        // Click again to collapse (if that's the behavior, usually it is togglable)
        await ordersButton.click();
        await dp.page.waitForTimeout(500);

        // Verify sub-link is hidden or detached
        await expect(orderListLink).not.toBeVisible();
    });

    authTest('should expand and collapse Customer Management menu', async ({ authenticatedPage, dashboardPage: dp }) => {
        dashboardPage = dp;
        await dashboardPage.goto();

        const customerListLink = dp.page.getByRole('link', { name: /顧客一覧|Customer List/i });
        const customersButton = dp.customersButton;

        await expect(customersButton).toBeVisible();

        // Click to expand
        await customersButton.click();
        await dp.page.waitForTimeout(500);

        // Verify sub-link is visible
        await expect(customerListLink).toBeVisible();

        // Click again to collapse
        await customersButton.click();
        await dp.page.waitForTimeout(500);

        // Verify sub-link is hidden
        await expect(customerListLink).not.toBeVisible();
    });
});
