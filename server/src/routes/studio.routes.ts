import { Router } from 'express';
import {
  getStudios,
  getStudioBySlugOrId,
  getStudioCategories,
  createStudio,
  updateStudio,
  deleteStudio,
} from '../controllers/studio.controller';
import { requireAuth, requireVerified, optionalAuth } from '../middleware/auth.middleware';
import { validateQuery, validateBody } from '../middleware/validate.middleware';
import {
  marketplaceQuerySchema,
  createStudioSchema,
  updateStudioSchema,
} from '../validators/marketplace.validator';

export const studioRouter = Router();

studioRouter.get('/', validateQuery(marketplaceQuerySchema), getStudios);
studioRouter.get('/meta/categories', getStudioCategories);
studioRouter.get('/:slugOrId', optionalAuth, getStudioBySlugOrId);
studioRouter.post('/', requireAuth, requireVerified, validateBody(createStudioSchema), createStudio);
studioRouter.patch('/:slugOrId', requireAuth, validateBody(updateStudioSchema), updateStudio);
studioRouter.delete('/:slugOrId', requireAuth, deleteStudio);

