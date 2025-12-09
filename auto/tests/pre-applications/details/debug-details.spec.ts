import { test as authTest } from '../../../src/fixtures/auth.fixture';
import { PreApplicationsListPage } from '../../../src/pages/pre-applications-list.page';
import * as fs from 'fs';

authTest('debug details page structure', async ({ authenticatedPage, page }) => {
    const listPage = new PreApplicationsListPage(page);
    await listPage.goto();
    await listPage.verifyPageLoaded();
    await listPage.clickPreApplication(0);

    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000); // Wait for potential dynamic content

    const content = await page.content();
    fs.writeFileSync('details_page_dump.html', content);
    console.log('✅ Saved details page HTML to details_page_dump.html');
});
