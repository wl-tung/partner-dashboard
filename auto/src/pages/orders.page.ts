import { Page, expect } from '@playwright/test';
import { BasePage } from './base.page';
import { OrderStatus } from '../types';

/**
 * Orders Page Object
 * Handles order list, search, and order detail interactions
 */
export class OrdersPage extends BasePage {
  // Selectors
  private readonly orderListTable = 'table, [role="table"], .MuiTable-root';
  private readonly orderRows = 'tbody tr, [role="row"]';
  private readonly searchInput = 'input[type="search"], input[placeholder*="検索"], input[placeholder*="Search"]';
  private readonly statusFilter = 'select[name="status"], [data-testid="status-filter"]';
  private readonly dateFilter = 'input[type="date"], [data-testid="date-filter"]';
  private readonly pagination = '.MuiPagination-root, [data-testid="pagination"]';
  private readonly nextPageButton = 'button[aria-label="Next"], button:has-text("次へ")';
  private readonly previousPageButton = 'button[aria-label="Previous"], button:has-text("前へ")';
  private readonly bulkCheckbox = 'thead input[type="checkbox"]';
  private readonly orderCheckboxes = 'tbody input[type="checkbox"]';
  private readonly formPrintButton = 'button:has-text("帳票印刷"), button:has-text("Form Printing")';
  private readonly createOrderFromPreAppButton = 'button:has-text("事前申込から注文作成")';
  private readonly proxyOrderButton = 'button:has-text("代理注文配置"), button:has-text("Proxy Order Placement")';
  private readonly orderDetailPage = '.order-detail, [data-testid="order-detail"]';
  private readonly orderNumberLink = 'a:has-text("注文"), td a';

  constructor(page: Page) {
    super(page);
  }

  /**
   * Navigate to orders page
   */
  async goto(): Promise<void> {
    await super.goto('/orders');
    await this.waitForPageLoad();
  }

  /**
   * Verify orders page is loaded
   */
  async verifyOrdersPageLoaded(): Promise<void> {
    await expect(this.page).toHaveURL(/.*\/orders/);
    await expect(this.page.locator(this.orderListTable)).toBeVisible();
  }

  /**
   * Search for orders by keyword
   */
  async searchOrders(keyword: string): Promise<void> {
    await this.fill(this.searchInput, keyword);
    await this.pressKey('Enter');
    await this.waitForPageLoad();
  }

  /**
   * Filter orders by status
   */
  async filterByStatus(status: OrderStatus): Promise<void> {
    if (await this.isElementExists(this.statusFilter)) {
      await this.selectOption(this.statusFilter, status);
      await this.waitForPageLoad();
    }
  }

  /**
   * Filter orders by date range
   */
  async filterByDateRange(startDate: string, endDate: string): Promise<void> {
    // Implementation depends on actual date picker component
    await this.waitForPageLoad();
  }

  /**
   * Click on order by order number
   */
  async clickOrderByNumber(orderNumber: string): Promise<void> {
    await this.page.click(`text=${orderNumber}`);
    await this.waitForNavigation();
  }

  /**
   * Get order count from current page
   */
  async getOrderCount(): Promise<number> {
    const rows = this.page.locator(this.orderRows);
    return await rows.count();
  }

  /**
   * Select order by checkbox
   */
  async selectOrder(index: number): Promise<void> {
    const checkboxes = this.page.locator(this.orderCheckboxes);
    await checkboxes.nth(index).check();
  }

  /**
   * Select all orders
   */
  async selectAllOrders(): Promise<void> {
    if (await this.isElementExists(this.bulkCheckbox)) {
      await this.click(this.bulkCheckbox);
    }
  }

  /**
   * Click form print button
   */
  async clickFormPrint(): Promise<void> {
    await this.click(this.formPrintButton);
  }

  /**
   * Click create order from pre-application
   */
  async clickCreateOrderFromPreApp(): Promise<void> {
    await this.click(this.createOrderFromPreAppButton);
    await this.waitForNavigation();
  }

  /**
   * Click proxy order button
   */
  async clickProxyOrder(): Promise<void> {
    await this.click(this.proxyOrderButton);
    await this.waitForNavigation();
  }

  /**
   * Navigate to next page
   */
  async goToNextPage(): Promise<void> {
    if (await this.isElementExists(this.nextPageButton)) {
      await this.click(this.nextPageButton);
      await this.waitForPageLoad();
    }
  }

  /**
   * Navigate to previous page
   */
  async goToPreviousPage(): Promise<void> {
    if (await this.isElementExists(this.previousPageButton)) {
      await this.click(this.previousPageButton);
      await this.waitForPageLoad();
    }
  }

  /**
   * Verify order exists in list
   */
  async verifyOrderExists(orderNumber: string): Promise<void> {
    await expect(this.page.locator(`text=${orderNumber}`)).toBeVisible();
  }

  /**
   * Verify order status
   */
  async verifyOrderStatus(orderNumber: string, expectedStatus: OrderStatus): Promise<void> {
    const orderRow = this.page.locator(`tr:has-text("${orderNumber}")`);
    await expect(orderRow).toContainText(expectedStatus);
  }

  /**
   * Get order details from list row
   */
  async getOrderDetails(orderNumber: string): Promise<Partial<{ orderNumber: string; status: string; customer: string; amount: string; date: string }>> {
    const row = this.page.locator(`tr:has-text("${orderNumber}")`);
    // Extract details from row cells
    // This is a placeholder - actual implementation depends on table structure
    return {};
  }
}

