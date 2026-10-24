"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bookingRouter = void 0;
const express_1 = require("express");
const booking_controller_1 = require("../controllers/booking.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const validate_middleware_1 = require("../middleware/validate.middleware");
const booking_validator_1 = require("../validators/booking.validator");
exports.bookingRouter = (0, express_1.Router)();
exports.bookingRouter.get('/', auth_middleware_1.requireAuth, booking_controller_1.getBookingRequests);
exports.bookingRouter.post('/', auth_middleware_1.requireAuth, (0, validate_middleware_1.validateBody)(booking_validator_1.createBookingSchema), booking_controller_1.createBookingRequest);
exports.bookingRouter.get('/:id', auth_middleware_1.requireAuth, booking_controller_1.getBookingRequestById);
exports.bookingRouter.patch('/:id/status', auth_middleware_1.requireAuth, (0, validate_middleware_1.validateBody)(booking_validator_1.updateBookingStatusSchema), booking_controller_1.updateBookingStatus);
//# sourceMappingURL=booking.routes.js.map