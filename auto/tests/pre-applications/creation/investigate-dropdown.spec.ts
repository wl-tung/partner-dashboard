import { test as authTest } from '../../../src/fixtures/auth.fixture';
import { PreApplicationsListPage } from '../../../src/pages/pre-applications-list.page';

authTest.describe('Pre-Applications - Investigate Dropdown Structure', () => {
    let listPage: PreApplicationsListPage;

    authTest.beforeEach(async ({ authenticatedPage, page }) => {
        listPage = new PreApplicationsListPage(page);
        await listPage.goto();
        await listPage.verifyPageLoaded();
    });

    authTest('should dump dropdown HTML structure', async ({ authenticatedPage, page }) => {
        console.log('\n========== INVESTIGATING DROPDOWN STRUCTURE ==========');

        // Open modal
        await listPage.clickCreateNew();
        await page.waitForTimeout(1000);

        console.log('\n1. Before opening dropdown:');
        let dropdownContainer = page.locator('label:has-text("用途")').locator('..').first();
        let beforeHtml = await dropdownContainer.innerHTML();
        console.log(beforeHtml.substring(0, 500));

        // Click usage dropdown to open it
        const usageDropdown = page.locator('label:has-text("用途")').locator('..').locator('[role="combobox"]:not([aria-disabled="true"])').first();
        await usageDropdown.click({ force: true });

        console.log('\n2. Waiting for dropdown to open...');
        await page.waitForTimeout(2000); // Wait for animation

        // Check if aria-expanded changed
        const expanded = await usageDropdown.getAttribute('aria-expanded');
        console.log(`aria-expanded: ${expanded}`);

        // Look for any visible menus/lists
        console.log('\n3. Looking for menu elements:');

        const menuSelectors = [
            '[role="listbox"]',
            '[role="menu"]',
            '.MuiMenu-root',
            '.MuiPopover-root',
            '.MuiPaper-root',
            'ul[role="listbox"]',
            '[role="presentation"]'
        ];

        for (const selector of menuSelectors) {
            const element = page.locator(selector);
            const count = await element.count();
            if (count > 0) {
                console.log(`\n✅ Found ${count} elements with selector: ${selector}`);

                // Get first visible one
                for (let i = 0; i < Math.min(count, 3); i++) {
                    const isVisible = await element.nth(i).isVisible();
                    if (isVisible) {
                        console.log(`  Element ${i} is VISIBLE`);
                        const html = await element.nth(i).innerHTML();
                        console.log(`  HTML (first 1000 chars):\n${html.substring(0, 1000)}`);

                        // Look for list items inside
                        const listItems = element.nth(i).locator('li, [role="option"], .MuiMenuItem-root');
                        const itemCount = await listItems.count();
                        console.log(`  Found ${itemCount} items inside`);

                        if (itemCount > 0) {
                            for (let j = 0; j < Math.min(itemCount, 5); j++) {
                                const text = await listItems.nth(j).textContent();
                                const role = await listItems.nth(j).getAttribute('role');
                                console.log(`    Item ${j}: role="${role}", text="${text}"`);
                            }
                        }
                    } else {
                        console.log(`  Element ${i} is hidden`);
                    }
                }
            }
        }

        // Screenshot
        await page.screenshot({ path: 'dropdown_open.png', fullPage: true });
        console.log('\n4. Screenshot saved: dropdown_open.png');

        // Try to find ANY visible li elements
        console.log('\n5. Checking all visible <li> elements:');
        const allLi = page.locator('li:visible');
        const liCount = await allLi.count();
        console.log(`Found ${liCount} visible <li> elements`);

        for (let i = 0; i < Math.min(liCount, 10); i++) {
            const text = await allLi.nth(i).textContent();
            const role = await allLi.nth(i).getAttribute('role');
            const classes = await allLi.nth(i).getAttribute('class');
            console.log(`  Li ${i}: role="${role}", class="${classes}", text="${text?.substring(0, 50)}"`);
        }

        console.log('\n========== END INVESTIGATION ==========\n');

        // Keep browser open for manual inspection
        await page.waitForTimeout(10000);
    });
});
