import { Page, Locator, expect } from '@playwright/test';

/**
 * Utility class for smart waiting strategies
 * Replaces fixed waitForTimeout with intelligent waits
 */
export class WaitUtils {
    /**
     * Wait for an element to reach a specific state
     * @param locator Element to wait for
     * @param state Desired state ('visible', 'enabled', 'stable')
     * @param timeout Maximum wait time (default: 5000ms)
     */
    static async waitForElementState(
        locator: Locator,
        state: 'visible' | 'enabled' | 'stable',
        timeout = 5000
    ): Promise<void> {
        if (state === 'stable') {
            // Wait for element to stop moving/changing
            await locator.waitFor({ state: 'visible', timeout });
            await expect(locator).toBeVisible({ timeout });
        } else if (state === 'enabled') {
            await expect(locator).toBeEnabled({ timeout });
        } else {
            await locator.waitFor({ state, timeout });
        }
    }

    /**
     * Wait for network to be idle
     * @param page Page instance
     * @param timeout Maximum wait time (default: 5000ms)
     */
    static async waitForNetworkIdle(page: Page, timeout = 5000): Promise<void> {
        await page.waitForLoadState('networkidle', { timeout });
    }

    /**
     * Wait for a button to be enabled
     * @param button Button locator
     * @param timeout Maximum wait time (default: 5000ms)
     */
    static async waitForButtonEnabled(button: Locator, timeout = 5000): Promise<void> {
        await expect(button).toBeEnabled({ timeout });
    }

    /**
     * Wait for an element to be visible
     * @param locator Element locator
     * @param timeout Maximum wait time (default: 5000ms)
     */
    static async waitForVisible(locator: Locator, timeout = 5000): Promise<void> {
        await expect(locator).toBeVisible({ timeout });
    }

    /**
     * Wait for an element to disappear
     * @param locator Element locator
     * @param timeout Maximum wait time (default: 5000ms)
     */
    static async waitForHidden(locator: Locator, timeout = 5000): Promise<void> {
        await expect(locator).toBeHidden({ timeout });
    }
}
