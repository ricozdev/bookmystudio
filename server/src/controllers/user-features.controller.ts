import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { SavedItem } from '../models/saved-item.model';
import { CompareItem } from '../models/compare.model';
import { ProductionBrief } from '../models/brief.model';
import { Studio } from '../models/studio.model';
import { FilmingLocationModel } from '../models/location.model';
import { ProfessionalProfile } from '../models/professional.model';
import { Equipment } from '../models/equipment.model';

// --- SAVED ITEMS ---

export async function getSavedItems(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }

    const items = await SavedItem.find({ user: req.user._id })
      .populate('studio')
      .populate('location')
      .populate('crew')
      .populate('equipment')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: items.map((i) => i.toJSON()),
    });
  } catch (error) {
    next(error);
  }
}

export async function addSavedItem(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }

    const { itemType, itemId } = req.body;

    // Check if already saved
    let saved = await SavedItem.findOne({
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
    const references: any = {
      user: req.user._id,
      itemType,
      itemId,
    };

    if (itemType === 'studio') {
      const studio = mongoose.Types.ObjectId.isValid(itemId)
        ? await Studio.findById(itemId)
        : await Studio.findOne({ slug: itemId.toLowerCase() });
      if (studio) references.studio = studio._id;
    } else if (itemType === 'location') {
      const loc = mongoose.Types.ObjectId.isValid(itemId)
        ? await FilmingLocationModel.findById(itemId)
        : await FilmingLocationModel.findOne({ slug: itemId.toLowerCase() });
      if (loc) references.location = loc._id;
    } else if (itemType === 'crew') {
      const crew = mongoose.Types.ObjectId.isValid(itemId)
        ? await ProfessionalProfile.findById(itemId)
        : await ProfessionalProfile.findOne({ slug: itemId.toLowerCase() });
      if (crew) references.crew = crew._id;
    } else if (itemType === 'equipment') {
      const eq = mongoose.Types.ObjectId.isValid(itemId)
        ? await Equipment.findById(itemId)
        : await Equipment.findOne({ slug: itemId.toLowerCase() });
      if (eq) references.equipment = eq._id;
    }

    saved = new SavedItem(references);
    await saved.save();

    res.status(201).json({
      success: true,
      message: 'Item saved to your production shortlist.',
      data: saved.toJSON(),
    });
  } catch (error) {
    next(error);
  }
}

export async function removeSavedItem(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }

    const { id } = req.params;

    // Can be deleted by saved item _id OR by matching itemId
    const query: any = { user: req.user._id };
    if (mongoose.Types.ObjectId.isValid(id)) {
      query.$or = [{ _id: id }, { itemId: id }];
    } else {
      query.itemId = id;
    }

    const deleted = await SavedItem.findOneAndDelete(query);

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
  } catch (error) {
    next(error);
  }
}

// --- STUDIO COMPARISON ---

export async function getComparedStudios(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }

    const items = await CompareItem.find({ user: req.user._id })
      .populate('studio')
      .sort({ createdAt: 1 });

    const validStudios = items
      .filter((i) => i.studio)
      .map((i) => (i.studio as any).toJSON ? (i.studio as any).toJSON() : i.studio);

    res.status(200).json({
      success: true,
      data: validStudios,
    });
  } catch (error) {
    next(error);
  }
}

export async function addStudioToCompare(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }

    const { studioId } = req.body;

    const studio = mongoose.Types.ObjectId.isValid(studioId)
      ? await Studio.findById(studioId)
      : await Studio.findOne({ slug: studioId.toLowerCase() });

    if (!studio) {
      res.status(404).json({
        success: false,
        error: `Studio '${studioId}' not found.`,
      });
      return;
    }

    // Check existing count for this user (Max 3 comparison rule)
    const existingCount = await CompareItem.countDocuments({ user: req.user._id });
    const isAlreadyAdded = await CompareItem.findOne({
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

    const compareItem = new CompareItem({
      user: req.user._id,
      studio: studio._id,
    });
    await compareItem.save();

    res.status(201).json({
      success: true,
      message: `${studio.name} added to comparison matrix.`,
      data: studio.toJSON(),
    });
  } catch (error) {
    next(error);
  }
}

export async function removeStudioFromCompare(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }

    const { id } = req.params;

    let studioId = id;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      const studio = await Studio.findOne({ slug: id.toLowerCase() });
      if (studio) studioId = studio._id.toString();
    }

    await CompareItem.findOneAndDelete({
      user: req.user._id,
      studio: studioId,
    });

    res.status(200).json({
      success: true,
      message: 'Studio removed from comparison dock.',
    });
  } catch (error) {
    next(error);
  }
}

export async function clearCompare(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }

    await CompareItem.deleteMany({ user: req.user._id });

    res.status(200).json({
      success: true,
      message: 'Comparison dock cleared.',
    });
  } catch (error) {
    next(error);
  }
}

// --- PRODUCTION BRIEFS ---

export async function getProductionBriefs(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }

    const briefs = await ProductionBrief.find({ owner: req.user._id })
      .populate('selectedResources.studios')
      .populate('selectedResources.locations')
      .populate('selectedResources.crew')
      .populate('selectedResources.equipment')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: briefs.map((b) => b.toJSON()),
    });
  } catch (error) {
    next(error);
  }
}

export async function createProductionBrief(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }

    const brief = new ProductionBrief({
      ...req.body,
      owner: req.user._id,
    });
    await brief.save();

    res.status(201).json({
      success: true,
      message: 'Production brief created successfully.',
      data: brief.toJSON(),
    });
  } catch (error) {
    next(error);
  }
}

export async function getProductionBriefById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }

    const { id } = req.params;
    const brief = await ProductionBrief.findById(id)
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
  } catch (error) {
    next(error);
  }
}

export async function updateProductionBrief(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }

    const { id } = req.params;
    const brief = await ProductionBrief.findById(id);

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
  } catch (error) {
    next(error);
  }
}

