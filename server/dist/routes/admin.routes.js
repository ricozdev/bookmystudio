"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminRouter = void 0;
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const admin_controller_1 = require("../controllers/admin.controller");
const admin_review_controller_1 = require("../controllers/admin-review.controller");
exports.adminRouter = (0, express_1.Router)();
// =========================================================================
// OPERATIONAL ADMIN ENDPOINTS (SUPER_ADMIN & ADMIN)
// =========================================================================
// High-level Platform Metrics
exports.adminRouter.get('/metrics', auth_middleware_1.requireAuth, auth_middleware_1.requireAdmin, admin_controller_1.getAdminMetrics);
// User Directory & Account Moderation
exports.adminRouter.get('/users', auth_middleware_1.requireAuth, auth_middleware_1.requireAdmin, admin_controller_1.getAdminUsers);
exports.adminRouter.patch('/users/:id/status', auth_middleware_1.requireAuth, auth_middleware_1.requireAdmin, admin_controller_1.updateUserStatus);
// Partner Network Tracking
exports.adminRouter.get('/partners', auth_middleware_1.requireAuth, auth_middleware_1.requireAdmin, admin_controller_1.getAdminPartners);
// Listings Curation & Review Desk (Preserved from adminReviewRouter)
exports.adminRouter.get('/listings', auth_middleware_1.requireAuth, auth_middleware_1.requireAdmin, admin_review_controller_1.getAdminListings);
exports.adminRouter.post('/listings/:type/:id/review', auth_middleware_1.requireAuth, auth_middleware_1.requireAdmin, admin_review_controller_1.reviewListing);
// Production Bookings Moderation
exports.adminRouter.get('/bookings', auth_middleware_1.requireAuth, auth_middleware_1.requireAdmin, admin_controller_1.getAdminBookings);
exports.adminRouter.patch('/bookings/:id/status', auth_middleware_1.requireAuth, auth_middleware_1.requireAdmin, admin_controller_1.updateAdminBookingStatus);
// Chronological Audit Ledger
exports.adminRouter.get('/audit-logs', auth_middleware_1.requireAuth, auth_middleware_1.requireAdmin, admin_controller_1.getAdminAuditLogs);
// =========================================================================
// SUPER_ADMIN PRIVILEGED ACCESS MANAGEMENT
// =========================================================================
// Administrator Account Registry & Role Assignment
exports.adminRouter.get('/access-management', auth_middleware_1.requireAuth, auth_middleware_1.requireSuperAdmin, admin_controller_1.getAccessManagement);
exports.adminRouter.post('/access-management/assign', auth_middleware_1.requireAuth, auth_middleware_1.requireSuperAdmin, admin_controller_1.assignAdminRole);
//# sourceMappingURL=admin.routes.js.map