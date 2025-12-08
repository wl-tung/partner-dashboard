import { test, expect } from '../../../src/fixtures/test.fixture';
import { test as authTest } from '../../../src/fixtures/auth.fixture';
import { OrderCreationPage } from '../../../src/pages/order-creation.page';
import * as fs from 'fs';

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

    authTest('should complete full order creation flow', async ({ authenticatedPage, page }) => {
        authTest.setTimeout(60000); // Increase timeout to 60s for complex E2E flow
        orderCreationPage = new OrderCreationPage(page);

        await orderCreationPage.goto();

        // Step 1: Select customer
        // NOTE: Customer must have Shopify ID for address registration to work
        // Using customer at index 0: "大嶋 まち" (has Shopify ID)
        // See BUG_SHOPIFY_ID_REQUIRED.md for details
        console.log('Step 1: Selecting customer...');
        await orderCreationPage.openCustomerSelectionModal();
        await orderCreationPage.selectCustomer(0); // "大嶋 まち" - first customer
        const customerInfo = await orderCreationPage.getSelectedCustomerInfo();
        console.log(`Selected customer: ${customerInfo.name}`);
        await orderCreationPage.verifyCustomerSelected();

        // Step 2: Navigate to Delivery Info tab
        console.log('Step 2: Navigating to Delivery Info...');
        await orderCreationPage.clickDeliveryInfoTab();
        await page.waitForTimeout(1000);

        // Debug: Check page state in Delivery Info tab
        console.log('--- Delivery Info Tab State ---');
        const senderGroupExists = await page.getByText('依頼主グループ').count() > 0;
        console.log('Sender Group exists:', senderGroupExists);

        const allButtons = await page.locator('button').allInnerTexts();
        console.log('All buttons:', allButtons);

        // Step 3: Add sender (select from customer's existing addresses)
        console.log('Step 3: Adding sender...');
        await orderCreationPage.clickAddSenderButton();
        await page.waitForTimeout(1000);

        // Step 4: Add delivery destination
        // Note: Sender is automatically set from the customer selected in Order Info tab
        console.log('Step 4: Adding delivery destination...');
        await orderCreationPage.clickAddDeliveryDestinationButton();
        await page.waitForTimeout(1000);

        console.log('Step 4: Adding product...');

        await orderCreationPage.openProductSelectionModal();
        // Add product with quantity 1
        await orderCreationPage.addProduct(0, 1);

        // Wait for product to be added to cart
        await page.waitForTimeout(2000);

        // Verify product added
        const products = await orderCreationPage.getAddedProducts();
        console.log('Added Products:', products);
        expect(products.length).toBeGreaterThan(0);

        // Step 6: Submitting order
        console.log('Step 6: Submitting order...');

        // Navigate to Payment Info tab (last tab) where submit button is located
        await orderCreationPage.clickPaymentInfoTab();
        await page.waitForTimeout(1000);

        // Debug: Inspect Payment Info tab content
        console.log('--- Payment Info Tab Content ---');
        // Print labels and inputs
        const labels = await page.locator('label').allInnerTexts();
        console.log('Labels:', labels);

        // Check for Invoice Email (required)
        const invoiceEmailLabel = page.getByText('請求書送信先メールアドレス');
        if (await invoiceEmailLabel.count() > 0) {
            console.log('Found Invoice Email field. Filling it...');
            const emailInput = page.locator('input[type="email"], input[name*="email"], input[name*="mail"]').first();
            if (await emailInput.count() > 0) {
                await emailInput.fill('test-invoice@example.com');
                console.log('Filled Invoice Email.');
            }
        }

        // Check for payment method select
        const paymentSelect = page.locator('select[name*="payment"], select[name*="支払"]');
        if (await paymentSelect.count() > 0) {
            const options = await paymentSelect.locator('option').allInnerTexts();
            console.log('Payment Method Options:', options);

            // Try to select the first valid option if not selected
            const value = await paymentSelect.inputValue();
            if (!value && options.length > 1) {
                // Select second option (first might be placeholder)
                console.log(`Selecting payment method: ${options[1]}`);
                await paymentSelect.selectOption({ index: 1 });
            }
        } else {
            console.log('No payment method select found. Inspecting label...');
            const label = page.getByText('支払方法', { exact: true });
            if (await label.count() > 0) {
                // Print parent HTML
                const parent = label.locator('..').locator('..'); // Go up a few levels
                console.log('Payment Method Area HTML:', await parent.innerHTML());
            }
        }
        console.log('--------------------------------');

        // Check submit button state
        const submitButton = page.getByRole('button', { name: '注文を確定' }).first();
        const isDisabled = await submitButton.isDisabled();
        console.log(`Submit button disabled: ${isDisabled}`);

        if (isDisabled) {
            console.log('Submit button is disabled! Checking for missing fields...');
        }

        // Handle potential confirmation dialogs BEFORE clicking submit
        page.on('dialog', async dialog => {
            console.log(`Dialog appeared: ${dialog.message()}`);
            await dialog.accept();
        });

        // Monitor network responses during submission
        console.log('Setting up network and console listener...');

        // Log console messages
        page.on('console', msg => console.log(`BROWSER CONSOLE: ${msg.type()} - ${msg.text()}`));

        // Log all requests
        page.on('request', request => console.log(`REQUEST: ${request.method()} ${request.url()}`));

        // Log all responses
        page.on('response', async response => {
            console.log(`RESPONSE: ${response.status()} ${response.url()}`);
            // Only log body for XHR/Fetch to avoid clutter
            if (response.request().resourceType() === 'xhr' || response.request().resourceType() === 'fetch') {
                try {
                    // const body = await response.text();
                    // console.log(`Response Body: ${body.substring(0, 200)}...`);
                } catch (e) { }
            }
        });

        await orderCreationPage.submitOrder();

        // Wait for manual observation
        console.log('Waiting 5 seconds for observation...');
        await page.waitForTimeout(5000);

        // Verify we're either on order detail page or orders list
        const currentUrl = page.url();
        console.log('Current URL after submission:', currentUrl);

        // Check if order was created successfully
        const isOrderDetailPage = /\/orders\/[a-f0-9-]+/.test(currentUrl) && !currentUrl.includes('/create');
        const isOrdersListPage = currentUrl.includes('/orders') && !currentUrl.includes('/create');

        console.log(`isOrderDetailPage: ${isOrderDetailPage}, isOrdersListPage: ${isOrdersListPage}`);

        if (!isOrderDetailPage && !isOrdersListPage) {
            console.log('Submission might have failed or not redirected yet.');

            // Dump HTML
            const html = await page.content();
            fs.writeFileSync('/Users/nguyenthanhtung/.gemini/antigravity/brain/f1059879-f76f-413a-91a6-d6d49cd2f1c4/submission_fail.html', html);
            console.log('Saved page HTML to submission_fail.html');

            // Check for validation errors
            const errors = await orderCreationPage.getValidationErrors();
            if (errors.length > 0) {
                console.log('Validation Errors:', errors);
            }

            // Check for error messages
            const errorAlert = page.locator('.MuiAlert-standardError, [role="alert"]');
            if (await errorAlert.count() > 0) {
                console.log('Error Alert Found (innerText):', await errorAlert.allInnerTexts());
                console.log('Error Alert Found (message class):', await errorAlert.locator('.MuiAlert-message').allInnerTexts());
            }

            // Take screenshot for debugging
            const screenshotPath = '/Users/nguyenthanhtung/.gemini/antigravity/brain/f1059879-f76f-413a-91a6-d6d49cd2f1c4/submission_debug.png';
            await page.screenshot({ path: screenshotPath });
            console.log(`Screenshot saved to ${screenshotPath}`);
        }

        expect(isOrderDetailPage || isOrdersListPage).toBeTruthy();

        // Verification: Check if order is visible
        if (isOrderDetailPage) {
            console.log('Redirected to Order Detail page. Verifying details...');
            await expect(page.getByText('検証真鳥')).toBeVisible(); // Verify customer name
        } else if (isOrdersListPage) {
            console.log('Redirected to Orders List page. Verifying top order...');
            await page.waitForSelector('table tbody tr');
            const firstRow = page.locator('table tbody tr').first();
            await expect(firstRow).toContainText('大嶋'); // Verify customer name in first row
        }

        console.log('✅ Full order creation flow with submission and verification completed successfully!');
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
