import { test as base, Page } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { DashboardPage } from '../pages/dashboard.page';
import { OrdersPage } from '../pages/orders.page';
import { CustomersPage } from '../pages/customers.page';
import { AccountsPage } from '../pages/accounts.page';
import { SystemPage } from '../pages/system.page';
import { User, UserRole } from '../types';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

/**
 * Extended test with authentication fixtures
 */
type AuthFixtures = {
  authenticatedPage: Page;
  loginPage: LoginPage;
  dashboardPage: DashboardPage;
  ordersPage: OrdersPage;
  customersPage: CustomersPage;
  accountsPage: AccountsPage;
  systemPage: SystemPage;
  storeOwnerUser: User;
  adminUser: User;
};

/**
 * Get default test user based on role
 */
function getDefaultUser(role: UserRole): User {
  if (role === UserRole.MALL_ADMINISTRATOR) {
    return {
      email: process.env.ADMIN_USER_EMAIL,
      employeeCode: process.env.ADMIN_USER_EMPLOYEE_CODE,
      password: process.env.ADMIN_USER_PASSWORD || '',
      role: UserRole.MALL_ADMINISTRATOR,
      storeCode: process.env.TEST_STORE_CODE || 'TKY001',
      buildingCode: process.env.TEST_BUILDING_CODE || 'TKY001-A',
      locationCode: process.env.TEST_LOCATION_CODE || 'TKY001-A-1B'
    };
  } else {
    return {
      email: process.env.TEST_USER_EMAIL,
      employeeCode: process.env.TEST_USER_EMPLOYEE_CODE,
      password: process.env.TEST_USER_PASSWORD || '',
      role: UserRole.STORE_OWNER,
      storeCode: process.env.TEST_STORE_CODE || 'TKY001',
      buildingCode: process.env.TEST_BUILDING_CODE || 'TKY001-A',
      locationCode: process.env.TEST_LOCATION_CODE || 'TKY001-A-1B'
    };
  }
}

export const test = base.extend<AuthFixtures>({
  /**
   * Authenticated page - automatically logs in before test
   */
  authenticatedPage: async ({ page, loginPage }, use) => {
    const user = getDefaultUser(UserRole.STORE_OWNER);
    await loginPage.goto();
    await loginPage.login(user);
    await use(page);
  },

  /**
   * Login page fixture
   */
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await use(loginPage);
  },

  /**
   * Dashboard page fixture
   */
  dashboardPage: async ({ page }, use) => {
    const dashboardPage = new DashboardPage(page);
    await use(dashboardPage);
  },

  /**
   * Orders page fixture
   */
  ordersPage: async ({ page }, use) => {
    const ordersPage = new OrdersPage(page);
    await use(ordersPage);
  },

  /**
   * Customers page fixture
   */
  customersPage: async ({ page }, use) => {
    const customersPage = new CustomersPage(page);
    await use(customersPage);
  },

  /**
   * Accounts page fixture
   */
  accountsPage: async ({ page }, use) => {
    const accountsPage = new AccountsPage(page);
    await use(accountsPage);
  },

  /**
   * System page fixture
   */
  systemPage: async ({ page }, use) => {
    const systemPage = new SystemPage(page);
    await use(systemPage);
  },

  /**
   * Store Owner user fixture
   */
  storeOwnerUser: async ({}, use) => {
    const user = getDefaultUser(UserRole.STORE_OWNER);
    await use(user);
  },

  /**
   * Mall Administrator user fixture
   */
  adminUser: async ({}, use) => {
    const user = getDefaultUser(UserRole.MALL_ADMINISTRATOR);
    await use(user);
  }
});

export { expect } from '@playwright/test';

