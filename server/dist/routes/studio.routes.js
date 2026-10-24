"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.studioRouter = void 0;
const express_1 = require("express");
const studio_controller_1 = require("../controllers/studio.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const validate_middleware_1 = require("../middleware/validate.middleware");
const marketplace_validator_1 = require("../validators/marketplace.validator");
exports.studioRouter = (0, express_1.Router)();
exports.studioRouter.get('/', (0, validate_middleware_1.validateQuery)(marketplace_validator_1.marketplaceQuerySchema), studio_controller_1.getStudios);
exports.studioRouter.get('/meta/categories', studio_controller_1.getStudioCategories);
exports.studioRouter.get('/:slugOrId', auth_middleware_1.optionalAuth, studio_controller_1.getStudioBySlugOrId);
exports.studioRouter.post('/', auth_middleware_1.requireAuth, auth_middleware_1.requireVerified, (0, validate_middleware_1.validateBody)(marketplace_validator_1.createStudioSchema), studio_controller_1.createStudio);
exports.studioRouter.patch('/:slugOrId', auth_middleware_1.requireAuth, (0, validate_middleware_1.validateBody)(marketplace_validator_1.updateStudioSchema), studio_controller_1.updateStudio);
exports.studioRouter.delete('/:slugOrId', auth_middleware_1.requireAuth, studio_controller_1.deleteStudio);
//# sourceMappingURL=studio.routes.js.map