import { Page, Locator } from '@playwright/test';
import { TestLogger } from '../utils/logger';

/**
 * Page object for the Pre-Application Creation Modal
 * Opens when clicking "Create New" button from list view
 */
export class PreApplicationCreationModal {
    readonly page: Page;

    // Modal container
    readonly modal: Locator;
    readonly modalTitle: Locator;

    // Form fields
    readonly usageDropdown: Locator;
    readonly targetYearDropdown: Locator;
    readonly referenceYearsDropdown: Locator;
    readonly memoTextarea: Locator;

    // Buttons
    readonly cancelButton: Locator;
    readonly createButton: Locator;

    constructor(page: Page) {
        this.page = page;

        // Modal
        this.modal = page.locator('.MuiDialog-root');
        this.modalTitle = this.modal.locator('h2, h6').filter({ hasText: /作成|create/i });

        // Form fields - using role-based selectors (simpler and more reliable)
        // Note: Modal has multiple comboboxes, we target by position

        // 用途 (Usage) - required - first combobox
        this.usageDropdown = page.getByRole('combobox').first();

        // 対象年 (Target Year) - required - second combobox
        this.targetYearDropdown = page.getByRole('combobox').nth(1);

        // 参照年数 (Reference Years) - optional - third combobox
        this.referenceYearsDropdown = page.getByRole('combobox').nth(2);

        // メモ (Memo) - optional textarea
        this.memoTextarea = page.getByRole('textbox', { name: 'メモ（任意）' });

        // Buttons
        this.cancelButton = this.modal.getByRole('button', { name: 'キャンセル' });
        this.createButton = this.modal.getByRole('button', { name: '作成' });
    }

    // ============ Verification ============

    async verifyModalVisible(): Promise<boolean> {
        const isVisible = await this.modal.isVisible();
        TestLogger.log(`Create modal visible: ${isVisible}`);
        return isVisible;
    }

    async isCreateButtonEnabled(): Promise<boolean> {
        const isEnabled = await this.createButton.isEnabled();
        TestLogger.log(`Create button enabled: ${isEnabled}`);
        return isEnabled;
    }

    // ============ Form Filling ============

    /**
     * Select usage option from dropdown
     * @param option The usage option text (e.g., "お中元", "父の日")
     */
    async selectUsage(option: string): Promise<void> {
        TestLogger.log(`Selecting usage: ${option}`);
        await this.usageDropdown.click();
        await this.page.getByRole('option', { name: option }).click();
        TestLogger.log('Usage selected');
    }

    /**
     * Select target year from dropdown
     * @param year The year (e.g., "2025年", "2026年")
     */
    async selectTargetYear(year: string): Promise<void> {
        TestLogger.log(`Selecting target year: ${year}`);
        await this.targetYearDropdown.click();
        await this.page.getByRole('option', { name: year }).click();
        TestLogger.log('Target year selected');
    }

    /**
     * Select reference years option
     * @param option The reference period (e.g., "過去2年分", "過去3年分")
     */
    async selectReferenceYears(option: string): Promise<void> {
        TestLogger.log(`Selecting reference years: ${option}`);
        await this.referenceYearsDropdown.click();
        await this.page.getByRole('option', { name: option }).click();
        TestLogger.log('Reference years selected');
    }

    /**
     * Fill the memo/notes field
     * @param text The memo text
     */
    async fillMemo(text: string): Promise<void> {
        TestLogger.log(`Filling memo: ${text.substring(0, 50)}...`);
        await this.memoTextarea.fill(text);
    }

    // ============ Actions ============

    /**
     * Click the Create button to submit the form
     * Note: A confirmation modal may appear after clicking create
     */
    async clickCreate(): Promise<void> {
        TestLogger.log('Clicking Create button');

        // Ensure button is enabled before clicking
        const isEnabled = await this.isCreateButtonEnabled();
        if (!isEnabled) {
            throw new Error('Create button is disabled - cannot submit form');
        }

        await this.createButton.click();

        // Wait for confirmation modal to appear
        await this.page.waitForTimeout(2000);

        // Check if a confirmation modal appeared (merge conflict resolution)
        const confirmationModal = this.page.locator('.MuiDialog-root').filter({ hasText: '既存リスト' });
        const hasConfirmation = await confirmationModal.count();

        if (hasConfirmation > 0 && await confirmationModal.first().isVisible()) {
            TestLogger.log('Merge confirmation modal appeared - clicking execute merge button');
            // Click "マージを実行" (Execute Merge) button - the contained/primary button
            await confirmationModal.locator('button.MuiButton-contained').click();
            TestLogger.log('Clicked execute merge button');
            await this.page.waitForTimeout(2000);
        }

        // Wait for all modals to close
        await this.page.waitForTimeout(2000);
        TestLogger.log('Create modal closed - submission successful');
    }

    /**
     * Click the Cancel button to close modal without saving
     */
    async clickCancel(): Promise<void> {
        TestLogger.log('Clicking Cancel button');
        await this.cancelButton.click();

        // Wait for modal to close
        await this.modal.waitFor({ state: 'hidden', timeout: 5000 });
        TestLogger.log('Modal cancelled and closed');
    }

    // ============ Convenience Methods ============

    /**
     * Fill form with minimum required fields
     * @param usage Usage option
     * @param year Target year
     */
    async fillRequiredFields(usage: string, year: string): Promise<void> {
        TestLogger.log(`Filling required fields: usage=${usage}, year=${year}`);
        await this.selectUsage(usage);
        await this.selectTargetYear(year);
    }

    /**
     * Fill complete form with all fields
     */
    async fillCompleteForm(params: {
        usage: string;
        year: string;
        referenceYears?: string;
        memo?: string;
    }): Promise<void> {
        TestLogger.log('Filling complete form');

        await this.fillRequiredFields(params.usage, params.year);

        if (params.referenceYears) {
            await this.selectReferenceYears(params.referenceYears);
        }

        if (params.memo) {
            await this.fillMemo(params.memo);
        }

        TestLogger.log('Form filled completely');
    }
}
