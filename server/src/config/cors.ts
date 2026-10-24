import cors from 'cors';
import { env } from './env';

/**
 * Parses CLIENT_ORIGIN (which may contain a single origin or comma-separated origins)
 * into a sanitized array of allowed origins.
 *
 * Rules:
 * 1. Split value by commas (',').
 * 2. Trim whitespace around each URL.
 * 3. Strip any trailing slashes to ensure consistent origin comparison (e.g. 'http://localhost:3000/' -> 'http://localhost:3000').
 * 4. Remove empty entries.
 * 5. Deduplicate origins.
 */
export function parseAllowedOrigins(raw?: string): string[] {
  const originString = raw !== undefined ? raw : env.CLIENT_ORIGIN;
  if (!originString || typeof originString !== 'string') {
    return [];
  }

  const origins = originString
    .split(',')
    .map((origin) => origin.trim().replace(/\/+$/, ''))
    .filter((origin) => origin.length > 0);

  return Array.from(new Set(origins));
}

/**
 * Creates the CORS options configuration object using the parsed allowed origins.
 *
 * Security & Protocol Guarantees:
 * - Specific origin reflection: When an origin matches the allowlist, it is explicitly
 *   reflected in 'Access-Control-Allow-Origin' (never '*' when credentials are true).
 * - Credentials enabled: 'Access-Control-Allow-Credentials: true' is set.
 * - Clean rejection: Unconfigured origins do NOT receive CORS allow headers, causing
 *   browsers to block the response without crashing Express with an unhandled 500 error.
 * - Preflight handling: OPTIONS preflight returns HTTP 204 with required headers.
 */
export function createCorsOptions(origins?: string[]): cors.CorsOptions {
  const allowedOrigins = origins !== undefined ? origins : parseAllowedOrigins();

  return {
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g., mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);

      const normalizedOrigin = origin.trim().replace(/\/+$/, '');

      if (allowedOrigins.includes(normalizedOrigin)) {
        return callback(null, true);
      }

      // Reject unconfigured origins cleanly without throwing HTTP 500
      return callback(null, false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    optionsSuccessStatus: 204,
  };
}

