import { Page, Locator } from '@playwright/test';
import { ModalHelper } from './modal.helper';

/**
 * Helper class for product selection in modals
 * Handles both "Quick Add" and "Detailed Selection" modal types
 */
export class ProductSelectionHelper {
    private modalHelper: ModalHelper;

    constructor(private page: Page) {
        this.modalHelper = new ModalHelper(page);
    }

    /**
     * Select a product from the product selection modal
     * Automatically detects modal type and uses appropriate flow
     * @param index Product index to select (default: 0)
     * @param quantity Quantity to select (default: 1)
     */
    async selectProduct(index: number = 0, quantity: number = 1): Promise<void> {
        const modal = await this.modalHelper.waitForModalOpen();
        const modalType = await this.detectModalType(modal);

        console.log(`Detected modal type: ${modalType}`);

        if (modalType === 'quick-add') {
            await this.handleQuickAddFlow(modal, index);
        } else {
            await this.handleDetailedSelectionFlow(modal, index, quantity);
        }
    }

    /**
     * Detect which type of product selection modal is open
     * @param modal The modal locator
     * @returns 'quick-add' or 'detailed'
     */
    private async detectModalType(modal: Locator): Promise<'quick-add' | 'detailed'> {
        const addButtons = await modal.locator('button').filter({ hasText: /^追加$/ }).count();
        const selectButtons = await modal.locator('button').filter({ hasText: '選択' }).count();
        const confirmButton = await modal.locator('button').filter({ hasText: /商品を追加|Add/ }).count();

        // Quick Add: Has 追加 buttons on cards, no bottom confirmation button
        if (addButtons > 0 && confirmButton === 0) {
            return 'quick-add';
        }

        // Detailed: Has 選択 buttons on cards and bottom confirmation button
        return 'detailed';
    }

    /**
     * Handle Quick Add modal flow
     * Click "追加" button on product card, then close modal
     */
    private async handleQuickAddFlow(modal: Locator, index: number): Promise<void> {
        console.log('Using Quick Add flow...');

        const addButtons = modal.locator('button').filter({ hasText: /^追加$/ });
        const count = await addButtons.count();

        if (count > index) {
            await addButtons.nth(index).click();
            await this.page.waitForTimeout(1000);

            // Check if modal is still open and close it
            if (await modal.isVisible()) {
                await this.modalHelper.closeModal(modal);
            }
        } else {
            throw new Error(`Product index ${index} out of range (found ${count} products)`);
        }
    }

    /**
     * Handle Detailed Selection modal flow
     * Set quantity, click "選択" on card, then click "商品を追加" confirmation
     */
    private async handleDetailedSelectionFlow(
        modal: Locator,
        index: number,
        quantity: number
    ): Promise<void> {
        console.log('Using Detailed Selection flow...');

        const productCards = modal.locator('.MuiCard-root');
        const count = await productCards.count();

        if (count <= index) {
            throw new Error(`Product index ${index} out of range (found ${count} products)`);
        }

        const card = productCards.nth(index);

        // Set quantity if needed
        if (quantity !== 1) {
            const quantityInput = card.locator('input[type="number"]');
            if (await quantityInput.count() > 0) {
                await quantityInput.fill(quantity.toString());
                await this.page.waitForTimeout(200);
            }
        }

        // Click "選択" button on card
        await this.clickSelectButton(card);

        // Click "商品を追加" confirmation button
        await this.clickConfirmButton(modal);
    }

    /**
     * Click the "選択" (Select) button on a product card
     * Retries with different strategies if initial click fails
     */
    private async clickSelectButton(card: Locator): Promise<void> {
        const selectButton = card.locator('button').filter({ hasText: '選択' }).first();

        if (await selectButton.count() > 0) {
            await selectButton.click({ force: true });
        } else {
            // Fallback: click any button in the card
            const buttons = card.locator('button');
            if (await buttons.count() > 0) {
                await buttons.last().click({ force: true });
            }
        }

        await this.page.waitForTimeout(500);
    }

    /**
     * Click the "商品を追加" (Add Product) confirmation button
     * Retries multiple times if button is not enabled
     */
    private async clickConfirmButton(modal: Locator): Promise<void> {
        const confirmButton = await this.modalHelper.findButtonInModal(modal, /商品を追加|Add/);

        // Wait for button to be enabled (with retries)
        let isEnabled = false;
        const maxAttempts = 5;

        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            isEnabled = await confirmButton.isEnabled();

            if (isEnabled) {
                break;
            }

            console.log(`Attempt ${attempt}/${maxAttempts}: Waiting for confirmation button to be enabled...`);
            await this.page.waitForTimeout(1000);
        }

        if (!isEnabled) {
            throw new Error('Confirmation button did not become enabled');
        }

        await confirmButton.click();
        await this.page.waitForTimeout(500);
    }
}
