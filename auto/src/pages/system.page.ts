import { Page, expect } from '@playwright/test';
import { BasePage } from './base.page';

/**
 * System Management Page Object
 * Handles system logs, settings, and configuration (Mall Administrator only)
 */
export class SystemPage extends BasePage {
  // Selectors
  private readonly logManagementTab = 'button:has-text("ログ管理"), button:has-text("Log Management")';
  private readonly statusManagementTab = 'button:has-text("ステータス管理"), button:has-text("Status Management")';
  private readonly integrationSettingsTab = 'button:has-text("連携設定"), button:has-text("Integration Settings")';
  private readonly storeManagementTab = 'button:has-text("店舗管理"), button:has-text("Store Management")';
  private readonly locationManagementTab = 'button:has-text("ロケーション管理"), button:has-text("Location Management")';
  private readonly logTable = 'table, [role="table"], .MuiTable-root';
  private readonly logRows = 'tbody tr, [role="row"]';
  private readonly dateRangePicker = 'input[type="date"], [data-testid="date-range"]';
  private readonly moduleFilter = 'select[name="module"], [data-testid="module-filter"]';
  private readonly actionTypeFilter = 'select[name="action"], [data-testid="action-filter"]';
  private readonly userFilter = 'input[placeholder*="ユーザー"], input[placeholder*="User"]';
  private readonly exportButton = 'button:has-text("エクスポート"), button:has-text("Export")';
  private readonly shopifySettings = '.shopify-settings, [data-testid="shopify-settings"]';
  private readonly shopifyApiKey = 'input[name="apiKey"], input[placeholder*="API Key"]';
  private readonly shopifyApiSecret = 'input[name="apiSecret"], input[placeholder*="API Secret"]';
  private readonly shopifyAccessToken = 'input[name="accessToken"], input[placeholder*="Access Token"]';
  private readonly shopifyShopUrl = 'input[name="shopUrl"], input[placeholder*="Shop URL"]';

  constructor(page: Page) {
    super(page);
  }

  /**
   * Navigate to system logs page
   */
  async gotoLogs(): Promise<void> {
    await super.goto('/system/logs');
    await this.waitForPageLoad();
  }

  /**
   * Navigate to system page
   */
  async goto(): Promise<void> {
    await super.goto('/system');
    await this.waitForPageLoad();
  }

  /**
   * Verify system logs page is loaded
   */
  async verifySystemLogsPageLoaded(): Promise<void> {
    await expect(this.page).toHaveURL(/.*\/system\/logs/);
    await expect(this.page.locator(this.logTable)).toBeVisible();
  }

  /**
   * Click on log management tab
   */
  async clickLogManagement(): Promise<void> {
    await this.click(this.logManagementTab);
    await this.waitForPageLoad();
  }

  /**
   * Click on status management tab
   */
  async clickStatusManagement(): Promise<void> {
    await this.click(this.statusManagementTab);
    await this.waitForPageLoad();
  }

  /**
   * Click on integration settings tab
   */
  async clickIntegrationSettings(): Promise<void> {
    await this.click(this.integrationSettingsTab);
    await this.waitForPageLoad();
  }

  /**
   * Click on store management tab
   */
  async clickStoreManagement(): Promise<void> {
    await this.click(this.storeManagementTab);
    await this.waitForPageLoad();
  }

  /**
   * Click on location management tab
   */
  async clickLocationManagement(): Promise<void> {
    await this.click(this.locationManagementTab);
    await this.waitForPageLoad();
  }

  /**
   * Filter logs by date range
   */
  async filterLogsByDateRange(startDate: string, endDate: string): Promise<void> {
    // Implementation depends on actual date picker component
    await this.waitForPageLoad();
  }

  /**
   * Filter logs by module
   */
  async filterLogsByModule(module: string): Promise<void> {
    if (await this.isElementExists(this.moduleFilter)) {
      await this.selectOption(this.moduleFilter, module);
      await this.waitForPageLoad();
    }
  }

  /**
   * Filter logs by action type
   */
  async filterLogsByActionType(actionType: string): Promise<void> {
    if (await this.isElementExists(this.actionTypeFilter)) {
      await this.selectOption(this.actionTypeFilter, actionType);
      await this.waitForPageLoad();
    }
  }

  /**
   * Filter logs by user
   */
  async filterLogsByUser(userName: string): Promise<void> {
    await this.fill(this.userFilter, userName);
    await this.pressKey('Enter');
    await this.waitForPageLoad();
  }

  /**
   * Export logs
   */
  async exportLogs(format: 'CSV' | 'Excel' | 'JSON' = 'CSV'): Promise<void> {
    await this.click(this.exportButton);
    // Handle export dialog if needed
  }

  /**
   * Get log count from current page
   */
  async getLogCount(): Promise<number> {
    const rows = this.page.locator(this.logRows);
    return await rows.count();
  }

  /**
   * Configure Shopify integration
   */
  async configureShopify(shopUrl: string, apiKey: string, apiSecret: string, accessToken: string): Promise<void> {
    await this.clickIntegrationSettings();
    await this.waitForElement(this.shopifySettings);
    
    await this.fill(this.shopifyShopUrl, shopUrl);
    await this.fill(this.shopifyApiKey, apiKey);
    await this.fill(this.shopifyApiSecret, apiSecret);
    await this.fill(this.shopifyAccessToken, accessToken);
    
    // Click save button
    await this.page.click('button:has-text("保存"), button:has-text("Save")');
    await this.waitForPageLoad();
  }

  /**
   * Verify access restricted message (for non-admin users)
   */
  async verifyAccessRestricted(): Promise<void> {
    await expect(this.page.locator('text=モール管理者のみがアクセス可能, text=Access Restricted')).toBeVisible();
  }
}

