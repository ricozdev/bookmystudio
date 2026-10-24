import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import {
  getMyListings,
  getPartnerBusinessSummary,
  submitListingForReview,
  publishListing,
  unpublishListing,
  updateListingLocation,
} from '../controllers/my-listings.controller';

export const myListingsRouter = Router();

myListingsRouter.get('/', requireAuth, getMyListings);
myListingsRouter.get('/overview', requireAuth, getPartnerBusinessSummary);
myListingsRouter.patch('/:type/:id/location', requireAuth, updateListingLocation);
myListingsRouter.post('/:type/:id/publish', requireAuth, publishListing);
myListingsRouter.post('/:type/:id/unpublish', requireAuth, unpublishListing);
myListingsRouter.post('/:type/:id/submit', requireAuth, submitListingForReview);


