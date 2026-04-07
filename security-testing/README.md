# Web3Auth Security Testing Suite

## Overview

This directory contains a comprehensive security testing suite for Web3Auth using Playwright. It includes Proof-of-Concept (PoC) demonstrations and automated tests for critical vulnerabilities.

## Test Client ID

```
BFNfeVQyFvB_Fo5Yd6jYOvwje42U8qaHkDLOZ51AF_AjAd8GbrHV-zZ6yVytWDJJwKmJHQn7G7bW6Ei3p5Og8dw
```

## Quick Start

### 1. Install Dependencies

```bash
cd security-testing
npm install
npx playwright install
```

### 2. Run All Tests

```bash
npm test
```

### 3. Run Specific Test Suites

```bash
# Prototype Pollution Tests
npm run poc:prototype

# DOM XSS Tests
npm run poc:xss

# All PoC Tests
npm run poc:all
```

### 4. View Test Results

```bash
npm run test:report
```

## Test Suite Coverage

### 🔴 Critical Severity Tests

#### 1. Prototype Pollution (CWE-1321)
- **File:** `tests/prototype-pollution.spec.ts`
- **PoC:** `poc-files/prototype-pollution.html`
- **Tests:**
  - `__proto__` injection
  - `constructor.prototype` pollution
  - Nested object pollution
- **CVSS:** 9.1

#### 2. DOM-Based XSS (CWE-79)
- **File:** `tests/xss-vulnerability.spec.ts`
- **PoC:** `poc-files/dom-xss.html`
- **Tests:**
  - Basic innerHTML XSS vectors
  - Session hijacking payloads
  - Embed mode XSS
- **CVSS:** 8.6

## Manual Testing

### Running PoC Files Manually

1. Start the test server:
```bash
node test-server.js
```

2. Open PoC files in browser:
- http://localhost:3000/prototype-pollution.html
- http://localhost:3000/dom-xss.html

### Interactive Testing

Each PoC file includes:
- ✅ Step-by-step test controls
- ✅ Real-time vulnerability status
- ✅ Detailed result logging
- ✅ Visual indicators for vulnerabilities

## Directory Structure

```
security-testing/
├── package.json              # Dependencies and scripts
├── playwright.config.ts      # Playwright configuration
├── test-server.js           # Express server for PoC hosting
├── README.md                # This file
├── poc-files/               # PoC HTML demonstrations
│   ├── prototype-pollution.html
│   └── dom-xss.html
├── tests/                   # Playwright test suites
│   ├── prototype-pollution.spec.ts
│   └── xss-vulnerability.spec.ts
└── test-results/            # Generated during test runs
    ├── screenshots/         # Evidence screenshots
    ├── *.json              # Test reports
    └── html-report/        # Interactive HTML report
```

## Test Server Endpoints

The test server (`test-server.js`) provides:

- `GET /` - Serves PoC files
- `GET /capture-oauth` - Simulates malicious OAuth redirect
- `POST /exfiltrate` - Captures XSS exfiltration attempts
- `GET /health` - Health check endpoint

## Running Tests in Codespaces

### Option 1: Automated Setup

The `.devcontainer` configuration automatically:
1. Installs all dependencies
2. Installs Playwright browsers
3. Sets up the testing environment

### Option 2: Manual Setup

```bash
# Open terminal in Codespaces
cd security-testing

# Install dependencies
npm install
npx playwright install --with-deps

# Run tests
npm test
```

### Viewing Results in Codespaces

After tests run:

```bash
# Open HTML report (if port forwarding is enabled)
npm run test:report

# View JSON reports
cat test-results/dom-xss-report.json
```

## Evidence Collection

Each test automatically captures:

1. **Screenshots** - `test-results/screenshots/*.png`
2. **Videos** - `test-results/videos/*.webm` (on failure)
3. **JSON Reports** - `test-results/*.json`
4. **HTML Report** - `test-results/html-report/index.html`

## Interpreting Results

### ✅ PASS (Protected)
The test PASSES when vulnerabilities are NOT found:
```
✅ PROTECTED: Prototype pollution blocked
✅ PROTECTED: DOM XSS blocked
```

### 🔴 FAIL (Vulnerable)
The test FAILS when vulnerabilities ARE found:
```
🔴 VULNERABILITY DETECTED: Prototype pollution via __proto__
🔴 CRITICAL VULNERABILITY: Session hijacking XSS executed!
```

## Bug Bounty Reporting

For confirmed vulnerabilities, reference:
- `/docs/security/MANUAL_TESTING_GUIDE.md` - Manual testing procedures
- Test screenshots from `test-results/screenshots/`
- JSON reports from `test-results/`

## Debugging Tests

### Run tests with UI mode:
```bash
npm run test:ui
```

### Run tests in headed mode:
```bash
npm run test:headed
```

### Debug specific test:
```bash
npm run test:debug
```

## Security Notes

⚠️ **IMPORTANT:**
- These tests are for security research only
- Only run against authorized Web3Auth test instances
- Never use on production systems without authorization
- All test payloads are benign but demonstrate real attack vectors

## Contributing

When adding new tests:

1. Create PoC HTML file in `poc-files/`
2. Create Playwright test in `tests/`
3. Add npm script to `package.json`
4. Update this README
5. Document in `/docs/security/MANUAL_TESTING_GUIDE.md`

## References

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [CWE-79: Cross-site Scripting](https://cwe.mitre.org/data/definitions/79.html)
- [CWE-1321: Prototype Pollution](https://cwe.mitre.org/data/definitions/1321.html)
- [Playwright Documentation](https://playwright.dev/)

## License

ISC - See repository root for license details.
