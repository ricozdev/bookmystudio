import { Router } from 'express';
import {
  getLocations,
  getLocationBySlugOrId,
  createLocation,
  updateLocation,
  deleteLocation,
} from '../controllers/location.controller';
import { requireAuth, requireVerified, optionalAuth } from '../middleware/auth.middleware';
import { validateQuery, validateBody } from '../middleware/validate.middleware';
import {
  marketplaceQuerySchema,
  createLocationSchema,
  updateLocationSchema,
} from '../validators/marketplace.validator';

export const locationRouter = Router();

locationRouter.get('/', validateQuery(marketplaceQuerySchema), getLocations);
locationRouter.get('/:slugOrId', optionalAuth, getLocationBySlugOrId);
locationRouter.post('/', requireAuth, requireVerified, validateBody(createLocationSchema), createLocation);
locationRouter.patch('/:slugOrId', requireAuth, validateBody(updateLocationSchema), updateLocation);
locationRouter.delete('/:slugOrId', requireAuth, deleteLocation);
