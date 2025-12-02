import { Page, expect, Locator } from '@playwright/test';
import { BasePage } from './base.page';
import { OrderStatus } from '../types';

/**
 * Order Detail Page Object
 * Handles order detail view, data extraction, and actions
 * ENHANCED: Uses flexible selectors and smart waits
 */
export class OrderDetailPage extends BasePage {

    constructor(page: Page) {
        super(page);
    }

    /**
     * Navigate to order detail page
     * @param orderId - The UUID of the order
     */
    async goto(orderId: string): Promise<void> {
        await super.goto(`/orders/${orderId}`);
        await this.waitForOrderDetailLoaded();
    }

    /**
     * Wait for order detail page to be fully loaded
     */
    async waitForOrderDetailLoaded(): Promise<void> {
        // Wait for URL pattern
        await this.page.waitForURL(/.*\/orders\/[a-f0-9-]+/);

        // Wait for network idle
        await this.page.waitForLoadState('networkidle');

        // Wait for main content to be visible
        const mainContent = this.page.locator('main, [role="main"], .MuiPaper-root').first();
        await mainContent.waitFor({ state: 'visible', timeout: 10000 });

        // Wait a bit for rendering
        await this.page.waitForTimeout(500);
    }

    // ============ Navigation ============

    /**
     * Click back button to return to order list
     */
    async goBackToList(): Promise<void> {
        const backButton = this.page.getByRole('button', { name: /戻る|Back/i });
        await backButton.click();
        await this.page.waitForURL(/.*\/orders$/);
    }

    /**
     * Click breadcrumb to navigate to order list
     */
    async clickBreadcrumbToOrders(): Promise<void> {
        const breadcrumb = this.page.getByRole('link', { name: /注文管理|Order Management/i });
        await breadcrumb.click();
        await this.page.waitForURL(/.*\/orders$/);
    }

    // ============ Data Extraction ============

    /**
   * Get order number from page
   */
    async getOrderNumber(): Promise<string> {
        // The order number is usually in the page title or a heading
        // Try to find it in the breadcrumb or main heading
        try {
            // Try breadcrumb first
            const breadcrumbText = await this.page.locator('.MuiBreadcrumbs-root').innerText();
            const match = breadcrumbText.match(/#\d+/);
            if (match) return match[0];
        } catch (e) {
            // Ignore
        }

        try {
            // Try main heading
            const heading = await this.page.locator('h1, h2, h3, h4').first().innerText();
            const match = heading.match(/#\d+/);
            if (match) return match[0];
        } catch (e) {
            // Ignore
        }

        try {
            // Try any text containing #number pattern
            const allText = await this.page.locator('text=/#\\d+/').first().innerText();
            const match = allText.match(/#\d+/);
            if (match) return match[0];
        } catch (e) {
            // Ignore
        }

        return '';
    }

    /**
     * Get order basic information
     */
    async getOrderInfo(): Promise<{
        orderNumber: string;
        customerName: string;
        orderDate: string;
        status: string;
    }> {
        // This is a simplified version - actual implementation would parse the specific sections
        const orderNumber = await this.getOrderNumber();

        // Extract customer name (from 注文基本情報 section)
        const customerName = await this.extractFieldValue('注文者', '顧客名');

        // Extract order date
        const orderDate = await this.extractFieldValue('注文日時', 'Order Date');

        // Extract status
        const status = await this.getOrderStatus();

        return {
            orderNumber,
            customerName,
            orderDate,
            status
        };
    }

    /**
   * Get order status from status badges
   */
    async getOrderStatus(): Promise<string> {
        // Status is shown as badges - try multiple strategies
        const strategies = [
            () => this.page.locator('.MuiChip-root').allInnerTexts(),
            () => this.page.locator('[class*="Chip"]').allInnerTexts(),
            () => this.page.locator('[class*="badge"]').allInnerTexts()
        ];

        for (const strategy of strategies) {
            try {
                const texts = await strategy();
                if (texts.length > 0) {
                    return texts.filter(t => t.trim()).join(', ');
                }
            } catch (e) {
                continue;
            }
        }

        return 'Unknown';
    }

    /**
     * Get line items from order
     */
    async getLineItems(): Promise<Array<{
        productName: string;
        quantity: string;
        price: string;
    }>> {
        const items: Array<{ productName: string; quantity: string; price: string }> = [];

        // Find the line items table (in 注文詳細 section)
        const table = this.page.locator('table').filter({ hasText: /商品|Product/ }).first();
        const rows = table.locator('tbody tr');
        const count = await rows.count();

        for (let i = 0; i < count; i++) {
            const row = rows.nth(i);
            const cells = row.locator('td');
            const cellCount = await cells.count();

            if (cellCount >= 3) {
                items.push({
                    productName: await cells.nth(0).innerText(),
                    quantity: await cells.nth(1).innerText(),
                    price: await cells.nth(2).innerText()
                });
            }
        }

        return items;
    }

    /**
     * Get total amount
     */
    async getTotalAmount(): Promise<string> {
        return await this.extractFieldValue('合計金額', 'Total', '¥');
    }

    /**
     * Helper: Extract field value by label
     */
    private async extractFieldValue(...labels: string[]): Promise<string> {
        for (const label of labels) {
            try {
                // Try to find a row with the label
                const row = this.page.locator(`text=${label}`).first();
                if (await row.isVisible({ timeout: 2000 })) {
                    const parent = row.locator('xpath=ancestor::tr | ancestor::div[contains(@class, "row")]').first();
                    const value = await parent.innerText();
                    // Remove the label from the value
                    return value.replace(label, '').trim();
                }
            } catch (e) {
                continue;
            }
        }
        return '';
    }

    // ============ Actions ============

    /**
   * Cancel order
   */
    async cancelOrder(): Promise<void> {
        const cancelButton = this.page.getByRole('button', { name: /注文をキャンセル|Cancel Order/i }).first();
        await cancelButton.click();

        // Wait for confirmation dialog if it appears
        await this.page.waitForTimeout(500);

        // Look for confirm button in dialog
        const confirmButton = this.page.getByRole('button', { name: /確認|Confirm|OK/i });
        if (await confirmButton.isVisible({ timeout: 2000 })) {
            await confirmButton.click();
        }
    }

    /**
   * Print/view documents
   */
    async clickPrintDocuments(): Promise<void> {
        const printButton = this.page.getByRole('button', { name: /帳票の印刷・確認|Print.*Documents/i }).first();
        await printButton.click();
        await this.page.waitForTimeout(1000);
    }

    /**
     * Export file
     */
    async clickExportFile(): Promise<void> {
        const exportButton = this.page.getByRole('button', { name: /ファイル出力|Export.*File/i });
        await exportButton.click();
        await this.page.waitForTimeout(1000);
    }

    /**
     * Duplicate order
     */
    async duplicateOrder(): Promise<void> {
        const duplicateButton = this.page.getByRole('button', { name: /この注文を複製|Duplicate.*Order/i });
        await duplicateButton.click();
        // Should navigate to order creation page with pre-filled data
        await this.page.waitForTimeout(1000);
    }

    /**
     * Edit order information
     */
    async clickEditOrderInfo(): Promise<void> {
        const editButton = this.page.getByRole('button', { name: /注文者情報を編集|Edit.*Order.*Info/i });
        await editButton.click();
        await this.page.waitForTimeout(500);
    }

    /**
     * Edit requester information
     */
    async clickEditRequesterInfo(): Promise<void> {
        const editButton = this.page.getByRole('button', { name: /依頼主情報を編集|Edit.*Requester.*Info/i });
        await editButton.click();
        await this.page.waitForTimeout(500);
    }

    /**
     * Save changes
     */
    async saveChanges(): Promise<void> {
        const saveButton = this.page.getByRole('button', { name: /保存|Save/i });
        await saveButton.click();
        await this.page.waitForTimeout(1000);
    }

    /**
     * Add management memo
     */
    async addManagementMemo(memo: string): Promise<void> {
        const memoInput = this.page.getByRole('textbox', { name: /管理用メモ|Management.*Memo/i });
        await memoInput.fill(memo);
    }

    /**
     * Add tag
     */
    async addTag(tag: string): Promise<void> {
        const tagInput = this.page.getByRole('textbox', { name: /新しいタグ|New.*Tag/i });
        await tagInput.fill(tag);
        await this.page.keyboard.press('Enter');
    }

    // ============ Verification ============

    /**
     * Verify order detail page is loaded
     */
    async verifyOrderDetailLoaded(orderId?: string): Promise<void> {
        if (orderId) {
            await expect(this.page).toHaveURL(new RegExp(`/orders/${orderId}`));
        } else {
            await expect(this.page).toHaveURL(/.*\/orders\/[a-f0-9-]+/);
        }

        // Verify main content is visible
        const mainContent = this.page.locator('main, [role="main"]').first();
        await expect(mainContent).toBeVisible();
    }

    /**
     * Verify action buttons are visible
     */
    async verifyActionButtonsVisible(): Promise<void> {
        const buttons = [
            /注文をキャンセル|Cancel/i,
            /帳票の印刷|Print/i,
            /戻る|Back/i,
            /保存|Save/i
        ];

        for (const buttonName of buttons) {
            const button = this.page.getByRole('button', { name: buttonName }).first();
            await expect(button).toBeVisible();
        }
    }
}
