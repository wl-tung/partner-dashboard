import { Page, expect, Locator } from '@playwright/test';
import { BasePage } from './base.page';

/**
 * Customer information interface
 */
export interface CustomerInfo {
    name: string;
    email: string;
    phone: string;
    address?: string;
}

/**
 * Product information interface
 */
export interface Product {
    name: string;
    quantity: number;
    price?: string;
}

/**
 * Address information interface
 */
export interface Address {
    postalCode?: string;
    prefecture?: string;
    city?: string;
    street?: string;
    building?: string;
}

/**
 * Order Creation Page Object
 * Handles the 3-tab order creation flow with modal interactions
 * ENHANCED: Uses flexible selectors and smart waits for complex form
 */
export class OrderCreationPage extends BasePage {

    constructor(page: Page) {
        super(page);
    }

    /**
     * Navigate to order creation page
     */
    async goto(): Promise<void> {
        await super.goto('/orders/create');
        await this.waitForOrderCreationPageLoaded();
    }

    /**
     * Wait for order creation page to be fully loaded
     */
    async waitForOrderCreationPageLoaded(): Promise<void> {
        // Wait for URL
        await this.page.waitForURL(/.*\/orders\/create/);

        // Wait for network idle
        await this.page.waitForLoadState('networkidle');

        // Wait for main form to be visible
        const form = this.page.locator('form, main, [role="main"]').first();
        await form.waitFor({ state: 'visible', timeout: 10000 });

        // Wait a bit for rendering
        await this.page.waitForTimeout(500);
    }

    // ============ Tab Navigation ============

    /**
     * Click on Order Info tab (注文情報)
     */
    async clickOrderInfoTab(): Promise<void> {
        const tab = this.page.getByRole('tab', { name: /注文情報|Order Info/i });
        await tab.click();
        await this.page.waitForTimeout(300);
    }

    /**
     * Click on Delivery Info tab (お届け情報)
     */
    async clickDeliveryInfoTab(): Promise<void> {
        const tab = this.page.getByRole('tab', { name: /お届け情報|Delivery Info/i });
        await tab.click();
        await this.page.waitForTimeout(300);
    }

    /**
     * Click on Payment Info tab (決済情報)
     */
    async clickPaymentInfoTab(): Promise<void> {
        const tab = this.page.getByRole('tab', { name: /決済情報|Payment Info/i });
        await tab.click();
        await this.page.waitForTimeout(300);
    }

    /**
     * Check if a tab is enabled
     */
    async isTabEnabled(tabName: string): Promise<boolean> {
        const tab = this.page.getByRole('tab', { name: new RegExp(tabName, 'i') });
        const isDisabled = await tab.getAttribute('aria-disabled');
        return isDisabled !== 'true';
    }

    // ============ Customer Selection ============

    /**
     * Open customer selection modal
     */
    async openCustomerSelectionModal(): Promise<void> {
        const button = this.page.getByRole('button', { name: /注文者選択|Select.*Customer/i });
        await button.click();
        await this.waitForModalOpen();
    }

    /**
     * Search for customer in modal
     */
    async searchCustomer(query: string): Promise<void> {
        const searchInput = this.page.locator('input[type="search"], input[placeholder*="検索"]').first();
        await searchInput.fill(query);
        await this.page.waitForTimeout(500); // Wait for search results
    }

    /**
   * Select customer from modal by index
   */
    async selectCustomer(index: number = 0): Promise<void> {
        // Wait for modal to be fully loaded
        await this.page.waitForTimeout(1000);

        // Customers are displayed as MuiCard components
        // Actual DOM: <div class="MuiCard-root mui-zbpjio">
        const modal = this.page.locator('[role="dialog"]');
        const customerCards = modal.locator('.MuiCard-root.mui-zbpjio, .MuiCard-root');

        const count = await customerCards.count();
        console.log(`Found ${count} customer cards in modal`);

        if (count > index) {
            await customerCards.nth(index).click();
            await this.waitForModalClose();
        } else {
            throw new Error(`Customer index ${index} out of range (found ${count} customers)`);
        }
    }

    /**
   * Get selected customer information from form
   */
    async getSelectedCustomerInfo(): Promise<CustomerInfo> {
        // Wait for form to populate
        await this.page.waitForTimeout(1500);

        // Simpler approach: find the label, then get the next p tag
        // DOM: <span>注文者氏名</span> followed by <p>藤田 和也</p>

        const name = await this.page
            .getByText('注文者氏名', { exact: true })
            .locator('xpath=following-sibling::p')
            .first()
            .innerText()
            .catch(() => '');

        const email = await this.page
            .getByText('メールアドレス', { exact: true })
            .locator('xpath=following-sibling::p')
            .first()
            .innerText()
            .catch(() => '');

        const phone = await this.page
            .getByText('注文者電話番号', { exact: true })
            .locator('xpath=following-sibling::p')
            .first()
            .innerText()
            .catch(() => '');

        console.log('Extracted customer info - Name:', name, 'Email:', email, 'Phone:', phone);

        return {
            name,
            email,
            phone
        };
    }

    // ============ Product Selection ============

    /**
     * Open product selection modal
     */
    async openProductSelectionModal(): Promise<void> {
        const selectProductBtn = this.page.locator('button').filter({ hasText: '商品を選択' }).first();

        if (await selectProductBtn.count() > 0 && await selectProductBtn.isVisible()) {
            console.log('Found "Select Product" (商品を選択) button. Clicking it...');
            await selectProductBtn.click();
        } else {
            console.log('"Select Product" button not found or not visible.');
            console.log('Falling back to "Add Product" (商品を追加) button...');
            const button = this.page.getByRole('button', { name: '商品を追加' });
            await button.click();
        }
        await this.waitForModalOpen();
    }

    /**
   * Add product from modal by index
   */
    async addProduct(index: number = 0, quantity: number = 1): Promise<void> {
        // Wait for modal to be fully loaded
        await this.page.waitForTimeout(1000);

        // Products use card structure
        const modal = this.page.locator('[role="dialog"]');
        const productCards = modal.locator('.MuiCard-root');

        const count = await productCards.count();
        console.log(`Found ${count} product cards in modal`);

        if (count > index) {
            const card = productCards.nth(index);

            // Set quantity if needed (default is 1)
            if (quantity !== 1) {
                const quantityInput = card.locator('input[type="number"]');
                if (await quantityInput.count() > 0) {
                    await quantityInput.fill(quantity.toString());
                    await this.page.waitForTimeout(200);
                }
            }

            // Find the right modal - use the last one as it's likely the top-most
            const modals = this.page.locator('[role="dialog"]');
            const modalCount = await modals.count();
            console.log(`Found ${modalCount} modals`);
            const modal = modals.last();

            // Debug: Print modal title
            const title = await modal.locator('h2').first().innerText();
            console.log(`Top-most modal title: "${title}"`);

            // Debug: Print all buttons in the modal to see what we have
            const allButtons = modal.locator('button');
            const btnCount = await allButtons.count();
            console.log(`Found ${btnCount} buttons in the top-most modal:`);
            for (let i = 0; i < btnCount; i++) {
                const text = await allButtons.nth(i).innerText();
                console.log(`- Button ${i}: "${text}"`);
            }

            // Find the confirmation button using regex
            const confirmButton = modal.locator('button').filter({ hasText: /商品を追加|Add/ }).first();

            // NEW LOGIC: Check for "追加" (Add) buttons on cards (Alternative UI state)
            const addButtons = modal.locator('button').filter({ hasText: /^追加$/ }); // Exact match to avoid partials if needed
            const addButtonCount = await addButtons.count();

            if (addButtonCount > 0 && await confirmButton.count() === 0) {
                console.log(`Detected ${addButtonCount} "Add" (追加) buttons on cards. This is the 'Quick Add' UI.`);

                // Click the first Add button
                console.log('Clicking the first "Add" button...');
                await addButtons.first().click();
                await this.page.waitForTimeout(1000);

                // Check if modal is still open
                if (await modal.isVisible()) {
                    console.log('Modal still open. Looking for "Close" (閉じる) button...');
                    const closeButton = modal.locator('button').filter({ hasText: '閉じる' }).first();
                    if (await closeButton.count() > 0) {
                        console.log('Clicking "Close" button...');
                        await closeButton.click();
                    } else {
                        console.log('No "Close" button found. Assuming modal closes automatically or we need to click outside.');
                        // Optional: Click backdrop if needed
                    }
                }
                return; // Done with this flow
            }

            // Verify button exists (Standard UI)
            if (await confirmButton.count() === 0) {
                console.log('CRITICAL: "Add Product" button not found in modal!');
                const modalHtml = await modal.evaluate(el => el.outerHTML);
                console.log(`Modal HTML (first 500 chars): ${modalHtml.substring(0, 500)}...`);
                throw new Error('"Add Product" button not found');
            }

            // Try to enable it
            let isEnabled = await confirmButton.isEnabled();
            let attempts = 0;
            const maxAttempts = 5;

            while (!isEnabled && attempts < maxAttempts) {
                console.log(`Attempt ${attempts + 1}/${maxAttempts} to enable "Add Product" button...`);

                // Strategy 1: Click "Select" button
                const selectButton = card.locator('button').filter({ hasText: '選択' }).first();
                if (await selectButton.count() > 0) {
                    console.log('Clicking "Select" button...');
                    await selectButton.click({ force: true });
                }

                await this.page.waitForTimeout(1000);
                isEnabled = await confirmButton.isEnabled();
                if (isEnabled) break;

                // Strategy 2: Click Image
                const image = card.locator('img').first();
                if (await image.count() > 0) {
                    console.log('Clicking Product Image...');
                    await image.click({ force: true });
                }

                await this.page.waitForTimeout(1000);
                isEnabled = await confirmButton.isEnabled();
                if (isEnabled) break;

                // Strategy 3: Click Card Body (top left)
                console.log('Clicking Card Body...');
                await card.click({ force: true, position: { x: 20, y: 20 } });

                await this.page.waitForTimeout(1000);
                isEnabled = await confirmButton.isEnabled();

                attempts++;
            }

            if (isEnabled) {
                console.log('"Add Product" button is enabled. Clicking it...');
                await confirmButton.click();
            } else {
                console.log('CRITICAL: "Add Product" button is still disabled after all attempts!');
                await this.page.screenshot({ path: 'product_selection_failed.png' });
                throw new Error('Could not enable "Add Product" button');
            }

            await this.page.waitForTimeout(1000);
        } else {
            throw new Error(`Product index ${index} out of range (found ${count} products)`);
        }
    }

    /**
     * Close product selection modal
     */
    async closeProductModal(): Promise<void> {
        // Try multiple strategies to close the modal
        const strategies = [
            () => this.page.getByRole('button', { name: /閉じる|Close/i }).click(),
            () => this.page.locator('[role="dialog"] button[aria-label*="close"]').click(),
            () => this.page.keyboard.press('Escape')
        ];

        for (const strategy of strategies) {
            try {
                await strategy();
                await this.waitForModalClose();
                return;
            } catch (e) {
                continue;
            }
        }
    }

    /**
     * Get list of added products
     */
    async getAddedProducts(): Promise<Product[]> {
        const products: Product[] = [];

        // Actual DOM from user's HTML:
        // <div class="MuiBox-root mui-q3vkmp">
        //   <p class="MuiTypography-body2 mui-zt7ovo">Product Name</p>
        //   <p class="MuiTypography-body2 mui-zt7ovo">¥3,510</p>
        // </div>

        const productContainers = this.page.locator('.MuiBox-root.mui-q3vkmp, div.mui-q3vkmp');
        const count = await productContainers.count();

        console.log(`Found ${count} products in cart`);

        for (let i = 0; i < count; i++) {
            const container = productContainers.nth(i);
            const paragraphs = container.locator('p.mui-zt7ovo, p.MuiTypography-body2');

            const pCount = await paragraphs.count();
            if (pCount >= 2) {
                const name = await paragraphs.nth(0).innerText();
                const priceText = await paragraphs.nth(1).innerText();

                products.push({
                    name,
                    quantity: 1, // Default quantity
                    price: priceText
                });
            }
        }

        return products;
    }

    /**
     * Update product quantity
     */
    async updateProductQuantity(index: number, quantity: number): Promise<void> {
        const quantityInput = this.page.locator('input[type="number"]').nth(index);
        await quantityInput.clear();
        await quantityInput.fill(quantity.toString());
        await quantityInput.blur();
        await this.page.waitForTimeout(300);
    }

    /**
     * Remove product from order
     */
    async removeProduct(index: number): Promise<void> {
        const removeButtons = this.page.locator('button').filter({ hasText: /削除|Remove|Delete/i });
        await removeButtons.nth(index).click();
        await this.page.waitForTimeout(300);
    }

    // ============ Delivery Information ============

    /**
     * Set delivery address
     */
    async setDeliveryAddress(address: Address): Promise<void> {
        if (address.postalCode) {
            const postalInput = this.page.locator('input[name*="postal"], input[placeholder*="郵便"]').first();
            await postalInput.fill(address.postalCode);
        }

        if (address.prefecture) {
            const prefectureSelect = this.page.locator('select[name*="prefecture"], select[name*="都道府県"]').first();
            await prefectureSelect.selectOption({ label: address.prefecture });
        }

        if (address.city) {
            const cityInput = this.page.locator('input[name*="city"], input[name*="市区町村"]').first();
            await cityInput.fill(address.city);
        }

        if (address.street) {
            const streetInput = this.page.locator('input[name*="street"], input[name*="番地"]').first();
            await streetInput.fill(address.street);
        }

        if (address.building) {
            const buildingInput = this.page.locator('input[name*="building"], input[name*="建物"]').first();
            await buildingInput.fill(address.building);
        }
    }

    /**
     * Select shipping method
     */
    async selectShippingMethod(method: string): Promise<void> {
        const shippingSelect = this.page.locator('select[name*="shipping"], select[name*="配送"]').first();
        await shippingSelect.selectOption({ label: method });
    }

    // ============ Payment Information ============

    /**
     * Select payment method
     */
    async selectPaymentMethod(method: string): Promise<void> {
        const paymentSelect = this.page.locator('select[name*="payment"], select[name*="支払"]').first();
        await paymentSelect.selectOption({ label: method });
    }

    /**
     * Add order notes
     */
    async addOrderNotes(notes: string): Promise<void> {
        const notesInput = this.page.locator('textarea[name*="note"], textarea[name*="memo"]').first();
        await notesInput.fill(notes);
    }

    /**
     * Click "Add Sender" button (依頼主を追加する)
     * Clicks "Add New Address", fills form, then selects the new address
     */
    async clickAddSenderButton(): Promise<void> {
        const addSenderButton = this.page.getByRole('button', { name: /依頼主.*追加|Add.*Sender/i });
        await addSenderButton.click();
        await this.page.waitForTimeout(1500);

        // Click "Add New Address" button to open registration form
        console.log('Clicking "Add New Address" button...');
        const addNewButton = this.page.getByRole('button', { name: /新しい住所を追加|Add.*New/i });
        await addNewButton.click();
        await this.page.waitForTimeout(1000);

        // Fill the registration form
        console.log('Filling sender registration form...');
        await this.page.locator('input[name="lastName"]').fill('テスト');
        await this.page.locator('input[name="firstName"]').fill('太郎');
        await this.page.locator('input[name="zipCode"]').fill('100-0001');
        await this.page.waitForTimeout(1000);

        // Select prefecture (required field)
        const provinceSelect = this.page.locator('#select-provinceCode');
        await provinceSelect.click();
        await this.page.waitForTimeout(500);
        // Select Tokyo (東京都)
        await this.page.getByRole('option', { name: '東京都' }).click();
        await this.page.waitForTimeout(500);

        const city = await this.page.locator('input[name="city"]').inputValue();
        if (!city) {
            await this.page.locator('input[name="city"]').fill('千代田区');
        }
        await this.page.locator('input[name="address1"]').fill('千代田1-1');
        await this.page.locator('input[name="phone"]').fill('03-1234-5678');

        // Submit the form
        console.log('Submitting sender registration...');
        const submitButton = this.page.getByRole('button', { name: '住所を登録' });
        await submitButton.click();
        await this.page.waitForTimeout(2000);

        // Close the registration modal by clicking Cancel
        console.log('Closing registration modal...');
        const cancelButton = this.page.getByRole('button', { name: 'キャンセル' }).last();
        await cancelButton.click();
        await this.page.waitForTimeout(1000);

        // Now select the newly created address from the selection modal
        console.log('Selecting newly created address...');
        const addressCards = this.page.locator('[role="dialog"] .MuiCard-root');
        const cardCount = await addressCards.count();
        console.log(`Found ${cardCount} address cards`);

        if (cardCount > 0) {
            await addressCards.last().click(); // Click last card (newest)
            await this.page.waitForTimeout(1000);
        }

        await this.waitForModalClose();
    }

    /**
     * Click "Add Delivery Destination" button (配送先を追加)
     * This should be called after adding sender to create a delivery group
     * Handles two cases like sender: select existing or create new
     */
    async clickAddDeliveryDestinationButton(): Promise<void> {
        const addDestButton = this.page.getByRole('button', { name: /配送先.*追加|Add.*Destination/i }).first();
        await addDestButton.click();
        await this.page.waitForTimeout(1000);

        // Check if there are existing address cards to select
        const modal = this.page.locator('[role="dialog"]').first();
        const existingCards = modal.locator('.MuiCard-root');

        if (await existingCards.count() > 0) {
            console.log('Found existing delivery cards, selecting first one...');
            await existingCards.first().click();
            await this.page.waitForTimeout(1000);
            return;
        }

        // No cards, click "Add New" to open Registration Modal
        const addNewButton = modal.getByRole('button', { name: /新しい住所を追加|Add.*New/i });
        if (await addNewButton.count() > 0) {
            await addNewButton.click();
            await this.page.waitForTimeout(1000);

            // Fill form
            await this.page.locator('input[name="lastName"]').fill('配送');
            await this.page.locator('input[name="firstName"]').fill('太郎');
            await this.page.locator('input[name="zipCode"]').fill('100-0001');
            await this.page.waitForTimeout(1000);

            // Select prefecture (required field)
            const provinceSelect = this.page.locator('#select-provinceCode');
            await provinceSelect.click();
            await this.page.waitForTimeout(500);
            // Select Tokyo (東京都)
            await this.page.getByRole('option', { name: '東京都' }).click();
            await this.page.waitForTimeout(500);

            const city = await this.page.locator('input[name="city"]').inputValue();
            if (!city) {
                await this.page.locator('input[name="city"]').fill('千代田区');
            }
            await this.page.locator('input[name="address1"]').fill('千代田2-2');
            await this.page.locator('input[name="phone"]').fill('03-5678-1234');

            // Click Register
            console.log('Clicking Register button...');
            const registerButton = this.page.getByRole('button', { name: '住所を登録' });
            await registerButton.click();

            // Wait for registration to complete and modal to reload with address cards
            console.log('Waiting 5s for registration and modal reload...');
            await this.page.waitForTimeout(5000);

            // Click the last address card (newest one)
            const addressCards = this.page.locator('[role="dialog"] .MuiCard-root');
            const cardCount = await addressCards.count();
            console.log(`Found ${cardCount} address cards after registration`);

            if (cardCount > 0) {
                console.log('Clicking last address card to select it...');
                await addressCards.last().click();
                await this.page.waitForTimeout(1000);
            } else {
                console.log('ERROR: No address cards found after registration!');
            }

            // Final cleanup
            if (await this.page.locator('[role="dialog"]').count() > 0) {
                console.log('Pressing ESC to close any remaining modals');
                await this.page.keyboard.press('Escape');
            }

            await this.waitForModalClose();
        }
    }

    // ============ Submission ============

    /**
     * Submit order
     */
    async submitOrder(): Promise<void> {
        // Updated selector based on actual HTML: "注文を確定"
        const submitButton = this.page.getByRole('button', { name: '注文を確定' }).first();
        await submitButton.click();

        // Wait for confirmation modal to appear
        console.log('Waiting for confirmation modal...');
        await this.page.waitForTimeout(1000);

        // Click the "Confirm" (確定する) button in the confirmation modal
        const confirmButton = this.page.locator('button').filter({ hasText: '確定する' }).first();
        if (await confirmButton.count() > 0) {
            console.log('Clicking "Confirm" (確定する) button in confirmation modal...');
            await confirmButton.click();
        } else {
            console.log('Warning: Confirmation button not found. Proceeding...');
        }

        // Wait for navigation or success message
        await Promise.race([
            this.page.waitForURL(/.*\/orders\/[a-f0-9-]+/, { timeout: 10000 }),
            this.page.waitForSelector('text=/成功|Success|完了|Complete/', { timeout: 10000 })
        ]).catch(() => { });
    }

    /**
     * Get validation errors
     */
    async getValidationErrors(): Promise<string[]> {
        const errors: string[] = [];

        // Look for error messages
        const errorElements = this.page.locator('.error, .MuiFormHelperText-root.Mui-error, [role="alert"]');
        const count = await errorElements.count();

        for (let i = 0; i < count; i++) {
            const text = await errorElements.nth(i).innerText();
            if (text) errors.push(text);
        }

        return errors;
    }

    // ============ Verification ============

    /**
     * Verify order creation page is loaded
     */
    async verifyOrderCreationPageLoaded(): Promise<void> {
        await expect(this.page).toHaveURL(/.*\/orders\/create/);

        // Verify tabs are visible
        const orderInfoTab = this.page.getByRole('tab', { name: /注文情報|Order Info/i });
        await expect(orderInfoTab).toBeVisible();
    }

    /**
     * Verify customer is selected
     */
    async verifyCustomerSelected(): Promise<void> {
        const customerInfo = await this.getSelectedCustomerInfo();
        expect(customerInfo.name).toBeTruthy();
    }

    /**
     * Verify products are added
     */
    async verifyProductsAdded(): Promise<void> {
        const products = await this.getAddedProducts();
        expect(products.length).toBeGreaterThan(0);
    }

    // ============ Helper Methods ============

    /**
     * Wait for modal to open
     */
    private async waitForModalOpen(): Promise<void> {
        const modal = this.page.locator('[role="dialog"]');
        await modal.waitFor({ state: 'visible', timeout: 5000 });
        await this.page.waitForTimeout(300); // Animation
    }

    /**
     * Wait for modal to close
     */
    private async waitForModalClose(): Promise<void> {
        const modal = this.page.locator('[role="dialog"]');
        await modal.waitFor({ state: 'hidden', timeout: 5000 }).catch(() => { });
        await this.page.waitForTimeout(300); // Animation
    }

    /**
     * Check if modal is open
     */
    private async isModalOpen(): Promise<boolean> {
        const modal = this.page.locator('[role="dialog"]');
        return await modal.isVisible().catch(() => false);
    }

    /**
     * Extract field value by label
     */
    private async extractFieldValue(...labels: string[]): Promise<string> {
        for (const label of labels) {
            try {
                const field = this.page.locator(`text=${label}`).first();
                if (await field.isVisible({ timeout: 1000 })) {
                    const parent = field.locator('xpath=ancestor::div[1]');
                    const input = parent.locator('input, select, textarea').first();
                    const value = await input.inputValue().catch(() => '');
                    if (value) return value;
                }
            } catch (e) {
                continue;
            }
        }
        return '';
    }
}
