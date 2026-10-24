"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminReviewRouter = void 0;
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const admin_review_controller_1 = require("../controllers/admin-review.controller");
exports.adminReviewRouter = (0, express_1.Router)();
// Strict admin-only access
exports.adminReviewRouter.get('/listings', auth_middleware_1.requireAuth, (0, auth_middleware_1.requireRole)('ADMIN'), admin_review_controller_1.getAdminListings);
exports.adminReviewRouter.post('/listings/:type/:id/review', auth_middleware_1.requireAuth, (0, auth_middleware_1.requireRole)('ADMIN'), admin_review_controller_1.reviewListing);
//# sourceMappingURL=admin-review.routes.js.map