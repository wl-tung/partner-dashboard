import { test as authTest } from '../../../src/fixtures/auth.fixture';
import { PreApplicationsListPage } from '../../../src/pages/pre-applications-list.page';

authTest.describe('Pre-Applications - Test Dropdown Opening Methods', () => {
    let listPage: PreApplicationsListPage;

    authTest.beforeEach(async ({ authenticatedPage, page }) => {
        listPage = new PreApplicationsListPage(page);
        await listPage.goto();
        await listPage.verifyPageLoaded();
    });

    authTest('should try different methods to open dropdown', async ({ authenticatedPage, page }) => {
        console.log('\n========== TESTING DROPDOWN OPENING METHODS ==========');

        // Open modal
        await listPage.clickCreateNew();
        await page.waitForTimeout(1000);

        const usageDropdown = page.locator('label:has-text("用途")').locator('..').locator('[role="combobox"]:not([aria-disabled="true"])').first();

        // METHOD 1: Focus + Space key
        console.log('\n--- METHOD 1: Focus + Space Key ---');
        await usageDropdown.focus();
        await page.waitForTimeout(500);
        await usageDropdown.press('Space');
        await page.waitForTimeout(1000);

        let expanded = await usageDropdown.getAttribute('aria-expanded');
        console.log(`After Space key - aria-expanded: ${expanded}`);

        if (expanded === 'true') {
            console.log('SUCCESS: SUCCESS! Dropdown opened with Space key');

            // Look for options
            const options = page.locator('li[role="option"]');
            const count = await options.count();
            console.log(`Options found: ${count}`);

            if (count > 0) {
                for (let i = 0; i < Math.min(count, 5); i++) {
                    const text = await options.nth(i).textContent();
                    console.log(`  Option ${i + 1}: "${text}"`);
                }
            }

            // Close dropdown
            await page.keyboard.press('Escape');
            await page.waitForTimeout(500);
        } else {
            console.log('FAILED: Space key did not work');
        }

        // METHOD 2: Focus + Enter key
        console.log('\n--- METHOD 2: Focus + Enter Key ---');
        await usageDropdown.focus();
        await page.waitForTimeout(500);
        await usageDropdown.press('Enter');
        await page.waitForTimeout(1000);

        expanded = await usageDropdown.getAttribute('aria-expanded');
        console.log(`After Enter key - aria-expanded: ${expanded}`);

        if (expanded === 'true') {
            console.log('SUCCESS: SUCCESS! Dropdown opened with Enter key');

            const options = page.locator('li[role="option"]');
            const count = await options.count();
            console.log(`Options found: ${count}`);

            if (count > 0) {
                for (let i = 0; i < Math.min(count, 5); i++) {
                    const text = await options.nth(i).textContent();
                    console.log(`  Option ${i + 1}: "${text}"`);
                }
            }

            await page.keyboard.press('Escape');
            await page.waitForTimeout(500);
        } else {
            console.log('FAILED: Enter key did not work');
        }

        // METHOD 3: Click without force, with wait
        console.log('\n--- METHOD 3: Regular Click (no force) ---');
        await usageDropdown.scrollIntoViewIfNeeded();
        await page.waitForTimeout(500);
        await usageDropdown.click();
        await page.waitForTimeout(1000);

        expanded = await usageDropdown.getAttribute('aria-expanded');
        console.log(`After regular click - aria-expanded: ${expanded}`);

        if (expanded === 'true') {
            console.log('SUCCESS: SUCCESS! Dropdown opened with regular click');

            const options = page.locator('li[role="option"]');
            const count = await options.count();
            console.log(`Options found: ${count}`);

            if (count > 0) {
                for (let i = 0; i < Math.min(count, 5); i++) {
                    const text = await options.nth(i).textContent();
                    console.log(`  Option ${i + 1}: "${text}"`);
                }
            }

            await page.keyboard.press('Escape');
            await page.waitForTimeout(500);
        } else {
            console.log('FAILED: Regular click did not work');
        }

        // METHOD 4: Click the SVG icon specifically
        console.log('\n--- METHOD 4: Click Dropdown Icon ---');
        const dropdownIcon = usageDropdown.locator('svg').first();
        const iconExists = await dropdownIcon.count();

        if (iconExists > 0) {
            await dropdownIcon.click();
            await page.waitForTimeout(1000);

            expanded = await usageDropdown.getAttribute('aria-expanded');
            console.log(`After icon click - aria-expanded: ${expanded}`);

            if (expanded === 'true') {
                console.log('SUCCESS: SUCCESS! Dropdown opened with icon click');

                const options = page.locator('li[role="option"]');
                const count = await options.count();
                console.log(`Options found: ${count}`);

                if (count > 0) {
                    for (let i = 0; i < Math.min(count, 5); i++) {
                        const text = await options.nth(i).textContent();
                        console.log(`  Option ${i + 1}: "${text}"`);
                    }
                }
            } else {
                console.log('FAILED: Icon click did not work');
            }
        } else {
            console.log('No SVG icon found');
        }

        await page.screenshot({ path: 'dropdown_methods_test.png', fullPage: true });
        console.log('\n========== END TESTING ==========\n');
    });
});
