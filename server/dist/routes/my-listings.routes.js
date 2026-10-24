"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.myListingsRouter = void 0;
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const my_listings_controller_1 = require("../controllers/my-listings.controller");
exports.myListingsRouter = (0, express_1.Router)();
exports.myListingsRouter.get('/', auth_middleware_1.requireAuth, my_listings_controller_1.getMyListings);
exports.myListingsRouter.get('/overview', auth_middleware_1.requireAuth, my_listings_controller_1.getPartnerBusinessSummary);
exports.myListingsRouter.patch('/:type/:id/location', auth_middleware_1.requireAuth, my_listings_controller_1.updateListingLocation);
exports.myListingsRouter.post('/:type/:id/publish', auth_middleware_1.requireAuth, my_listings_controller_1.publishListing);
exports.myListingsRouter.post('/:type/:id/unpublish', auth_middleware_1.requireAuth, my_listings_controller_1.unpublishListing);
exports.myListingsRouter.post('/:type/:id/submit', auth_middleware_1.requireAuth, my_listings_controller_1.submitListingForReview);
//# sourceMappingURL=my-listings.routes.js.map