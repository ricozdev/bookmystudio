import { Router } from 'express';
import { requireAuth, requireAdmin, requireSuperAdmin } from '../middleware/auth.middleware';
import {
  getAdminMetrics,
  getAdminUsers,
  updateUserStatus,
  getAdminPartners,
  getAdminBookings,
  updateAdminBookingStatus,
  getAccessManagement,
  assignAdminRole,
  getAdminAuditLogs,
} from '../controllers/admin.controller';
import { getAdminListings, reviewListing } from '../controllers/admin-review.controller';

export const adminRouter = Router();

// =========================================================================
// OPERATIONAL ADMIN ENDPOINTS (SUPER_ADMIN & ADMIN)
// =========================================================================

// High-level Platform Metrics
adminRouter.get('/metrics', requireAuth, requireAdmin, getAdminMetrics);

// User Directory & Account Moderation
adminRouter.get('/users', requireAuth, requireAdmin, getAdminUsers);
adminRouter.patch('/users/:id/status', requireAuth, requireAdmin, updateUserStatus);

// Partner Network Tracking
adminRouter.get('/partners', requireAuth, requireAdmin, getAdminPartners);

// Listings Curation & Review Desk (Preserved from adminReviewRouter)
adminRouter.get('/listings', requireAuth, requireAdmin, getAdminListings);
adminRouter.post('/listings/:type/:id/review', requireAuth, requireAdmin, reviewListing);

// Production Bookings Moderation
adminRouter.get('/bookings', requireAuth, requireAdmin, getAdminBookings);
adminRouter.patch('/bookings/:id/status', requireAuth, requireAdmin, updateAdminBookingStatus);

// Chronological Audit Ledger
adminRouter.get('/audit-logs', requireAuth, requireAdmin, getAdminAuditLogs);

// =========================================================================
// SUPER_ADMIN PRIVILEGED ACCESS MANAGEMENT
// =========================================================================

// Administrator Account Registry & Role Assignment
adminRouter.get('/access-management', requireAuth, requireSuperAdmin, getAccessManagement);
adminRouter.post('/access-management/assign', requireAuth, requireSuperAdmin, assignAdminRole);

