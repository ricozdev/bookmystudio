import assert from 'assert';
import http from 'http';
import express, { Express } from 'express';
import cors from 'cors';
import { parseAllowedOrigins, createCorsOptions } from '../src/config/cors';

async function runCorsTests() {
  console.log('\n======================================================');
  console.log('🧪 RUNNING BOOKMYSTUDIO CORS SUITE');
  console.log('======================================================\n');

  let passed = 0;
  let failed = 0;

  async function test(name: string, fn: () => Promise<void> | void) {
    try {
      await fn();
      console.log(`  ✅ PASS: ${name}`);
      passed++;
    } catch (err: any) {
      console.error(`  ❌ FAIL: ${name}`);
      console.error(`     Error: ${err.message}`);
      failed++;
    }
  }

  // =========================================================================
  // 1. UNIT TESTS: parseAllowedOrigins
  // =========================================================================

  test('parseAllowedOrigins handles undefined and empty values', () => {
    assert.deepStrictEqual(parseAllowedOrigins(''), []);
    assert.deepStrictEqual(parseAllowedOrigins('   '), []);
    // When undefined, falls back to the environment-configured CLIENT_ORIGIN
    const defaultOrigins = parseAllowedOrigins(undefined);
    assert.ok(Array.isArray(defaultOrigins));
    assert.ok(defaultOrigins.includes('http://localhost:3000'));
  });

  test('parseAllowedOrigins parses a single origin without trailing slash', () => {
    const result = parseAllowedOrigins('http://localhost:3000');
    assert.deepStrictEqual(result, ['http://localhost:3000']);
  });

  test('parseAllowedOrigins strips trailing slashes', () => {
    const result = parseAllowedOrigins('http://localhost:3000/');
    assert.deepStrictEqual(result, ['http://localhost:3000']);
  });

  test('parseAllowedOrigins parses multiple comma-separated origins', () => {
    const input = 'http://localhost:3000,https://bookmystudio-fawn.vercel.app';
    const result = parseAllowedOrigins(input);
    assert.deepStrictEqual(result, [
      'http://localhost:3000',
      'https://bookmystudio-fawn.vercel.app',
    ]);
  });

  test('parseAllowedOrigins trims whitespace around commas and URLs', () => {
    const input = '  http://localhost:3000/  ,   https://bookmystudio-fawn.vercel.app/   ,   ';
    const result = parseAllowedOrigins(input);
    assert.deepStrictEqual(result, [
      'http://localhost:3000',
      'https://bookmystudio-fawn.vercel.app',
    ]);
  });

  test('parseAllowedOrigins deduplicates entries', () => {
    const input = 'http://localhost:3000, https://bookmystudio-fawn.vercel.app, http://localhost:3000';
    const result = parseAllowedOrigins(input);
    assert.deepStrictEqual(result, [
      'http://localhost:3000',
      'https://bookmystudio-fawn.vercel.app',
    ]);
  });

  // =========================================================================
  // 2. INTEGRATION TESTS: HTTP & OPTIONS Preflight with Express CORS Middleware
  // =========================================================================

  const allowedList = parseAllowedOrigins(
    'http://localhost:3000, https://bookmystudio-fawn.vercel.app, https://partner.bookmystudio.com'
  );

  const app: Express = express();
  app.use(cors(createCorsOptions(allowedList)));
  app.use(express.json());

  // Mock API routes for testing
  app.post('/api/auth/login', (req, res) => {
    res.setHeader('Set-Cookie', 'bms_sid=mock_session_id; Path=/; HttpOnly; SameSite=None; Secure');
    res.json({ success: true, message: 'Logged in' });
  });

  app.get('/api/studios', (_req, res) => {
    res.json({ success: true, data: [] });
  });

  app.get('/api/auth/me', (_req, res) => {
    res.json({ success: true, user: { id: 'u1', email: 'test@example.com' } });
  });

  const server = http.createServer(app);
  let baseUrl = '';

  await new Promise<void>((resolve) => {
    server.listen(0, () => {
      const port = (server.address() as any).port;
      baseUrl = `http://127.0.0.1:${port}`;
      resolve();
    });
  });

  try {
    await test('OPTIONS preflight for /api/auth/login returns 204 and CORS headers for configured origin', async () => {
      const res = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'OPTIONS',
        headers: {
          Origin: 'https://bookmystudio-fawn.vercel.app',
          'Access-Control-Request-Method': 'POST',
          'Access-Control-Request-Headers': 'Content-Type,Authorization',
        },
      });

      assert.strictEqual(res.status, 204, 'Preflight status should be 204');
      assert.strictEqual(
        res.headers.get('access-control-allow-origin'),
        'https://bookmystudio-fawn.vercel.app',
        'Should reflect exact requested origin'
      );
      assert.strictEqual(
        res.headers.get('access-control-allow-credentials'),
        'true',
        'Should enable credentials for cookies'
      );
      assert.ok(
        res.headers.get('access-control-allow-methods')?.includes('POST'),
        'Should allow POST method'
      );
      assert.strictEqual(res.headers.get('content-length'), '0');
    });

    await test('OPTIONS preflight for /api/studios works for localhost:3000', async () => {
      const res = await fetch(`${baseUrl}/api/studios`, {
        method: 'OPTIONS',
        headers: {
          Origin: 'http://localhost:3000',
          'Access-Control-Request-Method': 'GET',
        },
      });

      assert.strictEqual(res.status, 204);
      assert.strictEqual(res.headers.get('access-control-allow-origin'), 'http://localhost:3000');
      assert.strictEqual(res.headers.get('access-control-allow-credentials'), 'true');
    });

    await test('OPTIONS preflight tolerates origin with trailing slash from client', async () => {
      const res = await fetch(`${baseUrl}/api/auth/me`, {
        method: 'OPTIONS',
        headers: {
          Origin: 'https://bookmystudio-fawn.vercel.app/',
          'Access-Control-Request-Method': 'GET',
        },
      });

      assert.strictEqual(res.status, 204);
      assert.strictEqual(
        res.headers.get('access-control-allow-origin'),
        'https://bookmystudio-fawn.vercel.app/'
      );
      assert.strictEqual(res.headers.get('access-control-allow-credentials'), 'true');
    });

    await test('OPTIONS preflight from unconfigured origin is NOT granted CORS allow header', async () => {
      const res = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'OPTIONS',
        headers: {
          Origin: 'https://unauthorized-domain.com',
          'Access-Control-Request-Method': 'POST',
          'Access-Control-Request-Headers': 'Content-Type',
        },
      });

      // Crucially, must not fail with HTTP 500
      assert.notStrictEqual(res.status, 500, 'Must not crash with HTTP 500 on unconfigured origin');
      // Must NOT include Access-Control-Allow-Origin
      assert.strictEqual(
        res.headers.get('access-control-allow-origin'),
        null,
        'Unconfigured origin must not receive Access-Control-Allow-Origin header'
      );
    });

    await test('Actual POST /api/auth/login includes CORS headers and preserves session cookies', async () => {
      const res = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: {
          Origin: 'https://bookmystudio-fawn.vercel.app',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: 'user@example.com', password: 'password123' }),
      });

      assert.strictEqual(res.status, 200);
      assert.strictEqual(
        res.headers.get('access-control-allow-origin'),
        'https://bookmystudio-fawn.vercel.app',
        'Response must reflect allowed origin'
      );
      assert.strictEqual(
        res.headers.get('access-control-allow-credentials'),
        'true',
        'Credentials must be true'
      );
      const setCookie = res.headers.get('set-cookie');
      assert.ok(setCookie?.includes('bms_sid'), 'Set-Cookie header must be preserved');
    });

    await test('Actual GET /api/studios without Origin header (curl / mobile app) succeeds normally', async () => {
      const res = await fetch(`${baseUrl}/api/studios`, {
        method: 'GET',
      });

      assert.strictEqual(res.status, 200);
      const data = await res.json();
      assert.strictEqual(data.success, true);
    });

    await test('Actual GET /api/studios with unconfigured origin does not receive allow header', async () => {
      const res = await fetch(`${baseUrl}/api/studios`, {
        method: 'GET',
        headers: {
          Origin: 'https://malicious-website.xyz',
        },
      });

      assert.strictEqual(
        res.headers.get('access-control-allow-origin'),
        null,
        'Disallowed origin must not receive Access-Control-Allow-Origin'
      );
    });
  } finally {
    server.close();
  }

  console.log('\n------------------------------------------------------');
  console.log(`Results: ${passed} passed, ${failed} failed`);
  console.log('======================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runCorsTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
