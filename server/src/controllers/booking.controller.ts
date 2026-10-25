import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { BookingRequest } from '../models/booking.model';
import { Payment } from '../models/payment.model';
import { Studio } from '../models/studio.model';
import { FilmingLocationModel } from '../models/location.model';
import { ProfessionalProfile } from '../models/professional.model';
import { Equipment } from '../models/equipment.model';
import { validateAndPriceBooking } from '../services/availability.service';
import { razorpayService } from '../services/razorpay.service';
import { emailService } from '../services/email.service';
import { env } from '../config/env';

export async function createBookingRequest(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Authentication required to submit booking hold.' });
      return;
    }

    const {
      listingType = 'studio',
      studioId,
      locationId,
      equipmentId,
      crewId,
      requestedDate,
      startTime = '09:00',
      shiftType = '10h Standard Shoot Day',
      durationHours = 10,
      attendeesCount = 10,
      productionName,
      contactEmail,
      contactPhone,
      powerAddon = false,
      riggingAddon = false,
      specialInstructions = '',
    } = req.body;

    let studioRef: mongoose.Types.ObjectId | null = null;
    let locationRef: mongoose.Types.ObjectId | null = null;
    let equipmentRef: mongoose.Types.ObjectId | null = null;
    let crewRef: mongoose.Types.ObjectId | null = null;
    let ownerRef: mongoose.Types.ObjectId | null = null;
    let targetIdentifier = '';

    if (listingType === 'studio' || studioId) {
      targetIdentifier = studioId;
      const studio = mongoose.Types.ObjectId.isValid(studioId)
        ? await Studio.findById(studioId)
        : await Studio.findOne({ slug: studioId.toLowerCase() });

      if (!studio) {
        res.status(404).json({ success: false, error: 'Target studio stage not found.' });
        return;
      }
      if (studio.publicationStatus !== 'published') {
        res.status(400).json({ success: false, error: 'This studio is currently unlisted.' });
        return;
      }
      studioRef = studio._id;
      ownerRef = studio.owner || null;
    } else if (listingType === 'location' || locationId) {
      targetIdentifier = locationId;
      const loc = mongoose.Types.ObjectId.isValid(locationId)
        ? await FilmingLocationModel.findById(locationId)
        : await FilmingLocationModel.findOne({ slug: locationId.toLowerCase() });

      if (!loc) {
        res.status(404).json({ success: false, error: 'Target location not found.' });
        return;
      }
      locationRef = loc._id;
      ownerRef = loc.owner || null;
    } else if (listingType === 'equipment' || equipmentId) {
      targetIdentifier = equipmentId;
      const eq = mongoose.Types.ObjectId.isValid(equipmentId)
        ? await Equipment.findById(equipmentId)
        : await Equipment.findOne({ slug: equipmentId.toLowerCase() });

      if (!eq) {
        res.status(404).json({ success: false, error: 'Target equipment item not found.' });
        return;
      }
      equipmentRef = eq._id;
      ownerRef = eq.owner || null;
    } else if (listingType === 'crew' || crewId) {
      targetIdentifier = crewId;
      const crew = mongoose.Types.ObjectId.isValid(crewId)
        ? await ProfessionalProfile.findById(crewId)
        : await ProfessionalProfile.findOne({ slug: crewId.toLowerCase() });

      if (!crew) {
        res.status(404).json({ success: false, error: 'Target creative professional not found.' });
        return;
      }
      crewRef = crew._id;
      ownerRef = crew.user || null;
    }

    const shootDate = new Date(requestedDate);
    if (isNaN(shootDate.getTime())) {
      res.status(400).json({ success: false, error: 'Invalid requested shoot date.' });
      return;
    }

    const dateStr = requestedDate.slice(0, 10);
    const duration = Math.max(1, Math.min(24, Number(durationHours) || 10));

    // Authoritative validation and price calculation
    const priceCheck = await validateAndPriceBooking(listingType, targetIdentifier, {
      requestedDate: dateStr,
      startTime,
      durationHours: duration,
      shiftType,
      powerAddon: Boolean(powerAddon),
      riggingAddon: Boolean(riggingAddon),
      customerEmail: contactEmail || req.user.email,
      customerId: req.user._id.toString(),
    });

    if (!priceCheck.isValid) {
      const isConflict = priceCheck.code === 'BOOKING_CONFLICT' || priceCheck.code === 'DATE_BLOCKED';
      res.status(isConflict ? 409 : 400).json({
        success: false,
        error: priceCheck.error || 'Requested booking interval is invalid or unavailable.',
        code: priceCheck.code,
      });
      return;
    }

    // 15-minute hold expiresAt
    const holdExpiresAt = new Date(Date.now() + 15 * 60 * 1000);

    const booking = new BookingRequest({
      customer: req.user._id,
      listingType,
      studio: studioRef,
      location: locationRef,
      equipment: equipmentRef,
      crew: crewRef,
      studioOwner: ownerRef,
      requestedDate: shootDate,
      startTime,
      endTime: priceCheck.endTime,
      startDateTime: priceCheck.startDateTime,
      endDateTime: priceCheck.endDateTime,
      shiftType,
      durationHours: duration,
      attendeesCount: Number(attendeesCount) || 10,
      productionName,
      contactEmail,
      contactPhone: contactPhone || '',
      powerAddon: Boolean(powerAddon),
      riggingAddon: Boolean(riggingAddon),
      estimatedTotal: priceCheck.estimatedTotal,
      pricingBreakdown: priceCheck.pricingBreakdown,
      specialInstructions: specialInstructions || '',
      holdExpiresAt,
      status: 'pending',
    });

    await booking.save();

    // Re-populate references for immediate return
    const populated = await BookingRequest.findById(booking._id)
      .populate('studio')
      .populate('location')
      .populate('equipment')
      .populate('crew')
      .populate('customer', 'fullName email phone companyName');

    res.status(201).json({
      success: true,
      message: 'Production stage hold inquiry submitted. A 15-minute priority hold has been placed.',
      data: populated ? populated.toJSON() : booking.toJSON(),
    });
  } catch (error) {
    next(error);
  }
}

export async function getBookingRequests(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }

    const query: any = {};
    const { as } = req.query;

    const isAdmin = req.user.roles.includes('ADMIN');
    const isOwner =
      req.user.roles.includes('STUDIO_OWNER') || req.user.roles.includes('PROFESSIONAL');

    if (as === 'partner') {
      // Partner perspective: show only inbound inquiries received for owned listings
      query.studioOwner = req.user._id;
    } else if (as === 'buyer') {
      // Buyer perspective: show only reservations made by the authenticated user
      query.customer = req.user._id;
    } else if (isAdmin) {
      // Admin sees all without filter
    } else if (isOwner) {
      // Owner default sees both
      query.$or = [{ customer: req.user._id }, { studioOwner: req.user._id }];
    } else {
      // Customer sees only their own booking requests
      query.customer = req.user._id;
    }

    const bookings = await BookingRequest.find(query)
      .populate('studio')
      .populate('location')
      .populate('equipment')
      .populate('crew')
      .populate('customer', 'fullName email phone companyName')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: bookings.map((b) => b.toJSON()),
    });
  } catch (error) {
    next(error);
  }
}

export async function getBookingRequestById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }

    const { id } = req.params;
    const booking = await BookingRequest.findById(id)
      .populate('studio')
      .populate('location')
      .populate('equipment')
      .populate('crew')
      .populate('customer', 'fullName email phone companyName');

    if (!booking) {
      res.status(404).json({ success: false, error: 'Booking request not found' });
      return;
    }

    const isCustomer = booking.customer && (booking.customer as any)._id.toString() === req.user._id.toString();
    const isOwner = booking.studioOwner && booking.studioOwner.toString() === req.user._id.toString();
    const isAdmin = req.user.roles.includes('ADMIN');

    if (!isCustomer && !isOwner && !isAdmin) {
      res.status(403).json({ success: false, error: 'Forbidden: Access denied to this inquiry' });
      return;
    }

    res.status(200).json({
      success: true,
      data: booking.toJSON(),
    });
  } catch (error) {
    next(error);
  }
}

export async function updateBookingStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }

    const { id } = req.params;
    const { status } = req.body;

    const booking = await BookingRequest.findById(id);

    if (!booking) {
      res.status(404).json({ success: false, error: 'Booking request not found' });
      return;
    }

    const isCustomer = booking.customer.toString() === req.user._id.toString();
    const isOwner = booking.studioOwner && booking.studioOwner.toString() === req.user._id.toString();
    const isAdmin = req.user.roles.includes('ADMIN');

    // Customer can only cancel their own booking
    if (isCustomer && !isOwner && !isAdmin) {
      if (status !== 'cancelled') {
        res.status(403).json({
          success: false,
          error: 'Customers may only cancel a pending inquiry.',
        });
        return;
      }
    } else if (!isOwner && !isAdmin) {
      res.status(403).json({
        success: false,
        error: 'Forbidden: You are not authorized to update this booking status.',
      });
      return;
    }

    booking.status = status;
    await booking.save();

    res.status(200).json({
      success: true,
      message: `Booking hold status updated to ${status}.`,
      data: booking.toJSON(),
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Creates a pending booking and a Razorpay Checkout order.
 * Calculates authoritative price on the backend and enforces a 15-minute priority hold.
 */
export async function createCheckoutOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Authentication required to initiate checkout.' });
      return;
    }

    const {
      listingType = 'studio',
      studioId,
      locationId,
      equipmentId,
      crewId,
      requestedDate,
      startTime = '09:00',
      shiftType = '10h Standard Shoot Day',
      durationHours = 10,
      attendeesCount = 10,
      productionName,
      contactEmail,
      contactPhone,
      powerAddon = false,
      riggingAddon = false,
      specialInstructions = '',
    } = req.body;

    let studioRef: mongoose.Types.ObjectId | null = null;
    let locationRef: mongoose.Types.ObjectId | null = null;
    let equipmentRef: mongoose.Types.ObjectId | null = null;
    let crewRef: mongoose.Types.ObjectId | null = null;
    let ownerRef: mongoose.Types.ObjectId | null = null;
    let targetIdentifier = '';
    let listingTitle = 'Production Stage';

    if (listingType === 'studio' || studioId) {
      targetIdentifier = studioId;
      const studio = mongoose.Types.ObjectId.isValid(studioId)
        ? await Studio.findById(studioId)
        : await Studio.findOne({ slug: studioId.toLowerCase() });

      if (!studio) {
        res.status(404).json({ success: false, error: 'Target studio stage not found.' });
        return;
      }
      if (studio.publicationStatus !== 'published') {
        res.status(400).json({ success: false, error: 'This studio is currently unlisted.' });
        return;
      }
      studioRef = studio._id;
      ownerRef = studio.owner || null;
      listingTitle = studio.name;
    } else if (listingType === 'location' || locationId) {
      targetIdentifier = locationId;
      const loc = mongoose.Types.ObjectId.isValid(locationId)
        ? await FilmingLocationModel.findById(locationId)
        : await FilmingLocationModel.findOne({ slug: locationId.toLowerCase() });

      if (!loc) {
        res.status(404).json({ success: false, error: 'Target location not found.' });
        return;
      }
      locationRef = loc._id;
      ownerRef = loc.owner || null;
      listingTitle = loc.name;
    } else if (listingType === 'equipment' || equipmentId) {
      targetIdentifier = equipmentId;
      const eq = mongoose.Types.ObjectId.isValid(equipmentId)
        ? await Equipment.findById(equipmentId)
        : await Equipment.findOne({ slug: equipmentId.toLowerCase() });

      if (!eq) {
        res.status(404).json({ success: false, error: 'Target equipment item not found.' });
        return;
      }
      equipmentRef = eq._id;
      ownerRef = eq.owner || null;
      listingTitle = eq.name;
    } else if (listingType === 'crew' || crewId) {
      targetIdentifier = crewId;
      const crew = mongoose.Types.ObjectId.isValid(crewId)
        ? await ProfessionalProfile.findById(crewId)
        : await ProfessionalProfile.findOne({ slug: crewId.toLowerCase() });

      if (!crew) {
        res.status(404).json({ success: false, error: 'Target creative professional not found.' });
        return;
      }
      crewRef = crew._id;
      ownerRef = crew.user || null;
      listingTitle = crew.name;
    }

    const shootDate = new Date(requestedDate);
    if (isNaN(shootDate.getTime())) {
      res.status(400).json({ success: false, error: 'Invalid requested shoot date.' });
      return;
    }

    const dateStr = requestedDate.slice(0, 10);
    const duration = Math.max(1, Math.min(24, Number(durationHours) || 10));

    // Authoritative availability check and price calculation
    const priceCheck = await validateAndPriceBooking(listingType, targetIdentifier, {
      requestedDate: dateStr,
      startTime,
      durationHours: duration,
      shiftType,
      powerAddon: Boolean(powerAddon),
      riggingAddon: Boolean(riggingAddon),
      customerEmail: contactEmail || req.user.email,
      customerId: req.user._id.toString(),
    });

    if (!priceCheck.isValid) {
      const isConflict = priceCheck.code === 'BOOKING_CONFLICT' || priceCheck.code === 'DATE_BLOCKED';
      res.status(isConflict ? 409 : 400).json({
        success: false,
        error: priceCheck.error || 'Requested booking interval is invalid or unavailable.',
        code: priceCheck.code,
      });
      return;
    }

    // 15-minute priority hold
    const holdExpiresAt = new Date(Date.now() + 15 * 60 * 1000);

    // Look for an existing pending booking by this user for the same slot to avoid duplicates
    const queryTarget: Record<string, any> = {
      customer: req.user._id,
      requestedDate: shootDate,
      startTime,
      status: 'pending',
    };
    if (studioRef) queryTarget.studio = studioRef;
    else if (locationRef) queryTarget.location = locationRef;
    else if (equipmentRef) queryTarget.equipment = equipmentRef;
    else if (crewRef) queryTarget.crew = crewRef;

    let booking = await BookingRequest.findOne(queryTarget);

    if (booking) {
      // Refresh hold and update pricing
      booking.holdExpiresAt = holdExpiresAt;
      booking.durationHours = duration;
      booking.endTime = priceCheck.endTime;
      booking.startDateTime = priceCheck.startDateTime;
      booking.endDateTime = priceCheck.endDateTime;
      booking.estimatedTotal = priceCheck.estimatedTotal;
      booking.pricingBreakdown = priceCheck.pricingBreakdown;
      booking.powerAddon = Boolean(powerAddon);
      booking.riggingAddon = Boolean(riggingAddon);
      booking.attendeesCount = Number(attendeesCount) || 10;
      booking.specialInstructions = specialInstructions || '';
      booking.paymentStatus = 'unpaid';
    } else {
      booking = new BookingRequest({
        customer: req.user._id,
        listingType,
        studio: studioRef,
        location: locationRef,
        equipment: equipmentRef,
        crew: crewRef,
        studioOwner: ownerRef,
        requestedDate: shootDate,
        startTime,
        endTime: priceCheck.endTime,
        startDateTime: priceCheck.startDateTime,
        endDateTime: priceCheck.endDateTime,
        shiftType,
        durationHours: duration,
        attendeesCount: Number(attendeesCount) || 10,
        productionName,
        contactEmail: contactEmail || req.user.email,
        contactPhone: contactPhone || req.user.phone || '',
        powerAddon: Boolean(powerAddon),
        riggingAddon: Boolean(riggingAddon),
        estimatedTotal: priceCheck.estimatedTotal,
        pricingBreakdown: priceCheck.pricingBreakdown,
        specialInstructions: specialInstructions || '',
        holdExpiresAt,
        status: 'pending',
        paymentStatus: 'unpaid',
        currency: 'INR',
      });
    }

    await booking.save();

    // Create Razorpay Order with authoritative server-calculated amount in paise (₹1 = 100 paise)
    const amountInPaise = Math.round(priceCheck.estimatedTotal * 100);
    const orderReceipt = `bms_${booking._id.toString().slice(-10)}_${Date.now().toString().slice(-6)}`;

    const rzpOrder = await razorpayService.createOrder({
      amount: amountInPaise,
      currency: 'INR',
      receipt: orderReceipt,
      notes: {
        bookingId: booking._id.toString(),
        customerId: req.user._id.toString(),
        listingTitle,
        listingType,
      },
    });

    booking.razorpayOrderId = rzpOrder.id;
    booking.paymentAmount = priceCheck.estimatedTotal;
    await booking.save();

    // Record payment attempt
    await Payment.create({
      booking: booking._id,
      customer: req.user._id,
      razorpayOrderId: rzpOrder.id,
      amount: amountInPaise,
      currency: 'INR',
      status: 'created',
      notes: {
        receipt: orderReceipt,
        listingTitle,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Razorpay checkout order created. 15-minute priority hold active.',
      data: {
        bookingId: booking._id.toString(),
        orderId: rzpOrder.id,
        amount: amountInPaise,
        currency: rzpOrder.currency || 'INR',
        keyId: razorpayService.getPublicKeyId() || env.RAZORPAY_KEY_ID || '',
        holdExpiresAt,
        estimatedTotal: priceCheck.estimatedTotal,
        pricingBreakdown: priceCheck.pricingBreakdown,
        listingTitle,
        customer: {
          fullName: req.user.fullName || productionName,
          email: contactEmail || req.user.email,
          phone: contactPhone || req.user.phone || '',
        },
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Authoritatively verifies Razorpay payment signature and confirms the booking.
 */
export async function verifyPayment(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Authentication required to verify payment.' });
      return;
    }

    const { bookingId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const booking = await BookingRequest.findById(bookingId)
      .populate('studio')
      .populate('location')
      .populate('equipment')
      .populate('crew')
      .populate('customer', 'fullName email phone companyName');

    if (!booking) {
      res.status(404).json({ success: false, error: 'Booking reservation not found.' });
      return;
    }

    // Ownership check: only customer or admin may verify
    const isCustomer =
      booking.customer &&
      ((booking.customer as any)._id?.toString() === req.user._id.toString() ||
        booking.customer.toString() === req.user._id.toString());
    const isAdmin = req.user.roles.includes('ADMIN');

    if (!isCustomer && !isAdmin) {
      res.status(403).json({ success: false, error: 'Forbidden: Access denied to this booking payment.' });
      return;
    }

    // Ensure order ID matches the pending booking
    if (booking.razorpayOrderId && booking.razorpayOrderId !== razorpay_order_id) {
      res.status(400).json({
        success: false,
        error: `Order ID mismatch. Expected '${booking.razorpayOrderId}', received '${razorpay_order_id}'.`,
        code: 'ORDER_MISMATCH',
      });
      return;
    }

    // Idempotency: if already verified and confirmed, return success without duplicate work
    if (booking.status === 'confirmed' && booking.paymentStatus === 'paid') {
      res.status(200).json({
        success: true,
        message: 'Payment already verified and reservation confirmed.',
        data: booking.toJSON(),
      });
      return;
    }

    // Cryptographic HMAC-SHA256 signature verification
    const isValidSignature = razorpayService.verifyPaymentSignature({
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
    });

    if (!isValidSignature) {
      // Record failed verification attempt
      await Payment.findOneAndUpdate(
        { razorpayOrderId: razorpay_order_id },
        {
          $set: {
            status: 'failed',
            failureReason: 'Cryptographic signature mismatch',
            razorpayPaymentId: razorpay_payment_id,
            razorpaySignature: razorpay_signature,
          },
        }
      );

      res.status(400).json({
        success: false,
        error: 'Invalid payment signature. Verification rejected by security protocol.',
        code: 'INVALID_SIGNATURE',
      });
      return;
    }

    // Fetch payment from Razorpay API when configured to verify status is captured / authorized
    let paymentDetails = null;
    try {
      paymentDetails = await razorpayService.fetchPayment(razorpay_payment_id);
    } catch {}

    // Update booking to confirmed and paid
    booking.status = 'confirmed';
    booking.paymentStatus = 'paid';
    booking.razorpayOrderId = razorpay_order_id;
    booking.razorpayPaymentId = razorpay_payment_id;
    booking.razorpaySignature = razorpay_signature;
    booking.paidAt = new Date();
    booking.holdExpiresAt = null; // Hold converted to permanent reservation
    await booking.save();

    // Update Payment record
    await Payment.findOneAndUpdate(
      { razorpayOrderId: razorpay_order_id },
      {
        $set: {
          status: 'captured',
          razorpayPaymentId: razorpay_payment_id,
          razorpaySignature: razorpay_signature,
          method: paymentDetails?.method || 'razorpay_checkout',
          verifiedAt: new Date(),
        },
      },
      { upsert: true, new: true }
    );

    // Send confirmation email asynchronously
    const listingTitle =
      (booking.studio as any)?.name ||
      (booking.location as any)?.name ||
      (booking.equipment as any)?.name ||
      (booking.crew as any)?.name ||
      'Production Stage';

    emailService
      .sendBookingConfirmationEmail({
        to: booking.contactEmail || req.user.email,
        fullName: req.user.fullName || booking.productionName,
        bookingId: booking._id.toString(),
        listingTitle,
        requestedDate: booking.requestedDate.toISOString().slice(0, 10),
        timeWindow: `${booking.startTime || '09:00'} – ${booking.endTime || '19:00'}`,
        amount: booking.estimatedTotal,
        paymentId: razorpay_payment_id,
      })
      .catch((err) => console.warn('[EmailService] Confirmation email notice:', err.message));

    res.status(200).json({
      success: true,
      message: 'Payment verified successfully. Stage reservation is confirmed!',
      data: booking.toJSON(),
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Records checkout failure or dismissal without releasing the 15-minute slot hold prematurely.
 */
export async function reportPaymentFailure(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Authentication required.' });
      return;
    }

    const { bookingId, razorpay_order_id, reason, error } = req.body;

    const booking = await BookingRequest.findById(bookingId);
    if (!booking) {
      res.status(404).json({ success: false, error: 'Booking reservation not found.' });
      return;
    }

    const isCustomer = booking.customer.toString() === req.user._id.toString();
    const isAdmin = req.user.roles.includes('ADMIN');
    if (!isCustomer && !isAdmin) {
      res.status(403).json({ success: false, error: 'Forbidden.' });
      return;
    }

    // Do not alter status if already confirmed
    if (booking.status !== 'confirmed') {
      booking.paymentStatus = 'failed';
      await booking.save();
    }

    if (razorpay_order_id) {
      await Payment.findOneAndUpdate(
        { razorpayOrderId: razorpay_order_id },
        {
          $set: {
            status: 'failed',
            failureReason: reason || error?.description || 'Checkout cancelled or declined by user/bank',
          },
        }
      );
    }

    res.status(200).json({
      success: true,
      message: 'Payment failure recorded. Hold remains recoverable until expiration.',
      data: {
        bookingId: booking._id.toString(),
        holdExpiresAt: booking.holdExpiresAt,
        paymentStatus: booking.paymentStatus,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Razorpay Webhook listener with cryptographic HMAC SHA-256 signature verification.
 */
export async function handleRazorpayWebhook(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const signature = req.headers['x-razorpay-signature'] as string;
    if (!signature) {
      res.status(400).json({ success: false, error: 'Missing x-razorpay-signature header.' });
      return;
    }

    const rawBody = req.rawBody || JSON.stringify(req.body);
    const isValid = razorpayService.verifyWebhookSignature(rawBody, signature);

    if (!isValid) {
      res.status(400).json({ success: false, error: 'Invalid webhook signature.' });
      return;
    }

    const eventPayload = req.body;
    const eventType = eventPayload?.event;
    const eventId = eventPayload?.event_id || eventPayload?.id;

    console.log(`[RazorpayWebhook] Received valid event: ${eventType} (${eventId || 'no-id'})`);

    const paymentEntity = eventPayload?.payload?.payment?.entity;
    const orderEntity = eventPayload?.payload?.order?.entity;
    const orderId = paymentEntity?.order_id || orderEntity?.id;
    const paymentId = paymentEntity?.id;

    if (orderId) {
      const paymentRecord = await Payment.findOne({ razorpayOrderId: orderId });
      if (paymentRecord) {
        paymentRecord.webhookEvents.push({
          event: eventType || 'unknown',
          receivedAt: new Date(),
          eventId,
          payload: eventPayload,
        });
        await paymentRecord.save();
      }

      if (eventType === 'payment.captured' || eventType === 'order.paid') {
        const booking = await BookingRequest.findOne({ razorpayOrderId: orderId });
        if (booking && booking.status !== 'confirmed') {
          booking.status = 'confirmed';
          booking.paymentStatus = 'paid';
          if (paymentId) booking.razorpayPaymentId = paymentId;
          booking.paidAt = new Date();
          booking.holdExpiresAt = null;
          await booking.save();

          if (paymentRecord) {
            paymentRecord.status = 'captured';
            if (paymentId) paymentRecord.razorpayPaymentId = paymentId;
            paymentRecord.verifiedAt = new Date();
            await paymentRecord.save();
          }
        }
      } else if (eventType === 'payment.failed') {
        if (paymentRecord && paymentRecord.status !== 'captured') {
          paymentRecord.status = 'failed';
          paymentRecord.failureReason = paymentEntity?.error_description || 'Payment failed on gateway';
          await paymentRecord.save();
        }
      }
    }

    res.status(200).json({ status: 'ok' });
  } catch (error) {
    next(error);
  }
}
