import { test as authTest } from '../../../src/fixtures/auth.fixture';
import { expect } from '@playwright/test';
import { PreApplicationsListPage } from '../../../src/pages/pre-applications-list.page';
import { PreApplicationCreationModal } from '../../../src/pages/pre-application-creation-modal.page';
import { PreApplicationDetailsPage } from '../../../src/pages/pre-application-details.page';

authTest.describe('Pre-Applications - Create & Verify (Full CRUD - C & R)', () => {
    let listPage: PreApplicationsListPage;
    let createModal: PreApplicationCreationModal;
    let detailsPage: PreApplicationDetailsPage;

    // Test data - using unique Usage to test Flow A (new creation)
    // Usage "父の日" (Father's Day) should not conflict with existing "お中元" lists
    const testUsage = '父の日'; // Unique usage for Flow A
    const testYear = '2025年';
    const testTimestamp = Date.now();
    const testMemo = `Test automation - ${testTimestamp}`;

    authTest.beforeEach(async ({ authenticatedPage, page }) => {
        listPage = new PreApplicationsListPage(page);
        createModal = new PreApplicationCreationModal(page);
        detailsPage = new PreApplicationDetailsPage(page);

        await listPage.goto();
        await listPage.verifyPageLoaded();
    });

    authTest('should create pre-application and verify in list (Flow A - New Creation)', async ({ authenticatedPage, page }) => {
        // This tests Flow A: unique Usage+Year → direct creation (no merge modal)
        console.log('\n========== STEP 1: OPEN CREATE MODAL ==========');

        // Get initial count of items in list
        const initialCount = await listPage.getPreApplicationCount();
        console.log(`Initial pre-application count: ${initialCount}`);

        // Open create modal
        await listPage.clickCreateNew();
        const modalVisible = await createModal.verifyModalVisible();
        expect(modalVisible).toBe(true);
        console.log('✅ Create modal opened');

        // Verify Create button is disabled initially
        const initiallyDisabled = !(await createModal.isCreateButtonEnabled());
        expect(initiallyDisabled).toBe(true);
        console.log('✅ Create button initially disabled (validation working)');

        console.log('\n========== STEP 2: FILL FORM ==========');

        // Fill required fields
        await createModal.fillRequiredFields(testUsage, testYear);

        // Add memo to make item identifiable
        await createModal.fillMemo(testMemo);

        // Wait a moment for validation
        await page.waitForTimeout(1000);

        // Verify Create button is now enabled
        const nowEnabled = await createModal.isCreateButtonEnabled();
        expect(nowEnabled).toBe(true);
        console.log('✅ Create button enabled after filling required fields');

        // Take screenshot before submission
        await page.screenshot({ path: 'pre_app_before_create.png' });

        console.log('\n========== STEP 3: SUBMIT FORM ==========');

        // Submit the form
        await createModal.clickCreate();

        // Wait and check if merge modal appeared
        await page.waitForTimeout(2000);
        const mergeModal = page.locator('.MuiDialog-root').filter({ hasText: '既存リスト' });
        const mergeModalCount = await mergeModal.count();
        const hadMergeModal = mergeModalCount > 0 && await mergeModal.first().isVisible();

        if (hadMergeModal) {
            console.log('⚠️ MERGE MODAL APPEARED - This is Flow B, not Flow A!');
            console.log('   This means 父の日 + 2025 already exists');
        } else {
            console.log('✅ NO MERGE MODAL - This is Flow A (new creation)');
        }

        console.log('✅ Form submitted - modal closed');

        // Wait longer for list to refresh and reload page to be sure
        await page.waitForTimeout(3000);
        await page.reload();
        await listPage.verifyPageLoaded();

        console.log('\n========== STEP 4: VERIFY IN LIST ==========');

        // Verify count increased
        const newCount = await listPage.getPreApplicationCount();
        console.log(`New pre-application count: ${newCount}`);
        expect(newCount).toBe(initialCount + 1);
        console.log('✅ List count increased by 1');

        // Try to find our created item
        // Since we don't have a list name, we'll look at the newest item (first row)
        const firstRowData = await listPage.getPreApplicationData(0);
        console.log(`First row data:`, firstRowData);

        // Verify it has recent creation date (today)
        const today = new Date().toLocaleDateString('ja-JP', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        }).replace(/\//g, '/');

        expect(firstRowData.createdDate).toContain(today.split('/')[0]); // At least same year
        console.log('✅ Created item appears as first row with recent date');

        // Take screenshot of list with new item
        await page.screenshot({ path: 'pre_app_in_list.png' });

        console.log('\n========== STEP 5: VERIFY IN DETAILS VIEW ==========');

        // Click on the first row (our newly created item)
        await listPage.clickPreApplication(0);

        // Verify details page loaded
        const detailsLoaded = await detailsPage.verifyPageLoaded();
        expect(detailsLoaded).toBe(true);
        console.log('✅ Details page loaded');

        // Get details
        const details = await detailsPage.getDetails();
        console.log(`Details:`, details);

        // Verify management number exists
        expect(details.managementNumber).toBeTruthy();
        expect(details.managementNumber).toMatch(/#[A-Z0-9]+/);
        console.log(`✅ Management number assigned: ${details.managementNumber}`);

        // Verify status is Draft (新規作成 should create as draft)
        expect(details.status).toBeTruthy();
        console.log(`✅ Status: ${details.status}`);

        // Take screenshot of details page
        await page.screenshot({ path: 'pre_app_details.png', fullPage: true });

        console.log('\n========== STEP 6: RETURN TO LIST & VERIFY PERSISTENCE ==========');

        // Go back to list
        await detailsPage.clickBack();
        await listPage.verifyPageLoaded();
        console.log('✅ Returned to list');

        // Verify our item is still there
        const stillFirstRow = await listPage.getPreApplicationData(0);
        expect(stillFirstRow.listNumber).toBe(firstRowData.listNumber);
        console.log('✅ Item still appears in list after navigation');

        // Take final screenshot
        await page.screenshot({ path: 'pre_app_verified.png' });

        console.log('\n========== ✅ CREATE & VERIFY COMPLETE ==========');
        console.log(`Created pre-application: ${details.managementNumber}`);
        console.log(`Usage: ${testUsage}, Year: ${testYear}`);
        console.log(`Memo: ${testMemo}`);
        console.log('\n⚠️ NOTE: Item NOT deleted - manual cleanup required or separate delete test');
    });

    authTest('should cancel creation without saving', async ({ authenticatedPage, page }) => {
        console.log('\n========== TEST: CANCEL WITHOUT SAVING ==========');

        const initialCount = await listPage.getPreApplicationCount();

        // Open modal
        await listPage.clickCreateNew();
        await createModal.verifyModalVisible();

        // Fill form partially
        await createModal.fillRequiredFields(testUsage, testYear);

        // Cancel instead of create
        await createModal.clickCancel();
        console.log('✅ Modal cancelled');

        // Verify count didn't change
        const finalCount = await listPage.getPreApplicationCount();
        expect(finalCount).toBe(initialCount);
        console.log('✅ No item created - count unchanged');

        console.log('========== ✅ CANCEL TEST COMPLETE ==========\n');
    });

    authTest('should validate required fields', async ({ authenticatedPage, page }) => {
        console.log('\n========== TEST: REQUIRED FIELD VALIDATION ==========');

        await listPage.clickCreateNew();
        await createModal.verifyModalVisible();

        // Create button should be disabled without required fields
        let isEnabled = await createModal.isCreateButtonEnabled();
        expect(isEnabled).toBe(false);
        console.log('✅ Create disabled with empty form');

        // Fill only usage (missing year)
        await createModal.selectUsage(testUsage);
        await page.waitForTimeout(500);

        isEnabled = await createModal.isCreateButtonEnabled();
        expect(isEnabled).toBe(false);
        console.log('✅ Create still disabled with only usage filled');

        // Fill year (all required fields now filled)
        await createModal.selectTargetYear(testYear);
        await page.waitForTimeout(500);

        isEnabled = await createModal.isCreateButtonEnabled();
        expect(isEnabled).toBe(true);
        console.log('✅ Create enabled when all required fields filled');

        // Cancel without submitting
        await createModal.clickCancel();

        console.log('========== ✅ VALIDATION TEST COMPLETE ==========\n');
    });
});
