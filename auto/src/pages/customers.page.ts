import { Page, expect } from '@playwright/test';
import { BasePage } from './base.page';

/**
 * Customers Page Object
 * Handles customer list, search, and customer detail interactions
 */
export class CustomersPage extends BasePage {
  // Selectors
  private readonly customerListTable = 'table, [role="table"], .MuiTable-root';
  private readonly customerRows = 'tbody tr, [role="row"]';
  private readonly searchInput = 'input[type="search"], input[placeholder*="検索"], input[placeholder*="Search"]';
  private readonly createCustomerButton = 'button:has-text("顧客作成"), button:has-text("Create Customer")';
  private readonly csvImportButton = 'button:has-text("CSVインポート"), button:has-text("CSV Import")';
  private readonly customerDetailPage = '.customer-detail, [data-testid="customer-detail"]';
  private readonly customerNameLink = 'a:has-text("顧客"), td a';
  private readonly pagination = '.MuiPagination-root, [data-testid="pagination"]';

  constructor(page: Page) {
    super(page);
  }

  /**
   * Navigate to customers page
   */
  async goto(): Promise<void> {
    await super.goto('/customers');
    await this.waitForPageLoad();
  }

  /**
   * Verify customers page is loaded
   */
  async verifyCustomersPageLoaded(): Promise<void> {
    await expect(this.page).toHaveURL(/.*\/customers/);
    await expect(this.page.locator(this.customerListTable)).toBeVisible();
  }

  /**
   * Search for customers by keyword
   */
  async searchCustomers(keyword: string): Promise<void> {
    await this.fill(this.searchInput, keyword);
    await this.pressKey('Enter');
    await this.waitForPageLoad();
  }

  /**
   * Click on customer by name
   */
  async clickCustomerByName(customerName: string): Promise<void> {
    await this.page.click(`text=${customerName}`);
    await this.waitForNavigation();
  }

  /**
   * Click create customer button
   */
  async clickCreateCustomer(): Promise<void> {
    await this.click(this.createCustomerButton);
    await this.waitForNavigation();
  }

  /**
   * Click CSV import button
   */
  async clickCSVImport(): Promise<void> {
    await this.click(this.csvImportButton);
    await this.waitForNavigation();
  }

  /**
   * Get customer count from current page
   */
  async getCustomerCount(): Promise<number> {
    const rows = this.page.locator(this.customerRows);
    return await rows.count();
  }

  /**
   * Verify customer exists in list
   */
  async verifyCustomerExists(customerName: string): Promise<void> {
    await expect(this.page.locator(`text=${customerName}`)).toBeVisible();
  }

  /**
   * Verify customer email
   */
  async verifyCustomerEmail(customerName: string, expectedEmail: string): Promise<void> {
    const customerRow = this.page.locator(`tr:has-text("${customerName}")`);
    await expect(customerRow).toContainText(expectedEmail);
  }

  /**
   * Get customer details from list row
   */
  async getCustomerDetails(customerName: string): Promise<Partial<{ name: string; email: string; phone: string; orderCount: string; totalSpent: string }>> {
    const row = this.page.locator(`tr:has-text("${customerName}")`);
    // Extract details from row cells
    // This is a placeholder - actual implementation depends on table structure
    return {};
  }

  /**
   * Navigate to customer detail page
   */
  async viewCustomerDetail(customerName: string): Promise<void> {
    await this.clickCustomerByName(customerName);
    await this.verifyCustomerDetailPage();
  }

  /**
   * Verify customer detail page is loaded
   */
  async verifyCustomerDetailPage(): Promise<void> {
    await expect(this.page.locator(this.customerDetailPage)).toBeVisible();
  }
}

