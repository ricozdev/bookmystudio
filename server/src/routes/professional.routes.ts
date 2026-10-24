import { Router } from 'express';
import {
  getProfessionals,
  getProfessionalBySlugOrId,
  createProfessional,
  updateProfessional,
  deleteProfessional,
} from '../controllers/professional.controller';
import { requireAuth, requireVerified, optionalAuth } from '../middleware/auth.middleware';
import { validateQuery, validateBody } from '../middleware/validate.middleware';
import {
  marketplaceQuerySchema,
  createProfessionalSchema,
  updateProfessionalSchema,
} from '../validators/marketplace.validator';

export const professionalRouter = Router();

professionalRouter.get('/', validateQuery(marketplaceQuerySchema), getProfessionals);
professionalRouter.get('/:slugOrId', optionalAuth, getProfessionalBySlugOrId);
professionalRouter.post('/', requireAuth, requireVerified, validateBody(createProfessionalSchema), createProfessional);
professionalRouter.patch('/:slugOrId', requireAuth, validateBody(updateProfessionalSchema), updateProfessional);
professionalRouter.delete('/:slugOrId', requireAuth, deleteProfessional);
