import { Router } from 'express';
import {
  getSavedItems,
  addSavedItem,
  removeSavedItem,
  getComparedStudios,
  addStudioToCompare,
  removeStudioFromCompare,
  clearCompare,
  getProductionBriefs,
  createProductionBrief,
  getProductionBriefById,
  updateProductionBrief,
} from '../controllers/user-features.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { validateBody } from '../middleware/validate.middleware';
import {
  savedItemSchema,
  compareItemSchema,
  productionBriefSchema,
} from '../validators/marketplace.validator';

export const userFeaturesRouter = Router();

// Saved items
userFeaturesRouter.get('/saved-items', requireAuth, getSavedItems);
userFeaturesRouter.post('/saved-items', requireAuth, validateBody(savedItemSchema), addSavedItem);
userFeaturesRouter.delete('/saved-items/:id', requireAuth, removeSavedItem);

// Studio comparison
userFeaturesRouter.get('/compare', requireAuth, getComparedStudios);
userFeaturesRouter.post('/compare', requireAuth, validateBody(compareItemSchema), addStudioToCompare);
userFeaturesRouter.delete('/compare/:id', requireAuth, removeStudioFromCompare);
userFeaturesRouter.delete('/compare', requireAuth, clearCompare);

// Production briefs
userFeaturesRouter.get('/production-briefs', requireAuth, getProductionBriefs);
userFeaturesRouter.post('/production-briefs', requireAuth, validateBody(productionBriefSchema), createProductionBrief);
userFeaturesRouter.get('/production-briefs/:id', requireAuth, getProductionBriefById);
userFeaturesRouter.patch('/production-briefs/:id', requireAuth, updateProductionBrief);

