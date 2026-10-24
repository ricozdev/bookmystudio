import { Router } from 'express';
import { LocationGeocodeController } from '../controllers/location-geocode.controller';

const router = Router();

router.get('/search', LocationGeocodeController.search);
router.get('/reverse', LocationGeocodeController.reverse);
router.get('/hubs', LocationGeocodeController.getHubs);

export default router;

