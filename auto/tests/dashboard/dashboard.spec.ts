import { test, expect } from '../../src/fixtures/test.fixture';
import { test as authTest } from '../../src/fixtures/auth.fixture';
import { DashboardPage } from '../../src/pages/dashboard.page';
import { DataHelper } from '../../src/helpers/data.helper';

test.describe('Dashboard', () => {
  let dashboardPage: DashboardPage;
  let dataHelper: DataHelper;

  test.beforeEach(async ({ page, dashboardPage: dp }) => {
    dashboardPage = dp;
    dataHelper = new DataHelper();
  });

  authTest('should load dashboard after login', async ({ authenticatedPage, dashboardPage: dp }) => {
    dashboardPage = dp;
    await dashboardPage.goto();
    await dashboardPage.verifyDashboardLoaded();
  });

  authTest('should display KPI cards', async ({ authenticatedPage, dashboardPage: dp }) => {
    dashboardPage = dp;
    await dashboardPage.goto();
    await dashboardPage.verifyKPICardsVisible();
  });

  authTest('should display user information', async ({ authenticatedPage, dashboardPage: dp }) => {
    dashboardPage = dp;
    await dashboardPage.goto();
    await dashboardPage.verifyUserInfo('TKY001');
  });

  authTest('should display quick action buttons', async ({ authenticatedPage, dashboardPage: dp }) => {
    dashboardPage = dp;
    await dashboardPage.goto();
    await dashboardPage.verifyQuickActionsVisible();
  });

  authTest('should navigate to orders page', async ({ authenticatedPage, dashboardPage: dp }) => {
    dashboardPage = dp;
    await dashboardPage.goto();
    await dashboardPage.navigateToOrders();
    await expect(authenticatedPage).toHaveURL(/.*\/orders/);
  });

  authTest('should navigate to customers page', async ({ authenticatedPage, dashboardPage: dp }) => {
    dashboardPage = dp;
    await dashboardPage.goto();
    await dashboardPage.navigateToCustomers();
    await expect(authenticatedPage).toHaveURL(/.*\/customers/);
  });

  authTest('should click create customer button', async ({ authenticatedPage, dashboardPage: dp }) => {
    dashboardPage = dp;
    await dashboardPage.goto();
    await dashboardPage.clickCreateCustomer();
    // Verify navigation to create customer page
  });

  authTest('should verify unprocessed orders KPI', async ({ authenticatedPage, dashboardPage: dp }) => {
    dashboardPage = dp;
    await dashboardPage.goto();
    await dashboardPage.verifyUnprocessedOrdersKPI();
  });
});

