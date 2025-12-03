import { test, expect } from '../../../src/fixtures/test.fixture';
import { test as authTest } from '../../../src/fixtures/auth.fixture';
import { OrderCreationPage } from '../../../src/pages/order-creation.page';

test.describe('Order Creation - Happy Path', () => {
    let orderCreationPage: OrderCreationPage;

    test.beforeEach(async ({ page }) => {
        orderCreationPage = new OrderCreationPage(page);
    });

    authTest('should load order creation page', async ({ authenticatedPage, page }) => {
        orderCreationPage = new OrderCreationPage(page);

        await orderCreationPage.goto();
        await orderCreationPage.verifyOrderCreationPageLoaded();

        // Verify URL
        await expect(page).toHaveURL(/\/orders\/create/);
    });

    authTest('should have 3 tabs visible', async ({ authenticatedPage, page }) => {
        orderCreationPage = new OrderCreationPage(page);

        await orderCreationPage.goto();

        // Verify all 3 tabs exist
        const orderInfoTab = page.getByRole('tab', { name: /注文情報|Order Info/i });
        const deliveryInfoTab = page.getByRole('tab', { name: /お届け情報|Delivery Info/i });
        const paymentInfoTab = page.getByRole('tab', { name: /決済情報|Payment Info/i });

        await expect(orderInfoTab).toBeVisible();
        await expect(deliveryInfoTab).toBeVisible();
        await expect(paymentInfoTab).toBeVisible();
    });

    authTest('should select customer successfully', async ({ authenticatedPage, page }) => {
        orderCreationPage = new OrderCreationPage(page);

        await orderCreationPage.goto();

        // Open customer selection modal
        await orderCreationPage.openCustomerSelectionModal();

        // Select first customer
        await orderCreationPage.selectCustomer(0);

        // Verify customer is selected
        await orderCreationPage.verifyCustomerSelected();

        const customerInfo = await orderCreationPage.getSelectedCustomerInfo();
        console.log('Selected Customer:', customerInfo);

        // Verify customer name is populated
        expect(customerInfo.name).toBeTruthy();
    });

    authTest.skip('should complete full order creation flow', async ({ authenticatedPage, page }) => {
        orderCreationPage = new OrderCreationPage(page);

        await orderCreationPage.goto();

        // Step 1: Select customer
        console.log('Step 1: Selecting customer...');
        await orderCreationPage.openCustomerSelectionModal();
        await orderCreationPage.selectCustomer(0);
        await orderCreationPage.verifyCustomerSelected();

        // Step 2: Navigate to Delivery Info tab
        console.log('Step 2: Navigating to Delivery Info...');
        await orderCreationPage.clickDeliveryInfoTab();

        // Step 3: Add product
        console.log('Step 3: Adding product...');
        await orderCreationPage.openProductSelectionModal();
        await orderCreationPage.addProduct(0);
        await orderCreationPage.closeProductModal();

        // Verify product added
        const products = await orderCreationPage.getAddedProducts();
        console.log('Added Products:', products);
        expect(products.length).toBeGreaterThan(0);

        // Step 4: Navigate to Payment Info tab (if enabled)
        console.log('Step 4: Checking Payment Info tab...');
        const paymentTabEnabled = await orderCreationPage.isTabEnabled('決済情報');
        if (paymentTabEnabled) {
            await orderCreationPage.clickPaymentInfoTab();
        }

        console.log('Order creation flow completed successfully!');
    });

    authTest.skip('should add multiple products', async ({ authenticatedPage, page }) => {
        orderCreationPage = new OrderCreationPage(page);

        await orderCreationPage.goto();

        // Select customer first
        await orderCreationPage.openCustomerSelectionModal();
        await orderCreationPage.selectCustomer(0);

        // Navigate to Delivery Info
        await orderCreationPage.clickDeliveryInfoTab();

        // Add first product
        await orderCreationPage.openProductSelectionModal();
        await orderCreationPage.addProduct(0);
        await orderCreationPage.closeProductModal();

        // Add second product
        await orderCreationPage.openProductSelectionModal();
        await orderCreationPage.addProduct(1);
        await orderCreationPage.closeProductModal();

        // Verify 2 products added
        const products = await orderCreationPage.getAddedProducts();
        console.log(`Added ${products.length} products`);
        expect(products.length).toBeGreaterThanOrEqual(2);
    });
});
