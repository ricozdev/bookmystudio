"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveListing = resolveListing;
exports.getListingAvailabilityForDate = getListingAvailabilityForDate;
exports.getListingMonthOverview = getListingMonthOverview;
exports.validateAndPriceBooking = validateAndPriceBooking;
const mongoose_1 = __importDefault(require("mongoose"));
const studio_model_1 = require("../models/studio.model");
const location_model_1 = require("../models/location.model");
const professional_model_1 = require("../models/professional.model");
const equipment_model_1 = require("../models/equipment.model");
const booking_model_1 = require("../models/booking.model");
const availability_types_1 = require("../models/availability.types");
// Convert "09:00" to minutes from midnight
function timeToMinutes(timeStr) {
    const [h, m] = timeStr.split(':').map(Number);
    return (h || 0) * 60 + (m || 0);
}
// Convert minutes to "09:00"
function minutesToTime(minutes) {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}
// Format "09:00" to "09:00 AM"
function format12Hour(timeStr) {
    const [hStr, mStr] = timeStr.split(':');
    let h = Number(hStr);
    const m = mStr || '00';
    const period = h >= 12 ? 'PM' : 'AM';
    if (h === 0)
        h = 12;
    else if (h > 12)
        h -= 12;
    return `${String(h).padStart(2, '0')}:${m} ${period}`;
}
// Get current date string (YYYY-MM-DD) and current time (HH:MM) in timezone
function getNowInTimezone(timezone = 'Asia/Kolkata') {
    try {
        const formatter = new Intl.DateTimeFormat('en-CA', {
            timeZone: timezone,
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
        });
        const parts = formatter.formatToParts(new Date());
        const year = parts.find((p) => p.type === 'year')?.value || '2026';
        const month = parts.find((p) => p.type === 'month')?.value || '01';
        const day = parts.find((p) => p.type === 'day')?.value || '01';
        const hour = parts.find((p) => p.type === 'hour')?.value || '00';
        const minute = parts.find((p) => p.type === 'minute')?.value || '00';
        return {
            dateStr: `${year}-${month}-${day}`,
            timeStr: `${hour}:${minute}`,
        };
    }
    catch {
        const now = new Date();
        return {
            dateStr: now.toISOString().slice(0, 10),
            timeStr: `${String(now.getUTCHours()).padStart(2, '0')}:${String(now.getUTCMinutes()).padStart(2, '0')}`,
        };
    }
}
async function resolveListing(category, listingId) {
    const cleanId = decodeURIComponent(listingId).trim();
    const isObjectId = mongoose_1.default.Types.ObjectId.isValid(cleanId);
    let listing = null;
    let refField = 'studio';
    let listingType = 'studio';
    let hourlyRate = 150;
    let dayRate10h = 1200;
    let title = 'Production Stage';
    let ownerId = null;
    switch (category.toLowerCase()) {
        case 'studio':
        case 'studios': {
            refField = 'studio';
            listingType = 'studio';
            listing = isObjectId ? await studio_model_1.Studio.findById(cleanId) : await studio_model_1.Studio.findOne({ slug: cleanId.toLowerCase() });
            if (listing) {
                hourlyRate = listing.hourlyRate || 150;
                dayRate10h = listing.dayRate10h || 1200;
                title = listing.name;
                ownerId = listing.owner ? listing.owner.toString() : null;
            }
            break;
        }
        case 'location':
        case 'locations': {
            refField = 'location';
            listingType = 'location';
            listing = isObjectId ? await location_model_1.FilmingLocationModel.findById(cleanId) : await location_model_1.FilmingLocationModel.findOne({ slug: cleanId.toLowerCase() });
            if (listing) {
                hourlyRate = listing.hourlyRate || 180;
                dayRate10h = listing.dayRate10h || 1500;
                title = listing.name;
                ownerId = listing.owner ? listing.owner.toString() : null;
            }
            break;
        }
        case 'crew':
        case 'professional':
        case 'professionals': {
            refField = 'crew';
            listingType = 'crew';
            listing = isObjectId ? await professional_model_1.ProfessionalProfile.findById(cleanId) : await professional_model_1.ProfessionalProfile.findOne({ slug: cleanId.toLowerCase() });
            if (listing) {
                dayRate10h = listing.dayRate10h || 1200;
                hourlyRate = Math.round(dayRate10h / 10);
                title = listing.name;
                ownerId = listing.user ? listing.user.toString() : null;
            }
            break;
        }
        case 'equipment': {
            refField = 'equipment';
            listingType = 'equipment';
            listing = isObjectId ? await equipment_model_1.Equipment.findById(cleanId) : await equipment_model_1.Equipment.findOne({ slug: cleanId.toLowerCase() });
            if (listing) {
                dayRate10h = listing.dayRate || 500;
                hourlyRate = Math.round(dayRate10h / 10);
                title = listing.name;
                ownerId = listing.owner ? listing.owner.toString() : null;
            }
            break;
        }
        default:
            throw new Error(`Unsupported marketplace category: '${category}'`);
    }
    if (!listing) {
        throw new Error(`Listing '${cleanId}' not found in category '${category}'.`);
    }
    return { listing, refField, listingType, hourlyRate, dayRate10h, title, ownerId };
}
async function getListingAvailabilityForDate(category, listingId, targetDateStr) {
    const { listing, refField, listingType } = await resolveListing(category, listingId);
    const operating = listing.operatingHours || availability_types_1.defaultOperatingHours;
    const blockedList = listing.blockedDates || [];
    const timezone = operating.timezone || 'Asia/Kolkata';
    const { dateStr: todayStr, timeStr: nowTimeStr } = getNowInTimezone(timezone);
    const isPastDate = targetDateStr < todayStr;
    const isToday = targetDateStr === todayStr;
    // Day of week check (0 = Sunday, 1 = Monday, ...)
    const dateObj = new Date(`${targetDateStr}T12:00:00Z`);
    const dayOfWeek = dateObj.getUTCDay();
    const isOperatingDay = operating.operatingDays?.includes(dayOfWeek) ?? true;
    // Check explicit owner blocked ranges
    const matchingBlocks = blockedList.filter((b) => targetDateStr >= b.startDate && targetDateStr <= b.endDate);
    const isWholeDayBlocked = matchingBlocks.some((b) => !b.startTime && !b.endTime);
    // Generate slots
    const startMin = timeToMinutes(operating.openingTime || '08:00');
    const endMin = timeToMinutes(operating.closingTime || '20:00');
    const increment = operating.slotIncrementMinutes || 60;
    // Fetch active bookings for this date and listing
    // Start of day in UTC / local
    const startOfDay = new Date(`${targetDateStr}T00:00:00.000Z`);
    const endOfDay = new Date(`${targetDateStr}T23:59:59.999Z`);
    const now = new Date();
    // Active bookings are confirmed, reviewed, or unexpired pending holds
    const activeBookings = await booking_model_1.BookingRequest.find({
        [refField]: listing._id,
        requestedDate: { $gte: startOfDay, $lte: endOfDay },
        status: { $in: ['confirmed', 'reviewed', 'pending'] },
        $or: [
            { holdExpiresAt: { $gt: now } },
            { holdExpiresAt: null },
            { status: { $in: ['confirmed', 'reviewed'] } },
        ],
    });
    const slots = [];
    for (let current = startMin; current < endMin; current += increment) {
        const slotStartStr = minutesToTime(current);
        const slotEndStr = minutesToTime(Math.min(current + increment, endMin));
        const label = `${format12Hour(slotStartStr)} – ${format12Hour(slotEndStr)}`;
        let status = 'available';
        let reason;
        if (isPastDate) {
            status = 'past';
            reason = 'Date is in the past';
        }
        else if (!isOperatingDay) {
            status = 'unavailable';
            reason = 'Facility closed on this weekday';
        }
        else if (isWholeDayBlocked) {
            status = 'blocked';
            reason = matchingBlocks[0]?.reason || 'Blocked by stage owner';
        }
        else if (isToday && current < timeToMinutes(nowTimeStr)) {
            status = 'past';
            reason = 'Time slot has passed';
        }
        else {
            // Check partial blocks
            const slotBlocked = matchingBlocks.find((b) => {
                if (!b.startTime || !b.endTime)
                    return false;
                const bStart = timeToMinutes(b.startTime);
                const bEnd = timeToMinutes(b.endTime);
                return current < bEnd && current + increment > bStart;
            });
            if (slotBlocked) {
                status = 'blocked';
                reason = slotBlocked.reason || 'Blocked by stage owner';
            }
            else {
                // Check active bookings overlap
                const conflictingBooking = activeBookings.find((b) => {
                    if (!b.startTime || !b.endTime)
                        return true; // whole day reservation
                    const bStart = timeToMinutes(b.startTime);
                    const bEnd = timeToMinutes(b.endTime);
                    return current < bEnd && current + increment > bStart;
                });
                if (conflictingBooking) {
                    status = 'unavailable';
                    reason = conflictingBooking.status === 'confirmed' ? 'Reserved' : 'Temporary Hold';
                }
            }
        }
        slots.push({
            start: slotStartStr,
            end: slotEndStr,
            label,
            status,
            reason,
        });
    }
    const availableSlotsCount = slots.filter((s) => s.status === 'available').length;
    const totalSlotsCount = slots.length;
    let overallStatus;
    if (isPastDate) {
        overallStatus = 'past';
    }
    else if (isWholeDayBlocked) {
        overallStatus = 'blocked';
    }
    else if (availableSlotsCount === 0) {
        overallStatus = 'fully_booked';
    }
    else if (availableSlotsCount < totalSlotsCount) {
        overallStatus = 'partially_available';
    }
    else {
        overallStatus = 'available';
    }
    return {
        listingId: listing._id.toString(),
        category: listingType,
        date: targetDateStr,
        timezone,
        status: overallStatus,
        operatingHours: operating,
        slots,
        availableSlotsCount,
        totalSlotsCount,
    };
}
async function getListingMonthOverview(category, listingId, yearMonthStr // "2026-11"
) {
    const { listing, refField, listingType } = await resolveListing(category, listingId);
    const operating = listing.operatingHours || availability_types_1.defaultOperatingHours;
    const blockedList = listing.blockedDates || [];
    const timezone = operating.timezone || 'Asia/Kolkata';
    const [yearStr, monthStr] = yearMonthStr.split('-');
    const year = Number(yearStr);
    const month = Number(monthStr);
    const daysInMonth = new Date(year, month, 0).getDate();
    const { dateStr: todayStr } = getNowInTimezone(timezone);
    // Month range
    const startOfMonth = new Date(Date.UTC(year, month - 1, 1));
    const endOfMonth = new Date(Date.UTC(year, month - 1, daysInMonth, 23, 59, 59, 999));
    const now = new Date();
    const monthBookings = await booking_model_1.BookingRequest.find({
        [refField]: listing._id,
        requestedDate: { $gte: startOfMonth, $lte: endOfMonth },
        status: { $in: ['confirmed', 'reviewed', 'pending'] },
        $or: [
            { holdExpiresAt: { $gt: now } },
            { holdExpiresAt: null },
            { status: { $in: ['confirmed', 'reviewed'] } },
        ],
    });
    const startMin = timeToMinutes(operating.openingTime || '08:00');
    const endMin = timeToMinutes(operating.closingTime || '20:00');
    const increment = operating.slotIncrementMinutes || 60;
    const totalDailySlots = Math.max(1, Math.floor((endMin - startMin) / increment));
    const days = [];
    for (let day = 1; day <= daysInMonth; day++) {
        const dayStr = `${yearStr}-${String(monthStr).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const dateObj = new Date(`${dayStr}T12:00:00Z`);
        const dayOfWeek = dateObj.getUTCDay();
        const isOperatingDay = operating.operatingDays?.includes(dayOfWeek) ?? true;
        if (dayStr < todayStr) {
            days.push({
                date: dayStr,
                status: 'past',
                availableSlotsCount: 0,
                totalSlotsCount: totalDailySlots,
            });
            continue;
        }
        if (!isOperatingDay) {
            days.push({
                date: dayStr,
                status: 'blocked',
                availableSlotsCount: 0,
                totalSlotsCount: totalDailySlots,
            });
            continue;
        }
        const isBlocked = blockedList.some((b) => dayStr >= b.startDate && dayStr <= b.endDate && !b.startTime && !b.endTime);
        if (isBlocked) {
            days.push({
                date: dayStr,
                status: 'blocked',
                availableSlotsCount: 0,
                totalSlotsCount: totalDailySlots,
            });
            continue;
        }
        // Check bookings count on that day
        const dayBookings = monthBookings.filter((b) => {
            const bDate = b.requestedDate.toISOString().slice(0, 10);
            return bDate === dayStr;
        });
        // Approximate count of occupied hours
        let occupiedHours = 0;
        dayBookings.forEach((b) => {
            occupiedHours += b.durationHours || 10;
        });
        const availableSlots = Math.max(0, totalDailySlots - occupiedHours);
        let status;
        if (availableSlots <= 0) {
            status = 'fully_booked';
        }
        else if (availableSlots < totalDailySlots) {
            status = 'partially_available';
        }
        else {
            status = 'available';
        }
        days.push({
            date: dayStr,
            status,
            availableSlotsCount: availableSlots,
            totalSlotsCount: totalDailySlots,
        });
    }
    return {
        listingId: listing._id.toString(),
        category: listingType,
        month: yearMonthStr,
        days,
    };
}
async function validateAndPriceBooking(category, listingId, options) {
    const { listing, refField, hourlyRate, dayRate10h } = await resolveListing(category, listingId);
    const operating = listing.operatingHours || availability_types_1.defaultOperatingHours;
    const timezone = operating.timezone || 'Asia/Kolkata';
    const { dateStr: todayStr, timeStr: nowTimeStr } = getNowInTimezone(timezone);
    const requestedDateStr = options.requestedDate;
    if (requestedDateStr < todayStr) {
        return {
            isValid: false,
            error: 'Cannot book shoot dates in the past.',
            code: 'DATE_IN_PAST',
            estimatedTotal: 0,
            pricingBreakdown: {},
        };
    }
    const startMin = timeToMinutes(options.startTime);
    const duration = Math.max(1, Math.min(24, Number(options.durationHours) || 1));
    const endMin = startMin + duration * 60;
    const endTimeStr = minutesToTime(endMin);
    if (requestedDateStr === todayStr && startMin < timeToMinutes(nowTimeStr)) {
        return {
            isValid: false,
            error: 'The requested start time has already passed today.',
            code: 'SLOT_IN_PAST',
            estimatedTotal: 0,
            pricingBreakdown: {},
        };
    }
    // Operating hours bounds check
    const openMin = timeToMinutes(operating.openingTime || '08:00');
    const closeMin = timeToMinutes(operating.closingTime || '20:00');
    if (startMin < openMin || endMin > closeMin) {
        // If not a recognized overnight shoot
        if (!(options.shiftType && options.shiftType.includes('Overnight'))) {
            return {
                isValid: false,
                error: `Requested time interval (${options.startTime} - ${endTimeStr}) extends outside facility operating hours (${operating.openingTime} - ${operating.closingTime}).`,
                code: 'OUTSIDE_OPERATING_HOURS',
                estimatedTotal: 0,
                pricingBreakdown: {},
            };
        }
    }
    // Check explicit owner blocked dates
    const blockedList = listing.blockedDates || [];
    const conflictingBlock = blockedList.find((b) => {
        if (requestedDateStr < b.startDate || requestedDateStr > b.endDate)
            return false;
        if (!b.startTime || !b.endTime)
            return true; // whole day blocked
        const bStart = timeToMinutes(b.startTime);
        const bEnd = timeToMinutes(b.endTime);
        return startMin < bEnd && endMin > bStart;
    });
    if (conflictingBlock) {
        return {
            isValid: false,
            error: `This date or time slot is unavailable: ${conflictingBlock.reason || 'Blocked by owner'}.`,
            code: 'DATE_BLOCKED',
            estimatedTotal: 0,
            pricingBreakdown: {},
        };
    }
    // Range datetimes
    const startDateTime = new Date(`${requestedDateStr}T${options.startTime}:00.000Z`);
    const endDateTime = new Date(`${requestedDateStr}T${endTimeStr}:00.000Z`);
    // Concurrency-safe overlap conflict check against existing bookings
    const now = new Date();
    const overlappingBooking = await booking_model_1.BookingRequest.findOne({
        [refField]: listing._id,
        requestedDate: new Date(`${requestedDateStr}T00:00:00.000Z`),
        status: { $in: ['confirmed', 'reviewed', 'pending'] },
        $or: [
            { holdExpiresAt: { $gt: now } },
            { holdExpiresAt: null },
            { status: { $in: ['confirmed', 'reviewed'] } },
        ],
        $expr: {
            $and: [
                {
                    $lt: [
                        '$startTime',
                        endTimeStr,
                    ],
                },
                {
                    $gt: [
                        '$endTime',
                        options.startTime,
                    ],
                },
            ],
        },
    });
    if (overlappingBooking) {
        return {
            isValid: false,
            error: 'This time slot is no longer available. Please choose another time.',
            code: 'BOOKING_CONFLICT',
            estimatedTotal: 0,
            pricingBreakdown: {},
        };
    }
    // Recalculate price accurately based on listing category and rates
    let baseRate = hourlyRate;
    let subtotal = 0;
    let rateType = 'hourly';
    if (category === 'studio' || category === 'location') {
        if (duration >= 10) {
            rateType = 'daily';
            baseRate = dayRate10h;
            subtotal = Math.round(dayRate10h * (duration / 10));
        }
        else if (duration === 5) {
            rateType = 'daily';
            baseRate = Math.round(dayRate10h * 0.6);
            subtotal = baseRate;
        }
        else {
            rateType = 'hourly';
            baseRate = hourlyRate;
            subtotal = hourlyRate * duration;
        }
    }
    else if (category === 'crew') {
        rateType = 'daily';
        baseRate = dayRate10h;
        subtotal = dayRate10h;
    }
    else if (category === 'equipment') {
        rateType = 'daily';
        baseRate = dayRate10h;
        subtotal = dayRate10h;
    }
    const addonsTotal = (options.powerAddon ? 350 : 0) + (options.riggingAddon ? 500 : 0);
    const total = subtotal + addonsTotal;
    return {
        isValid: true,
        startDateTime,
        endDateTime,
        endTime: endTimeStr,
        estimatedTotal: total,
        pricingBreakdown: {
            baseRate,
            rateType,
            durationUnits: duration,
            subtotal,
            addonsTotal,
            insurancePolicyFee: 0,
            taxes: 0,
            total,
        },
    };
}
//# sourceMappingURL=availability.service.js.map