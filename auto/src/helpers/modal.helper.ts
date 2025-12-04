import { Page, Locator } from '@playwright/test';

/**
 * Helper class for common modal interactions
 * Provides reusable methods for waiting, clicking, and inspecting modals
 */
export class ModalHelper {
    constructor(private page: Page) { }

    /**
     * Wait for a modal with specific title text to appear
     * @param titleText - Text to search for in modal title (h2, h6, etc.)
     * @param timeout - Maximum time to wait in milliseconds
     * @returns The modal locator
     */
    async waitForModal(titleText: string, timeout: number = 5000): Promise<Locator> {
        const modal = this.page
            .locator('[role="dialog"]')
            .filter({ has: this.page.locator('h2, h6', { hasText: titleText }) })
            .last();

        await modal.waitFor({ state: 'visible', timeout });
        return modal;
    }

    /**
     * Get the top-most (last) visible modal
     * @returns The top-most modal locator
     */
    getTopMostModal(): Locator {
        return this.page.locator('[role="dialog"]').last();
    }

    /**
     * Click a button within a modal by text
     * @param modal - The modal locator
     * @param buttonText - Text or regex to match button
     * @param options - Click options
     */
    async clickModalButton(
        modal: Locator,
        buttonText: string | RegExp,
        options?: { force?: boolean; timeout?: number }
    ): Promise<void> {
        const button = modal.locator('button').filter({ hasText: buttonText }).first();
        await button.click(options);
    }

    /**
     * Close a modal by clicking a button (e.g., "Cancel", "Close")
     * @param modal - The modal locator
     * @param buttonText - Text of the close button
     */
    async closeModal(modal: Locator, buttonText: string = 'キャンセル'): Promise<void> {
        await this.clickModalButton(modal, buttonText);
        await modal.waitFor({ state: 'hidden', timeout: 3000 });
    }

    /**
     * Get all button texts in a modal (useful for debugging)
     * @param modal - The modal locator
     * @returns Array of button text strings
     */
    async getAllButtons(modal: Locator): Promise<string[]> {
        const buttons = modal.locator('button');
        const count = await buttons.count();
        const buttonTexts: string[] = [];

        for (let i = 0; i < count; i++) {
            const text = await buttons.nth(i).innerText();
            buttonTexts.push(text);
        }

        return buttonTexts;
    }

    /**
     * Get modal title text
     * @param modal - The modal locator
     * @returns The title text
     */
    async getModalTitle(modal: Locator): Promise<string> {
        const title = modal.locator('h2, h6').first();
        return await title.innerText();
    }

    /**
     * Check if a modal is currently visible
     * @param titleText - Optional title text to match
     * @returns True if modal is visible
     */
    async isModalVisible(titleText?: string): Promise<boolean> {
        if (titleText) {
            const modal = this.page
                .locator('[role="dialog"]')
                .filter({ has: this.page.locator('h2, h6', { hasText: titleText }) });
            return await modal.isVisible();
        }

        const modal = this.page.locator('[role="dialog"]');
        return await modal.first().isVisible();
    }
}
