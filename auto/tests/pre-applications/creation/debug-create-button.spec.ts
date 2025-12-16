import { test as authTest } from '../../../src/fixtures/auth.fixture';
import { expect } from '@playwright/test';
import { PreApplicationsListPage } from '../../../src/pages/pre-applications-list.page';

authTest.describe('Pre-Applications- Debug Create Button', () => {
    let listPage: PreApplicationsListPage;

    authTest.beforeEach(async ({ authenticatedPage, page }) => {
        listPage = new PreApplicationsListPage(page);
        await listPage.goto();
        await listPage.verifyPageLoaded();
    });

    authTest('should debug create new button functionality', async ({ authenticatedPage, page }) => {
        console.log('\n========== DEBUG CREATE BUTTON ==========');

        // Step 1: Find the button
        console.log('1. Looking for "Create New" (新規作成) button...');
        const createButton = page.getByRole('button', { name: '新規作成' });

        const buttonExists = await createButton.count();
        console.log(`   Button count: ${buttonExists}`);

        if (buttonExists === 0) {
            console.log('   ❌ Button not found with role="button" and name="新規作成"');
            console.log('   Searching for any button with similar text...');

            const similarButtons = page.locator('button', { hasText: /新規|作成|create|new/i });
            const count = await similarButtons.count();
            console.log(`   Found ${count} buttons with similar text`);

            for (let i = 0; i < Math.min(count, 10); i++) {
                const btn = similarButtons.nth(i);
                const text = await btn.textContent();
                console.log(`   Button ${i}: "${text}"`);
            }
            return;
        }

        // Step 2: Check button state
        console.log('\n2. Checking button state...');
        const isVisible = await createButton.isVisible();
        const isEnabled = await createButton.isEnabled();
        const isDisabled = await createButton.isDisabled();

        console.log(`   Visible: ${isVisible}`);
        console.log(`   Enabled: ${isEnabled}`);
        console.log(`   Disabled: ${isDisabled}`);

        if (isDisabled) {
            console.log('   ⚠️ Button is disabled - maybe permissions issue?');
            await page.screenshot({ path: 'create_button_disabled.png' });
            return;
        }

        // Step 3: Monitor network activity
        console.log('\n3. Monitoring network activity on click...');
        const requests: string[] = [];
        const responses: any[] = [];

        page.on('request', req => {
            requests.push(req.url());
        });

        page.on('response', async resp => {
            responses.push({
                url: resp.url(),
                status: resp.status()
            });
        });

        // Step 4: Click the button
        console.log('\n4. Clicking the button...');
        const initialUrl = page.url();
        await createButton.click();
        await page.waitForTimeout(3000);

        const currentUrl = page.url();
        console.log(`   URL Before: ${initialUrl}`);
        console.log(`   URL After: ${currentUrl}`);
        console.log(`   URL Changed: ${initialUrl !== currentUrl}`);

        // Step 5: Check for modal/dialog
        console.log('\n5. Checking for modal/dialog...');
        const modalSelectors = [
            '.MuiDialog-root',
            '[role="dialog"]',
            '.modal',
            '[role="presentation"]',
            '.MuiModal-root'
        ];

        for (const selector of modalSelectors) {
            const element = page.locator(selector);
            if (await element.isVisible()) {
                console.log(`   ✅ Found: ${selector}`);
                await page.screenshot({ path: 'create_modal_found.png', fullPage: true });

                // Log modal content
                const modalText = await element.textContent();
                console.log(`   Modal content: ${modalText?.substring(0, 200)}...`);

                return;
            }
        }
        console.log('   ❌ No modal found');

        // Step 6: Check network requests
        console.log('\n6. Network activity:');
        console.log(`   Requests made: ${requests.length}`);
        console.log(`   Responses received: ${responses.length}`);

        const apiRequests = requests.filter(url => url.includes('/api/'));
        if (apiRequests.length > 0) {
            console.log('   API Requests:');
            apiRequests.forEach((url, i) => {
                console.log(`     ${i}: ${url}`);
            });
        }

        // Step 7: Check for any page changes
        console.log('\n7. Checking page state...');
        await page.screenshot({ path: 'create_button_after_click.png', fullPage: true });

        // Check if any new elements appeared
        const beforeCount = await page.locator('*').count();
        console.log(`   Total elements on page: ${beforeCount}`);

        console.log('\n========== END DEBUG ==========\n');
    });
});
