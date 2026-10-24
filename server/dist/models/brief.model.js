"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductionBrief = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const productionBriefSchema = new mongoose_1.Schema({
    owner: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    projectName: {
        type: String,
        required: [true, 'Project name is required'],
        trim: true,
    },
    productionType: {
        type: String,
        required: [true, 'Production type is required'],
        default: 'Commercial Shoot',
    },
    shootDate: {
        type: Date,
        default: null,
    },
    durationHours: {
        type: Number,
        default: 10,
        min: 1,
    },
    budgetExpectation: {
        type: String,
        default: '',
    },
    requirements: {
        type: String,
        default: '',
    },
    selectedResources: {
        studios: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'Studio' }],
        locations: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'FilmingLocation' }],
        crew: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'ProfessionalProfile' }],
        equipment: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'Equipment' }],
    },
    status: {
        type: String,
        enum: ['draft', 'submitted', 'active', 'completed', 'archived'],
        default: 'draft',
        index: true,
    },
}, {
    timestamps: true,
    toJSON: {
        transform(_doc, ret) {
            ret.id = ret._id.toString();
            delete ret._id;
            delete ret.__v;
            return ret;
        },
    },
});
exports.ProductionBrief = mongoose_1.default.model('ProductionBrief', productionBriefSchema);
//# sourceMappingURL=brief.model.js.map