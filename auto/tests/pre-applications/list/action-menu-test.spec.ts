import { test as authTest } from '../../../src/fixtures/auth.fixture';
import { expect } from '@playwright/test';
import { PreApplicationsListPage } from '../../../src/pages/pre-applications-list.page';

authTest.describe('Pre-Applications List - Action Menu Test', () => {
    let listPage: PreApplicationsListPage;

    authTest.beforeEach(async ({ authenticatedPage, page }) => {
        listPage = new PreApplicationsListPage(page);
        await listPage.goto();
        await listPage.verifyPageLoaded();
    });

    authTest('should open action menu and click edit', async ({ authenticatedPage, page }) => {
        console.log('\n========== TESTING ACTION MENU ==========');

        // Click the action button
        console.log('1. Clicking 3-dot action button...');
        await listPage.clickActionButton(0);

        // Check if menu appeared
        const menu = page.locator('ul[role="menu"]');
        const isVisible = await menu.isVisible();
        console.log(`2. Menu visible: ${isVisible}`);

        if (isVisible) {
            const menuItems = menu.locator('li[role="menuitem"]');
            const count = await menuItems.count();
            console.log(`3. Menu items found: ${count}`);

            for (let i = 0; i < count; i++) {
                const text = await menuItems.nth(i).textContent();
                console.log(`   - Item ${i}: ${text}`);
            }

            // Click Edit
            console.log('4. Clicking Edit (編集)...');
            await page.getByRole('menuitem', { name: '編集' }).click();

            await page.waitForTimeout(1000);
            const currentUrl = page.url();
            console.log(`5. Current URL after Edit: ${currentUrl}`);

            // Check if 404
            const is404 = await page.locator('text=404').isVisible().catch(() => false);
            if (is404) {
                console.log('   ⚠️ Confirmed: Edit navigates to 404 (known bug)');
            }

            await page.screenshot({ path: 'action_menu_edit_result.png' });
        }

        console.log('========== END TEST ==========\n');
    });
});
