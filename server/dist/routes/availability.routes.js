"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.availabilityRouter = void 0;
const express_1 = require("express");
const availability_controller_1 = require("../controllers/availability.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
exports.availabilityRouter = (0, express_1.Router)();
// Public: Get availability overview for a listing (by category and slug or ObjectId)
// Supports ?date=YYYY-MM-DD or ?month=YYYY-MM
exports.availabilityRouter.get('/:category/:listingId', availability_controller_1.getAvailability);
// Public / Client: Recalculate authoritative price quote for a booking interval
exports.availabilityRouter.post('/quote', availability_controller_1.calculateQuote);
// Authenticated Owner/Admin: Block out dates/time ranges for maintenance or private holds
exports.availabilityRouter.post('/:category/:listingId/block', auth_middleware_1.requireAuth, availability_controller_1.addBlockedDate);
// Authenticated Owner/Admin: Remove a scheduled blackout date range
exports.availabilityRouter.post('/:category/:listingId/unblock', auth_middleware_1.requireAuth, availability_controller_1.removeBlockedDate);
//# sourceMappingURL=availability.routes.js.map