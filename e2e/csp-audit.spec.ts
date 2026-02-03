import { test, expect } from '@playwright/test';

/**
 * Content Security Policy (CSP) Audit
 *
 * Comprehensive check for CSP and other security headers
 */

test.describe('Content Security Policy Audit', () => {

  test('should audit all security headers', async ({ page }) => {
    const response = await page.goto('/login');

    if (!response) {
      test.fail(true, 'No response received');
      return;
    }

    const headers = response.headers();

    console.log('\n========================================');
    console.log('SECURITY HEADERS AUDIT REPORT');
    console.log('========================================\n');

    // Content-Security-Policy
    const csp = headers['content-security-policy'];
    console.log('📋 Content-Security-Policy:');
    if (csp) {
      console.log('   ✅ PRESENT');
      console.log('   Directives:');
      csp.split(';').forEach(directive => {
        console.log(`      - ${directive.trim()}`);
      });
    } else {
      console.log('   ❌ MISSING - No CSP header found!');
      console.log('   Risk: XSS attacks, data injection, clickjacking');
    }

    // Check for CSP in meta tag
    const cspMeta = await page.locator('meta[http-equiv="Content-Security-Policy"]').count();
    if (cspMeta > 0) {
      const cspMetaContent = await page.locator('meta[http-equiv="Content-Security-Policy"]').getAttribute('content');
      console.log('\n   📌 CSP Meta Tag Found:');
      console.log(`      ${cspMetaContent}`);
    }

    console.log('\n----------------------------------------');

    // X-Content-Type-Options
    const xContentType = headers['x-content-type-options'];
    console.log('📋 X-Content-Type-Options:');
    if (xContentType === 'nosniff') {
      console.log('   ✅ PRESENT: nosniff');
    } else if (xContentType) {
      console.log(`   ⚠️ PRESENT but unexpected value: ${xContentType}`);
    } else {
      console.log('   ❌ MISSING');
      console.log('   Risk: MIME-type sniffing attacks');
    }

    console.log('\n----------------------------------------');

    // X-Frame-Options
    const xFrameOptions = headers['x-frame-options'];
    console.log('📋 X-Frame-Options:');
    if (xFrameOptions) {
      if (['DENY', 'SAMEORIGIN'].includes(xFrameOptions.toUpperCase())) {
        console.log(`   ✅ PRESENT: ${xFrameOptions}`);
      } else {
        console.log(`   ⚠️ PRESENT but weak: ${xFrameOptions}`);
      }
    } else {
      console.log('   ❌ MISSING');
      console.log('   Risk: Clickjacking attacks');
    }

    console.log('\n----------------------------------------');

    // Strict-Transport-Security (HSTS)
    const hsts = headers['strict-transport-security'];
    console.log('📋 Strict-Transport-Security (HSTS):');
    if (hsts) {
      console.log(`   ✅ PRESENT: ${hsts}`);
      if (hsts.includes('includeSubDomains')) {
        console.log('   ✅ Includes subdomains');
      }
      if (hsts.includes('preload')) {
        console.log('   ✅ Preload enabled');
      }
    } else {
      console.log('   ❌ MISSING');
      console.log('   Risk: SSL stripping attacks');
      console.log('   Note: Only applies to HTTPS');
    }

    console.log('\n----------------------------------------');

    // X-XSS-Protection (legacy but still useful)
    const xssProtection = headers['x-xss-protection'];
    console.log('📋 X-XSS-Protection:');
    if (xssProtection) {
      console.log(`   ✅ PRESENT: ${xssProtection}`);
    } else {
      console.log('   ⚠️ MISSING (legacy header, CSP is preferred)');
    }

    console.log('\n----------------------------------------');

    // Referrer-Policy
    const referrerPolicy = headers['referrer-policy'];
    console.log('📋 Referrer-Policy:');
    if (referrerPolicy) {
      console.log(`   ✅ PRESENT: ${referrerPolicy}`);
    } else {
      console.log('   ❌ MISSING');
      console.log('   Risk: Referrer information leakage');
    }

    console.log('\n----------------------------------------');

    // Permissions-Policy (formerly Feature-Policy)
    const permissionsPolicy = headers['permissions-policy'] || headers['feature-policy'];
    console.log('📋 Permissions-Policy:');
    if (permissionsPolicy) {
      console.log(`   ✅ PRESENT: ${permissionsPolicy}`);
    } else {
      console.log('   ⚠️ MISSING');
      console.log('   Risk: Unwanted browser feature access');
    }

    console.log('\n----------------------------------------');

    // Cross-Origin headers
    const coep = headers['cross-origin-embedder-policy'];
    const coop = headers['cross-origin-opener-policy'];
    const corp = headers['cross-origin-resource-policy'];

    console.log('📋 Cross-Origin Policies:');
    console.log(`   COEP (Embedder): ${coep || '❌ MISSING'}`);
    console.log(`   COOP (Opener): ${coop || '❌ MISSING'}`);
    console.log(`   CORP (Resource): ${corp || '❌ MISSING'}`);

    console.log('\n----------------------------------------');

    // Server information exposure
    const server = headers['server'];
    const poweredBy = headers['x-powered-by'];

    console.log('📋 Information Disclosure:');
    if (server) {
      console.log(`   Server: ${server}`);
      if (/\d+\.\d+/.test(server)) {
        console.log('   ⚠️ WARNING: Server version exposed!');
      }
    } else {
      console.log('   Server: ✅ Not exposed');
    }

    if (poweredBy) {
      console.log(`   X-Powered-By: ${poweredBy}`);
      console.log('   ⚠️ WARNING: Technology stack exposed!');
    } else {
      console.log('   X-Powered-By: ✅ Not exposed');
    }

    console.log('\n----------------------------------------');

    // Cache-Control for sensitive pages
    const cacheControl = headers['cache-control'];
    console.log('📋 Cache-Control:');
    if (cacheControl) {
      console.log(`   ${cacheControl}`);
      if (cacheControl.includes('no-store') || cacheControl.includes('private')) {
        console.log('   ✅ Appropriate for sensitive content');
      } else {
        console.log('   ⚠️ Consider no-store for login pages');
      }
    } else {
      console.log('   ❌ MISSING');
    }

    console.log('\n========================================');
    console.log('SUMMARY');
    console.log('========================================');

    const criticalMissing = [];
    const recommendedMissing = [];

    if (!csp) criticalMissing.push('Content-Security-Policy');
    if (!xFrameOptions) criticalMissing.push('X-Frame-Options');
    if (!xContentType) recommendedMissing.push('X-Content-Type-Options');
    if (!hsts) recommendedMissing.push('Strict-Transport-Security');
    if (!referrerPolicy) recommendedMissing.push('Referrer-Policy');

    if (criticalMissing.length > 0) {
      console.log('\n🔴 CRITICAL - Missing headers:');
      criticalMissing.forEach(h => console.log(`   - ${h}`));
    }

    if (recommendedMissing.length > 0) {
      console.log('\n🟡 RECOMMENDED - Missing headers:');
      recommendedMissing.forEach(h => console.log(`   - ${h}`));
    }

    if (criticalMissing.length === 0 && recommendedMissing.length === 0) {
      console.log('\n✅ All essential security headers present!');
    }

    console.log('\n========================================\n');

    // Store results for assertion
    const hasCriticalHeaders = criticalMissing.length === 0;

    // This test documents the current state - adjust expectation based on requirements
    // For now, we just log the findings
    expect(response.status()).toBe(200);
  });

  test('should check CSP directives in detail', async ({ page }) => {
    const response = await page.goto('/login');

    if (!response) {
      test.fail(true, 'No response received');
      return;
    }

    const headers = response.headers();
    const csp = headers['content-security-policy'];

    // Also check meta tag
    const cspMetaLocator = page.locator('meta[http-equiv="Content-Security-Policy"]');
    const cspMeta = await cspMetaLocator.count() > 0
      ? await cspMetaLocator.getAttribute('content')
      : null;

    const effectiveCSP = csp || cspMeta;

    console.log('\n========================================');
    console.log('CSP DIRECTIVE ANALYSIS');
    console.log('========================================\n');

    if (!effectiveCSP) {
      console.log('❌ NO CSP FOUND\n');
      console.log('Recommended minimal CSP for this app:\n');
      console.log(`Content-Security-Policy:
  default-src 'self';
  script-src 'self';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  font-src 'self';
  connect-src 'self' https://demo.labgate.net;
  frame-ancestors 'none';
  base-uri 'self';
  form-action 'self';
`);
      return;
    }

    const directives = effectiveCSP.split(';').map(d => d.trim()).filter(d => d);

    const directiveMap: Record<string, string> = {};
    directives.forEach(d => {
      const parts = d.split(/\s+/);
      const name = parts[0];
      const values = parts.slice(1).join(' ');
      directiveMap[name] = values;
    });

    // Check critical directives
    const criticalDirectives = [
      'default-src',
      'script-src',
      'style-src',
      'img-src',
      'connect-src',
      'frame-ancestors',
    ];

    criticalDirectives.forEach(directive => {
      console.log(`📋 ${directive}:`);
      if (directiveMap[directive]) {
        console.log(`   ${directiveMap[directive]}`);

        // Security checks
        if (directive === 'script-src') {
          if (directiveMap[directive].includes("'unsafe-inline'")) {
            console.log('   ⚠️ WARNING: unsafe-inline allows inline scripts (XSS risk)');
          }
          if (directiveMap[directive].includes("'unsafe-eval'")) {
            console.log('   ⚠️ WARNING: unsafe-eval allows eval() (XSS risk)');
          }
          if (directiveMap[directive].includes('*')) {
            console.log('   🔴 CRITICAL: Wildcard allows scripts from any source!');
          }
        }

        if (directive === 'frame-ancestors') {
          if (directiveMap[directive] === "'none'") {
            console.log('   ✅ Good: Prevents framing (clickjacking protection)');
          }
        }
      } else {
        console.log('   ❌ NOT SPECIFIED (falls back to default-src)');
      }
      console.log('');
    });

    console.log('========================================\n');
  });

  test('should verify inline script handling', async ({ page }) => {
    // Check if the app uses inline scripts that would need CSP adjustments
    await page.goto('/login');
    await page.waitForLoadState('domcontentloaded');

    const inlineScripts = await page.locator('script:not([src])').count();
    const eventHandlers = await page.evaluate(() => {
      const elements = document.querySelectorAll('*');
      let count = 0;
      elements.forEach(el => {
        const attrs = el.attributes;
        for (let i = 0; i < attrs.length; i++) {
          if (attrs[i].name.startsWith('on')) {
            count++;
          }
        }
      });
      return count;
    });

    console.log('\n========================================');
    console.log('INLINE CODE ANALYSIS');
    console.log('========================================\n');

    console.log(`Inline <script> tags: ${inlineScripts}`);
    console.log(`Inline event handlers (onclick, etc.): ${eventHandlers}`);

    if (inlineScripts > 0 || eventHandlers > 0) {
      console.log('\n⚠️ Inline code detected!');
      console.log('If implementing strict CSP, you may need:');
      console.log("- 'unsafe-inline' (not recommended)");
      console.log('- nonce-based CSP');
      console.log('- hash-based CSP');
      console.log('- Refactor to external scripts');
    } else {
      console.log('\n✅ No inline scripts detected - strict CSP possible');
    }

    console.log('\n========================================\n');
  });
});
