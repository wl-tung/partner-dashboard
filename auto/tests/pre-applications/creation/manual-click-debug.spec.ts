import { test as authTest } from '../../../src/fixtures/auth.fixture';
import { PreApplicationsListPage } from '../../../src/pages/pre-applications-list.page';

authTest.describe('Pre-Applications - Manual Click Debug', () => {
    let listPage: PreApplicationsListPage;

    authTest.beforeEach(async ({ authenticatedPage, page }) => {
        listPage = new PreApplicationsListPage(page);
        await listPage.goto();
        await listPage.verifyPageLoaded();
    });

    authTest('should pause for manual clicking', async ({ authenticatedPage, page }) => {
        console.log('\n========== MANUAL DEBUG SESSION ==========');
        console.log('Opening create modal...');

        // Open modal
        await listPage.clickCreateNew();
        await page.waitForTimeout(1000);

        console.log('\n✋ PAUSED - Please do the following:');
        console.log('1. Manually click the 用途 (Usage) dropdown');
        console.log('2. Observe what happens');
        console.log('3. Select an option if dropdown opens');
        console.log('4. Then click Resume in Playwright Inspector');
        console.log('\nWatching for Popover...');

        // Pause here
        await page.pause();

        console.log('\n After resume - checking if Popover appeared...');

        // Check if Popover exists now
        const popover = page.locator('.MuiPopover-paper');
        const popoverCount = await popover.count();
        console.log(`Popover count: ${popoverCount}`);

        if (popoverCount > 0) {
            for (let i = 0; i < popoverCount; i++) {
                const isVisible = await popover.nth(i).isVisible();
                const classes = await popover.nth(i).getAttribute('class');
                console.log(`  Popover ${i}: visible=${isVisible}, classes="${classes}"`);
            }
        }

        // Check for menu specifically
        const menu = page.locator('.MuiMenu-paper');
        const menuCount = await menu.count();
        console.log(`Menu count: ${menuCount}`);

        // Check for any visible li[role="option"]
        const options = page.locator('li[role="option"]:visible');
        const optionsCount = await options.count();
        console.log(`Visible options: ${optionsCount}`);

        if (optionsCount > 0) {
            for (let i = 0; i < Math.min(optionsCount, 5); i++) {
                const text = await options.nth(i).textContent();
                console.log(`  Option ${i}: "${text}"`);
            }
        }

        await page.screenshot({ path: 'manual_debug_result.png', fullPage: true });
        console.log('\n========== END DEBUG ==========\n');
    });
});
