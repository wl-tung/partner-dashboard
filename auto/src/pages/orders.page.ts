import { Page, expect } from '@playwright/test';
import { BasePage } from './base.page';
import { OrderStatus } from '../types';

/**
 * Orders Page Object
 * Handles order list, search, and order detail interactions
 * ENHANCED: Uses flexible selectors and smart waits
 */
export class OrdersPage extends BasePage {
  // Selectors
  private readonly orderListTable = 'table, [role="table"], .MuiTable-root';
  private readonly orderRows = 'tbody tr, [role="row"]';

  // Flexible selectors for search input
  private readonly searchInputSelectors = [
    'input[type="search"]',
    'input[placeholder*="検索"]',
    'input[placeholder*="Search"]',
    '[data-testid="search-input"]'
  ];

  // Flexible selectors for status filter
  private readonly statusFilterSelectors = [
    'select[name="status"]',
    '[data-testid="status-filter"]',
    '#status-filter',
    'div[role="button"]:has-text("Status")'
  ];

  constructor(page: Page) {
    super(page);
  }

  /**
   * Navigate to orders page
   */
  async goto(): Promise<void> {
    await super.goto('/orders');
    await this.waitForOrdersLoaded();
  }

  /**
   * Verify orders page is loaded
   */
  async verifyOrdersPageLoaded(): Promise<void> {
    await expect(this.page).toHaveURL(/.*\/orders/);

    // Wait for table to be visible
    await this.waitForOrdersLoaded();

    // Verify at least the table container exists
    const tableVisible = await this.page.locator(this.orderListTable).first().isVisible().catch(() => false);
    if (!tableVisible) {
      // If table not found, check for "No orders" message or empty state
      const emptyState = await this.page.locator('text=No orders|text=注文はありません').isVisible().catch(() => false);
      if (!emptyState) {
        throw new Error('Orders table not found and no empty state message visible');
      }
    }
  }

  /**
   * Wait for orders to be fully loaded
   */
  async waitForOrdersLoaded(): Promise<void> {
    // Wait for URL
    await this.page.waitForURL(/.*\/orders/);

    // Wait for network idle to ensure API calls are done
    await this.page.waitForLoadState('networkidle');

    // Wait for spinner to disappear if it exists
    const spinner = this.page.locator('.MuiCircularProgress-root, [role="progressbar"]');
    if (await spinner.isVisible().catch(() => false)) {
      await spinner.waitFor({ state: 'hidden', timeout: 10000 }).catch(() => { });
    }

    // Wait a bit for rendering
    await this.page.waitForTimeout(500);
  }

  /**
   * Search for orders by keyword
   */
  async searchOrders(keyword: string): Promise<void> {
    // Find working search input
    let searchInput = '';
    for (const selector of this.searchInputSelectors) {
      if (await this.page.locator(selector).first().isVisible().catch(() => false)) {
        searchInput = selector;
        break;
      }
    }

    if (!searchInput) {
      throw new Error('Could not find search input');
    }

    await this.fill(searchInput, keyword);
    await this.pressKey('Enter');

    // Wait for results to reload
    await this.page.waitForTimeout(1000); // Give time for request to start
    await this.waitForOrdersLoaded();
  }

  /**
   * Filter orders by status
   */
  async filterByStatus(status: OrderStatus): Promise<void> {
    // Find working status filter
    // Note: Implementation depends heavily on UI library (MUI, native select, etc.)
    // This is a simplified approach

    // Try native select first
    const select = this.page.locator('select[name="status"]');
    if (await select.isVisible().catch(() => false)) {
      await select.selectOption({ label: status }).catch(() => select.selectOption({ value: status }));
      await this.waitForOrdersLoaded();
      return;
    }

    // Try MUI/Custom dropdown
    // This usually involves clicking a trigger then clicking an option
    const trigger = this.page.locator('[role="button"]:has-text("Status"), [role="button"]:has-text("ステータス")');
    if (await trigger.isVisible().catch(() => false)) {
      await trigger.click();
      await this.page.waitForTimeout(200);
      await this.page.click(`li[role="option"]:has-text("${status}")`);
      await this.waitForOrdersLoaded();
      return;
    }

    console.log('Could not find status filter, skipping filter step');
  }

  /**
   * Get order count from current page
   */
  async getOrderCount(): Promise<number> {
    return await this.page.locator(this.orderRows).count();
  }

  /**
   * Get data from a specific order row
   */
  async getOrderRowData(index: number): Promise<any> {
    const row = this.page.locator(this.orderRows).nth(index);
    if (!(await row.isVisible())) return null;

    // Extract text from all cells
    const cells = row.locator('td');
    const cellCount = await cells.count();
    const rowData: string[] = [];

    for (let i = 0; i < cellCount; i++) {
      rowData.push(await cells.nth(i).innerText());
    }

    return {
      raw: rowData,
      // Attempt to parse common fields if possible (heuristic)
      // Order number usually starts with # or ORD-
      orderNumber: rowData.find(t => t.match(/^#\d+/) || t.match(/ORD-\d+/)) || '',
      // Status is usually one of the known status strings
      status: rowData.find(t => Object.values(OrderStatus).some(s => t.includes(s))) || '',
      // Amount usually starts with ¥ or has currency format
      amount: rowData.find(t => t.includes('¥') && t.match(/\d/)) || ''
    };
  }

  /**
   * Select order by checkbox
   */
  async selectOrder(index: number): Promise<void> {
    const checkbox = this.page.locator(this.orderRows).nth(index).locator('input[type="checkbox"]');
    if (await checkbox.isVisible()) {
      await checkbox.check();
    }
  }

  /**
   * Navigate to next page
   */
  async goToNextPage(): Promise<void> {
    const nextBtn = this.page.locator('button[aria-label="Next page"], button[title="Next page"], .MuiPaginationItem-previousNext').last();
    if (await nextBtn.isVisible() && await nextBtn.isEnabled()) {
      await nextBtn.click();
      await this.waitForOrdersLoaded();
    }
  }
}

