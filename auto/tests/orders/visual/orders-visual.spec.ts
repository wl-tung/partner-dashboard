import { test, expect } from '../../../src/fixtures/auth.fixture';
import { OrdersPage } from '../../../src/pages/orders.page';

test.describe('Orders Visual Regression', () => {
    let ordersPage: OrdersPage;

    test.beforeEach(async ({ page, ordersPage: op }) => {
        ordersPage = op;
    });

    test('should match orders list snapshot', async ({ authenticatedPage, ordersPage: op }) => {
        ordersPage = op;
        await ordersPage.goto();

        // Mask dynamic content
        // We mask the entire table body if data changes frequently, 
        // or specific columns like dates/IDs
        await expect(op.page).toHaveScreenshot('orders-list.png', {
            fullPage: true,
            maxDiffPixelRatio: 0.05,
            mask: [
                op.page.locator('tbody'), // Mask rows as data is dynamic
                op.page.locator('.MuiPagination-root') // Mask pagination as it might change
            ]
        });
    });
});
