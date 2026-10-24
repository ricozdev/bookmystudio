"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const location_geocode_controller_1 = require("../controllers/location-geocode.controller");
const router = (0, express_1.Router)();
router.get('/search', location_geocode_controller_1.LocationGeocodeController.search);
router.get('/reverse', location_geocode_controller_1.LocationGeocodeController.reverse);
router.get('/hubs', location_geocode_controller_1.LocationGeocodeController.getHubs);
exports.default = router;
//# sourceMappingURL=location-geocode.routes.js.map