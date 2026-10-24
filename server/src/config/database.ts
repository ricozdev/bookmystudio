import mongoose from 'mongoose';
import fs from 'fs';
import { env, getDatabaseUri } from './env';

const LOCAL_SOCKET_PATH = '/tmp/mongodb-27017.sock';

export interface DatabaseConnectionOptions {
  isTest?: boolean;
}

/**
 * Extracts and returns only the database name segment from a connection string,
 * completely avoiding logging or leaking credentials or hosts.
 */
export function extractDatabaseName(uri: string): string {
  try {
    const withoutProtocol = uri.replace(/^mongodb(\+srv)?:\/\//, '');
    const pathPart = withoutProtocol.split('/')[1] || '';
    const dbName = pathPart.split('?')[0];
    return dbName || 'bookmystudio';
  } catch {
    return 'unknown';
  }
}

/**
 * Strict safety guard: throws an error if destructive actions are run against non-test databases.
 */
export function assertIsTestDatabase(action: string): void {
  const currentDb = mongoose.connection.name;
  if (!currentDb || currentDb === 'bookmystudio' || !currentDb.endsWith('_test')) {
    throw new Error(
      `FATAL GUARD: Destructive test action "${action}" rejected. Active database is not an isolated test database (current: "${currentDb}").`
    );
  }
}

export async function connectDatabase(
  customUri?: string,
  options?: DatabaseConnectionOptions
): Promise<typeof mongoose> {
  const isTest = options?.isTest ?? (process.env.NODE_ENV === 'test' || env.NODE_ENV === 'test');
  const targetUri = customUri || getDatabaseUri(isTest);
  const targetDbName = extractDatabaseName(targetUri);

  // STRICT GUARD: If in test mode, NEVER allow connecting to primary 'bookmystudio'
  if (isTest && targetDbName === 'bookmystudio') {
    throw new Error(
      'FATAL CONFIGURATION DEFECT: Automated tests are strictly blocked from connecting to development database "bookmystudio". Test database "bookmystudio_test" required.'
    );
  }

  try {
    const conn = await mongoose.connect(targetUri, {
      serverSelectionTimeoutMS: 5000,
    });
    const connectedDb = mongoose.connection.name;

    if (isTest && connectedDb === 'bookmystudio') {
      await mongoose.disconnect();
      throw new Error(
        'FATAL RUNTIME SECURITY VIOLATION: Test connection resolved to "bookmystudio". Disconnected immediately.'
      );
    }

    console.log(`✅ MongoDB connected successfully to [${connectedDb}] (${isTest ? 'TEST ISOLATION' : 'APPLICATION'})`);
    return conn;
  } catch (initialError: any) {
    if (initialError.message?.startsWith('FATAL')) {
      throw initialError;
    }

    // Unix domain socket fallback (with strict test database isolation)
    if (
      (targetUri.includes('127.0.0.1') || targetUri.includes('localhost')) &&
      fs.existsSync(LOCAL_SOCKET_PATH)
    ) {
      const socketDbName = isTest ? 'bookmystudio_test' : 'bookmystudio';
      const socketUri = `mongodb://%2Ftmp%2Fmongodb-27017.sock/${socketDbName}`;
      console.log(`ℹ️ TCP connection failed, falling back to local Unix domain socket: ${LOCAL_SOCKET_PATH} [${socketDbName}]`);
      try {
        const conn = await mongoose.connect(socketUri, {
          serverSelectionTimeoutMS: 5000,
        });
        const connectedDb = mongoose.connection.name;

        if (isTest && connectedDb === 'bookmystudio') {
          await mongoose.disconnect();
          throw new Error('FATAL RUNTIME SECURITY VIOLATION: Unix socket test connection landed on "bookmystudio".');
        }

        console.log(`✅ MongoDB connected successfully via Unix domain socket [${connectedDb}] (${isTest ? 'TEST ISOLATION' : 'APPLICATION'})`);
        return conn;
      } catch (socketError: any) {
        console.error('❌ Failed to connect to MongoDB via Unix domain socket:', socketError.message);
        throw socketError;
      }
    }

    console.error('❌ MongoDB connection error:', initialError.message);
    throw initialError;
  }
}

export async function disconnectDatabase(): Promise<void> {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
    console.log('🔌 MongoDB connection closed gracefully');
  }
}

mongoose.connection.on('disconnected', () => {
  console.warn('⚠️ MongoDB disconnected');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB runtime error:', err);
});

