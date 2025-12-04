import { Page, Locator } from '@playwright/test';
import { ModalHelper } from './modal.helper';

/**
 * Data structure for address information
 */
export interface AddressData {
    name: string;
    phone: string;
    postalCode: string;
    prefecture: string;
    address: string;
    building?: string;
}

/**
 * Helper class for address form interactions
 * Handles both sender and delivery destination address forms
 */
export class AddressFormHelper {
    private modalHelper: ModalHelper;

    constructor(private page: Page) {
        this.modalHelper = new ModalHelper(page);
    }

    /**
     * Fill an address registration form
     * @param modal - The modal containing the form
     * @param data - Address data to fill
     */
    async fillAddressForm(modal: Locator, data: AddressData): Promise<void> {
        // Fill name
        const nameInput = modal.locator('input[name="name"], input[placeholder*="名前"]').first();
        await nameInput.fill(data.name);

        // Fill phone
        const phoneInput = modal.locator('input[name="phone"], input[placeholder*="電話"], input[type="tel"]').first();
        await phoneInput.fill(data.phone);

        // Fill postal code
        const postalInput = modal.locator('input[name="postalCode"], input[placeholder*="郵便"]').first();
        await postalInput.fill(data.postalCode);

        // Select prefecture
        await this.selectPrefecture(modal, data.prefecture);

        // Fill address
        const addressInput = modal.locator('input[name="address"], input[placeholder*="住所"]').first();
        await addressInput.fill(data.address);

        // Fill building (optional)
        if (data.building) {
            const buildingInput = modal.locator('input[name="building"], input[placeholder*="建物"]').first();
            if (await buildingInput.count() > 0) {
                await buildingInput.fill(data.building);
            }
        }
    }

    /**
     * Select prefecture from dropdown
     * @param modal - The modal containing the form
     * @param prefecture - Prefecture name (e.g., '東京都')
     */
    async selectPrefecture(modal: Locator, prefecture: string): Promise<void> {
        // Find the prefecture select element
        const prefectureSelect = modal.locator('select').filter({
            has: this.page.locator('option', { hasText: prefecture })
        }).first();

        if (await prefectureSelect.count() > 0) {
            await prefectureSelect.selectOption({ label: prefecture });
            await this.page.waitForTimeout(200); // Brief wait for form validation
        }
    }

    /**
     * Submit the address form
     * @param modal - The modal containing the form
     * @param buttonText - Text of the submit button (default: '登録')
     */
    async submitForm(modal: Locator, buttonText: string = '登録'): Promise<void> {
        await this.modalHelper.clickModalButton(modal, buttonText);
        await this.page.waitForLoadState('networkidle', { timeout: 3000 }).catch(() => { });
    }

    /**
     * Fill and submit an address form in one call
     * @param modal - The modal containing the form
     * @param data - Address data to fill
     * @param submitButtonText - Text of the submit button
     */
    async fillAndSubmit(
        modal: Locator,
        data: AddressData,
        submitButtonText: string = '登録'
    ): Promise<void> {
        await this.fillAddressForm(modal, data);
        await this.submitForm(modal, submitButtonText);
    }

    /**
     * Select an address from a list of address cards
     * @param modal - The modal containing address cards
     * @param index - Index of the address to select (default: 0)
     */
    async selectAddressFromList(modal: Locator, index: number = 0): Promise<void> {
        const addressCards = modal.locator('.MuiCard-root');
        const count = await addressCards.count();

        if (count > index) {
            await addressCards.nth(index).click();
            await this.page.waitForTimeout(300);
        } else {
            throw new Error(`Address index ${index} out of range (found ${count} addresses)`);
        }
    }
}
