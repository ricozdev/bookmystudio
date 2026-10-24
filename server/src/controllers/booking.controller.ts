import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { BookingRequest } from '../models/booking.model';
import { Studio } from '../models/studio.model';
import { FilmingLocationModel } from '../models/location.model';
import { ProfessionalProfile } from '../models/professional.model';
import { Equipment } from '../models/equipment.model';
import { validateAndPriceBooking } from '../services/availability.service';

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
