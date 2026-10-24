import { Router } from 'express';
import {
  createBookingRequest,
  getBookingRequests,
  getBookingRequestById,
  updateBookingStatus,
} from '../controllers/booking.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { validateBody } from '../middleware/validate.middleware';
import {
  createBookingSchema,
  updateBookingStatusSchema,
} from '../validators/booking.validator';

export const bookingRouter = Router();

bookingRouter.get('/', requireAuth, getBookingRequests);
bookingRouter.post('/', requireAuth, validateBody(createBookingSchema), createBookingRequest);
bookingRouter.get('/:id', requireAuth, getBookingRequestById);
bookingRouter.patch('/:id/status', requireAuth, validateBody(updateBookingStatusSchema), updateBookingStatus);

