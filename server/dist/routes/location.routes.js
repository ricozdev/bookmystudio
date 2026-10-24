"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.locationRouter = void 0;
const express_1 = require("express");
const location_controller_1 = require("../controllers/location.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const validate_middleware_1 = require("../middleware/validate.middleware");
const marketplace_validator_1 = require("../validators/marketplace.validator");
exports.locationRouter = (0, express_1.Router)();
exports.locationRouter.get('/', (0, validate_middleware_1.validateQuery)(marketplace_validator_1.marketplaceQuerySchema), location_controller_1.getLocations);
exports.locationRouter.get('/:slugOrId', auth_middleware_1.optionalAuth, location_controller_1.getLocationBySlugOrId);
exports.locationRouter.post('/', auth_middleware_1.requireAuth, auth_middleware_1.requireVerified, (0, validate_middleware_1.validateBody)(marketplace_validator_1.createLocationSchema), location_controller_1.createLocation);
exports.locationRouter.patch('/:slugOrId', auth_middleware_1.requireAuth, (0, validate_middleware_1.validateBody)(marketplace_validator_1.updateLocationSchema), location_controller_1.updateLocation);
exports.locationRouter.delete('/:slugOrId', auth_middleware_1.requireAuth, location_controller_1.deleteLocation);
//# sourceMappingURL=location.routes.js.map