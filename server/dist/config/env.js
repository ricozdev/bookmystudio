"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
exports.getDatabaseUri = getDatabaseUri;
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const zod_1 = require("zod");
// Load .env file safely checking server/.env, cwd/.env, and parent directory
const candidates = [
    path_1.default.resolve(process.cwd(), 'server', '.env'),
    path_1.default.resolve(process.cwd(), '.env'),
    path_1.default.resolve(__dirname, '..', '..', '.env'),
];
for (const envPath of candidates) {
    if (fs_1.default.existsSync(envPath)) {
        dotenv_1.default.config({ path: envPath });
        break;
    }
}
dotenv_1.default.config();
const envSchema = zod_1.z.object({
    PORT: zod_1.z.coerce.number().default(4000),
    NODE_ENV: zod_1.z.enum(['development', 'production', 'test']).default('development'),
    MONGODB_URI: zod_1.z
        .string()
        .default('mongodb://127.0.0.1:27017/bookmystudio'),
    MONGODB_TEST_URI: zod_1.z.string().optional(),
    CLIENT_ORIGIN: zod_1.z.string().default('http://localhost:3000'),
    SESSION_SECRET: zod_1.z.string().default('bms_dev_session_secret_32_characters_long_min_production'),
    ADMIN_EMAILS: zod_1.z.string().optional().default('raghuveerlinkedin@gmail.com'),
    SMTP_HOST: zod_1.z.string().default('smtp.gmail.com'),
    SMTP_PORT: zod_1.z.coerce.number().default(465),
    SMTP_USER: zod_1.z.string().optional(),
    SMTP_PASS: zod_1.z.string().optional(),
    SMTP_FROM: zod_1.z.string().default('BookMyStudio <no-reply@bookmystudio.com>'),
    PAYOUT_ENCRYPTION_SECRET: zod_1.z.string().optional(),
    RAZORPAY_KEY_ID: zod_1.z.string().optional(),
    RAZORPAY_KEY_SECRET: zod_1.z.string().optional(),
    RAZORPAY_WEBHOOK_SECRET: zod_1.z.string().optional(),
    RAZORPAY_ROUTE_ENABLED: zod_1.z
        .string()
        .transform((val) => val === 'true')
        .optional()
        .default('false'),
    GOOGLE_MAPS_SERVER_API_KEY: zod_1.z.string().optional(),
    SMS_PROVIDER: zod_1.z.enum(['mock', 'msg91', 'twilio']).default('mock'),
    SMS_API_KEY: zod_1.z.string().optional(),
    SMS_SENDER_ID: zod_1.z.string().optional(),
    SMS_TEMPLATE_ID: zod_1.z.string().optional(),
    TWILIO_ACCOUNT_SID: zod_1.z.string().optional(),
    TWILIO_AUTH_TOKEN: zod_1.z.string().optional(),
    TWILIO_FROM_NUMBER: zod_1.z.string().optional(),
});
const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
    console.error('❌ Invalid environment variables configuration:');
    console.error(JSON.stringify(parsed.error.format(), null, 2));
    process.exit(1);
}
exports.env = parsed.data;
/**
 * Returns the authoritative database URI depending on execution mode.
 * Strictly guarantees that test execution NEVER resolves to the primary development/production database.
 */
function getDatabaseUri(isTest = false) {
    const isTestMode = isTest || process.env.NODE_ENV === 'test' || exports.env.NODE_ENV === 'test';
    if (isTestMode) {
        if (process.env.MONGODB_TEST_URI || exports.env.MONGODB_TEST_URI) {
            return (process.env.MONGODB_TEST_URI || exports.env.MONGODB_TEST_URI);
        }
        const baseUri = process.env.MONGODB_URI || exports.env.MONGODB_URI;
        // Replace the trailing database name with bookmystudio_test
        if (baseUri.includes('/bookmystudio')) {
            return baseUri.replace(/\/bookmystudio(\?|$)/, '/bookmystudio_test$1');
        }
        // For custom connection URIs, append _test to path
        const [pathPart, queryPart] = baseUri.split('?');
        const segments = pathPart.split('/');
        segments[segments.length - 1] = 'bookmystudio_test';
        return queryPart ? `${segments.join('/')}?${queryPart}` : segments.join('/');
    }
    return process.env.MONGODB_URI || exports.env.MONGODB_URI;
}
if (exports.env.NODE_ENV === 'production' && exports.env.SESSION_SECRET.includes('dev_session_secret')) {
    console.warn('⚠️ WARNING: Using default SESSION_SECRET in production. Set a random 32+ character string in your environment.');
}
//# sourceMappingURL=env.js.map