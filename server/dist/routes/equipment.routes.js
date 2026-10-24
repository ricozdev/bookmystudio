"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.equipmentRouter = void 0;
const express_1 = require("express");
const equipment_controller_1 = require("../controllers/equipment.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const validate_middleware_1 = require("../middleware/validate.middleware");
const marketplace_validator_1 = require("../validators/marketplace.validator");
exports.equipmentRouter = (0, express_1.Router)();
exports.equipmentRouter.get('/', (0, validate_middleware_1.validateQuery)(marketplace_validator_1.marketplaceQuerySchema), equipment_controller_1.getEquipment);
exports.equipmentRouter.get('/:slugOrId', auth_middleware_1.optionalAuth, equipment_controller_1.getEquipmentBySlugOrId);
exports.equipmentRouter.post('/', auth_middleware_1.requireAuth, auth_middleware_1.requireVerified, (0, validate_middleware_1.validateBody)(marketplace_validator_1.createEquipmentSchema), equipment_controller_1.createEquipment);
exports.equipmentRouter.patch('/:slugOrId', auth_middleware_1.requireAuth, (0, validate_middleware_1.validateBody)(marketplace_validator_1.updateEquipmentSchema), equipment_controller_1.updateEquipment);
exports.equipmentRouter.delete('/:slugOrId', auth_middleware_1.requireAuth, equipment_controller_1.deleteEquipment);
//# sourceMappingURL=equipment.routes.js.map