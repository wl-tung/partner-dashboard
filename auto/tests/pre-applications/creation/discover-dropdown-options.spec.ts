import { test as authTest } from '../../../src/fixtures/auth.fixture';
import { PreApplicationsListPage } from '../../../src/pages/pre-applications-list.page';
import { PreApplicationCreationModal } from '../../../src/pages/pre-application-creation-modal.page';

authTest.describe('Pre-Applications - Discover Dropdown Options', () => {
    let listPage: PreApplicationsListPage;
    let createModal: PreApplicationCreationModal;

    authTest.beforeEach(async ({ authenticatedPage, page }) => {
        listPage = new PreApplicationsListPage(page);
        createModal = new PreApplicationCreationModal(page);

        await listPage.goto();
        await listPage.verifyPageLoaded();
    });

    authTest('should discover usage dropdown options', async ({ authenticatedPage, page }) => {
        console.log('\n========== DISCOVER USAGE OPTIONS ==========');

        // Open modal
        await listPage.clickCreateNew();
        await createModal.verifyModalVisible();

        // Click usage dropdown to open it
        const usageDropdown = page.locator('label:has-text("用途")').locator('..').locator('[role="combobox"]:not([aria-disabled="true"])').first();
        await usageDropdown.click({ force: true });
        await page.waitForTimeout(1000);

        // Get all options
        const options = page.locator('li[role="option"]');
        const count = await options.count();
        console.log(`\nFound ${count} usage options:`);

        for (let i = 0; i < count; i++) {
            const text = await options.nth(i).textContent();
            console.log(`  ${i + 1}. "${text}"`);
        }

        // Take screenshot
        await page.screenshot({ path: 'usage_dropdown_options.png' });

        console.log('\n========== END DISCOVER ==========\n');
    });

    authTest('should discover target year options', async ({ authenticatedPage, page }) => {
        console.log('\n========== DISCOVER TARGET YEAR OPTIONS ==========');

        await listPage.clickCreateNew();
        await createModal.verifyModalVisible();

        // Click year dropdown
        const yearDropdown = page.locator('label:has-text("対象年")').locator('..').locator('[role="combobox"]:not([aria-disabled="true"])').first();
        await yearDropdown.click({ force: true });
        await page.waitForTimeout(1000);

        // Get all options
        const options = page.locator('li[role="option"]');
        const count = await options.count();
        console.log(`\nFound ${count} year options:`);

        for (let i = 0; i < count; i++) {
            const text = await options.nth(i).textContent();
            console.log(`  ${i + 1}. "${text}"`);
        }

        await page.screenshot({ path: 'year_dropdown_options.png' });

        console.log('\n========== END DISCOVER ==========\n');
    });
});
