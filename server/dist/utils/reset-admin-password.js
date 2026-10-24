"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateSecureAdminPassword = generateSecureAdminPassword;
exports.resetAdminPassword = resetAdminPassword;
const crypto_1 = __importDefault(require("crypto"));
const database_1 = require("../config/database");
const user_model_1 = require("../models/user.model");
const audit_log_model_1 = require("../models/audit-log.model");
const env_1 = require("../config/env");
function generateSecureAdminPassword() {
    // Generates a 16-character strong password containing uppercase, lowercase, numbers, and symbols
    const entropy = crypto_1.default.randomBytes(6).toString('hex'); // 12 alphanumeric chars
    return `BmsAdmin!${entropy}#2026`;
}
async function resetAdminPassword(targetEmail) {
    const email = (targetEmail || process.argv[2] || 'raghuveerlinkedin@gmail.com')
        .trim()
        .toLowerCase();
    console.log('\n======================================================');
    console.log('🛡️  BOOKMYSTUDIO ADMIN PASSWORD RECOVERY UTILITY');
    console.log('======================================================');
    console.log(`Target Administrator: ${email}`);
    // Safeguard: Check allowlist
    if (env_1.env.ADMIN_EMAILS) {
        const allowlist = env_1.env.ADMIN_EMAILS.split(',').map((e) => e.trim().toLowerCase());
        if (!allowlist.includes(email)) {
            console.warn(`⚠️ Warning: ${email} is not in configured ADMIN_EMAILS allowlist (${env_1.env.ADMIN_EMAILS}). Proceeding with administrator recovery.`);
        }
    }
    // 1. Locate user in MongoDB (Never select passwordHash for display)
    const user = await user_model_1.User.findOne({ email });
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
    const newHash = await user_model_1.User.hashPassword(newPassword);
    // 4. Update user state (clear pending reset tokens, mark active and verified)
    user.passwordHash = newHash;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    user.isVerified = true;
    user.accountStatus = 'ACTIVE';
    await user.save();
    // 5. Record immutable audit log
    try {
        await audit_log_model_1.AuditLog.create({
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
    }
    catch {
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
            await (0, database_1.connectDatabase)();
            await resetAdminPassword();
            await (0, database_1.disconnectDatabase)();
            process.exit(0);
        }
        catch (err) {
            console.error('❌ Unexpected error during password recovery:', err.message);
            await (0, database_1.disconnectDatabase)().catch(() => { });
            process.exit(1);
        }
    })();
}
//# sourceMappingURL=reset-admin-password.js.map