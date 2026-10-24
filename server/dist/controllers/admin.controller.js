"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAdminMetrics = getAdminMetrics;
exports.getAdminUsers = getAdminUsers;
exports.updateUserStatus = updateUserStatus;
exports.getAdminPartners = getAdminPartners;
exports.getAdminBookings = getAdminBookings;
exports.updateAdminBookingStatus = updateAdminBookingStatus;
exports.getAccessManagement = getAccessManagement;
exports.assignAdminRole = assignAdminRole;
exports.getAdminAuditLogs = getAdminAuditLogs;
const user_model_1 = require("../models/user.model");
const studio_model_1 = require("../models/studio.model");
const location_model_1 = require("../models/location.model");
const professional_model_1 = require("../models/professional.model");
const equipment_model_1 = require("../models/equipment.model");
const booking_model_1 = require("../models/booking.model");
const audit_log_model_1 = require("../models/audit-log.model");
/**
 * 1. GET /api/admin/metrics
 * Comprehensive real platform metrics aggregated directly from database collections.
 */
async function getAdminMetrics(_req, res, next) {
    try {
        const [totalUsers, activeUsers, suspendedUsers, activeCustomers, activePartners, totalAdmins, totalSuperAdmins, studiosCount, locationsCount, crewCount, equipmentCount, pendingStudios, pendingLocations, pendingCrew, pendingEquip, approvedStudios, approvedLocations, approvedCrew, approvedEquip, totalBookings, pendingBookings, confirmedBookings, declinedBookings, cancelledBookings, recentAuditLogs, recentBookings, bookingFinancials, userRegistrationsByDay, bookingVolumeByDay,] = await Promise.all([
            user_model_1.User.countDocuments(),
            user_model_1.User.countDocuments({ accountStatus: 'ACTIVE' }),
            user_model_1.User.countDocuments({ accountStatus: 'SUSPENDED' }),
            user_model_1.User.countDocuments({ roles: 'CUSTOMER', accountStatus: 'ACTIVE' }),
            user_model_1.User.countDocuments({ roles: { $in: ['STUDIO_OWNER', 'PROFESSIONAL'] }, accountStatus: 'ACTIVE' }),
            user_model_1.User.countDocuments({ roles: 'ADMIN' }),
            user_model_1.User.countDocuments({ roles: 'SUPER_ADMIN' }),
            studio_model_1.Studio.countDocuments(),
            location_model_1.FilmingLocationModel.countDocuments(),
            professional_model_1.ProfessionalProfile.countDocuments(),
            equipment_model_1.Equipment.countDocuments(),
            studio_model_1.Studio.countDocuments({ reviewStatus: 'PENDING_REVIEW' }),
            location_model_1.FilmingLocationModel.countDocuments({ reviewStatus: 'PENDING_REVIEW' }),
            professional_model_1.ProfessionalProfile.countDocuments({ reviewStatus: 'PENDING_REVIEW' }),
            equipment_model_1.Equipment.countDocuments({ reviewStatus: 'PENDING_REVIEW' }),
            studio_model_1.Studio.countDocuments({ reviewStatus: 'APPROVED' }),
            location_model_1.FilmingLocationModel.countDocuments({ reviewStatus: 'APPROVED' }),
            professional_model_1.ProfessionalProfile.countDocuments({ reviewStatus: 'APPROVED' }),
            equipment_model_1.Equipment.countDocuments({ reviewStatus: 'APPROVED' }),
            booking_model_1.BookingRequest.countDocuments(),
            booking_model_1.BookingRequest.countDocuments({ status: 'pending' }),
            booking_model_1.BookingRequest.countDocuments({ status: { $in: ['confirmed', 'completed'] } }),
            booking_model_1.BookingRequest.countDocuments({ status: 'declined' }),
            booking_model_1.BookingRequest.countDocuments({ status: 'cancelled' }),
            audit_log_model_1.AuditLog.find().sort({ createdAt: -1 }).limit(6),
            booking_model_1.BookingRequest.find().sort({ createdAt: -1 }).limit(6),
            booking_model_1.BookingRequest.aggregate([
                {
                    $group: {
                        _id: null,
                        totalPipeline: { $sum: '$estimatedTotal' },
                        pendingPipeline: {
                            $sum: {
                                $cond: [{ $eq: ['$status', 'pending'] }, '$estimatedTotal', 0],
                            },
                        },
                        confirmedPipeline: {
                            $sum: {
                                $cond: [{ $in: ['$status', ['confirmed', 'completed']] }, '$estimatedTotal', 0],
                            },
                        },
                    },
                },
            ]),
            user_model_1.User.aggregate([
                {
                    $group: {
                        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                        count: { $sum: 1 },
                    },
                },
                { $sort: { _id: 1 } },
            ]),
            booking_model_1.BookingRequest.aggregate([
                {
                    $group: {
                        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                        count: { $sum: 1 },
                        value: { $sum: '$estimatedTotal' },
                    },
                },
                { $sort: { _id: 1 } },
            ]),
        ]);
        const totalListings = studiosCount + locationsCount + crewCount + equipmentCount;
        const pendingListings = pendingStudios + pendingLocations + pendingCrew + pendingEquip;
        const approvedListings = approvedStudios + approvedLocations + approvedCrew + approvedEquip;
        const pipelineTotal = bookingFinancials[0]?.totalPipeline || 0;
        const pendingPipeline = bookingFinancials[0]?.pendingPipeline || 0;
        const confirmedPipeline = bookingFinancials[0]?.confirmedPipeline || 0;
        res.status(200).json({
            success: true,
            data: {
                users: {
                    total: totalUsers,
                    active: activeUsers,
                    suspended: suspendedUsers,
                    customers: activeCustomers,
                    partners: activePartners,
                    admins: totalAdmins,
                    superAdmins: totalSuperAdmins,
                    onlinePresence: {
                        status: 'UNAVAILABLE',
                        message: 'Presence heartbeat not configured; simulated users disabled.',
                    },
                },
                financials: {
                    realizedRevenue: 0,
                    realizedRevenueNote: 'No transaction gateway records in database. Unpaid booking inquiries are not counted as platform revenue.',
                    estimatedHoldVolume: pipelineTotal,
                    pendingHoldVolume: pendingPipeline,
                    confirmedHoldVolume: confirmedPipeline,
                    currency: 'USD',
                },
                listings: {
                    total: totalListings,
                    studios: studiosCount,
                    locations: locationsCount,
                    crew: crewCount,
                    equipment: equipmentCount,
                    pendingReview: pendingListings,
                    approved: approvedListings,
                },
                bookings: {
                    total: totalBookings,
                    pending: pendingBookings,
                    confirmed: confirmedBookings,
                    declined: declinedBookings,
                    cancelled: cancelledBookings,
                    estimatedTotalSum: pipelineTotal,
                },
                monthlyTrends: {
                    registrations: userRegistrationsByDay,
                    bookings: bookingVolumeByDay,
                },
                recentActivity: recentAuditLogs,
                recentBookings,
            },
        });
    }
    catch (error) {
        next(error);
    }
}
/**
 * 2. GET /api/admin/users
 * Paginated, searchable user registry with role and status filtering.
 */
async function getAdminUsers(req, res, next) {
    try {
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
        const search = (req.query.search || '').trim();
        const role = (req.query.role || '').trim();
        const status = (req.query.status || '').trim();
        const query = {};
        if (search) {
            const searchRegex = new RegExp(search, 'i');
            query.$or = [
                { fullName: searchRegex },
                { email: searchRegex },
                { companyName: searchRegex },
                { phone: searchRegex },
            ];
        }
        if (role && role !== 'all') {
            query.roles = role;
        }
        if (status && status !== 'all') {
            query.accountStatus = status;
        }
        const [users, total] = await Promise.all([
            user_model_1.User.find(query)
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit),
            user_model_1.User.countDocuments(query),
        ]);
        res.status(200).json({
            success: true,
            data: users.map((u) => u.toJSON()),
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        });
    }
    catch (error) {
        next(error);
    }
}
/**
 * 3. PATCH /api/admin/users/:id/status
 * Suspend or reactivate user account with audit trail.
 */
async function updateUserStatus(req, res, next) {
    try {
        const { id } = req.params;
        const { status, reason } = req.body;
        const actingAdmin = req.user;
        if (!['ACTIVE', 'SUSPENDED', 'PENDING'].includes(status)) {
            res.status(400).json({
                success: false,
                error: 'Invalid status. Permitted values: ACTIVE, SUSPENDED, PENDING.',
            });
            return;
        }
        const targetUser = await user_model_1.User.findById(id);
        if (!targetUser) {
            res.status(404).json({ success: false, error: 'User not found.' });
            return;
        }
        // Safeguard: Cannot suspend oneself
        if (targetUser._id.equals(actingAdmin._id)) {
            res.status(400).json({
                success: false,
                error: 'You cannot modify your own account status.',
            });
            return;
        }
        // Safeguard: Regular ADMIN cannot suspend a SUPER_ADMIN
        if (targetUser.roles.includes('SUPER_ADMIN') && !actingAdmin.roles.includes('SUPER_ADMIN')) {
            res.status(403).json({
                success: false,
                error: 'Forbidden: Only a Super Administrator can suspend another Super Administrator.',
            });
            return;
        }
        const prevStatus = targetUser.accountStatus;
        targetUser.accountStatus = status;
        await targetUser.save();
        // Audit log
        await audit_log_model_1.AuditLog.create({
            adminId: actingAdmin._id,
            adminEmail: actingAdmin.email,
            adminName: actingAdmin.fullName,
            action: status === 'SUSPENDED' ? 'ACCOUNT_SUSPENDED' : 'ACCOUNT_ACTIVATED',
            targetType: 'USER',
            targetId: targetUser._id.toString(),
            targetLabel: targetUser.email,
            details: {
                previousStatus: prevStatus,
                newStatus: status,
                reason: reason || 'Administrative action',
            },
            status: 'SUCCESS',
            ipAddress: req.ip,
            userAgent: req.get('user-agent'),
        });
        res.status(200).json({
            success: true,
            message: `User account status updated to ${status}.`,
            user: targetUser.toJSON(),
            data: targetUser.toJSON(),
        });
    }
    catch (error) {
        next(error);
    }
}
/**
 * 4. GET /api/admin/partners
 * Listing of active studio owners and creative talent with their listing volume.
 */
async function getAdminPartners(req, res, next) {
    try {
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
        const search = (req.query.search || '').trim();
        const status = (req.query.status || '').trim();
        const query = {
            roles: { $in: ['STUDIO_OWNER', 'PROFESSIONAL'] },
        };
        if (status && status !== 'all') {
            query.accountStatus = status;
        }
        if (search) {
            const searchRegex = new RegExp(search, 'i');
            query.$or = [
                { fullName: searchRegex },
                { email: searchRegex },
                { companyName: searchRegex },
            ];
        }
        const [partners, total] = await Promise.all([
            user_model_1.User.find(query)
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit),
            user_model_1.User.countDocuments(query),
        ]);
        // Aggregate listing counts and booking inquiries for each partner
        const partnerData = await Promise.all(partners.map(async (p) => {
            const [partnerStudios, locationsCount, crewProfile, equipmentCount, directBookings] = await Promise.all([
                studio_model_1.Studio.find({ owner: p._id }, '_id'),
                location_model_1.FilmingLocationModel.countDocuments({ owner: p._id }),
                professional_model_1.ProfessionalProfile.countDocuments({ user: p._id }),
                equipment_model_1.Equipment.countDocuments({ owner: p._id }),
                booking_model_1.BookingRequest.countDocuments({ studioOwner: p._id }),
            ]);
            const studioIds = partnerStudios.map((s) => s._id);
            let bookingsCount = directBookings;
            if (studioIds.length > 0) {
                bookingsCount = await booking_model_1.BookingRequest.countDocuments({
                    $or: [
                        { studioOwner: p._id },
                        { studio: { $in: studioIds } },
                    ],
                });
            }
            return {
                ...p.toJSON(),
                listingsCount: {
                    studios: partnerStudios.length,
                    locations: locationsCount,
                    crew: crewProfile,
                    equipment: equipmentCount,
                    total: partnerStudios.length + locationsCount + crewProfile + equipmentCount,
                },
                bookingsCount,
            };
        }));
        res.status(200).json({
            success: true,
            data: partnerData,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        });
    }
    catch (error) {
        next(error);
    }
}
/**
 * 5. GET /api/admin/bookings
 * Platform-wide production reservation tracking.
 */
async function getAdminBookings(req, res, next) {
    try {
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 25));
        const status = (req.query.status || '').trim();
        const search = (req.query.search || '').trim();
        const query = {};
        if (status && status !== 'all') {
            query.status = status;
        }
        if (search) {
            const searchRegex = new RegExp(search, 'i');
            query.$or = [
                { productionName: searchRegex },
                { contactEmail: searchRegex },
                { shiftType: searchRegex },
            ];
        }
        const [bookings, total] = await Promise.all([
            booking_model_1.BookingRequest.find(query)
                .populate('customer', 'fullName email phone companyName')
                .populate('studio', 'name location')
                .populate('location', 'title location')
                .populate('crew', 'name title')
                .populate('equipment', 'title')
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit),
            booking_model_1.BookingRequest.countDocuments(query),
        ]);
        res.status(200).json({
            success: true,
            data: bookings.map((b) => b.toJSON()),
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        });
    }
    catch (error) {
        next(error);
    }
}
/**
 * 6. PATCH /api/admin/bookings/:id/status
 * Administrative moderation of booking status.
 */
async function updateAdminBookingStatus(req, res, next) {
    try {
        const { id } = req.params;
        const { status, note } = req.body;
        const actingAdmin = req.user;
        if (!['pending', 'reviewed', 'confirmed', 'declined', 'cancelled'].includes(status)) {
            res.status(400).json({ success: false, error: 'Invalid booking status.' });
            return;
        }
        const booking = await booking_model_1.BookingRequest.findById(id);
        if (!booking) {
            res.status(404).json({ success: false, error: 'Booking record not found.' });
            return;
        }
        const previousStatus = booking.status;
        booking.status = status;
        await booking.save();
        await audit_log_model_1.AuditLog.create({
            adminId: actingAdmin._id,
            adminEmail: actingAdmin.email,
            adminName: actingAdmin.fullName,
            action: 'BOOKING_STATUS_MODIFIED',
            targetType: 'BOOKING',
            targetId: booking._id.toString(),
            targetLabel: `${booking.productionName || 'Production'} (${booking.listingType}) — ${booking.contactEmail}`,
            details: {
                previousStatus,
                newStatus: status,
                note: note || undefined,
            },
            status: 'SUCCESS',
            ipAddress: req.ip,
            userAgent: req.get('user-agent'),
        });
        res.status(200).json({
            success: true,
            message: `Booking status updated to ${status}.`,
            data: booking.toJSON(),
        });
    }
    catch (error) {
        next(error);
    }
}
/**
 * 7. GET /api/admin/access-management
 * Lists platform administrative accounts (SUPER_ADMIN, ADMIN, SUPPORT).
 * Restricted to SUPER_ADMIN.
 */
async function getAccessManagement(_req, res, next) {
    try {
        const adminAccounts = await user_model_1.User.find({
            roles: { $in: ['SUPER_ADMIN', 'ADMIN', 'SUPPORT'] },
        }).sort({ createdAt: 1 });
        res.status(200).json({
            success: true,
            data: adminAccounts.map((a) => a.toJSON()),
        });
    }
    catch (error) {
        next(error);
    }
}
/**
 * 8. POST /api/admin/access-management/assign
 * Promotes, modifies, or revokes administrative roles with strict security safeguards.
 * Restricted to SUPER_ADMIN.
 */
async function assignAdminRole(req, res, next) {
    try {
        const actingAdmin = req.user;
        const { userId, role, action } = req.body; // action: 'ASSIGN' | 'REVOKE'
        if (!['SUPER_ADMIN', 'ADMIN', 'SUPPORT'].includes(role)) {
            res.status(400).json({
                success: false,
                error: 'Invalid administrative role. Permitted: SUPER_ADMIN, ADMIN, SUPPORT.',
            });
            return;
        }
        if (!['ASSIGN', 'REVOKE'].includes(action)) {
            res.status(400).json({
                success: false,
                error: 'Invalid action. Permitted: ASSIGN, REVOKE.',
            });
            return;
        }
        const targetUser = await user_model_1.User.findById(userId);
        if (!targetUser) {
            res.status(404).json({ success: false, error: 'Target user not found.' });
            return;
        }
        // Safeguard 1: Prevent revoking SUPER_ADMIN from self to prevent accidental lockout
        if (action === 'REVOKE' && role === 'SUPER_ADMIN' && targetUser._id.equals(actingAdmin._id)) {
            res.status(400).json({
                success: false,
                error: 'Self-demotion protection: You cannot revoke your own SUPER_ADMIN privileges.',
            });
            return;
        }
        // Safeguard 2: Prevent demoting the final SUPER_ADMIN in the entire platform
        if (action === 'REVOKE' && role === 'SUPER_ADMIN') {
            const superAdminCount = await user_model_1.User.countDocuments({ roles: 'SUPER_ADMIN' });
            if (superAdminCount <= 1) {
                res.status(400).json({
                    success: false,
                    error: 'Protection rule: Cannot revoke the final remaining SUPER_ADMIN account.',
                });
                return;
            }
        }
        const previousRoles = [...targetUser.roles];
        let newRoles;
        if (action === 'ASSIGN') {
            // If promoting to SUPER_ADMIN, also ensure ADMIN is assigned
            const additional = role === 'SUPER_ADMIN' ? ['SUPER_ADMIN', 'ADMIN'] : [role];
            newRoles = Array.from(new Set([...targetUser.roles, ...additional]));
        }
        else {
            newRoles = targetUser.roles.filter((r) => r !== role);
            // If revoking ADMIN and user had SUPER_ADMIN, revoke SUPER_ADMIN too
            if (role === 'ADMIN') {
                newRoles = newRoles.filter((r) => r !== 'SUPER_ADMIN');
            }
            // Ensure user keeps at least CUSTOMER if all roles were stripped
            if (newRoles.length === 0) {
                newRoles = ['CUSTOMER'];
            }
        }
        targetUser.roles = newRoles;
        await targetUser.save();
        // Audit log entry
        await audit_log_model_1.AuditLog.create({
            adminId: actingAdmin._id,
            adminEmail: actingAdmin.email,
            adminName: actingAdmin.fullName,
            action: action === 'ASSIGN' ? 'USER_ROLE_ASSIGNED' : 'USER_ROLE_REVOKED',
            targetType: 'USER',
            targetId: targetUser._id.toString(),
            targetLabel: targetUser.email,
            details: {
                roleTargeted: role,
                action,
                previousRoles,
                updatedRoles: newRoles,
            },
            status: 'SUCCESS',
            ipAddress: req.ip,
            userAgent: req.get('user-agent'),
        });
        res.status(200).json({
            success: true,
            message: `Successfully ${action === 'ASSIGN' ? 'assigned' : 'revoked'} ${role} for ${targetUser.email}.`,
            user: targetUser.toJSON(),
        });
    }
    catch (error) {
        next(error);
    }
}
/**
 * 9. GET /api/admin/audit-logs
 * Chronological immutable audit trail of administrative events.
 */
async function getAdminAuditLogs(req, res, next) {
    try {
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 30));
        const action = (req.query.action || '').trim();
        const targetType = (req.query.targetType || '').trim();
        const query = {};
        if (action && action !== 'all') {
            query.action = action;
        }
        if (targetType && targetType !== 'all') {
            query.targetType = targetType;
        }
        const [logs, total] = await Promise.all([
            audit_log_model_1.AuditLog.find(query)
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit),
            audit_log_model_1.AuditLog.countDocuments(query),
        ]);
        res.status(200).json({
            success: true,
            data: logs.map((l) => l.toJSON()),
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        });
    }
    catch (error) {
        next(error);
    }
}
//# sourceMappingURL=admin.controller.js.map