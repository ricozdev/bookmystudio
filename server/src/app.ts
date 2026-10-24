import express, { Express, Request, Response } from 'express';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env';
import { emailService } from './services/email.service';
import { errorHandler } from './middleware/error.middleware';
import { optionalAuth } from './middleware/auth.middleware';
import { apiLimiter } from './middleware/rate-limit.middleware';

import { authRouter } from './routes/auth.routes';
import { studioRouter } from './routes/studio.routes';
import { locationRouter } from './routes/location.routes';
import { professionalRouter } from './routes/professional.routes';
import { equipmentRouter } from './routes/equipment.routes';
import { userFeaturesRouter } from './routes/user-features.routes';
import { bookingRouter } from './routes/booking.routes';
import { myListingsRouter } from './routes/my-listings.routes';
import { adminRouter } from './routes/admin.routes';
import locationGeocodeRouter from './routes/location-geocode.routes';
import { availabilityRouter } from './routes/availability.routes';
import { phoneVerificationRouter } from './routes/phone-verification.routes';

export function createApp(): Express {
  const app = express();

  // Trust proxy for secure cookies behind reverse proxy (e.g. Vercel, Nginx)
  if (env.NODE_ENV === 'production') {
    app.set('trust proxy', 1);
  }

  // Security Headers
  app.use(
    helmet({
      contentSecurityPolicy: false, // Managed by Next.js in production
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    })
  );

  // Strict CORS Configuration
  const allowedOrigins = [env.CLIENT_ORIGIN, 'http://localhost:3000', 'http://127.0.0.1:3000'];
  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (e.g., mobile apps, curl, server-to-server)
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin) || env.NODE_ENV === 'development') {
          return callback(null, true);
        }
        callback(new Error(`CORS blocked request from origin: ${origin}`));
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    })
  );

  // Body Parsing
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Persistent MongoDB Session Store
  app.use(
    session({
      name: 'bms_sid',
      secret: env.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      store: MongoStore.create({
        clientPromise: mongoose.connection.asPromise().then((m) => m.getClient() as any),
        collectionName: 'sessions',
        ttl: 7 * 24 * 60 * 60, // 7 days in seconds
        autoRemove: 'native',
      }),
      cookie: {
        httpOnly: true,
        secure: env.NODE_ENV === 'production',
        sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
        path: '/',
      },
    })
  );

  // Optional authentication hydration on every request
  app.use(optionalAuth);

  // General API Rate Limiting
  app.use('/api', apiLimiter);

  // Health Check Endpoint
  app.get('/api/health', (_req: Request, res: Response) => {
    const isDbConnected = mongoose.connection.readyState === 1;
    res.status(isDbConnected ? 200 : 503).json({
      status: isDbConnected ? 'healthy' : 'degraded',
      service: 'BookMyStudio API',
      database: isDbConnected ? 'connected' : 'disconnected',
      timestamp: new Date().toISOString(),
      environment: env.NODE_ENV,
    });
  });

  // SMTP Service Verification Endpoint (safe diagnostics without leaking credentials)
  app.get('/api/health/smtp', async (_req: Request, res: Response) => {
    const smtpStatus = await emailService.verifyConnection();
    res.status(smtpStatus.success ? 200 : 503).json(smtpStatus);
  });

  // REST API Endpoints
  app.use('/api/auth', authRouter);
  app.use('/api/studios', studioRouter);
  app.use('/api/locations', locationRouter);
  app.use('/api/professionals', professionalRouter);
  app.use('/api/equipment', equipmentRouter);
  app.use('/api/location', locationGeocodeRouter);
  app.use('/api/my-listings', myListingsRouter);
  app.use('/api/admin', adminRouter);
  app.use('/api', userFeaturesRouter);
  app.use('/api/booking-requests', bookingRouter);
  app.use('/api/availability', availabilityRouter);
  app.use('/api/auth/phone', phoneVerificationRouter);

  // 404 Handler for Unrecognized Endpoints
  app.use('/api/*', (req: Request, res: Response) => {
    res.status(404).json({
      success: false,
      error: `Endpoint '${req.method} ${req.originalUrl}' not found.`,
      code: 'ROUTE_NOT_FOUND',
    });
  });

  // Centralized Error Handler
  app.use(errorHandler);

  return app;
}

