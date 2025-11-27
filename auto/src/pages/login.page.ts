import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base.page';
import { User, Location } from '../types';

/**
 * Login Page Object
 * Handles authentication and location selection
 */
export class LoginPage extends BasePage {
  // Selectors - Updated based on actual page structure (using getters for dynamic access)
  
  /**
   * Email/Employee Code input field
   */
  get emailInput(): Locator {
    return this.page.getByLabel('メールアドレスまたは従業員コード');
  }

  /**
   * Password input field
   */
  get passwordInput(): Locator {
    return this.page.getByLabel('パスワード');
  }

  /**
   * Password visibility toggle button
   */
  get passwordToggle(): Locator {
    return this.page.locator('button[aria-label*="password"], button[aria-label*="パスワード"], button[type="button"]:has([class*="IconButton"])').first();
  }

  /**
   * Store dropdown (combobox) - flexible selector
   */
  get storeDropdown(): Locator {
    // Try exact match first, then fallback to any combobox
    return this.page.getByRole('combobox').first();
  }

  /**
   * Building dropdown (combobox) - flexible selector
   */
  get buildingDropdown(): Locator {
    // Second combobox is usually building
    return this.page.getByRole('combobox').nth(1);
  }

  /**
   * Location dropdown (combobox) - flexible selector
   */
  get locationDropdown(): Locator {
    // Third combobox is usually location
    return this.page.getByRole('combobox').nth(2);
  }

  /**
   * Remember Me checkbox
   */
  get rememberMeCheckbox(): Locator {
    return this.page.locator('input[type="checkbox"][name*="remember"], input[type="checkbox"][aria-label*="Remember"], input[type="checkbox"]').first();
  }

  /**
   * Login button
   */
  get loginButton(): Locator {
    return this.page.getByRole('button', { name: /ログイン|Login/i });
  }

  /**
   * Error message element
   */
  get errorMessage(): Locator {
    return this.page.locator('.error, .MuiAlert-root, [role="alert"]').first();
  }

  constructor(page: Page) {
    super(page);
  }

  /**
   * Navigate to login page
   */
  async goto(): Promise<void> {
    await super.goto('/auth/login');
    await this.waitForPageLoad();
  }

  /**
   * Login with email and password
   */
  async loginWithEmail(email: string, password: string, location: Location, rememberMe: boolean = false): Promise<void> {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.selectLocation(location);
    
    if (rememberMe) {
      if (await this.rememberMeCheckbox.isVisible({ timeout: 2000 }).catch(() => false)) {
        await this.rememberMeCheckbox.check();
      }
    }
    
    await this.loginButton.click();
    await this.waitForNavigation();
  }

  /**
   * Login with employee code and password
   */
  async loginWithEmployeeCode(employeeCode: string, password: string, location: Location, rememberMe: boolean = false): Promise<void> {
    // Same input field accepts both email and employee code
    await this.emailInput.fill(employeeCode);
    await this.passwordInput.fill(password);
    await this.selectLocation(location);
    
    if (rememberMe) {
      if (await this.rememberMeCheckbox.isVisible({ timeout: 2000 }).catch(() => false)) {
        await this.rememberMeCheckbox.check();
      }
    }
    
    await this.loginButton.click();
    await this.waitForNavigation();
  }

  /**
   * Login using User object
   */
  async login(user: User, rememberMe: boolean = false): Promise<void> {
    const location: Location = {
      storeCode: user.storeCode || process.env.TEST_STORE_CODE || 'TKY001',
      buildingCode: user.buildingCode || process.env.TEST_BUILDING_CODE || 'TKY001-A',
      locationCode: user.locationCode || process.env.TEST_LOCATION_CODE || 'TKY001-A-1B'
    };

    if (user.email) {
      await this.loginWithEmail(user.email, user.password, location, rememberMe);
    } else if (user.employeeCode) {
      await this.loginWithEmployeeCode(user.employeeCode, user.password, location, rememberMe);
    } else {
      throw new Error('User must have either email or employeeCode');
    }
  }

  /**
   * Select location (Store → Building → Location)
   */
  async selectLocation(location: Location): Promise<void> {
    await this.selectLocationWithRetry(location);
  }

  /**
   * Select location with retry logic for Material UI dropdowns
   * Handles portal/overlay rendering issues
   */
  async selectLocationWithRetry(location: Location, maxRetries: number = 3): Promise<void> {
    // Select Store
    await this.selectStoreWithRetry(location.storeCode, maxRetries);
    
    // Select Building
    await this.selectBuildingWithRetry(location.buildingCode, maxRetries);
    
    // Select Location
    await this.selectLocationOptionWithRetry(location.locationCode, maxRetries);
  }

  /**
   * Select store with multiple strategies
   */
  async selectStoreWithRetry(storeCode: string, maxRetries: number = 3): Promise<void> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        // Use getByRole for Material UI combobox (first combobox is store)
        const storeCombobox = this.page.getByRole('combobox').first();
        
        if (await storeCombobox.isVisible({ timeout: 5000 }).catch(() => false)) {
          // Click to open dropdown
          await storeCombobox.click({ force: true });
          await this.page.waitForTimeout(500);
          
          // Wait for dropdown menu to appear - try multiple selectors
          const menuSelectors = [
            '[role="listbox"]',
            '[role="menu"]',
            '.MuiMenu-list',
            'ul[role="listbox"]',
            '.MuiAutocomplete-listbox',
            '.MuiPopover-root [role="listbox"]'
          ];
          
          let menuFound = false;
          for (const selector of menuSelectors) {
            try {
              await this.page.waitForSelector(selector, { timeout: 2000, state: 'visible' });
              menuFound = true;
              break;
            } catch {
              continue;
            }
          }
          
          if (!menuFound) {
            // Try waiting a bit more and check if menu appeared
            await this.page.waitForTimeout(500);
          }
          
          // Try multiple strategies to find and click the option
          const optionSelectors = [
            `[role="option"]:has-text("${storeCode}")`,
            `li:has-text("${storeCode}")`,
            `[data-value*="${storeCode}"]`,
            `[data-value="${storeCode}"]`,
            `.MuiMenuItem-root:has-text("${storeCode}")`,
            `.MuiAutocomplete-option:has-text("${storeCode}")`
          ];
          
          let optionSelected = false;
          for (const selector of optionSelectors) {
            const option = this.page.locator(selector).first();
            if (await option.count() > 0 && await option.isVisible({ timeout: 1000 }).catch(() => false)) {
              await option.click({ force: true });
              await this.page.waitForTimeout(500);
              optionSelected = true;
              break;
            }
          }
          
          if (optionSelected) {
            return;
          }
          
          // Fallback: try getByRole with partial text match
          try {
            const optionByText = this.page.getByRole('option', { name: new RegExp(storeCode, 'i') });
            if (await optionByText.count() > 0) {
              await optionByText.first().click({ force: true });
              await this.page.waitForTimeout(500);
              return;
            }
          } catch {
            // Continue to next attempt
          }
        }

        if (attempt === maxRetries) {
          throw new Error(`Failed to select store ${storeCode} after ${maxRetries} attempts`);
        }
      } catch (error) {
        if (attempt === maxRetries) throw error;
        await this.page.waitForTimeout(1000);
      }
    }
  }

  /**
   * Select building with multiple strategies
   */
  async selectBuildingWithRetry(buildingCode: string, maxRetries: number = 3): Promise<void> {
    // Wait for building dropdown to be enabled
    await this.page.waitForTimeout(1000);
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        // Use getByRole for Material UI combobox (second combobox is building)
        const buildingCombobox = this.page.getByRole('combobox').nth(1);
        
        // Wait for building dropdown to be enabled
        await buildingCombobox.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
        const isEnabled = await buildingCombobox.isEnabled({ timeout: 5000 }).catch(() => false);
        
        if (isEnabled) {
          await buildingCombobox.click({ force: true });
          await this.page.waitForTimeout(500);
          
          // Wait for dropdown menu to appear
          const menuSelectors = [
            '[role="listbox"]',
            '[role="menu"]',
            '.MuiMenu-list',
            'ul[role="listbox"]',
            '.MuiAutocomplete-listbox',
            '.MuiPopover-root [role="listbox"]'
          ];
          
          let menuFound = false;
          for (const selector of menuSelectors) {
            try {
              await this.page.waitForSelector(selector, { timeout: 2000, state: 'visible' });
              menuFound = true;
              break;
            } catch {
              continue;
            }
          }
          
          if (!menuFound) {
            await this.page.waitForTimeout(500);
          }
          
          // Try multiple strategies to find and click the option
          const optionSelectors = [
            `[role="option"]:has-text("${buildingCode}")`,
            `li:has-text("${buildingCode}")`,
            `[data-value*="${buildingCode}"]`,
            `[data-value="${buildingCode}"]`,
            `.MuiMenuItem-root:has-text("${buildingCode}")`,
            `.MuiAutocomplete-option:has-text("${buildingCode}")`
          ];
          
          let optionSelected = false;
          for (const selector of optionSelectors) {
            const option = this.page.locator(selector).first();
            if (await option.count() > 0 && await option.isVisible({ timeout: 1000 }).catch(() => false)) {
              await option.click({ force: true });
              await this.page.waitForTimeout(500);
              optionSelected = true;
              break;
            }
          }
          
          if (optionSelected) {
            return;
          }
          
          // Fallback: try getByRole with partial text match
          try {
            const optionByText = this.page.getByRole('option', { name: new RegExp(buildingCode, 'i') });
            if (await optionByText.count() > 0) {
              await optionByText.first().click({ force: true });
              await this.page.waitForTimeout(500);
              return;
            }
          } catch {
            // Continue to next attempt
          }
        }

        if (attempt === maxRetries) {
          throw new Error(`Failed to select building ${buildingCode} after ${maxRetries} attempts`);
        }
      } catch (error) {
        if (attempt === maxRetries) throw error;
        await this.page.waitForTimeout(1000);
      }
    }
  }

  /**
   * Select location option with multiple strategies
   */
  async selectLocationOptionWithRetry(locationCode: string, maxRetries: number = 3): Promise<void> {
    // Wait for location dropdown to be enabled
    await this.page.waitForTimeout(1000);
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        // Use getByRole for Material UI combobox (third combobox is location)
        const locationCombobox = this.page.getByRole('combobox').nth(2);
        
        // Wait for location dropdown to be enabled
        await locationCombobox.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
        const isEnabled = await locationCombobox.isEnabled({ timeout: 5000 }).catch(() => false);
        
        if (isEnabled) {
          await locationCombobox.click({ force: true });
          await this.page.waitForTimeout(500);
          
          // Wait for dropdown menu to appear
          const menuSelectors = [
            '[role="listbox"]',
            '[role="menu"]',
            '.MuiMenu-list',
            'ul[role="listbox"]',
            '.MuiAutocomplete-listbox',
            '.MuiPopover-root [role="listbox"]'
          ];
          
          let menuFound = false;
          for (const selector of menuSelectors) {
            try {
              await this.page.waitForSelector(selector, { timeout: 2000, state: 'visible' });
              menuFound = true;
              break;
            } catch {
              continue;
            }
          }
          
          if (!menuFound) {
            await this.page.waitForTimeout(500);
          }
          
          // Try multiple ways to find and click the option
          const optionSelectors = [
            `[role="option"]:has-text("${locationCode}")`,
            `li:has-text("${locationCode}")`,
            `.MuiMenuItem-root:has-text("${locationCode}")`,
            `[data-value="${locationCode}"]`,
            `[data-value*="${locationCode}"]`,
            `.MuiAutocomplete-option:has-text("${locationCode}")`
          ];

          let optionSelected = false;
          for (const selector of optionSelectors) {
            const option = this.page.locator(selector).first();
            if (await option.count() > 0 && await option.isVisible({ timeout: 1000 }).catch(() => false)) {
              await option.click({ force: true });
              await this.page.waitForTimeout(500);
              optionSelected = true;
              break;
            }
          }

          if (optionSelected) {
            return;
          }

          // Fallback: select by visible text using getByRole
          try {
            const optionByText = this.page.getByRole('option', { name: new RegExp(locationCode, 'i') });
            if (await optionByText.count() > 0) {
              await optionByText.first().click({ force: true });
              await this.page.waitForTimeout(500);
              return;
            }
          } catch {
            // Continue to next attempt
          }

          // Last resort: try keyboard navigation
          await this.page.keyboard.press('ArrowDown');
          await this.page.waitForTimeout(200);
          await this.page.keyboard.press('Enter');
          await this.page.waitForTimeout(500);
          return;
        }

        if (attempt === maxRetries) {
          throw new Error(`Failed to select location ${locationCode} after ${maxRetries} attempts`);
        }
      } catch (error) {
        if (attempt === maxRetries) throw error;
        await this.page.waitForTimeout(1000);
      }
    }
  }

  /**
   * Toggle password visibility
   */
  async togglePasswordVisibility(): Promise<void> {
    // Find password visibility toggle button (usually an icon button near password field)
    if (await this.passwordToggle.isVisible({ timeout: 2000 }).catch(() => false)) {
      await this.passwordToggle.click();
    }
  }

  /**
   * Verify login page is displayed
   */
  async verifyLoginPage(): Promise<void> {
    await expect(this.passwordInput).toBeVisible();
    await expect(this.loginButton).toBeVisible();
  }

  /**
   * Verify error message is displayed
   */
  async verifyErrorMessage(expectedMessage?: string): Promise<void> {
    await expect(this.errorMessage).toBeVisible({ timeout: 5000 });
    
    if (expectedMessage) {
      await expect(this.errorMessage).toContainText(expectedMessage);
    }
  }

  /**
   * Verify successful login (redirected to dashboard)
   */
  async verifySuccessfulLogin(): Promise<void> {
    await this.waitForNavigation();
    await expect(this.page).not.toHaveURL(/.*\/auth\/login/);
    await expect(this.page).toHaveURL(/.*\/$/);
  }

  /**
   * Check if remember me checkbox is checked
   */
  async isRememberMeChecked(): Promise<boolean> {
    if (await this.rememberMeCheckbox.isVisible({ timeout: 2000 }).catch(() => false)) {
      return await this.rememberMeCheckbox.isChecked();
    }
    return false;
  }

  /**
   * Verify form validation errors
   */
  async verifyFormValidation(): Promise<{ hasErrors: boolean; errors: string[] }> {
    const errors: string[] = [];
    // Combine multiple selectors
    const errorElements = this.page.locator('.error, .MuiAlert-root, [role="alert"], .MuiFormHelperText-root');
    const errorCount = await errorElements.count();
    
    for (let i = 0; i < errorCount; i++) {
      const errorText = await errorElements.nth(i).textContent();
      if (errorText) errors.push(errorText.trim());
    }

    return {
      hasErrors: errors.length > 0,
      errors
    };
  }

  /**
   * Verify error messages with specific content
   */
  async verifyErrorMessages(expectedMessages: string[]): Promise<void> {
    const validation = await this.verifyFormValidation();
    expect(validation.hasErrors).toBe(true);
    
    for (const expectedMessage of expectedMessages) {
      const found = validation.errors.some(error => 
        error.toLowerCase().includes(expectedMessage.toLowerCase())
      );
      expect(found).toBe(true);
    }
  }

  /**
   * Verify session persistence (cookies/localStorage)
   */
  async verifySessionPersistence(): Promise<{ hasSessionCookie: boolean; hasRememberMe: boolean }> {
    const cookies = await this.page.context().cookies();
    const sessionCookie = cookies.find(cookie => 
      cookie.name.toLowerCase().includes('session') || 
      cookie.name.toLowerCase().includes('auth') ||
      cookie.name.toLowerCase().includes('token')
    );

    const rememberMeCookie = cookies.find(cookie => 
      cookie.name.toLowerCase().includes('remember') ||
      cookie.name.toLowerCase().includes('persist')
    );

    return {
      hasSessionCookie: !!sessionCookie,
      hasRememberMe: !!rememberMeCookie
    };
  }

  /**
   * Verify API call was made for login
   */
  async verifyAPICall(expectedEndpoint?: string): Promise<{ called: boolean; request?: any; response?: any }> {
    const requests: any[] = [];
    const responses: any[] = [];

    this.page.on('request', request => {
      if (request.url().includes('/auth/login') || request.url().includes('/api/login') || 
          (expectedEndpoint && request.url().includes(expectedEndpoint))) {
        requests.push({
          url: request.url(),
          method: request.method(),
          postData: request.postData()
        });
      }
    });

    this.page.on('response', response => {
      if (response.url().includes('/auth/login') || response.url().includes('/api/login') ||
          (expectedEndpoint && response.url().includes(expectedEndpoint))) {
        responses.push({
          url: response.url(),
          status: response.status(),
          statusText: response.statusText()
        });
      }
    });

    await this.page.waitForTimeout(1000); // Wait for API calls

    return {
      called: requests.length > 0,
      request: requests[0],
      response: responses[0]
    };
  }

  /**
   * Submit form without filling required fields to trigger validation
   */
  async submitEmptyForm(): Promise<void> {
    // Try to click login button (may be disabled, which is expected)
    try {
      await this.loginButton.click({ timeout: 2000 });
    } catch (error) {
      // Button may be disabled, which is correct behavior
      // Verify button is disabled
      const isDisabled = await this.loginButton.isDisabled().catch(() => true);
      if (isDisabled) {
        // This is expected - form validation prevents submission
        return;
      }
      throw error;
    }
    await this.page.waitForTimeout(500);
  }

  /**
   * Verify required field indicators (asterisks)
   */
  async verifyRequiredFieldIndicators(): Promise<{ emailHasIndicator: boolean; passwordHasIndicator: boolean }> {
    // Check for required indicators near the input fields
    const emailLabel = this.page.locator('label:has-text("メールアドレス"), label:has-text("従業員コード")').first();
    const passwordLabel = this.page.locator('label:has-text("パスワード")').first();
    
    const emailText = await emailLabel.textContent().catch(() => '');
    const passwordText = await passwordLabel.textContent().catch(() => '');

    // Also check for asterisk or required text in the label or nearby
    const emailHasAsterisk = emailText?.includes('*') || emailText?.includes('必須') || false;
    const passwordHasAsterisk = passwordText?.includes('*') || passwordText?.includes('必須') || false;

    // Check if input has required attribute
    const emailRequired = await this.emailInput.getAttribute('required').catch(() => null);
    const passwordRequired = await this.passwordInput.getAttribute('required').catch(() => null);

    return {
      emailHasIndicator: emailHasAsterisk || !!emailRequired,
      passwordHasIndicator: passwordHasAsterisk || !!passwordRequired
    };
  }

  /**
   * Verify password is masked
   */
  async verifyPasswordMasked(): Promise<boolean> {
    const inputType = await this.passwordInput.getAttribute('type');
    return inputType === 'password';
  }

  /**
   * Verify password is visible after toggle
   */
  async verifyPasswordVisible(): Promise<boolean> {
    const inputType = await this.passwordInput.getAttribute('type');
    return inputType === 'text';
  }

  /**
   * Get current location selections
   */
  async getCurrentLocationSelections(): Promise<{ store?: string; building?: string; location?: string }> {
    const store = await this.storeDropdown.textContent().catch(() => '');
    const building = await this.buildingDropdown.textContent().catch(() => '');
    const location = await this.locationDropdown.textContent().catch(() => '');
    
    return { store: store?.trim(), building: building?.trim(), location: location?.trim() };
  }

  /**
   * Verify dropdown states (enabled/disabled)
   */
  async verifyDropdownStates(): Promise<{ storeEnabled: boolean; buildingEnabled: boolean; locationEnabled: boolean }> {
    return {
      storeEnabled: await this.storeDropdown.isEnabled().catch(() => false),
      buildingEnabled: await this.buildingDropdown.isEnabled().catch(() => false),
      locationEnabled: await this.locationDropdown.isEnabled().catch(() => false)
    };
  }
}

