"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = createApp;
const express_1 = __importDefault(require("express"));
const express_session_1 = __importDefault(require("express-session"));
const connect_mongo_1 = __importDefault(require("connect-mongo"));
const mongoose_1 = __importDefault(require("mongoose"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const env_1 = require("./config/env");
const email_service_1 = require("./services/email.service");
const error_middleware_1 = require("./middleware/error.middleware");
const auth_middleware_1 = require("./middleware/auth.middleware");
const rate_limit_middleware_1 = require("./middleware/rate-limit.middleware");
const auth_routes_1 = require("./routes/auth.routes");
const studio_routes_1 = require("./routes/studio.routes");
const location_routes_1 = require("./routes/location.routes");
const professional_routes_1 = require("./routes/professional.routes");
const equipment_routes_1 = require("./routes/equipment.routes");
const user_features_routes_1 = require("./routes/user-features.routes");
const booking_routes_1 = require("./routes/booking.routes");
const my_listings_routes_1 = require("./routes/my-listings.routes");
const admin_routes_1 = require("./routes/admin.routes");
const location_geocode_routes_1 = __importDefault(require("./routes/location-geocode.routes"));
const availability_routes_1 = require("./routes/availability.routes");
const phone_verification_routes_1 = require("./routes/phone-verification.routes");
function createApp() {
    const app = (0, express_1.default)();
    // Trust proxy for secure cookies behind reverse proxy (e.g. Vercel, Nginx)
    if (env_1.env.NODE_ENV === 'production') {
        app.set('trust proxy', 1);
    }
    // Security Headers
    app.use((0, helmet_1.default)({
        contentSecurityPolicy: false, // Managed by Next.js in production
        crossOriginResourcePolicy: { policy: 'cross-origin' },
    }));
    // Strict CORS Configuration
    const allowedOrigins = [env_1.env.CLIENT_ORIGIN, 'http://localhost:3000', 'http://127.0.0.1:3000'];
    app.use((0, cors_1.default)({
        origin: (origin, callback) => {
            // Allow requests with no origin (e.g., mobile apps, curl, server-to-server)
            if (!origin)
                return callback(null, true);
            if (allowedOrigins.includes(origin) || env_1.env.NODE_ENV === 'development') {
                return callback(null, true);
            }
            callback(new Error(`CORS blocked request from origin: ${origin}`));
        },
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    }));
    // Body Parsing
    app.use(express_1.default.json({ limit: '10mb' }));
    app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
    // Persistent MongoDB Session Store
    app.use((0, express_session_1.default)({
        name: 'bms_sid',
        secret: env_1.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        store: connect_mongo_1.default.create({
            clientPromise: mongoose_1.default.connection.asPromise().then((m) => m.getClient()),
            collectionName: 'sessions',
            ttl: 7 * 24 * 60 * 60, // 7 days in seconds
            autoRemove: 'native',
        }),
        cookie: {
            httpOnly: true,
            secure: env_1.env.NODE_ENV === 'production',
            sameSite: env_1.env.NODE_ENV === 'production' ? 'none' : 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
            path: '/',
        },
    }));
    // Optional authentication hydration on every request
    app.use(auth_middleware_1.optionalAuth);
    // General API Rate Limiting
    app.use('/api', rate_limit_middleware_1.apiLimiter);
    // Health Check Endpoint
    app.get('/api/health', (_req, res) => {
        const isDbConnected = mongoose_1.default.connection.readyState === 1;
        res.status(isDbConnected ? 200 : 503).json({
            status: isDbConnected ? 'healthy' : 'degraded',
            service: 'BookMyStudio API',
            database: isDbConnected ? 'connected' : 'disconnected',
            timestamp: new Date().toISOString(),
            environment: env_1.env.NODE_ENV,
        });
    });
    // SMTP Service Verification Endpoint (safe diagnostics without leaking credentials)
    app.get('/api/health/smtp', async (_req, res) => {
        const smtpStatus = await email_service_1.emailService.verifyConnection();
        res.status(smtpStatus.success ? 200 : 503).json(smtpStatus);
    });
    // REST API Endpoints
    app.use('/api/auth', auth_routes_1.authRouter);
    app.use('/api/studios', studio_routes_1.studioRouter);
    app.use('/api/locations', location_routes_1.locationRouter);
    app.use('/api/professionals', professional_routes_1.professionalRouter);
    app.use('/api/equipment', equipment_routes_1.equipmentRouter);
    app.use('/api/location', location_geocode_routes_1.default);
    app.use('/api/my-listings', my_listings_routes_1.myListingsRouter);
    app.use('/api/admin', admin_routes_1.adminRouter);
    app.use('/api', user_features_routes_1.userFeaturesRouter);
    app.use('/api/booking-requests', booking_routes_1.bookingRouter);
    app.use('/api/availability', availability_routes_1.availabilityRouter);
    app.use('/api/auth/phone', phone_verification_routes_1.phoneVerificationRouter);
    // 404 Handler for Unrecognized Endpoints
    app.use('/api/*', (req, res) => {
        res.status(404).json({
            success: false,
            error: `Endpoint '${req.method} ${req.originalUrl}' not found.`,
            code: 'ROUTE_NOT_FOUND',
        });
    });
    // Centralized Error Handler
    app.use(error_middleware_1.errorHandler);
    return app;
}
//# sourceMappingURL=app.js.map