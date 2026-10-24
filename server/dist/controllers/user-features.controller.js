"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSavedItems = getSavedItems;
exports.addSavedItem = addSavedItem;
exports.removeSavedItem = removeSavedItem;
exports.getComparedStudios = getComparedStudios;
exports.addStudioToCompare = addStudioToCompare;
exports.removeStudioFromCompare = removeStudioFromCompare;
exports.clearCompare = clearCompare;
exports.getProductionBriefs = getProductionBriefs;
exports.createProductionBrief = createProductionBrief;
exports.getProductionBriefById = getProductionBriefById;
exports.updateProductionBrief = updateProductionBrief;
const mongoose_1 = __importDefault(require("mongoose"));
const saved_item_model_1 = require("../models/saved-item.model");
const compare_model_1 = require("../models/compare.model");
const brief_model_1 = require("../models/brief.model");
const studio_model_1 = require("../models/studio.model");
const location_model_1 = require("../models/location.model");
const professional_model_1 = require("../models/professional.model");
const equipment_model_1 = require("../models/equipment.model");
// --- SAVED ITEMS ---
async function getSavedItems(req, res, next) {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, error: 'Authentication required' });
            return;
        }
        const items = await saved_item_model_1.SavedItem.find({ user: req.user._id })
            .populate('studio')
            .populate('location')
            .populate('crew')
            .populate('equipment')
            .sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            data: items.map((i) => i.toJSON()),
        });
    }
    catch (error) {
        next(error);
    }
}
async function addSavedItem(req, res, next) {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, error: 'Authentication required' });
            return;
        }
        const { itemType, itemId } = req.body;
        // Check if already saved
        let saved = await saved_item_model_1.SavedItem.findOne({
            user: req.user._id,
            itemType,
            itemId,
        });
        if (saved) {
            res.status(200).json({
                success: true,
                message: 'Item already in saved collection.',
                data: saved.toJSON(),
            });
            return;
        }
        // Resolve reference
        const references = {
            user: req.user._id,
            itemType,
            itemId,
        };
        if (itemType === 'studio') {
            const studio = mongoose_1.default.Types.ObjectId.isValid(itemId)
                ? await studio_model_1.Studio.findById(itemId)
                : await studio_model_1.Studio.findOne({ slug: itemId.toLowerCase() });
            if (studio)
                references.studio = studio._id;
        }
        else if (itemType === 'location') {
            const loc = mongoose_1.default.Types.ObjectId.isValid(itemId)
                ? await location_model_1.FilmingLocationModel.findById(itemId)
                : await location_model_1.FilmingLocationModel.findOne({ slug: itemId.toLowerCase() });
            if (loc)
                references.location = loc._id;
        }
        else if (itemType === 'crew') {
            const crew = mongoose_1.default.Types.ObjectId.isValid(itemId)
                ? await professional_model_1.ProfessionalProfile.findById(itemId)
                : await professional_model_1.ProfessionalProfile.findOne({ slug: itemId.toLowerCase() });
            if (crew)
                references.crew = crew._id;
        }
        else if (itemType === 'equipment') {
            const eq = mongoose_1.default.Types.ObjectId.isValid(itemId)
                ? await equipment_model_1.Equipment.findById(itemId)
                : await equipment_model_1.Equipment.findOne({ slug: itemId.toLowerCase() });
            if (eq)
                references.equipment = eq._id;
        }
        saved = new saved_item_model_1.SavedItem(references);
        await saved.save();
        res.status(201).json({
            success: true,
            message: 'Item saved to your production shortlist.',
            data: saved.toJSON(),
        });
    }
    catch (error) {
        next(error);
    }
}
async function removeSavedItem(req, res, next) {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, error: 'Authentication required' });
            return;
        }
        const { id } = req.params;
        // Can be deleted by saved item _id OR by matching itemId
        const query = { user: req.user._id };
        if (mongoose_1.default.Types.ObjectId.isValid(id)) {
            query.$or = [{ _id: id }, { itemId: id }];
        }
        else {
            query.itemId = id;
        }
        const deleted = await saved_item_model_1.SavedItem.findOneAndDelete(query);
        if (!deleted) {
            res.status(404).json({
                success: false,
                error: 'Saved item not found in your shortlist.',
            });
            return;
        }
        res.status(200).json({
            success: true,
            message: 'Item removed from saved shortlist.',
        });
    }
    catch (error) {
        next(error);
    }
}
// --- STUDIO COMPARISON ---
async function getComparedStudios(req, res, next) {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, error: 'Authentication required' });
            return;
        }
        const items = await compare_model_1.CompareItem.find({ user: req.user._id })
            .populate('studio')
            .sort({ createdAt: 1 });
        const validStudios = items
            .filter((i) => i.studio)
            .map((i) => i.studio.toJSON ? i.studio.toJSON() : i.studio);
        res.status(200).json({
            success: true,
            data: validStudios,
        });
    }
    catch (error) {
        next(error);
    }
}
async function addStudioToCompare(req, res, next) {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, error: 'Authentication required' });
            return;
        }
        const { studioId } = req.body;
        const studio = mongoose_1.default.Types.ObjectId.isValid(studioId)
            ? await studio_model_1.Studio.findById(studioId)
            : await studio_model_1.Studio.findOne({ slug: studioId.toLowerCase() });
        if (!studio) {
            res.status(404).json({
                success: false,
                error: `Studio '${studioId}' not found.`,
            });
            return;
        }
        // Check existing count for this user (Max 3 comparison rule)
        const existingCount = await compare_model_1.CompareItem.countDocuments({ user: req.user._id });
        const isAlreadyAdded = await compare_model_1.CompareItem.findOne({
            user: req.user._id,
            studio: studio._id,
        });
        if (isAlreadyAdded) {
            res.status(200).json({
                success: true,
                message: 'Studio is already in your comparison dock.',
            });
            return;
        }
        if (existingCount >= 3) {
            res.status(400).json({
                success: false,
                error: 'Comparison limit reached. Maximum 3 studios can be compared simultaneously.',
                code: 'COMPARE_LIMIT_REACHED',
            });
            return;
        }
        const compareItem = new compare_model_1.CompareItem({
            user: req.user._id,
            studio: studio._id,
        });
        await compareItem.save();
        res.status(201).json({
            success: true,
            message: `${studio.name} added to comparison matrix.`,
            data: studio.toJSON(),
        });
    }
    catch (error) {
        next(error);
    }
}
async function removeStudioFromCompare(req, res, next) {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, error: 'Authentication required' });
            return;
        }
        const { id } = req.params;
        let studioId = id;
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            const studio = await studio_model_1.Studio.findOne({ slug: id.toLowerCase() });
            if (studio)
                studioId = studio._id.toString();
        }
        await compare_model_1.CompareItem.findOneAndDelete({
            user: req.user._id,
            studio: studioId,
        });
        res.status(200).json({
            success: true,
            message: 'Studio removed from comparison dock.',
        });
    }
    catch (error) {
        next(error);
    }
}
async function clearCompare(req, res, next) {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, error: 'Authentication required' });
            return;
        }
        await compare_model_1.CompareItem.deleteMany({ user: req.user._id });
        res.status(200).json({
            success: true,
            message: 'Comparison dock cleared.',
        });
    }
    catch (error) {
        next(error);
    }
}
// --- PRODUCTION BRIEFS ---
async function getProductionBriefs(req, res, next) {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, error: 'Authentication required' });
            return;
        }
        const briefs = await brief_model_1.ProductionBrief.find({ owner: req.user._id })
            .populate('selectedResources.studios')
            .populate('selectedResources.locations')
            .populate('selectedResources.crew')
            .populate('selectedResources.equipment')
            .sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            data: briefs.map((b) => b.toJSON()),
        });
    }
    catch (error) {
        next(error);
    }
}
async function createProductionBrief(req, res, next) {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, error: 'Authentication required' });
            return;
        }
        const brief = new brief_model_1.ProductionBrief({
            ...req.body,
            owner: req.user._id,
        });
        await brief.save();
        res.status(201).json({
            success: true,
            message: 'Production brief created successfully.',
            data: brief.toJSON(),
        });
    }
    catch (error) {
        next(error);
    }
}
async function getProductionBriefById(req, res, next) {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, error: 'Authentication required' });
            return;
        }
        const { id } = req.params;
        const brief = await brief_model_1.ProductionBrief.findById(id)
            .populate('selectedResources.studios')
            .populate('selectedResources.locations')
            .populate('selectedResources.crew')
            .populate('selectedResources.equipment');
        if (!brief) {
            res.status(404).json({ success: false, error: 'Production brief not found' });
            return;
        }
        const isOwner = brief.owner.toString() === req.user._id.toString();
        const isAdmin = req.user.roles.includes('ADMIN');
        if (!isOwner && !isAdmin) {
            res.status(403).json({ success: false, error: 'Forbidden: Access denied to this brief' });
            return;
        }
        res.status(200).json({
            success: true,
            data: brief.toJSON(),
        });
    }
    catch (error) {
        next(error);
    }
}
async function updateProductionBrief(req, res, next) {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, error: 'Authentication required' });
            return;
        }
        const { id } = req.params;
        const brief = await brief_model_1.ProductionBrief.findById(id);
        if (!brief) {
            res.status(404).json({ success: false, error: 'Production brief not found' });
            return;
        }
        const isOwner = brief.owner.toString() === req.user._id.toString();
        const isAdmin = req.user.roles.includes('ADMIN');
        if (!isOwner && !isAdmin) {
            res.status(403).json({ success: false, error: 'Forbidden: Access denied' });
            return;
        }
        Object.assign(brief, req.body);
        await brief.save();
        res.status(200).json({
            success: true,
            message: 'Production brief updated.',
            data: brief.toJSON(),
        });
    }
    catch (error) {
        next(error);
    }
}
//# sourceMappingURL=user-features.controller.js.map