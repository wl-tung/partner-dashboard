import { Page, Locator } from '@playwright/test';
import { ModalHelper } from './modal.helper';

/**
 * Helper class for product selection interactions
 * Simplifies the complex product selection flow
 */
export class ProductSelectionHelper {
    private modalHelper: ModalHelper;

    constructor(private page: Page) {
        this.modalHelper = new ModalHelper(page);
    }

    /**
     * Select a product from the product selection modal
     * @param index - Index of the product to select (default: 0)
     * @param quantity - Quantity to select (default: 1)
     */
    async selectProduct(index: number = 0, quantity: number = 1): Promise<void> {
        const modal = this.modalHelper.getTopMostModal();

        // Wait for products to load
        await this.page.waitForTimeout(500);

        // Get product cards
        const productCards = modal.locator('.MuiCard-root');
        const count = await productCards.count();

        if (count <= index) {
            throw new Error(`Product index ${index} out of range (found ${count} products)`);
        }

        const card = productCards.nth(index);

        // Set quantity if different from default
        if (quantity !== 1) {
            const quantityInput = card.locator('input[type="number"]').first();
            if (await quantityInput.count() > 0) {
                await quantityInput.fill(quantity.toString());
                await this.page.waitForTimeout(200);
            }
        }

        // Click the "Select" button on the card
        await this.clickSelectButton(card);

        // Confirm the selection
        await this.confirmSelection(modal);
    }

    /**
     * Click the "Select" button on a product card
     * @param card - The product card locator
     */
    private async clickSelectButton(card: Locator): Promise<void> {
        const selectButton = card.locator('button').filter({ hasText: '選択' }).first();

        if (await selectButton.count() > 0) {
            await selectButton.click({ force: true });
        } else {
            // Fallback: click the last button in the card
            const buttons = card.locator('button');
            if (await buttons.count() > 0) {
                await buttons.last().click({ force: true });
            }
        }

        await this.page.waitForTimeout(500);
    }

    /**
     * Click the confirmation button at the bottom of the modal
     * @param modal - The product selection modal
     */
    private async confirmSelection(modal: Locator): Promise<void> {
        const confirmButton = modal.locator('button').filter({ hasText: /商品を追加|Add/ }).first();

        // Try to enable the button if it's disabled
        const maxAttempts = 3;
        for (let attempt = 0; attempt < maxAttempts; attempt++) {
            if (await confirmButton.isEnabled()) {
                await confirmButton.click();
                await this.page.waitForTimeout(500);
                return;
            }
            await this.page.waitForTimeout(500);
        }

        // If still not enabled, force click
        await confirmButton.click({ force: true });
        await this.page.waitForTimeout(500);
    }

    /**
     * Get the number of available products in the modal
     * @returns Number of products
     */
    async getProductCount(): Promise<number> {
        const modal = this.modalHelper.getTopMostModal();
        const productCards = modal.locator('.MuiCard-root');
        return await productCards.count();
    }

    /**
     * Get product information by index
     * @param index - Product index
     * @returns Product name and price
     */
    async getProductInfo(index: number): Promise<{ name: string; price: string }> {
        const modal = this.modalHelper.getTopMostModal();
        const card = modal.locator('.MuiCard-root').nth(index);

        const name = await card.locator('.MuiTypography-root').first().innerText();
        const price = await card.locator('text=/¥|円/').first().innerText();

        return { name, price };
    }
}
