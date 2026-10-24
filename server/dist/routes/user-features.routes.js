"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userFeaturesRouter = void 0;
const express_1 = require("express");
const user_features_controller_1 = require("../controllers/user-features.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const validate_middleware_1 = require("../middleware/validate.middleware");
const marketplace_validator_1 = require("../validators/marketplace.validator");
exports.userFeaturesRouter = (0, express_1.Router)();
// Saved items
exports.userFeaturesRouter.get('/saved-items', auth_middleware_1.requireAuth, user_features_controller_1.getSavedItems);
exports.userFeaturesRouter.post('/saved-items', auth_middleware_1.requireAuth, (0, validate_middleware_1.validateBody)(marketplace_validator_1.savedItemSchema), user_features_controller_1.addSavedItem);
exports.userFeaturesRouter.delete('/saved-items/:id', auth_middleware_1.requireAuth, user_features_controller_1.removeSavedItem);
// Studio comparison
exports.userFeaturesRouter.get('/compare', auth_middleware_1.requireAuth, user_features_controller_1.getComparedStudios);
exports.userFeaturesRouter.post('/compare', auth_middleware_1.requireAuth, (0, validate_middleware_1.validateBody)(marketplace_validator_1.compareItemSchema), user_features_controller_1.addStudioToCompare);
exports.userFeaturesRouter.delete('/compare/:id', auth_middleware_1.requireAuth, user_features_controller_1.removeStudioFromCompare);
exports.userFeaturesRouter.delete('/compare', auth_middleware_1.requireAuth, user_features_controller_1.clearCompare);
// Production briefs
exports.userFeaturesRouter.get('/production-briefs', auth_middleware_1.requireAuth, user_features_controller_1.getProductionBriefs);
exports.userFeaturesRouter.post('/production-briefs', auth_middleware_1.requireAuth, (0, validate_middleware_1.validateBody)(marketplace_validator_1.productionBriefSchema), user_features_controller_1.createProductionBrief);
exports.userFeaturesRouter.get('/production-briefs/:id', auth_middleware_1.requireAuth, user_features_controller_1.getProductionBriefById);
exports.userFeaturesRouter.patch('/production-briefs/:id', auth_middleware_1.requireAuth, user_features_controller_1.updateProductionBrief);
//# sourceMappingURL=user-features.routes.js.map