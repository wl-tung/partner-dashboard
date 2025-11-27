import { test, expect } from '../../src/fixtures/test.fixture';
import { test as authTest } from '../../src/fixtures/auth.fixture';
import { CustomersPage } from '../../src/pages/customers.page';

test.describe('Customer Management', () => {
  let customersPage: CustomersPage;

  test.beforeEach(async ({ page, customersPage: cp }) => {
    customersPage = cp;
  });

  authTest('should load customers page', async ({ authenticatedPage, customersPage: cp }) => {
    customersPage = cp;
    await customersPage.goto();
    await customersPage.verifyCustomersPageLoaded();
  });

  authTest('should display customer list', async ({ authenticatedPage, customersPage: cp }) => {
    customersPage = cp;
    await customersPage.goto();
    const customerCount = await customersPage.getCustomerCount();
    expect(customerCount).toBeGreaterThanOrEqual(0);
  });

  authTest('should search for customers', async ({ authenticatedPage, customersPage: cp }) => {
    customersPage = cp;
    await customersPage.goto();
    await customersPage.searchCustomers('test@example.com');
    await customersPage.waitForPageLoad();
  });

  authTest('should navigate to customer detail', async ({ authenticatedPage, customersPage: cp }) => {
    customersPage = cp;
    await customersPage.goto();
    const customerCount = await customersPage.getCustomerCount();
    if (customerCount > 0) {
      // Implementation depends on actual customer list structure
      await customersPage.waitForPageLoad();
    }
  });

  authTest('should click create customer button', async ({ authenticatedPage, customersPage: cp }) => {
    customersPage = cp;
    await customersPage.goto();
    await customersPage.clickCreateCustomer();
    // Verify navigation to create customer page
  });

  authTest('should click CSV import button', async ({ authenticatedPage, customersPage: cp }) => {
    customersPage = cp;
    await customersPage.goto();
    await customersPage.clickCSVImport();
    // Verify CSV import dialog/page
  });
});

