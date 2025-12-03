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

        // Customers are displayed as div blocks within a scrollable container
        // Selector discovered by browser subagent: div.MuiBox-root > div
        const modal = this.page.locator('[role="dialog"]');
        const customerBlocks = modal.locator('div.MuiBox-root > div, .mui-qmuoz0 > div');

        const count = await customerBlocks.count();
        console.log(`Found ${count} customer blocks in modal`);

        if (count > index) {
            await customerBlocks.nth(index).click();
            await this.waitForModalClose();
        } else {
            throw new Error(`Customer index ${index} out of range (found ${count} customers)`);
        }
    }

    /**
   * Get selected customer information from form
   */
    async getSelectedCustomerInfo(): Promise<CustomerInfo> {
        // Customer info is displayed as label/value pairs
        // Selectors discovered by browser subagent
        const name = await this.page.locator('//div[text()="注文者氏名"]/following-sibling::div').first().innerText().catch(() => '');
        const email = await this.page.locator('//div[text()="メールアドレス"]/following-sibling::div').first().innerText().catch(() => '');
        const phone = await this.page.locator('//div[text()="注文者電話番号"]/following-sibling::div').first().innerText().catch(() => '');

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
        const button = this.page.getByRole('button', { name: /商品を追加|Add.*Product/i });
        await button.click();
        await this.waitForModalOpen();
    }

    /**
   * Add product from modal by index
   */
    async addProduct(index: number = 0): Promise<void> {
        // Product blocks use same structure as customer blocks
        const modal = this.page.locator('[role="dialog"]');
        const productBlocks = modal.locator('div.MuiBox-root.mui-qmuoz0 > div, div.MuiBox-root > div');

        const count = await productBlocks.count();
        console.log(`Found ${count} product blocks in modal`);

        if (count > index) {
            // Find the "追加" (Add) button within the product block
            const productBlock = productBlocks.nth(index);
            const addButton = productBlock.locator('button').filter({ hasText: /追加|Add/i });
            await addButton.click();
            await this.page.waitForTimeout(500);
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

        // Find product table/list in the form
        const productRows = this.page.locator('tbody tr').filter({ has: this.page.locator('td') });
        const count = await productRows.count();

        for (let i = 0; i < count; i++) {
            const row = productRows.nth(i);
            const cells = row.locator('td');
            const cellCount = await cells.count();

            if (cellCount >= 2) {
                const name = await cells.nth(0).innerText();
                const quantityText = await cells.nth(1).innerText();
                const quantity = parseInt(quantityText) || 1;

                products.push({ name, quantity });
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

    // ============ Submission ============

    /**
     * Submit order
     */
    async submitOrder(): Promise<void> {
        const submitButton = this.page.getByRole('button', { name: /登録|作成|Submit|Create/i });
        await submitButton.click();

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
