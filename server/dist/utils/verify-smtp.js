"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const email_service_1 = require("../services/email.service");
const env_1 = require("../config/env");
async function main() {
    console.log('\n======================================================');
    console.log('📧 BOOKMYSTUDIO GMAIL SMTP VERIFICATION DIAGNOSTIC');
    console.log('======================================================');
    console.log(`Configured Host: ${env_1.env.SMTP_HOST}`);
    console.log(`Configured Port: ${env_1.env.SMTP_PORT} (${env_1.env.SMTP_PORT === 465 ? 'SSL/TLS' : 'STARTTLS'})`);
    console.log(`Sender Identity: ${env_1.env.SMTP_FROM}`);
    console.log('Attempting secure handshake and authentication with SMTP server...\n');
    const result = await email_service_1.emailService.verifyConnection();
    if (result.success) {
        console.log('✅ STATUS: VERIFIED');
        console.log(`Message: ${result.message}`);
        console.log('======================================================\n');
        process.exit(0);
    }
    else {
        console.log('❌ STATUS: FAILED');
        console.log(`Message: ${result.message}`);
        if (result.error) {
            console.log(`Error: ${result.error}`);
        }
        console.log('======================================================\n');
        process.exit(1);
    }
}
main().catch((err) => {
    console.error('Fatal diagnostic error:', err.message);
    process.exit(1);
});
//# sourceMappingURL=verify-smtp.js.map