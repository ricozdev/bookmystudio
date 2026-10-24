import { emailService } from '../services/email.service';
import { env } from '../config/env';

async function main() {
  console.log('\n======================================================');
  console.log('📧 BOOKMYSTUDIO GMAIL SMTP VERIFICATION DIAGNOSTIC');
  console.log('======================================================');
  console.log(`Configured Host: ${env.SMTP_HOST}`);
  console.log(`Configured Port: ${env.SMTP_PORT} (${env.SMTP_PORT === 465 ? 'SSL/TLS' : 'STARTTLS'})`);
  console.log(`Sender Identity: ${env.SMTP_FROM}`);
  console.log('Attempting secure handshake and authentication with SMTP server...\n');

  const result = await emailService.verifyConnection();

  if (result.success) {
    console.log('✅ STATUS: VERIFIED');
    console.log(`Message: ${result.message}`);
    console.log('======================================================\n');
    process.exit(0);
  } else {
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

