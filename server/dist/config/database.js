"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractDatabaseName = extractDatabaseName;
exports.assertIsTestDatabase = assertIsTestDatabase;
exports.connectDatabase = connectDatabase;
exports.disconnectDatabase = disconnectDatabase;
const mongoose_1 = __importDefault(require("mongoose"));
const fs_1 = __importDefault(require("fs"));
const env_1 = require("./env");
const LOCAL_SOCKET_PATH = '/tmp/mongodb-27017.sock';
/**
 * Extracts and returns only the database name segment from a connection string,
 * completely avoiding logging or leaking credentials or hosts.
 */
function extractDatabaseName(uri) {
    try {
        const withoutProtocol = uri.replace(/^mongodb(\+srv)?:\/\//, '');
        const pathPart = withoutProtocol.split('/')[1] || '';
        const dbName = pathPart.split('?')[0];
        return dbName || 'bookmystudio';
    }
    catch {
        return 'unknown';
    }
}
/**
 * Strict safety guard: throws an error if destructive actions are run against non-test databases.
 */
function assertIsTestDatabase(action) {
    const currentDb = mongoose_1.default.connection.name;
    if (!currentDb || currentDb === 'bookmystudio' || !currentDb.endsWith('_test')) {
        throw new Error(`FATAL GUARD: Destructive test action "${action}" rejected. Active database is not an isolated test database (current: "${currentDb}").`);
    }
}
async function connectDatabase(customUri, options) {
    const isTest = options?.isTest ?? (process.env.NODE_ENV === 'test' || env_1.env.NODE_ENV === 'test');
    const targetUri = customUri || (0, env_1.getDatabaseUri)(isTest);
    const targetDbName = extractDatabaseName(targetUri);
    // STRICT GUARD: If in test mode, NEVER allow connecting to primary 'bookmystudio'
    if (isTest && targetDbName === 'bookmystudio') {
        throw new Error('FATAL CONFIGURATION DEFECT: Automated tests are strictly blocked from connecting to development database "bookmystudio". Test database "bookmystudio_test" required.');
    }
    try {
        const conn = await mongoose_1.default.connect(targetUri, {
            serverSelectionTimeoutMS: 5000,
        });
        const connectedDb = mongoose_1.default.connection.name;
        if (isTest && connectedDb === 'bookmystudio') {
            await mongoose_1.default.disconnect();
            throw new Error('FATAL RUNTIME SECURITY VIOLATION: Test connection resolved to "bookmystudio". Disconnected immediately.');
        }
        console.log(`✅ MongoDB connected successfully to [${connectedDb}] (${isTest ? 'TEST ISOLATION' : 'APPLICATION'})`);
        return conn;
    }
    catch (initialError) {
        if (initialError.message?.startsWith('FATAL')) {
            throw initialError;
        }
        // Unix domain socket fallback (with strict test database isolation)
        if ((targetUri.includes('127.0.0.1') || targetUri.includes('localhost')) &&
            fs_1.default.existsSync(LOCAL_SOCKET_PATH)) {
            const socketDbName = isTest ? 'bookmystudio_test' : 'bookmystudio';
            const socketUri = `mongodb://%2Ftmp%2Fmongodb-27017.sock/${socketDbName}`;
            console.log(`ℹ️ TCP connection failed, falling back to local Unix domain socket: ${LOCAL_SOCKET_PATH} [${socketDbName}]`);
            try {
                const conn = await mongoose_1.default.connect(socketUri, {
                    serverSelectionTimeoutMS: 5000,
                });
                const connectedDb = mongoose_1.default.connection.name;
                if (isTest && connectedDb === 'bookmystudio') {
                    await mongoose_1.default.disconnect();
                    throw new Error('FATAL RUNTIME SECURITY VIOLATION: Unix socket test connection landed on "bookmystudio".');
                }
                console.log(`✅ MongoDB connected successfully via Unix domain socket [${connectedDb}] (${isTest ? 'TEST ISOLATION' : 'APPLICATION'})`);
                return conn;
            }
            catch (socketError) {
                console.error('❌ Failed to connect to MongoDB via Unix domain socket:', socketError.message);
                throw socketError;
            }
        }
        console.error('❌ MongoDB connection error:', initialError.message);
        throw initialError;
    }
}
async function disconnectDatabase() {
    if (mongoose_1.default.connection.readyState !== 0) {
        await mongoose_1.default.connection.close();
        console.log('🔌 MongoDB connection closed gracefully');
    }
}
mongoose_1.default.connection.on('disconnected', () => {
    console.warn('⚠️ MongoDB disconnected');
});
mongoose_1.default.connection.on('error', (err) => {
    console.error('❌ MongoDB runtime error:', err);
});
//# sourceMappingURL=database.js.map