import { Page, expect } from '@playwright/test';
import { BasePage } from './base.page';
import { AccountStatus, UserRole } from '../types';

/**
 * Accounts Page Object
 * Handles account management (Mall Administrator only)
 */
export class AccountsPage extends BasePage {
  // Selectors
  private readonly accountListTable = 'table, [role="table"], .MuiTable-root';
  private readonly accountRows = 'tbody tr, [role="row"]';
  private readonly searchInput = 'input[type="search"], input[placeholder*="検索"], input[placeholder*="Search"]';
  private readonly createAccountButton = 'button:has-text("アカウント作成"), button:has-text("Create Account")';
  private readonly permissionManagementButton = 'button:has-text("権限管理"), button:has-text("Permission Management")';
  private readonly accountDetailPage = '.account-detail, [data-testid="account-detail"]';
  private readonly employeeCodeLink = 'a:has-text("従業員コード"), td a';

  constructor(page: Page) {
    super(page);
  }

  /**
   * Navigate to accounts page
   */
  async goto(): Promise<void> {
    await super.goto('/accounts');
    await this.waitForPageLoad();
  }

  /**
   * Verify accounts page is loaded
   */
  async verifyAccountsPageLoaded(): Promise<void> {
    await expect(this.page).toHaveURL(/.*\/accounts/);
    await expect(this.page.locator(this.accountListTable)).toBeVisible();
  }

  /**
   * Search for accounts by keyword
   */
  async searchAccounts(keyword: string): Promise<void> {
    await this.fill(this.searchInput, keyword);
    await this.pressKey('Enter');
    await this.waitForPageLoad();
  }

  /**
   * Click on account by employee code
   */
  async clickAccountByEmployeeCode(employeeCode: string): Promise<void> {
    await this.page.click(`text=${employeeCode}`);
    await this.waitForNavigation();
  }

  /**
   * Click create account button
   */
  async clickCreateAccount(): Promise<void> {
    await this.click(this.createAccountButton);
    await this.waitForNavigation();
  }

  /**
   * Click permission management button
   */
  async clickPermissionManagement(): Promise<void> {
    await this.click(this.permissionManagementButton);
    await this.waitForNavigation();
  }

  /**
   * Get account count from current page
   */
  async getAccountCount(): Promise<number> {
    const rows = this.page.locator(this.accountRows);
    return await rows.count();
  }

  /**
   * Verify account exists in list
   */
  async verifyAccountExists(employeeCode: string): Promise<void> {
    await expect(this.page.locator(`text=${employeeCode}`)).toBeVisible();
  }

  /**
   * Verify account status
   */
  async verifyAccountStatus(employeeCode: string, expectedStatus: AccountStatus): Promise<void> {
    const accountRow = this.page.locator(`tr:has-text("${employeeCode}")`);
    await expect(accountRow).toContainText(expectedStatus);
  }

  /**
   * Verify account role
   */
  async verifyAccountRole(employeeCode: string, expectedRole: UserRole): Promise<void> {
    const accountRow = this.page.locator(`tr:has-text("${employeeCode}")`);
    await expect(accountRow).toContainText(expectedRole);
  }

  /**
   * Navigate to account detail page
   */
  async viewAccountDetail(employeeCode: string): Promise<void> {
    await this.clickAccountByEmployeeCode(employeeCode);
    await this.verifyAccountDetailPage();
  }

  /**
   * Verify account detail page is loaded
   */
  async verifyAccountDetailPage(): Promise<void> {
    await expect(this.page.locator(this.accountDetailPage)).toBeVisible();
  }

  /**
   * Verify access restricted message (for non-admin users)
   */
  async verifyAccessRestricted(): Promise<void> {
    await expect(this.page.locator('text=モール管理者のみがアクセス可能, text=Access Restricted')).toBeVisible();
  }
}

