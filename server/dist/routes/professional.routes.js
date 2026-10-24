"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.professionalRouter = void 0;
const express_1 = require("express");
const professional_controller_1 = require("../controllers/professional.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const validate_middleware_1 = require("../middleware/validate.middleware");
const marketplace_validator_1 = require("../validators/marketplace.validator");
exports.professionalRouter = (0, express_1.Router)();
exports.professionalRouter.get('/', (0, validate_middleware_1.validateQuery)(marketplace_validator_1.marketplaceQuerySchema), professional_controller_1.getProfessionals);
exports.professionalRouter.get('/:slugOrId', auth_middleware_1.optionalAuth, professional_controller_1.getProfessionalBySlugOrId);
exports.professionalRouter.post('/', auth_middleware_1.requireAuth, auth_middleware_1.requireVerified, (0, validate_middleware_1.validateBody)(marketplace_validator_1.createProfessionalSchema), professional_controller_1.createProfessional);
exports.professionalRouter.patch('/:slugOrId', auth_middleware_1.requireAuth, (0, validate_middleware_1.validateBody)(marketplace_validator_1.updateProfessionalSchema), professional_controller_1.updateProfessional);
exports.professionalRouter.delete('/:slugOrId', auth_middleware_1.requireAuth, professional_controller_1.deleteProfessional);
//# sourceMappingURL=professional.routes.js.map