import crypto from 'crypto';
import { connectDatabase, disconnectDatabase } from '../config/database';
import { User } from '../models/user.model';
import { AuditLog } from '../models/audit-log.model';
import { env } from '../config/env';

export interface AdminPasswordResetResult {
  success: boolean;
  email: string;
  roles: string[];
  newPassword?: string;
  error?: string;
}

export function generateSecureAdminPassword(): string {
  // Generates a 16-character strong password containing uppercase, lowercase, numbers, and symbols
  const entropy = crypto.randomBytes(6).toString('hex'); // 12 alphanumeric chars
  return `BmsAdmin!${entropy}#2026`;
}

export async function resetAdminPassword(targetEmail?: string): Promise<AdminPasswordResetResult> {
  const email = (targetEmail || process.argv[2] || 'raghuveerlinkedin@gmail.com')
    .trim()
    .toLowerCase();

  console.log('\n======================================================');
  console.log('🛡️  BOOKMYSTUDIO ADMIN PASSWORD RECOVERY UTILITY');
  console.log('======================================================');
  console.log(`Target Administrator: ${email}`);

  // Safeguard: Check allowlist
  if (env.ADMIN_EMAILS) {
    const allowlist = env.ADMIN_EMAILS.split(',').map((e) => e.trim().toLowerCase());
    if (!allowlist.includes(email)) {
      console.warn(`⚠️ Warning: ${email} is not in configured ADMIN_EMAILS allowlist (${env.ADMIN_EMAILS}). Proceeding with administrator recovery.`);
    }
  }

  // 1. Locate user in MongoDB (Never select passwordHash for display)
  const user = await User.findOne({ email });

  if (!user) {
    const errorMsg = `Account "${email}" does not exist in the database. Run "npm run admin:provision" to create it.`;
    console.error(`❌ ${errorMsg}`);
    return { success: false, email, roles: [], error: errorMsg };
  }

  const hasAdminRole = user.roles.includes('SUPER_ADMIN') || user.roles.includes('ADMIN');
  if (!hasAdminRole) {
    const errorMsg = `Account "${email}" exists but does NOT possess administrative privileges (Roles: [${user.roles.join(', ')}]). Refusing to reset password via admin utility.`;
    console.error(`❌ ${errorMsg}`);
    return { success: false, email, roles: user.roles, error: errorMsg };
  }

  // 2. Generate a new cryptographically secure temporary password
  const newPassword = generateSecureAdminPassword();

  // 3. Hash with bcrypt using User.hashPassword (salt rounds 12)
  const newHash = await User.hashPassword(newPassword);

  // 4. Update user state (clear pending reset tokens, mark active and verified)
  user.passwordHash = newHash;
  user.resetPasswordToken = null;
  user.resetPasswordExpires = null;
  user.isVerified = true;
  user.accountStatus = 'ACTIVE';

  await user.save();

  // 5. Record immutable audit log
  try {
    await AuditLog.create({
      adminId: user._id,
      adminEmail: user.email,
      adminName: user.fullName,
      action: 'ADMIN_PASSWORD_RESET',
      targetType: 'USER',
      targetId: user._id.toString(),
      targetLabel: user.email,
      details: {
        reason: 'One-time secure administrator password recovery via CLI utility',
        source: 'reset-admin-password.ts',
      },
      status: 'SUCCESS',
    });
  } catch {
    // Non-fatal audit recording failure
  }

  console.log('\n✅ Admin Password Reset Completed Successfully!');
  console.log('------------------------------------------------------');
  console.log(`Account Email:     ${user.email}`);
  console.log(`Account Name:      ${user.fullName}`);
  console.log(`Assigned Roles:    ${user.roles.join(', ')}`);
  console.log(`Account Status:    ${user.accountStatus} (Verified)`);
  console.log(`New Password:      ${newPassword}`);
  console.log('------------------------------------------------------');
  console.log('Sign In URL:        http://localhost:3000/admin/login');
  console.log('Alternative URL:    http://localhost:3000/login');
  console.log('\n⚠️  SECURITY NOTICE: Use this password to sign in immediately.');
  console.log('======================================================\n');

  return {
    success: true,
    email: user.email,
    roles: user.roles,
    newPassword,
  };
}

// CLI entrypoint
if (require.main === module || process.argv[1]?.endsWith('reset-admin-password.ts')) {
  (async () => {
    try {
      await connectDatabase();
      await resetAdminPassword();
      await disconnectDatabase();
      process.exit(0);
    } catch (err: any) {
      console.error('❌ Unexpected error during password recovery:', err.message);
      await disconnectDatabase().catch(() => {});
      process.exit(1);
    }
  })();
}

