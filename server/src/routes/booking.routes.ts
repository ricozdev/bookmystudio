import { Router } from 'express';
import {
  createBookingRequest,
  getBookingRequests,
  getBookingRequestById,
  updateBookingStatus,
  createCheckoutOrder,
  verifyPayment,
  reportPaymentFailure,
  handleRazorpayWebhook,
} from '../controllers/booking.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { validateBody } from '../middleware/validate.middleware';
import {
  createBookingSchema,
  updateBookingStatusSchema,
  createCheckoutOrderSchema,
  verifyPaymentSchema,
  reportPaymentFailureSchema,
} from '../validators/booking.validator';

export const bookingRouter = Router();

// Webhook endpoint (must be accessible to Razorpay servers without browser session)
bookingRouter.post('/webhook', handleRazorpayWebhook);

// Authenticated booking & payment endpoints
bookingRouter.get('/', requireAuth, getBookingRequests);
bookingRouter.post('/', requireAuth, validateBody(createBookingSchema), createBookingRequest);
bookingRouter.post('/checkout-order', requireAuth, validateBody(createCheckoutOrderSchema), createCheckoutOrder);
bookingRouter.post('/verify-payment', requireAuth, validateBody(verifyPaymentSchema), verifyPayment);
bookingRouter.post('/payment-failed', requireAuth, validateBody(reportPaymentFailureSchema), reportPaymentFailure);
bookingRouter.get('/:id', requireAuth, getBookingRequestById);
bookingRouter.patch('/:id/status', requireAuth, validateBody(updateBookingStatusSchema), updateBookingStatus);


