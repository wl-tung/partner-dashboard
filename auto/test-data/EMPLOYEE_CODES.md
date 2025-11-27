# Employee Codes Reference

This file stores valid employee codes for testing purposes.

## Valid Employee Codes

### Mall Manager
- **Employee Code:** `EMP355782`
- **Password:** `Weblife_123`
- **Email:** `admin@itfor-wl.myshopify.com` (same account)
- **Role:** Mall Manager

### Partner Admin
- **Employee Code:** `EMP413405`
- **Password:** `Weblife_123`
- **Email:** `admin@itfor-wl.myshopify.com` (same account)
- **Role:** Partner Admin

## Notes

- Both employee codes use the same password: `Weblife_123`
- Both employee codes are associated with the same email: `admin@itfor-wl.myshopify.com`
- The login form accepts **either** email **or** employee code in the same input field
- Employee codes are stored in:
  - `test-data/users.json`
  - `test-data/auth/valid-credentials.json`

## Usage in Tests

These employee codes are automatically used in:
- `tests/auth/login-flow/successful-login.spec.ts` - Employee code login test
- Any test that uses `users.storeOwner` or `users.admin` from test data

---

**Last Updated:** November 27, 2025

