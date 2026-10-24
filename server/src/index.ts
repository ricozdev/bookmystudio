import { connectDatabase, disconnectDatabase } from './config/database';
import { env } from './config/env';
import { createApp } from './app';

async function bootstrap() {
  console.log('🚀 Starting BookMyStudio Express + MongoDB API Server...');

  try {
    await connectDatabase();

    const app = createApp();

    const server = app.listen(env.PORT, () => {
      console.log(`\n======================================================`);
      console.log(`🎬 BookMyStudio Backend Server Active`);
      console.log(`📡 URL: http://localhost:${env.PORT}`);
      console.log(`🌍 Client Origin: ${env.CLIENT_ORIGIN}`);
      console.log(`🗄️ Database: MongoDB Connected`);
      console.log(`🔒 Environment: ${env.NODE_ENV}`);
      console.log(`======================================================\n`);
    });

    const shutdown = async (signal: string) => {
      console.log(`\n⚠️ Received ${signal}. Initiating graceful shutdown...`);
      server.close(async () => {
        console.log('🛑 HTTP server closed.');
        await disconnectDatabase();
        process.exit(0);
      });

      // Force shutdown if taking longer than 10s
      setTimeout(() => {
        console.error('❌ Forcefully terminating server after timeout.');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
  } catch (error: any) {
    console.error('❌ Failed to start BookMyStudio server:', error.message);
    process.exit(1);
  }
}

bootstrap();

