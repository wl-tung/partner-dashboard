import { Page, Locator, expect } from '@playwright/test';

/**
 * Base Page Object class with common methods and utilities
 * All page objects should extend this class
 */
export class BasePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Navigate to a specific URL
   */
  async goto(path: string = ''): Promise<void> {
    await this.page.goto(path);
  }

  /**
   * Wait for page to be fully loaded
   */
  async waitForPageLoad(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Wait for element to be visible
   */
  async waitForElement(selector: string, timeout?: number): Promise<void> {
    await this.page.waitForSelector(selector, { state: 'visible', timeout });
  }

  /**
   * Wait for element to be hidden
   */
  async waitForElementHidden(selector: string, timeout?: number): Promise<void> {
    await this.page.waitForSelector(selector, { state: 'hidden', timeout });
  }

  /**
   * Click on an element
   */
  async click(selector: string): Promise<void> {
    await this.page.click(selector);
  }

  /**
   * Fill input field
   */
  async fill(selector: string, value: string): Promise<void> {
    await this.page.fill(selector, value);
  }

  /**
   * Get text content of an element
   */
  async getText(selector: string): Promise<string> {
    return await this.page.locator(selector).textContent() || '';
  }

  /**
   * Get all text contents of matching elements
   */
  async getAllTexts(selector: string): Promise<string[]> {
    return await this.page.locator(selector).allTextContents();
  }

  /**
   * Check if element is visible
   */
  async isVisible(selector: string): Promise<boolean> {
    return await this.page.locator(selector).isVisible();
  }

  /**
   * Check if element exists
   */
  async isElementExists(selector: string): Promise<boolean> {
    return (await this.page.locator(selector).count()) > 0;
  }

  /**
   * Select option from dropdown
   */
  async selectOption(selector: string, value: string | { label?: string; value?: string; index?: number }): Promise<void> {
    await this.page.selectOption(selector, value);
  }

  /**
   * Wait for navigation
   */
  async waitForNavigation(): Promise<void> {
    await this.page.waitForURL('**', { waitUntil: 'networkidle' });
  }

  /**
   * Get current URL
   */
  getCurrentUrl(): string {
    return this.page.url();
  }

  /**
   * Get page title
   */
  async getTitle(): Promise<string> {
    return await this.page.title();
  }

  /**
   * Take screenshot
   */
  async takeScreenshot(name: string): Promise<void> {
    await this.page.screenshot({ path: `screenshots/${name}.png`, fullPage: true });
  }

  /**
   * Wait for API response
   */
  async waitForResponse(urlPattern: string | RegExp, timeout?: number): Promise<void> {
    await this.page.waitForResponse(urlPattern, { timeout });
  }

  /**
   * Wait for API request
   */
  async waitForRequest(urlPattern: string | RegExp, timeout?: number): Promise<void> {
    await this.page.waitForRequest(urlPattern, { timeout });
  }

  /**
   * Get element by text (useful for Japanese text)
   */
  getByText(text: string): Locator {
    return this.page.getByText(text);
  }

  /**
   * Get element by role
   */
  getByRole(role: 'button' | 'link' | 'textbox' | 'checkbox' | 'radio' | 'combobox' | 'heading', options?: { name?: string; exact?: boolean }): Locator {
    return this.page.getByRole(role, options);
  }

  /**
   * Get element by label
   */
  getByLabel(text: string): Locator {
    return this.page.getByLabel(text);
  }

  /**
   * Get element by placeholder
   */
  getByPlaceholder(text: string): Locator {
    return this.page.getByPlaceholder(text);
  }

  /**
   * Wait for text to appear (useful for Japanese content)
   */
  async waitForText(text: string, timeout?: number): Promise<void> {
    await this.page.waitForSelector(`text=${text}`, { timeout });
  }

  /**
   * Verify text is present on page
   */
  async verifyTextPresent(text: string): Promise<void> {
    await expect(this.page.locator(`text=${text}`).first()).toBeVisible();
  }

  /**
   * Verify URL contains path
   */
  async verifyUrlContains(path: string): Promise<void> {
    await expect(this.page).toHaveURL(new RegExp(path));
  }

  /**
   * Scroll to element
   */
  async scrollToElement(selector: string): Promise<void> {
    await this.page.locator(selector).scrollIntoViewIfNeeded();
  }

  /**
   * Hover over element
   */
  async hover(selector: string): Promise<void> {
    await this.page.locator(selector).hover();
  }

  /**
   * Double click on element
   */
  async doubleClick(selector: string): Promise<void> {
    await this.page.locator(selector).dblclick();
  }

  /**
   * Press key
   */
  async pressKey(key: string): Promise<void> {
    await this.page.keyboard.press(key);
  }

  /**
   * Type text with delay (useful for slow typing simulation)
   */
  async type(selector: string, text: string, delay?: number): Promise<void> {
    await this.page.locator(selector).type(text, { delay });
  }

  /**
   * Clear input field
   */
  async clear(selector: string): Promise<void> {
    await this.page.locator(selector).clear();
  }

  /**
   * Get attribute value
   */
  async getAttribute(selector: string, attribute: string): Promise<string | null> {
    return await this.page.locator(selector).getAttribute(attribute);
  }

  /**
   * Wait for element to have specific text
   */
  async waitForTextContent(selector: string, text: string, timeout?: number): Promise<void> {
    await expect(this.page.locator(selector)).toContainText(text, { timeout });
  }
}

