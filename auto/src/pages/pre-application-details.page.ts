import { Page, Locator, expect } from '@playwright/test';
import { TestLogger } from '../utils/logger';

export class PreApplicationDetailsPage {
    readonly page: Page;

    // Locators
    readonly pageTitle: Locator;
    readonly managementNumber: Locator;
    readonly statusChip: Locator;
    readonly editButton: Locator;
    readonly backButton: Locator;
    readonly createOrderButton: Locator;

    // Action menu (3-dot button)
    readonly actionMenuButton: Locator;

    constructor(page: Page) {
        this.page = page;
        this.pageTitle = page.locator('h1');

        // ID: #2F0AC231
        this.managementNumber = page.locator('p', { hasText: 'ID:' });
        // Status is in a filled chip
        this.statusChip = page.locator('.MuiChip-filled .MuiChip-label').first();

        // Edit button is in the action menu (3-dot dropdown)
        // Looking for button with MoreVert icon or similar
        this.actionMenuButton = page.locator('button').filter({
            has: page.locator('svg[data-testid="MoreVertIcon"]')
        }).or(
            page.locator('button[aria-label*="more"]')
        ).or(
            // Fallback: button that contains only icon, no text
            page.locator('button:has(svg.MuiSvgIcon-root):not(:has-text(/\\w/))')
        );
        this.editButton = page.getByRole('menuitem', { name: '編集' });

        this.backButton = page.getByRole('button', { name: '戻る' });
        // Create Order button appears per customer in the accordion
        this.createOrderButton = page.getByRole('button', { name: '注文作成' }).first();
    }

    // ============ Navigation ============

    async verifyPageLoaded(): Promise<boolean> {
        await this.page.waitForLoadState('networkidle');
        const url = this.page.url();
        const isDetailsUrl = url.includes('/pre-applications/') && !url.endsWith('/edit');
        TestLogger.log(`Verifying details page load. URL: ${url}, Is Details: ${isDetailsUrl}`);
        return isDetailsUrl;
    }

    // ============ Data Retrieval ============

    async getDetails(): Promise<{ managementNumber: string, status: string }> {
        const numberText = await this.managementNumber.textContent() || '';
        // Format is "ID: #12345", we want "#12345" or "12345"
        const number = numberText.replace('ID:', '').trim();

        const status = await this.statusChip.textContent() || '';

        TestLogger.log(`Retrieved details - Number: ${number}, Status: ${status}`);
        return {
            managementNumber: number,
            status: status.trim()
        };
    }

    // ============ Actions ============

    async clickEdit(): Promise<void> {
        TestLogger.log('Opening action menu');
        await this.actionMenuButton.first().click();
        await this.page.waitForSelector('ul[role="menu"]', { state: 'visible' });

        TestLogger.log('Clicking Edit from menu');
        await this.editButton.click();
    }

    async clickDelete(): Promise<void> {
        TestLogger.log('Opening action menu');
        await this.actionMenuButton.first().click();
        await this.page.waitForSelector('ul[role="menu"]', { state: 'visible' });

        TestLogger.log('Clicking Delete from menu');
        await this.page.getByRole('menuitem', { name: '削除' }).click();
    }

    async clickBack(): Promise<void> {
        TestLogger.log('Clicking Back button');
        await this.backButton.click();
    }

    async clickCreateOrder(): Promise<void> {
        TestLogger.log('Clicking Create Order button');
        // Ensure the button is visible (it might be inside an accordion)
        // In the dump, it seems visible in the summary, so no need to expand
        await this.createOrderButton.click();
    }
}
