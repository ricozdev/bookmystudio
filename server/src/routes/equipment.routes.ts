import { Router } from 'express';
import {
  getEquipment,
  getEquipmentBySlugOrId,
  createEquipment,
  updateEquipment,
  deleteEquipment,
} from '../controllers/equipment.controller';
import { requireAuth, requireVerified, optionalAuth } from '../middleware/auth.middleware';
import { validateQuery, validateBody } from '../middleware/validate.middleware';
import {
  marketplaceQuerySchema,
  createEquipmentSchema,
  updateEquipmentSchema,
} from '../validators/marketplace.validator';

export const equipmentRouter = Router();

equipmentRouter.get('/', validateQuery(marketplaceQuerySchema), getEquipment);
equipmentRouter.get('/:slugOrId', optionalAuth, getEquipmentBySlugOrId);
equipmentRouter.post('/', requireAuth, requireVerified, validateBody(createEquipmentSchema), createEquipment);
equipmentRouter.patch('/:slugOrId', requireAuth, validateBody(updateEquipmentSchema), updateEquipment);
equipmentRouter.delete('/:slugOrId', requireAuth, deleteEquipment);
