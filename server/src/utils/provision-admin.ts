import { connectDatabase, disconnectDatabase } from '../config/database';
import { User } from '../models/user.model';
import { AuditLog } from '../models/audit-log.model';
import { env } from '../config/env';
import crypto from 'crypto';

export interface ProvisionOptions {
  email?: string;
  createIfMissing?: boolean;
  initialPassword?: string;
  fullName?: string;
}

export interface ProvisionResult {
  success: boolean;
  message: string;
  user?: any;
  temporaryPassword?: string;
  alreadyExisted?: boolean;
}

export async function provisionSuperAdmin(options: ProvisionOptions = {}): Promise<ProvisionResult> {
  const targetEmail = (options.email || process.argv[2] || 'raghuveerlinkedin@gmail.com')
    .trim()
    .toLowerCase();

  const isCreateAllowed = options.createIfMissing ?? process.argv.includes('--create');

  console.log(`\n======================================================`);
  console.log(`🛡️  BOOKMYSTUDIO SUPER_ADMIN PROVISIONING ENGINE`);
  console.log(`======================================================`);
  console.log(`Target Email: ${targetEmail}`);

  // Safeguard: Check against configured allowlist if set
  if (env.ADMIN_EMAILS) {
    const allowed = env.ADMIN_EMAILS.split(',').map((e) => e.trim().toLowerCase());
    if (!allowed.includes(targetEmail)) {
      console.warn(`⚠️ Warning: ${targetEmail} is not in ADMIN_EMAILS allowlist (${env.ADMIN_EMAILS}). Proceeding with explicit administrator execution.`);
    }
  }

  // 1. Locate existing user
  const user = await User.findOne({ email: targetEmail });

  if (user) {
    console.log(`✅ Located existing user record:`);
    console.log(`   ID:      ${user._id}`);
    console.log(`   Name:    ${user.fullName}`);
    console.log(`   Current: [${user.roles.join(', ')}]`);
    console.log(`   Status:  ${user.accountStatus}`);

    const hadSuperAdmin = user.roles.includes('SUPER_ADMIN');
    const hadAdmin = user.roles.includes('ADMIN');

    // Add SUPER_ADMIN and ADMIN roles while strictly preserving existing roles
    const updatedRoles = Array.from(new Set([...user.roles, 'SUPER_ADMIN', 'ADMIN']));
    user.roles = updatedRoles as any;
    user.isVerified = true;
    user.accountStatus = 'ACTIVE';

    await user.save();

    // Create Audit Log
    try {
      await AuditLog.create({
        adminId: user._id,
        adminEmail: user.email,
        adminName: user.fullName,
        action: 'ADMIN_PROVISIONED',
        targetType: 'USER',
        targetId: user._id.toString(),
        targetLabel: user.email,
        details: {
          previousRoles: user.roles,
          assignedRoles: updatedRoles,
          source: 'CLI_PROVISION_SCRIPT',
        },
        status: 'SUCCESS',
      });
    } catch {
      // Audit log creation failure should not abort success
    }

    const message = hadSuperAdmin && hadAdmin
      ? `Account ${targetEmail} is already provisioned with SUPER_ADMIN privileges and status is ACTIVE.`
      : `Successfully elevated ${targetEmail} to SUPER_ADMIN (roles: [${updatedRoles.join(', ')}]).`;

    console.log(`\n🎉 ${message}`);
    return {
      success: true,
      message,
      user: user.toJSON(),
      alreadyExisted: true,
    };
  }

  // User does not exist
  console.log(`\n⚠️ Account "${targetEmail}" does not currently exist in the database.`);

  if (!isCreateAllowed) {
    const helpMsg = [
      `To safely provision this account, choose one of the following approaches:`,
      `  1) Register at http://localhost:3000/create-account with email "${targetEmail}", then rerun:`,
      `     pnpm --filter server admin:provision ${targetEmail}`,
      `  2) Or run this script with --create to generate initial credentials safely:`,
      `     pnpm --filter server admin:provision ${targetEmail} --create`,
    ].join('\n');

    console.log(helpMsg);
    return {
      success: false,
      message: `Account "${targetEmail}" not found. Run with --create or register the account first.`,
    };
  }

  // Safe Account Creation with generated cryptographically secure password
  const tempPassword = options.initialPassword || `Admin!${crypto.randomBytes(8).toString('hex')}#2026`;
  const passwordHash = await User.hashPassword(tempPassword);
  const fullName = options.fullName || 'Raghuveer (Super Admin)';

  const newUser = new User({
    fullName,
    email: targetEmail,
    passwordHash,
    roles: ['SUPER_ADMIN', 'ADMIN', 'CUSTOMER'],
    isVerified: true,
    accountStatus: 'ACTIVE',
    companyName: 'BookMyStudio Platform Administration',
  });

  await newUser.save();

  // Create Audit Log
  try {
    await AuditLog.create({
      adminId: newUser._id,
      adminEmail: newUser.email,
      adminName: newUser.fullName,
      action: 'ADMIN_PROVISIONED',
      targetType: 'USER',
      targetId: newUser._id.toString(),
      targetLabel: newUser.email,
      details: {
        createdNewAccount: true,
        assignedRoles: ['SUPER_ADMIN', 'ADMIN', 'CUSTOMER'],
        source: 'CLI_PROVISION_SCRIPT',
      },
      status: 'SUCCESS',
    });
  } catch {
    // Audit failure non-fatal
  }

  console.log(`\n✨ Successfully created and provisioned SUPER_ADMIN account:`);
  console.log(`   Email:        ${targetEmail}`);
  console.log(`   Roles:        SUPER_ADMIN, ADMIN, CUSTOMER`);
  console.log(`   Initial Pass: ${tempPassword}`);
  console.log(`   Status:       ACTIVE (Verified)`);
  console.log(`\n⚠️ IMPORTANT: Keep these credentials secure or sign in and update password immediately.`);

  return {
    success: true,
    message: `Account "${targetEmail}" created and provisioned as SUPER_ADMIN.`,
    user: newUser.toJSON(),
    temporaryPassword: tempPassword,
    alreadyExisted: false,
  };
}

// Standalone execution entrypoint
if (require.main === module || process.argv[1]?.endsWith('provision-admin.ts')) {
  (async () => {
    try {
      await connectDatabase();
      await provisionSuperAdmin();
      await disconnectDatabase();
      process.exit(0);
    } catch (err: any) {
      console.error('❌ Provisioning error:', err.message);
      await disconnectDatabase().catch(() => {});
      process.exit(1);
    }
  })();
}

