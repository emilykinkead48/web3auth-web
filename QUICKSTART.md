# 🔒 Web3Auth Security Testing - Quick Start Guide

## What Has Been Created

This repository now includes a **complete Proof-of-Concept (PoC) security testing suite** with:

✅ **Automated Playwright Tests** - Full browser automation for vulnerability testing
✅ **Interactive PoC HTML Files** - Manual testing demonstrations
✅ **Test Server** - Malicious endpoint simulation for OAuth/XSS testing
✅ **Codespaces Configuration** - Instant cloud development environment
✅ **Refined Bug Bounty Report** - Complete HackerOne-ready documentation

## Your CLIENT_ID

```
BFNfeVQyFvB_Fo5Yd6jYOvwje42U8qaHkDLOZ51AF_AjAd8GbrHV-zZ6yVytWDJJwKmJHQn7G7bW6Ei3p5Og8dw
```

This CLIENT_ID is already configured in all test files.

---

## 🚀 Option 1: Using GitHub Codespaces (Recommended)

### Step 1: Launch Codespaces

1. Go to: https://github.com/EmilyKinkead48/web3auth-web
2. Click the **Code** button (green)
3. Select **Codespaces** tab
4. Click **Create codespace on claude/build-poc-and-report-testing**

The environment will automatically:
- Install Node.js 22
- Install all dependencies
- Install Playwright browsers
- Configure the testing environment

### Step 2: Run Tests in Codespaces

```bash
# Navigate to security testing directory
cd security-testing

# Run automated tests
npm test

# View results
npm run test:report
```

### Step 3: Manual Testing in Codespaces

```bash
# Start the test server
node test-server.js
```

Then forward port 3000 and open in browser:
- `http://localhost:3000/prototype-pollution.html`
- `http://localhost:3000/dom-xss.html`

---

## 💻 Option 2: Local Development

### Step 1: Clone and Setup

```bash
# Clone the repository
git clone https://github.com/EmilyKinkead48/web3auth-web.git
cd web3auth-web

# Checkout the testing branch
git checkout claude/build-poc-and-report-testing

# Install dependencies
npm install

# Navigate to security testing
cd security-testing

# Install test dependencies
npm install

# Install Playwright browsers
npx playwright install
```

### Step 2: Run Automated Tests

```bash
# Run all tests
npm test

# Run specific test suites
npm run poc:prototype  # Prototype pollution tests
npm run poc:xss        # XSS vulnerability tests

# View HTML report
npm run test:report
```

### Step 3: Manual Interactive Testing

**Terminal 1 - Start Test Server:**
```bash
cd security-testing
node test-server.js
```

**Browser - Open PoC Files:**
- http://localhost:3000/prototype-pollution.html
- http://localhost:3000/dom-xss.html

**What to Do:**
1. Click test buttons to trigger vulnerability checks
2. Observe results in the "Test Results" section
3. Check "Current Status" for vulnerability indicators
4. Open Browser DevTools Console for detailed logs

---

## 📋 What Gets Tested

### Test 1: Prototype Pollution (CWE-1321)

**Tests three attack vectors:**
1. `__proto__` injection
2. `constructor.prototype` pollution
3. Nested object pollution

**PoC File:** `poc-files/prototype-pollution.html`
**Test File:** `tests/prototype-pollution.spec.ts`

**How to verify manually:**
1. Open `http://localhost:3000/prototype-pollution.html`
2. Click "Test __proto__ Pollution"
3. Click "Verify Pollution Status"
4. Look for 🔴 VULNERABLE or ✅ PROTECTED

### Test 2: DOM XSS (CWE-79)

**Tests multiple XSS vectors:**
1. `img onerror` XSS
2. `svg onload` XSS
3. `script` tag injection
4. `iframe srcdoc` XSS
5. Session hijacking payload

**PoC File:** `poc-files/dom-xss.html`
**Test File:** `tests/xss-vulnerability.spec.ts`

**How to verify manually:**
1. Open `http://localhost:3000/dom-xss.html`
2. Open Browser Console (F12)
3. Click "Test Basic XSS"
4. Watch for console messages: "🔴 XSS Vector X Executed!"
5. Click "Verify XSS Execution"

---

## 📊 Test Results & Evidence

After running tests, find all evidence in:

```
security-testing/test-results/
├── screenshots/              # Screenshots of vulnerabilities
│   ├── prototype-pollution-proto.png
│   ├── prototype-pollution-constructor.png
│   ├── dom-xss-basic.png
│   └── dom-xss-session-steal.png
├── dom-xss-report.json      # Detailed JSON report
├── html-report/             # Interactive HTML report
│   └── index.html
└── captured-oauth-tokens.json  # Captured test data
```

---

## 📖 Documentation

### Main Report

**`REFINED_BUG_BOUNTY_SECURITY_AUDIT_REPORT.md`**
- Complete bug bounty report ready for HackerOne
- Detailed reproduction steps for each vulnerability
- Impact assessments and CVSS scores
- Recommended fixes with code patches
- Manual testing checklists

### Testing Guide

**`security-testing/README.md`**
- Detailed test suite documentation
- Directory structure explanation
- Debugging instructions
- Tool configuration guides

### Existing Security Docs

**`docs/security/MANUAL_TESTING_GUIDE.md`**
- Comprehensive manual testing procedures
- Additional test cases beyond the PoC
- Burp Suite configuration
- Evidence collection templates

---

## 🎯 Expected Results

### If System is PROTECTED (No Vulnerabilities)

**Prototype Pollution Test:**
```
✅ PROTECTED - No pollution detected
Pollution Status: All properties undefined
```

**XSS Test:**
```
✅ PROTECTED - No XSS execution detected
XSS Flags: All false
```

### If System is VULNERABLE

**Prototype Pollution Test:**
```
🔴 VULNERABLE - Prototype pollution detected!
isPolluted: true
isAdmin: true
role: "administrator"
```

**XSS Test:**
```
🔴 VULNERABLE - XSS executed!
Console: "🔴 XSS Vector 1 Executed!"
Alert dialogs appear
Session data exfiltrated
```

---

## 🔍 Debugging Tests

### Run with Visual Browser

```bash
# See the browser in action
npm run test:headed
```

### Run with Playwright UI

```bash
# Interactive test explorer
npm run test:ui
```

### Debug Specific Test

```bash
# Debug mode with step-by-step execution
npx playwright test tests/prototype-pollution.spec.ts --debug
```

### View Server Logs

The test server logs all requests:
```
🔴 SECURITY TEST: OAuth redirect captured
🔴 SECURITY TEST: XSS exfiltration attempt
```

---

## ✅ Next Steps

1. **Run the tests** - Execute automated tests to verify current security status
2. **Review the report** - Read `REFINED_BUG_BOUNTY_SECURITY_AUDIT_REPORT.md`
3. **Manual validation** - Use PoC HTML files for hands-on testing
4. **Collect evidence** - Screenshots and reports are auto-generated
5. **Submit findings** - Use documentation for HackerOne report if vulnerabilities found

---

## 🆘 Troubleshooting

### "Playwright not installed"
```bash
cd security-testing
npx playwright install
```

### "Port 3000 already in use"
```bash
# Kill existing process
lsof -ti:3000 | xargs kill -9
# Or change port in test-server.js
```

### "Tests failing to connect"
```bash
# Ensure test server is running
node test-server.js

# In another terminal, run tests
npm test
```

### "No screenshots generated"
Screenshots are only generated on test failures or when explicitly captured during test execution.

---

## 📞 Support

For issues with:
- **Testing setup**: Check `security-testing/README.md`
- **Manual testing**: Check `docs/security/MANUAL_TESTING_GUIDE.md`
- **Bug bounty reporting**: Check `REFINED_BUG_BOUNTY_SECURITY_AUDIT_REPORT.md`

---

**🎉 You're all set! Start testing with `cd security-testing && npm test`**
