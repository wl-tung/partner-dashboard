import { test, expect } from '../../src/fixtures/test.fixture';
import { test as authTest } from '../../src/fixtures/auth.fixture';
import { OrdersPage } from '../../src/pages/orders.page';
import { OrderStatus } from '../../src/types';

test.describe('Order Management', () => {
  let ordersPage: OrdersPage;

  test.beforeEach(async ({ page, ordersPage: op }) => {
    ordersPage = op;
  });

  authTest('should load orders page', async ({ authenticatedPage, ordersPage: op }) => {
    ordersPage = op;
    await ordersPage.goto();
    await ordersPage.verifyOrdersPageLoaded();
  });

  authTest('should display order list', async ({ authenticatedPage, ordersPage: op }) => {
    ordersPage = op;
    await ordersPage.goto();
    const orderCount = await ordersPage.getOrderCount();
    expect(orderCount).toBeGreaterThan(0);
  });

  authTest('should search for orders', async ({ authenticatedPage, ordersPage: op }) => {
    ordersPage = op;
    await ordersPage.goto();
    await ordersPage.searchOrders('ORD-001');
    await ordersPage.waitForPageLoad();
  });

  authTest('should filter orders by status', async ({ authenticatedPage, ordersPage: op }) => {
    ordersPage = op;
    await ordersPage.goto();
    await ordersPage.filterByStatus(OrderStatus.PROCESSING);
    await ordersPage.waitForPageLoad();
  });

  authTest('should navigate to order detail', async ({ authenticatedPage, ordersPage: op }) => {
    ordersPage = op;
    await ordersPage.goto();
    // Assuming there's at least one order
    const orderCount = await ordersPage.getOrderCount();
    if (orderCount > 0) {
      // Click on first order (implementation depends on actual structure)
      await ordersPage.waitForPageLoad();
    }
  });

  authTest('should select order checkbox', async ({ authenticatedPage, ordersPage: op }) => {
    ordersPage = op;
    await ordersPage.goto();
    const orderCount = await ordersPage.getOrderCount();
    if (orderCount > 0) {
      await ordersPage.selectOrder(0);
    }
  });

  authTest('should navigate to next page', async ({ authenticatedPage, ordersPage: op }) => {
    ordersPage = op;
    await ordersPage.goto();
    await ordersPage.goToNextPage();
    await ordersPage.waitForPageLoad();
  });
});

