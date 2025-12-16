import { test as authTest } from '../../../src/fixtures/auth.fixture';
import { expect } from '@playwright/test';
import { PreApplicationsListPage } from '../../../src/pages/pre-applications-list.page';

authTest.describe('Pre-Applications - Create New Discovery', () => {
    let listPage: PreApplicationsListPage;

    authTest.beforeEach(async ({ authenticatedPage, page }) => {
        listPage = new PreApplicationsListPage(page);
        await listPage.goto();
        await listPage.verifyPageLoaded();
    });

    authTest('should open create form and document structure', async ({ authenticatedPage, page }) => {
        console.log('\n========== CREATE FORM DISCOVERY ==========');

        // Step 1: Click Create New button (this now waits for modal internally)
        console.log('1. Clicking "Create New" button...');
        const initialUrl = page.url();
        await listPage.clickCreateNew();

        const currentUrl = page.url();
        console.log(`   Initial URL: ${initialUrl}`);
        console.log(`   Current URL: ${currentUrl}`);
        console.log(`   ✅ Modal should be open now`);

        // Modal is already confirmed open by clickCreateNew()
        const modal = page.locator('.MuiDialog-root');
        const hasModal = await modal.isVisible();
        console.log(`   Modal visible: ${hasModal}`);

        // Take screenshot of current state
        await page.screenshot({ path: 'create_form_initial.png', fullPage: true });
        console.log('   Screenshot saved: create_form_initial.png');

        // Step 3: Identify page title/header
        console.log('\n3. Page/Modal Title:');
        const pageTitle = page.locator('h1, h2, h4, h5, h6').filter({ hasText: /作成|新規|create|new/i }).first();
        if (await pageTitle.isVisible()) {
            const titleText = await pageTitle.textContent();
            console.log(`   Title: "${titleText}"`);
        } else {
            console.log('   No obvious title found');
        }

        // Step 4: Find all input fields
        console.log('\n4. Form Fields:');
        const inputs = page.locator('input[type="text"], input:not([type="hidden"]):not([type="checkbox"])');
        const inputCount = await inputs.count();
        console.log(`   Text inputs found: ${inputCount}`);

        for (let i = 0; i < Math.min(inputCount, 10); i++) {
            const input = inputs.nth(i);
            const isVisible = await input.isVisible().catch(() => false);
            if (!isVisible) continue;

            const placeholder = await input.getAttribute('placeholder').catch(() => '');
            const name = await input.getAttribute('name').catch(() => '');
            console.log(`   Input ${i}: placeholder="${placeholder}", name="${name}"`);
        }

        // Step 5: Find all dropdowns/selects
        console.log('\n5. Dropdowns:');
        const selects = page.locator('select, [role="combobox"]').filter({ hasNotText: /^$/ });
        const selectCount = await selects.count();
        console.log(`   Dropdowns found: ${selectCount}`);

        for (let i = 0; i < Math.min(selectCount, 10); i++) {
            const select = selects.nth(i);
            const isVisible = await select.isVisible().catch(() => false);
            if (!isVisible) continue;

            const ariaLabel = await select.getAttribute('aria-label').catch(() => '');
            console.log(`   Dropdown ${i}: aria-label="${ariaLabel}"`);
        }

        // Step 6: Find all buttons
        console.log('\n6. Buttons:');
        const buttons = page.locator('button:visible');
        const buttonCount = await buttons.count();
        console.log(`   Visible buttons found: ${buttonCount}`);

        for (let i = 0; i < Math.min(buttonCount, 20); i++) {
            const button = buttons.nth(i);
            const buttonText = await button.textContent();
            const disabled = await button.isDisabled().catch(() => false);
            if (buttonText?.trim()) {
                console.log(`   Button ${i}: "${buttonText?.trim()}" ${disabled ? '(disabled)' : '(enabled)'}`);
            }
        }

        // Step 7: Find textareas
        console.log('\n7. Textareas:');
        const textareas = page.locator('textarea:visible');
        const textareaCount = await textareas.count();
        console.log(`   Textareas found: ${textareaCount}`);

        for (let i = 0; i < textareaCount; i++) {
            const textarea = textareas.nth(i);
            const placeholder = await textarea.getAttribute('placeholder').catch(() => '');
            console.log(`   Textarea ${i}: placeholder="${placeholder}"`);
        }

        // Step 8: Check for sections/tabs
        console.log('\n8. Sections/Tabs:');
        const tabs = page.locator('[role="tab"], .MuiTab-root');
        const tabCount = await tabs.count();
        if (tabCount > 0) {
            console.log(`   Tabs found: ${tabCount}`);
            for (let i = 0; i < tabCount; i++) {
                const tabText = await tabs.nth(i).textContent();
                console.log(`   Tab ${i}: "${tabText}"`);
            }
        } else {
            console.log('   No tabs found');
        }

        // Step 9: Look for customer-related elements
        console.log('\n9. Looking for customer/product sections:');
        const customerKeywords = ['顧客', 'お客様', 'customer', '選択', 'select'];
        for (const keyword of customerKeywords) {
            const element = page.locator(`text=${keyword}`).first();
            if (await element.isVisible()) {
                console.log(`   Found: "${keyword}"`);
            }
        }

        console.log('\n========== END DISCOVERY ==========\n');
        console.log('✅ Discovery complete - review console output and screenshot');
        console.log('   Press Ctrl+C to exit or wait for timeout');

        // Wait to allow manual inspection
        await page.waitForTimeout(300000); // 5 minutes
    });
});
