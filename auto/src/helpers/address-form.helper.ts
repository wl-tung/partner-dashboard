import { Page, Locator } from '@playwright/test';

/**
 * Address information interface
 */
export interface Address {
    postalCode?: string;
    prefecture?: string;
    city?: string;
    street?: string;
    building?: string;
    name?: string;
    phone?: string;
}

/**
 * Helper class for filling address forms
 * Handles sender, delivery, and billing addresses
 */
export class AddressFormHelper {
    constructor(private page: Page) { }

    /**
     * Fill an address form with provided data
     * @param address Address data to fill
     * @param formLocator Optional specific form locator (defaults to first form)
     */
    async fillAddressForm(address: Address, formLocator?: Locator): Promise<void> {
        const form = formLocator || this.page.locator('form, [role="dialog"]').first();

        if (address.name) {
            await this.fillField(form, /氏名|名前|Name/i, address.name);
        }

        if (address.phone) {
            await this.fillField(form, /電話|Phone/i, address.phone);
        }

        if (address.postalCode) {
            await this.fillField(form, /郵便番号|Postal/i, address.postalCode);
        }

        if (address.prefecture) {
            await this.selectPrefecture(form, address.prefecture);
        }

        if (address.city) {
            await this.fillField(form, /市区町村|City/i, address.city);
        }

        if (address.street) {
            await this.fillField(form, /番地|Street|Address/i, address.street);
        }

        if (address.building) {
            await this.fillField(form, /建物|Building/i, address.building);
        }
    }

    /**
     * Select a prefecture from dropdown
     * @param form Form or modal locator
     * @param prefecture Prefecture name (e.g., "東京都")
     */
    async selectPrefecture(form: Locator, prefecture: string): Promise<void> {
        // Find the prefecture select element
        const selectContainer = form.locator('[role="button"]').filter({
            has: this.page.locator('text=/都道府/')
        }).first();

        if (await selectContainer.count() > 0) {
            // Click to open dropdown
            await selectContainer.click();
            await this.page.waitForTimeout(300);

            // Select the option
            const option = this.page.locator(`[role="option"]:has-text("${prefecture}")`).first();
            await option.click();
            await this.page.waitForTimeout(300);
        }
    }

    /**
     * Fill a single form field by label
     * @param form Form or modal locator
     * @param labelPattern Regex or string to match label
     * @param value Value to fill
     */
    async fillField(form: Locator, labelPattern: string | RegExp, value: string): Promise<void> {
        // Try to find input by associated label
        const label = form.locator('label').filter({ hasText: labelPattern }).first();

        if (await label.count() > 0) {
            // Get the input associated with this label
            const labelFor = await label.getAttribute('for');
            let input: Locator;

            if (labelFor) {
                input = form.locator(`#${labelFor}`);
            } else {
                // Label wraps input
                input = label.locator('input, textarea').first();
            }

            if (await input.count() > 0) {
                await input.fill(value);
                await this.page.waitForTimeout(200);
                return;
            }
        }

        // Fallback: find input by placeholder
        const inputByPlaceholder = form.locator(`input[placeholder*="${value}"], textarea[placeholder*="${value}"]`).first();
        if (await inputByPlaceholder.count() > 0) {
            await inputByPlaceholder.fill(value);
            await this.page.waitForTimeout(200);
        }
    }

    /**
     * Submit an address form
     * @param form Form or modal locator
     */
    async submitForm(form: Locator): Promise<void> {
        const submitButton = form.locator('button[type="submit"], button').filter({
            hasText: /登録|Submit|保存|Save/i
        }).first();

        if (await submitButton.count() > 0) {
            await submitButton.click();
            await this.page.waitForTimeout(500);
        }
    }
}
