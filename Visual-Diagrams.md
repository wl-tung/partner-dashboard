# Partner Dashboard Visual Diagrams

## 1. System Context
`mermaid
graph TD
    A[Store Staff / Partner Admin] -->|Login & Manage| B(Partner Dashboard Web App)
    B -->|Fetch Orders & Customers| C[Shopify / Commerce APIs]
    B -->|Authentication & Data| D[Partner API Gateway]
    D -->|Persists Data| E[(Partner DB Cluster)]
    B -->|Telemetry| F[(Monitoring & Logs)]
    B -->|Triggers Webhooks| G[External Integrations]
`

## 2. Authentication & Location Flow
`mermaid
sequenceDiagram
    participant U as User
    participant UI as Login UI (Playwright)
    participant Auth as Auth Service
    participant Loc as Location API

    U->>UI: Enter Email or Employee Code
    UI->>Auth: POST /auth/login (credentials)
    Auth-->>UI: 200 + Token (if valid)
    UI->>Loc: GET /locations?store=TKY001
    Loc-->>UI: Stores > Buildings > Locations
    UI->>Auth: POST /auth/session (store, building, location)
    Auth-->>UI: Session cookie + redirect /
    UI->>U: Dashboard with scoped access
`

## 3. Automation Architecture (Playwright TypeScript)
`mermaid
graph LR
    subgraph auto/
        A[tests/*] --> B[src/fixtures]
        B --> C[src/pages]
        C --> D[src/helpers]
        A --> E[test-data/*.json]
        A --> F[playwright.config.ts]
    end
    subgraph Execution
        F -.projects.-> G[Chromium / Firefox / WebKit]
        tests -->|uses| fixtures
        fixtures -->|inject| pages
        pages -->|wrap| helpers
    end
`

## 4. Writing New Tests (Step Guide)
1. **Create/Update Page Object** in uto/src/pages using Playwright locators (e.g., page.getByLabel).
2. **Add Fixture Support** in uto/src/fixtures if the test needs shared state (authenticated page, test data, etc.).
3. **Prepare Test Data** in uto/test-data/*.json so scenarios stay data-driven.
4. **Add Spec** under uto/tests/..., importing the shared 	est from src/fixtures/test.fixture and page objects.
5. **Use Expect Syntax** shown in current tests (async/await + wait expect(locator).toBeVisible()), mirroring existing coding style.
6. **Run Locally** with 
pm run test:auth or targeted scripts to verify selectors before CI.

### Example Snippet
`	s
import { test, expect } from '../../src/fixtures/test.fixture';
import { LoginPage } from '../../src/pages/login.page';

test('should lock account after 5 failed attempts', async ({ page, loginPage }) => {
  await loginPage.goto();
  for (let i = 0; i < 5; i++) {
    await loginPage.loginWithEmail('admin@itfor-wl.myshopify.com', 'WrongPass', defaultLocation);
    await loginPage.verifyErrorMessage('Invalid credentials');
  }
  await loginPage.loginWithEmail('admin@itfor-wl.myshopify.com', 'Weblife_123', defaultLocation);
  await loginPage.verifyErrorMessage('Account locked');
});
`

## 5. Test Coverage Heatmap
`mermaid
mindmap
  root((Auth Test Areas))
    Login Flow
      Email + Location ✅
      Employee Code ✅
      Remember Me ✅
    Validation
      Required Fields ✅
      Error Messages ✅
      Edge Inputs ⏳
    Security
      Password Masking ✅
      Session Security ✅
      Failed Attempts ⏳
    API Integration
      Request Coverage ✅
      Response Handling ⏳
    Non-Functional
      Performance Tests ⏳
      Accessibility ⏳
`

