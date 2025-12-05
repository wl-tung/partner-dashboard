import { Page, Locator } from '@playwright/test';

/**
 * Helper class for modal interactions
 * Provides reusable methods for opening, closing, and interacting with modals
 */
export class ModalHelper {
    constructor(private page: Page) { }

    /**
     * Wait for a modal to open and return the modal locator
     * @param timeout Maximum time to wait for modal (default: 5000ms)
     * @returns Locator for the opened modal
     */
    async waitForModalOpen(timeout = 5000): Promise<Locator> {
        const modal = this.page.locator('[role="dialog"]').last();
        await modal.waitFor({ state: 'visible', timeout });
        return modal;
    }

    /**
     * Close a modal by clicking the close/cancel button
     * @param modal The modal locator to close
     */
    async closeModal(modal: Locator): Promise<void> {
        const closeBtn = modal.locator('button').filter({
            hasText: /閉じる|キャンセル|Close|Cancel/i
        }).first();

        if (await closeBtn.count() > 0) {
            await closeBtn.click();
            await this.page.waitForTimeout(300); // Wait for close animation
        }
    }

    /**
     * Get the title of a modal
     * @param modal The modal locator
     * @returns The modal title text
     */
    async getModalTitle(modal: Locator): Promise<string> {
        const titleElement = modal.locator('h2, h1, [role="heading"]').first();
        return await titleElement.innerText();
    }

    /**
     * Find a button within a modal by text
     * @param modal The modal locator
     * @param text Text or regex to match button text
     * @returns Locator for the button
     */
    async findButtonInModal(modal: Locator, text: string | RegExp): Promise<Locator> {
        return modal.locator('button').filter({ hasText: text }).first();
    }

    /**
     * Get all buttons in a modal (useful for debugging)
     * @param modal The modal locator
     * @returns Array of button text strings
     */
    async getAllButtonTexts(modal: Locator): Promise<string[]> {
        const buttons = modal.locator('button');
        const count = await buttons.count();
        const texts: string[] = [];

        for (let i = 0; i < count; i++) {
            const text = await buttons.nth(i).innerText();
            texts.push(text);
        }

        return texts;
    }

    /**
     * Check if a modal is currently open
     * @returns True if any modal is visible
     */
    async isModalOpen(): Promise<boolean> {
        const modal = this.page.locator('[role="dialog"]').last();
        return await modal.isVisible().catch(() => false);
    }

    /**
     * Wait for a modal to close
     * @param timeout Maximum time to wait (default: 5000ms)
     */
    async waitForModalClose(timeout = 5000): Promise<void> {
        const modal = this.page.locator('[role="dialog"]').last();
        await modal.waitFor({ state: 'hidden', timeout });
    }
}
