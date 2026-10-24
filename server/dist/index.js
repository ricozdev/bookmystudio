"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = require("./config/database");
const env_1 = require("./config/env");
const app_1 = require("./app");
async function bootstrap() {
    console.log('🚀 Starting BookMyStudio Express + MongoDB API Server...');
    try {
        await (0, database_1.connectDatabase)();
        const app = (0, app_1.createApp)();
        const server = app.listen(env_1.env.PORT, () => {
            console.log(`\n======================================================`);
            console.log(`🎬 BookMyStudio Backend Server Active`);
            console.log(`📡 URL: http://localhost:${env_1.env.PORT}`);
            console.log(`🌍 Client Origin: ${env_1.env.CLIENT_ORIGIN}`);
            console.log(`🗄️ Database: MongoDB Connected`);
            console.log(`🔒 Environment: ${env_1.env.NODE_ENV}`);
            console.log(`======================================================\n`);
        });
        const shutdown = async (signal) => {
            console.log(`\n⚠️ Received ${signal}. Initiating graceful shutdown...`);
            server.close(async () => {
                console.log('🛑 HTTP server closed.');
                await (0, database_1.disconnectDatabase)();
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
    }
    catch (error) {
        console.error('❌ Failed to start BookMyStudio server:', error.message);
        process.exit(1);
    }
}
bootstrap();
//# sourceMappingURL=index.js.map