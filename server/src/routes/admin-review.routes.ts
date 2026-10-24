import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth.middleware';
import { getAdminListings, reviewListing } from '../controllers/admin-review.controller';

export const adminReviewRouter = Router();

// Strict admin-only access
adminReviewRouter.get('/listings', requireAuth, requireRole('ADMIN'), getAdminListings);
adminReviewRouter.post('/listings/:type/:id/review', requireAuth, requireRole('ADMIN'), reviewListing);

