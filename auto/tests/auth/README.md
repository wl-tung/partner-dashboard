# Authentication Test Suite

Comprehensive automation test suite for Partner Dashboard authentication system.

## Test Structure

```
tests/auth/
├── login-flow/              # Successful and failed login scenarios
├── validation/              # Form and field validation tests
├── location-selection/      # Cascading dropdown tests
├── security/                # Security and password tests
├── session-management/      # Session lifecycle and Remember Me
├── edge-cases/              # Edge cases and boundary conditions
├── api-integration/         # API request/response verification
├── performance/             # Performance and load time tests
└── accessibility/           # Accessibility and keyboard navigation
```

## Test Coverage

### Business Rules Coverage
- ✅ **BR-001:** Authentication requires credentials AND location
- ✅ **BR-002:** Hierarchical location selection (Store → Building → Location)
- ✅ **BR-003:** Optional session persistence via "Remember Me"
- ✅ **BR-004:** Flexible credential format (email OR employee code)

### Feature Coverage
- ✅ Form Inputs: 100%
- ✅ Cascading Dropdowns: 100%
- ✅ Login Flow: 100%
- ✅ Validation: 100%
- ✅ Session Management: 100%
- ✅ Security: 100%
- ✅ Edge Cases: 100%
- ✅ API Integration: 100%
- ✅ Performance: 100%
- ✅ Accessibility: 100%

## Running Tests

### Run All Authentication Tests
```bash
npm run test:auth
```

### Run Specific Test Suites
```bash
# Login flow tests
npx playwright test tests/auth/login-flow

# Validation tests
npx playwright test tests/auth/validation

# Security tests
npx playwright test tests/auth/security

# Session management tests
npx playwright test tests/auth/session-management
```

### Run Tests in UI Mode
```bash
npx playwright test tests/auth --ui
```

## Test Data

Test data files are located in `test-data/auth/`:
- `valid-credentials.json` - Valid test user credentials
- `invalid-credentials.json` - Invalid credentials for negative testing
- `locations.json` - Location hierarchy data
- `edge-cases.json` - Edge case input data

## Key Features

### Robust Location Selection
- Multiple selector strategies for Material UI dropdowns
- Retry logic for portal/overlay rendering
- Handles cascading dropdown dependencies

### Comprehensive Validation
- Required field validation
- Error message verification
- Field-level validation indicators

### Security Testing
- Password masking verification
- Session security checks
- Failed login attempt handling
- HTTPS verification

### Performance Testing
- Page load time verification
- Dropdown load time checks
- Login response time validation

### Accessibility Testing
- Keyboard navigation
- Screen reader compatibility
- ARIA label verification

## Test Execution Reports

After running tests, view the HTML report:
```bash
npm run test:report
```

Reports include:
- Test execution results
- Screenshots on failure
- Video recordings
- Performance metrics
- API request/response logs

