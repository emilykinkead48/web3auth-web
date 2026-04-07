import { test, expect } from '@playwright/test';

test.describe('Prototype Pollution Security Test', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/prototype-pollution.html');
    await page.waitForLoadState('networkidle');
  });

  test('should detect __proto__ pollution vulnerability', async ({ page }) => {
    // Click the test button for __proto__ pollution
    await page.click('#test-proto-pollution');

    // Wait for the test to complete
    await page.waitForTimeout(3000);

    // Check the pollution status
    const pollutionStatus = await page.locator('#pollution-status').textContent();

    // Check if pollution was detected
    const isVulnerable = pollutionStatus?.includes('VULNERABLE');

    if (isVulnerable) {
      console.log('🔴 VULNERABILITY DETECTED: Prototype pollution via __proto__');

      // Get the detailed results
      const results = await page.locator('#results').textContent();
      console.log('Test results:', results);

      // Take screenshot as evidence
      await page.screenshot({
        path: 'test-results/screenshots/prototype-pollution-proto.png',
        fullPage: true
      });

      // Verify that Object.prototype was actually polluted
      const pollutionCheck = await page.evaluate(() => {
        const testObj = {};
        return {
          isPolluted: testObj.isPolluted === true,
          isAdmin: testObj.isAdmin === true,
          role: testObj.role === 'administrator'
        };
      });

      console.log('Pollution verification:', pollutionCheck);

      // This test PASSES if vulnerability is NOT found
      expect(isVulnerable).toBe(false);
    } else {
      console.log('✅ PROTECTED: __proto__ pollution blocked');
      expect(isVulnerable).toBe(false);
    }
  });

  test('should detect constructor.prototype pollution vulnerability', async ({ page }) => {
    await page.click('#test-constructor-pollution');
    await page.waitForTimeout(3000);

    const pollutionStatus = await page.locator('#pollution-status').textContent();
    const isVulnerable = pollutionStatus?.includes('VULNERABLE');

    if (isVulnerable) {
      console.log('🔴 VULNERABILITY DETECTED: Prototype pollution via constructor.prototype');

      await page.screenshot({
        path: 'test-results/screenshots/prototype-pollution-constructor.png',
        fullPage: true
      });

      const pollutionCheck = await page.evaluate(() => {
        const testObj = {};
        return { compromised: testObj.compromised === true };
      });

      console.log('Constructor pollution check:', pollutionCheck);
      expect(isVulnerable).toBe(false);
    } else {
      console.log('✅ PROTECTED: constructor.prototype pollution blocked');
      expect(isVulnerable).toBe(false);
    }
  });

  test('should detect nested object pollution vulnerability', async ({ page }) => {
    await page.click('#test-nested-pollution');
    await page.waitForTimeout(3000);

    const pollutionStatus = await page.locator('#pollution-status').textContent();
    const isVulnerable = pollutionStatus?.includes('VULNERABLE');

    if (isVulnerable) {
      console.log('🔴 VULNERABILITY DETECTED: Nested object pollution');

      await page.screenshot({
        path: 'test-results/screenshots/prototype-pollution-nested.png',
        fullPage: true
      });

      const pollutionCheck = await page.evaluate(() => {
        const testObj = {};
        return { bypass: testObj.bypass === true };
      });

      console.log('Nested pollution check:', pollutionCheck);
      expect(isVulnerable).toBe(false);
    } else {
      console.log('✅ PROTECTED: Nested pollution blocked');
      expect(isVulnerable).toBe(false);
    }
  });

  test('should generate comprehensive pollution report', async ({ page }) => {
    // Run all pollution tests
    const tests = [
      'test-proto-pollution',
      'test-constructor-pollution',
      'test-nested-pollution'
    ];

    const vulnerabilities = [];

    for (const testId of tests) {
      await page.click(`#${testId}`);
      await page.waitForTimeout(2000);

      const status = await page.locator('#pollution-status').textContent();
      if (status?.includes('VULNERABLE')) {
        vulnerabilities.push(testId);
      }
    }

    // Click verify to get final status
    await page.click('#verify-pollution');
    await page.waitForTimeout(1000);

    // Get full results
    const results = await page.locator('#results').textContent();

    // Take final screenshot
    await page.screenshot({
      path: 'test-results/screenshots/prototype-pollution-summary.png',
      fullPage: true
    });

    // Generate report
    const report = {
      testName: 'Prototype Pollution Security Test',
      timestamp: new Date().toISOString(),
      vulnerabilitiesFound: vulnerabilities.length,
      vulnerableTests: vulnerabilities,
      results: results,
      status: vulnerabilities.length > 0 ? 'VULNERABLE' : 'PROTECTED'
    };

    console.log('\n📊 PROTOTYPE POLLUTION TEST REPORT:');
    console.log(JSON.stringify(report, null, 2));

    // The test should pass if NO vulnerabilities are found
    expect(vulnerabilities.length).toBe(0);
  });
});
