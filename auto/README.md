# Partner Dashboard E2E Tests

Comprehensive Playwright TypeScript end-to-end test suite for the Partner Dashboard application.

## Overview

This test suite provides automated testing for the Partner Dashboard, a comprehensive e-commerce management system integrated with Shopify. The tests cover all major modules including Dashboard, Order Management, Customer Management, Account Management, and System Management.

## Technology Stack

- **Playwright** - Modern end-to-end testing framework
- **TypeScript** - Type-safe test development
- **Page Object Model (POM)** - Maintainable test architecture
- **Test Fixtures** - Reusable authenticated sessions

## Project Structure

```
auto/
├── src/
│   ├── fixtures/          # Test fixtures for authentication and page objects
│   ├── helpers/          # Utility helpers (API, data, utils)
│   ├── pages/            # Page Object Model classes
│   └── types/            # TypeScript type definitions
├── tests/                # Test specifications
│   ├── auth/            # Authentication tests
│   ├── dashboard/       # Dashboard tests
│   ├── orders/          # Order management tests
│   ├── customers/       # Customer management tests
│   ├── accounts/        # Account management tests
│   └── system/          # System management tests
├── test-data/           # Test data files (users, sample data)
├── reports/             # Test reports
└── screenshots/         # Screenshots from test runs
```

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Access to Partner Dashboard application

## Setup Instructions

### 1. Install Dependencies

```bash
cd auto
npm install
```

### 2. Install Playwright Browsers

```bash
npx playwright install
```

### 3. Configure Environment Variables

Copy the example environment file and update with your credentials:

```bash
cp .env.example .env
```

Edit `.env` file with your test credentials:

```env
BASE_URL=https://itfor-shared-alb-882114827.ap-northeast-1.elb.amazonaws.com:8443
TEST_USER_EMAIL=your_email@example.com
TEST_USER_EMPLOYEE_CODE=EMP001
TEST_USER_PASSWORD=your_password
TEST_STORE_CODE=TKY001
TEST_BUILDING_CODE=TKY001-A
TEST_LOCATION_CODE=TKY001-A-1B
```

### 4. Update Test Data

Edit `test-data/users.json` with your actual test user credentials.

## Running Tests

### Run All Tests

```bash
npm test
```

### Run Tests in Headed Mode

```bash
npm run test:headed
```

### Run Tests in UI Mode (Interactive)

```bash
npm run test:ui
```

### Run Tests in Debug Mode

```bash
npm run test:debug
```

### Run Tests for Specific Module

```bash
# Authentication tests
npm run test:auth

# Dashboard tests
npm run test:dashboard

# Orders tests
npm run test:orders

# Customers tests
npm run test:customers

# Accounts tests
npm run test:accounts

# System tests
npm run test:system
```

### Run Tests on Specific Browser

```bash
npm run test:chromium
npm run test:firefox
npm run test:webkit
```

### Generate Test Code

Use Playwright's code generator to create new tests:

```bash
npm run test:codegen
```

## Viewing Test Reports

After running tests, view the HTML report:

```bash
npm run test:report
```

Reports are also available in the `playwright-report` directory.

## Writing Tests

### Using Page Objects

All page interactions are handled through Page Object Model classes:

```typescript
import { test, expect } from '../src/fixtures/test.fixture';
import { DashboardPage } from '../../src/pages/dashboard.page';

test('should display dashboard', async ({ dashboardPage }) => {
  await dashboardPage.goto();
  await dashboardPage.verifyDashboardLoaded();
});
```

### Using Authentication Fixtures

Use the authenticated fixture for tests that require login:

```typescript
import { test as authTest } from '../src/fixtures/auth.fixture';

authTest('should access dashboard after login', async ({ authenticatedPage, dashboardPage }) => {
  await dashboardPage.goto();
  await dashboardPage.verifyDashboardLoaded();
});
```

### Using Helper Utilities

```typescript
import { DataHelper } from '../../src/helpers/data.helper';
import { UtilsHelper } from '../../src/helpers/utils.helper';

const dataHelper = new DataHelper();
const users = dataHelper.getTestUsers();
const formattedAmount = UtilsHelper.formatCurrency(1000); // ¥1,000
```

## Page Objects

### Available Page Objects

- **LoginPage** - Authentication and location selection
- **DashboardPage** - Dashboard KPIs and quick actions
- **OrdersPage** - Order list, search, and detail pages
- **CustomersPage** - Customer management pages
- **AccountsPage** - Account management (admin only)
- **SystemPage** - System logs and settings (admin only)

### Base Page Methods

All page objects extend `BasePage` which provides common methods:

- `goto(path)` - Navigate to URL
- `click(selector)` - Click element
- `fill(selector, value)` - Fill input field
- `getText(selector)` - Get text content
- `waitForElement(selector)` - Wait for element visibility
- `verifyTextPresent(text)` - Verify text is visible
- And many more...

## Test Data Management

### Test Users

Test users are defined in `test-data/users.json`:

```json
{
  "storeOwner": {
    "email": "storeowner@example.com",
    "employeeCode": "EMP001",
    "password": "password123",
    "role": "Store Owner",
    "storeCode": "TKY001",
    "buildingCode": "TKY001-A",
    "locationCode": "TKY001-A-1B"
  }
}
```

### Using Test Data

```typescript
import { DataHelper } from '../../src/helpers/data.helper';

const dataHelper = new DataHelper();
const users = dataHelper.getTestUsers();
const storeOwner = users.storeOwner;
```

## Best Practices

### 1. Use Page Object Model

Always use page objects for UI interactions. Don't write selectors directly in tests.

```typescript
// ✅ Good
await dashboardPage.clickCreateCustomer();

// ❌ Bad
await page.click('button:has-text("新規顧客作成")');
```

### 2. Use Descriptive Test Names

Write clear, descriptive test names that explain what is being tested:

```typescript
// ✅ Good
test('should display error message when login with invalid credentials', async () => {});

// ❌ Bad
test('login test', async () => {});
```

### 3. Use Fixtures for Authentication

Use authentication fixtures instead of manually logging in:

```typescript
// ✅ Good
authTest('should access orders page', async ({ authenticatedPage, ordersPage }) => {});

// ❌ Bad
test('should access orders page', async ({ page }) => {
  // Manual login code...
});
```

### 4. Wait for Elements

Always wait for elements before interacting:

```typescript
// ✅ Good
await page.waitForSelector(selector);
await page.click(selector);

// ❌ Bad
await page.click(selector); // May fail if element not ready
```

### 5. Use TypeScript Types

Leverage TypeScript types for type safety:

```typescript
import { User, OrderStatus } from '../../src/types';

const user: User = {
  email: 'test@example.com',
  password: 'password123',
  role: UserRole.STORE_OWNER
};
```

### 6. Handle Japanese Text

The application uses Japanese text. Use appropriate selectors:

```typescript
// Use text selectors that work with Japanese
await page.click('text=注文管理');
await page.fill('input[placeholder*="検索"]', 'keyword');
```

### 7. Clean Up After Tests

Use `test.afterEach` or `test.afterAll` for cleanup:

```typescript
test.afterEach(async ({ page }) => {
  // Cleanup code
});
```

## Configuration

### Playwright Configuration

Main configuration is in `playwright.config.ts`:

- **Base URL** - Configured from `.env` file
- **Browsers** - Chromium, Firefox, WebKit, Mobile
- **Timeouts** - Action timeout: 30s, Navigation timeout: 60s
- **Retries** - 2 retries on CI, 0 locally
- **Reporting** - HTML, List, and JSON reporters

### TypeScript Configuration

TypeScript settings in `tsconfig.json`:

- **Strict mode** - Enabled for type safety
- **Path aliases** - `@src/*`, `@tests/*`, `@test-data/*`
- **Target** - ES2020

## Troubleshooting

### Tests Fail with Timeout

- Increase timeout in `playwright.config.ts`
- Check if application is accessible
- Verify network connectivity

### Authentication Fails

- Verify credentials in `.env` file
- Check location codes are correct
- Ensure test user account is active

### Selectors Not Found

- Use Playwright's codegen to find correct selectors
- Check if page structure has changed
- Use more flexible selectors (text, role, label)

### Japanese Text Issues

- Use text selectors that match Japanese characters
- Use placeholder selectors with wildcards
- Check encoding settings

## CI/CD Integration

### GitHub Actions Example

```yaml
name: E2E Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: |
          cd auto
          npm install
          npx playwright install --with-deps
      - name: Run tests
        run: |
          cd auto
          npm test
        env:
          BASE_URL: ${{ secrets.BASE_URL }}
          TEST_USER_EMAIL: ${{ secrets.TEST_USER_EMAIL }}
          TEST_USER_PASSWORD: ${{ secrets.TEST_USER_PASSWORD }}
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: auto/playwright-report/
```

## Contributing

1. Follow the existing code structure
2. Use Page Object Model pattern
3. Write descriptive test names
4. Add appropriate assertions
5. Update documentation as needed

## Resources

- [Playwright Documentation](https://playwright.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/)
- [Partner Dashboard Documentation](../DOCUMENT_SUMMARY.md)

## Support

For issues or questions:
1. Check existing test files for examples
2. Review Playwright documentation
3. Check application documentation

## License

ISC

