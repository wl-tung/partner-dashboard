import { test as base } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { DashboardPage } from '../pages/dashboard.page';
import { OrdersPage } from '../pages/orders.page';
import { CustomersPage } from '../pages/customers.page';
import { AccountsPage } from '../pages/accounts.page';
import { SystemPage } from '../pages/system.page';
import { User } from '../types';

/**
 * Extended test with all page objects
 */
type TestFixtures = {
  loginPage: LoginPage;
  dashboardPage: DashboardPage;
  ordersPage: OrdersPage;
  customersPage: CustomersPage;
  accountsPage: AccountsPage;
  systemPage: SystemPage;
};

export const test = base.extend<TestFixtures>({
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await use(loginPage);
  },

  dashboardPage: async ({ page }, use) => {
    const dashboardPage = new DashboardPage(page);
    await use(dashboardPage);
  },

  ordersPage: async ({ page }, use) => {
    const ordersPage = new OrdersPage(page);
    await use(ordersPage);
  },

  customersPage: async ({ page }, use) => {
    const customersPage = new CustomersPage(page);
    await use(customersPage);
  },

  accountsPage: async ({ page }, use) => {
    const accountsPage = new AccountsPage(page);
    await use(accountsPage);
  },

  systemPage: async ({ page }, use) => {
    const systemPage = new SystemPage(page);
    await use(systemPage);
  }
});

export { expect } from '@playwright/test';

/**
 * Helper function to login and return authenticated page
 */
export async function loginAsUser(page: any, user: User): Promise<void> {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login(user);
  await loginPage.verifySuccessfulLogin();
}

