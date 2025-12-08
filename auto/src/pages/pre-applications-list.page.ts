import { Page, Locator } from '@playwright/test';
import { TestLogger } from '../utils/logger';

/**
 * Page Object for Pre-Applications List (事前申込リスト管理)
 * URL: /pre-applications
 * 
 * This page displays a list of pre-application lists that can be used
 * to create orders. Each pre-application has a management number.
 */
export class PreApplicationsListPage {
    readonly page: Page;

    // Configuration
    private readonly CONFIG = {
        PAGE_PATH: '/pre-applications',
        TIMEOUTS: {
            PAGE_LOAD: 10000,
            NAVIGATION: 30000,
        }
    } as const;

    constructor(page: Page) {
        this.page = page;
    }

    // ============ Locators ============

    /**
     * Page heading - 事前申込リスト管理
     */
    private get pageHeading(): Locator {
        return this.page.getByRole('heading', { name: '事前申込リスト管理' });
    }

    /**
     * Search input - リスト名で検索
     */
    private get searchInput(): Locator {
        return this.page.getByRole('textbox', { name: 'リスト名で検索' });
    }

    /**
     * Create New button - 新規作成
     */
    private get createNewButton(): Locator {
        return this.page.getByRole('button', { name: '新規作成' });
    }

    /**
     * CSV Export button - CSVエクスポート
     */
    private get csvExportButton(): Locator {
        return this.page.getByRole('button', { name: 'CSVエクスポート' });
    }

    /**
     * Table containing pre-application lists
     */
    private get table(): Locator {
        return this.page.locator('table.MuiTable-root');
    }

    /**
     * All table rows (excluding header)
     */
    private get tableRows(): Locator {
        return this.table.locator('tbody tr');
    }

    // ============ Navigation ============

    /**
     * Navigate to pre-applications list page
     */
    async goto(): Promise<void> {
        TestLogger.log('Navigating to pre-applications list page...');
        const baseUrl = process.env.BASE_URL || 'https://itfor-shared-alb-882114827.ap-northeast-1.elb.amazonaws.com:8443';
        await this.page.goto(`${baseUrl}${this.CONFIG.PAGE_PATH}`);
        await this.page.waitForLoadState('domcontentloaded');
        TestLogger.log('Pre-applications list page loaded');
    }

    /**
     * Verify page has loaded successfully
     */
    async verifyPageLoaded(): Promise<void> {
        TestLogger.log('Verifying pre-applications page loaded...');
        await this.pageHeading.waitFor({ state: 'visible', timeout: this.CONFIG.TIMEOUTS.PAGE_LOAD });
        await this.table.waitFor({ state: 'visible', timeout: this.CONFIG.TIMEOUTS.PAGE_LOAD });
        TestLogger.log('Pre-applications page verified');
    }

    // ============ Search & Filter ============

    /**
     * Search for pre-application by list name
     * @param searchTerm - Text to search for
     */
    async searchByListName(searchTerm: string): Promise<void> {
        TestLogger.log(`Searching for: ${searchTerm}`);
        await this.searchInput.clear();
        await this.searchInput.fill(searchTerm);
        await this.page.waitForTimeout(500); // Wait for search to execute
    }

    /**
     * Clear search input
     */
    async clearSearch(): Promise<void> {
        TestLogger.log('Clearing search...');
        await this.searchInput.clear();
        await this.page.waitForTimeout(500);
    }

    // ============ Table Operations ============

    /**
     * Get total count of pre-application lists displayed
     */
    async getPreApplicationCount(): Promise<number> {
        const count = await this.tableRows.count();
        if (count === 0) return 0;

        // Check if the only row is a "No data" row
        if (count === 1) {
            const firstRowText = await this.tableRows.first().textContent();

            if (firstRowText?.includes('データがありません') ||
                firstRowText?.includes('No data') ||
                firstRowText?.includes('事前申込リストが見つかりません')) {
                TestLogger.log('Found "No data" row, count is 0');
                return 0;
            }
        }

        TestLogger.log(`Found ${count} pre-application lists`);
        return count;
    }

    /**
     * Get pre-application data from a specific row
     * @param index - Row index (0-based)
     */
    async getPreApplicationData(index: number): Promise<{
        listNumber: string;
        listName: string;
        customerCount: string;
        createdDate: string;
    }> {
        const row = this.tableRows.nth(index);
        const cells = row.locator('td');

        const data = {
            listNumber: await cells.nth(0).textContent() || '',
            listName: await cells.nth(1).textContent() || '',
            customerCount: await cells.nth(2).textContent() || '',
            createdDate: await cells.nth(3).textContent() || '',
        };

        TestLogger.log(`Row ${index} data:`, data);
        return data;
    }

    /**
     * Search for a pre-application by management number
     * @param managementNumber - Management number to search for (e.g., "C11070AB")
     * @returns Row index if found, -1 if not found
     */
    async findByManagementNumber(managementNumber: string): Promise<number> {
        TestLogger.log(`Searching for management number: ${managementNumber}`);
        const count = await this.getPreApplicationCount();

        for (let i = 0; i < count; i++) {
            const data = await this.getPreApplicationData(i);
            if (data.listNumber.includes(managementNumber)) {
                TestLogger.log(`Found at index ${i}`);
                return i;
            }
        }

        TestLogger.log('Management number not found');
        return -1;
    }

    /**
     * Click on a pre-application row to view details
     * @param index - Row index (0-based)
     */
    async clickPreApplication(index: number): Promise<void> {
        TestLogger.log(`Clicking pre-application at index ${index}`);
        const row = this.tableRows.nth(index);
        await row.click();
        await this.page.waitForTimeout(1000); // Wait for navigation/modal
    }

    /**
     * Click the action button (three dots menu) for a specific row
     * @param index - Row index (0-based)
     */
    async clickActionButton(index: number): Promise<void> {
        TestLogger.log(`Clicking action button for row ${index}`);
        const row = this.tableRows.nth(index);
        const actionButton = row.locator('button.MuiIconButton-root').last();
        await actionButton.click();
        await this.page.waitForTimeout(500);
    }

    // ============ Actions ============

    /**
     * Click "Create New" button to create a new pre-application
     */
    async clickCreateNew(): Promise<void> {
        TestLogger.log('Clicking Create New button...');
        await this.createNewButton.click();
        await this.page.waitForTimeout(1000); // Wait for form/modal to open
    }

    /**
     * Click CSV Export button
     */
    async clickCsvExport(): Promise<void> {
        await this.csvExportButton.click({ force: true });
    }

    async isCsvExportButtonEnabled(): Promise<boolean> {
        return await this.csvExportButton.isEnabled();
    }

    // ============ Filter Methods ============

    async filterByYear(year: string): Promise<void> {
        TestLogger.log(`Filtering by year: ${year}`);
        // Click the dropdown trigger (assuming label "対象年" is near the select)
        // MUI Select structure often has a hidden input and a visible div
        // We'll try to find the select by its label or a unique attribute if possible
        // Based on common patterns, we might look for a sibling of the label
        await this.page.locator('label:has-text("対象年") + div').click();

        // Wait for listbox
        const listbox = this.page.locator('ul[role="listbox"]');
        await listbox.waitFor();

        // Click the option
        await listbox.locator(`li[role="option"]:has-text("${year}")`).click();
        await this.page.waitForTimeout(1000); // Wait for filter to apply
    }

    async filterByUsage(usage: string): Promise<void> {
        TestLogger.log(`Filtering by usage: ${usage}`);
        await this.page.locator('label:has-text("用途") + div').click();

        const listbox = this.page.locator('ul[role="listbox"]');
        await listbox.waitFor();

        await listbox.locator(`li[role="option"]:has-text("${usage}")`).click();
        await this.page.waitForTimeout(1000);
    }

    // ============ Row Action Methods ============

    async clickRowAction(index: number, action: '編集' | '削除'): Promise<void> {
        TestLogger.log(`Clicking action "${action}" for row ${index}`);
        await this.clickActionButton(index);

        const menu = this.page.locator('ul[role="menu"]');
        await menu.waitFor();

        await menu.locator(`li[role="menuitem"]:has-text("${action}")`).click();
    }

    // ============ Pagination Methods ============

    async changeItemsPerPage(count: 5 | 10 | 25 | 50): Promise<void> {
        TestLogger.log(`Changing items per page to: ${count}`);
        // "表示件数" label - target the combobox specifically
        await this.page.locator('.MuiTablePagination-select[role="combobox"]').click();

        const listbox = this.page.locator('ul[role="listbox"]');
        await listbox.waitFor();

        await listbox.locator(`li[data-value="${count}"]`).click();
        await this.page.waitForTimeout(1000);
    }

    async getPaginationInfo(): Promise<string> {
        return await this.page.locator('.MuiTablePagination-displayedRows').textContent() || '';
    }

    // ============ Verification Methods ============

    /**
     * Verify the page title is displayed
     */
    async verifyPageTitle(): Promise<boolean> {
        return await this.pageHeading.isVisible();
    }

    /**
     * Verify Create New button is visible
     */
    async verifyCreateNewButtonVisible(): Promise<boolean> {
        return await this.createNewButton.isVisible();
    }

    /**
     * Verify table has data
     */
    async verifyTableHasData(): Promise<boolean> {
        const count = await this.getPreApplicationCount();
        return count > 0;
    }
}
