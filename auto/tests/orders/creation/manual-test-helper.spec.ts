import { test } from '@playwright/test';
import { test as authTest } from '../../../src/fixtures/auth.fixture';
import { OrderCreationPage } from '../../../src/pages/order-creation.page';

/**
 * Manual Test Helper
 * 
 * This script automates the navigation to order creation page,
 * then pauses for manual testing.
 * 
 * Usage:
 *   npm test tests/orders/creation/manual-test-helper.spec.ts -- --headed --project=chromium
 * 
 * After running:
 * 1. Browser will open and navigate to order creation page
 * 2. Browser will pause (you'll see Playwright Inspector)
 * 3. Perform manual test steps from ORDER_CREATION_MANUAL_TESTS.md
 * 4. Click Resume in Playwright Inspector when done
 */

test.describe('Order Creation - Manual Test Helper', () => {

    authTest('Navigate to Order Creation for Manual Testing', async ({ authenticatedPage, page }) => {
        const orderCreationPage = new OrderCreationPage(page);

        console.log('🚀 Starting manual test helper...');

        // Navigate to order creation page
        await orderCreationPage.goto();

        // Verify page loaded
        await orderCreationPage.verifyOrderCreationPageLoaded();

        console.log('✅ Order creation page loaded successfully');
        console.log('📍 URL:', page.url());
        console.log('');
        console.log('🎯 Ready for manual testing!');
        console.log('📋 Follow test cases in ORDER_CREATION_MANUAL_TESTS.md');
        console.log('⏸️  Browser will pause now - use Playwright Inspector to control');
        console.log('');

        // Pause for manual testing
        // Click "Resume" in Playwright Inspector when done
        await page.pause();

        console.log('✅ Manual testing session complete');
    });

    authTest('Quick Navigation - Customer Selection', async ({ authenticatedPage, page }) => {
        const orderCreationPage = new OrderCreationPage(page);

        await orderCreationPage.goto();

        // Open customer modal automatically
        await orderCreationPage.openCustomerSelectionModal();

        console.log('✅ Customer selection modal opened');
        console.log('👉 Now manually select a customer');

        await page.pause();
    });

    authTest('Quick Navigation - Product Selection', async ({ authenticatedPage, page }) => {
        const orderCreationPage = new OrderCreationPage(page);

        await orderCreationPage.goto();

        // Select first customer automatically
        await orderCreationPage.openCustomerSelectionModal();
        await orderCreationPage.selectCustomer(0);

        // Navigate to delivery tab
        await orderCreationPage.clickDeliveryInfoTab();

        // Open product modal
        await orderCreationPage.openProductSelectionModal();

        console.log('✅ Product selection modal opened');
        console.log('👉 Now manually add products');

        await page.pause();
    });
});
