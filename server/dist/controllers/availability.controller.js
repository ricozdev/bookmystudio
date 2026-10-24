"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAvailability = getAvailability;
exports.calculateQuote = calculateQuote;
exports.addBlockedDate = addBlockedDate;
exports.removeBlockedDate = removeBlockedDate;
const availability_service_1 = require("../services/availability.service");
async function getAvailability(req, res, next) {
    try {
        const { category, listingId } = req.params;
        const { date, month } = req.query;
        if (!category || !listingId) {
            res.status(400).json({ success: false, error: 'Category and listing identifier are required.' });
            return;
        }
        if (month && !date) {
            const overview = await (0, availability_service_1.getListingMonthOverview)(category, listingId, month);
            res.status(200).json({
                success: true,
                data: overview,
            });
            return;
        }
        const targetDate = date || new Date().toISOString().slice(0, 10);
        const availability = await (0, availability_service_1.getListingAvailabilityForDate)(category, listingId, targetDate);
        // If month was also requested, attach month days overview
        let monthOverview = null;
        if (month || targetDate) {
            const monthStr = month || targetDate.slice(0, 7);
            try {
                monthOverview = await (0, availability_service_1.getListingMonthOverview)(category, listingId, monthStr);
            }
            catch { }
        }
        res.status(200).json({
            success: true,
            data: {
                ...availability,
                monthOverview: monthOverview?.days || [],
            },
        });
    }
    catch (error) {
        if (error.message?.includes('not found')) {
            res.status(404).json({ success: false, error: error.message, code: 'LISTING_NOT_FOUND' });
            return;
        }
        next(error);
    }
}
async function calculateQuote(req, res, next) {
    try {
        const { category, listingId, requestedDate, startTime, durationHours, powerAddon, riggingAddon, shiftType } = req.body;
        if (!category || !listingId || !requestedDate || !startTime) {
            res.status(400).json({ success: false, error: 'category, listingId, requestedDate, and startTime are required.' });
            return;
        }
        const result = await (0, availability_service_1.validateAndPriceBooking)(category, listingId, {
            requestedDate,
            startTime,
            durationHours: Number(durationHours) || 1,
            powerAddon: Boolean(powerAddon),
            riggingAddon: Boolean(riggingAddon),
            shiftType,
        });
        if (!result.isValid) {
            res.status(400).json({
                success: false,
                error: result.error,
                code: result.code,
            });
            return;
        }
        res.status(200).json({
            success: true,
            data: {
                requestedDate,
                startTime,
                endTime: result.endTime,
                durationHours: Number(durationHours) || 1,
                estimatedTotal: result.estimatedTotal,
                pricingBreakdown: result.pricingBreakdown,
            },
        });
    }
    catch (error) {
        next(error);
    }
}
async function addBlockedDate(req, res, next) {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, error: 'Authentication required' });
            return;
        }
        const { category, listingId } = req.params;
        const { startDate, endDate, startTime, endTime, reason } = req.body;
        if (!startDate || !endDate) {
            res.status(400).json({ success: false, error: 'startDate and endDate (YYYY-MM-DD) are required.' });
            return;
        }
        const { listing, ownerId } = await (0, availability_service_1.resolveListing)(category, listingId);
        const isAdmin = req.user.roles.includes('ADMIN');
        const isOwner = ownerId && req.user._id.toString() === ownerId;
        if (!isAdmin && !isOwner) {
            res.status(403).json({ success: false, error: 'Unauthorized: Only stage owners or administrators may block dates.' });
            return;
        }
        listing.blockedDates = listing.blockedDates || [];
        listing.blockedDates.push({
            startDate,
            endDate,
            startTime: startTime || null,
            endTime: endTime || null,
            reason: reason || 'Blocked by owner',
        });
        await listing.save();
        res.status(200).json({
            success: true,
            message: 'Date range blocked successfully.',
            data: listing.blockedDates,
        });
    }
    catch (error) {
        next(error);
    }
}
async function removeBlockedDate(req, res, next) {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, error: 'Authentication required' });
            return;
        }
        const { category, listingId } = req.params;
        const { startDate, endDate } = req.body;
        if (!startDate) {
            res.status(400).json({ success: false, error: 'startDate (YYYY-MM-DD) is required to remove blackout.' });
            return;
        }
        const { listing, ownerId } = await (0, availability_service_1.resolveListing)(category, listingId);
        const isAdmin = req.user.roles.includes('ADMIN');
        const isOwner = ownerId && req.user._id.toString() === ownerId;
        if (!isAdmin && !isOwner) {
            res.status(403).json({ success: false, error: 'Unauthorized: Only stage owners or administrators may remove blackout dates.' });
            return;
        }
        listing.blockedDates = (listing.blockedDates || []).filter((b) => !(b.startDate === startDate && (!endDate || b.endDate === endDate)));
        await listing.save();
        res.status(200).json({
            success: true,
            message: 'Blackout date removed successfully.',
            data: listing.blockedDates,
        });
    }
    catch (error) {
        next(error);
    }
}
//# sourceMappingURL=availability.controller.js.map