"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedDatabase = seedDatabase;
const database_1 = require("../config/database");
const user_model_1 = require("../models/user.model");
const studio_model_1 = require("../models/studio.model");
const location_model_1 = require("../models/location.model");
const professional_model_1 = require("../models/professional.model");
const equipment_model_1 = require("../models/equipment.model");
const booking_model_1 = require("../models/booking.model");
const saved_item_model_1 = require("../models/saved-item.model");
const seed_data_1 = require("./seed-data");
async function seedDatabase() {
    console.log('🌱 Starting BookMyStudio Database Seeding...');
    if (process.env.NODE_ENV === 'production') {
        throw new Error('CRITICAL SAFETY HALT: Database seeding is strictly blocked in production mode.');
    }
    const hasConfirmFlag = process.argv.includes('--confirm-seed') || process.env.CONFIRM_SEED === 'true';
    if (!hasConfirmFlag) {
        console.warn('\n⚠️  SAFETY HALT: Seeding will purge all existing studios, locations, equipment, and bookings.');
        console.warn('To confirm, run with: npm --prefix server run seed -- --confirm-seed\n');
        return;
    }
    try {
        await (0, database_1.connectDatabase)();
        // 1. Clean existing records for fresh seed
        console.log('🧹 Purging legacy seed records...');
        await Promise.all([
            user_model_1.User.deleteMany({ email: { $in: ['admin@bookmystudio.com', 'operator@apexcinema.com', 'producer@agency.com'] } }),
            studio_model_1.Studio.deleteMany({}),
            location_model_1.FilmingLocationModel.deleteMany({}),
            professional_model_1.ProfessionalProfile.deleteMany({}),
            equipment_model_1.Equipment.deleteMany({}),
            booking_model_1.BookingRequest.deleteMany({}),
            saved_item_model_1.SavedItem.deleteMany({}),
        ]);
        // 2. Create Users
        console.log('👤 Creating default users...');
        const adminPasswordHash = await user_model_1.User.hashPassword('AdminPassword123!');
        const adminUser = await user_model_1.User.create({
            fullName: 'Antigravity Executive Director',
            email: 'admin@bookmystudio.com',
            passwordHash: adminPasswordHash,
            roles: ['ADMIN', 'STUDIO_OWNER', 'CUSTOMER'],
            isVerified: true,
            accountStatus: 'ACTIVE',
            companyName: 'BookMyStudio Global Operations',
        });
        const ownerPasswordHash = await user_model_1.User.hashPassword('StageOperator123!');
        const ownerUser = await user_model_1.User.create({
            fullName: 'Apex Stage Management',
            email: 'operator@apexcinema.com',
            passwordHash: ownerPasswordHash,
            roles: ['STUDIO_OWNER'],
            isVerified: true,
            accountStatus: 'ACTIVE',
            companyName: 'Apex Cinema Lots NYC',
        });
        const producerPasswordHash = await user_model_1.User.hashPassword('Producer123!');
        const customerUser = await user_model_1.User.create({
            fullName: 'Sarah Jenkins',
            email: 'producer@agency.com',
            passwordHash: producerPasswordHash,
            roles: ['CUSTOMER'],
            isVerified: true,
            accountStatus: 'ACTIVE',
            companyName: 'Anonymous Content NYC',
        });
        console.log('✅ Users created: Admin, Studio Owner, Customer');
        // 3. Seed Studios
        console.log(`🎬 Seeding ${seed_data_1.INITIAL_STUDIOS.length} commercial studios...`);
        const studiosToInsert = seed_data_1.INITIAL_STUDIOS.map((s) => ({
            owner: ownerUser._id,
            name: s.name,
            slug: s.slug,
            category: s.category,
            categoryLabel: s.categoryLabel,
            badgeTopLeft: s.badgeTopLeft,
            badgeTopSecondary: s.badgeTopSecondary,
            rating: s.rating,
            reviewCount: s.reviewCount,
            location: s.location,
            submarket: s.submarket,
            description: s.description,
            specs: s.specs,
            amenities: s.amenities,
            equipmentHighlight: s.equipmentHighlight,
            hourlyRate: s.hourlyRate,
            dayRate10h: s.dayRate10h,
            imageUrl: s.imageUrl,
            galleryImages: s.galleryImages,
            imageAlt: s.imageAlt,
            features: s.features,
            publicationStatus: 'published',
        }));
        const createdStudios = await studio_model_1.Studio.insertMany(studiosToInsert);
        console.log(`✅ ${createdStudios.length} studios inserted`);
        // 4. Seed Filming Locations
        console.log(`📍 Seeding ${seed_data_1.INITIAL_LOCATIONS.length} filming locations...`);
        const locationsToInsert = seed_data_1.INITIAL_LOCATIONS.map((loc) => ({
            owner: ownerUser._id,
            name: loc.name,
            slug: loc.slug,
            category: loc.category,
            categoryLabel: loc.categoryLabel,
            rating: loc.rating,
            reviewCount: loc.reviewCount,
            location: loc.location,
            submarket: loc.submarket,
            description: loc.description,
            areaSqFt: loc.areaSqFt,
            ceilingHeight: loc.ceilingHeight,
            powerSupply: loc.powerSupply,
            vehicleAccess: loc.vehicleAccess,
            curfewRestrictions: loc.curfewRestrictions,
            permitsRequired: loc.permitsRequired,
            amenities: loc.amenities,
            dayRate10h: loc.dayRate10h,
            hourlyRate: loc.hourlyRate,
            imageUrl: loc.imageUrl,
            galleryImages: loc.galleryImages,
            imageAlt: loc.imageAlt,
            featured: loc.featured,
            publicationStatus: 'published',
        }));
        const createdLocations = await location_model_1.FilmingLocationModel.insertMany(locationsToInsert);
        console.log(`✅ ${createdLocations.length} locations inserted`);
        // 5. Seed Professionals / Crew
        console.log(`🎥 Seeding ${seed_data_1.INITIAL_CREW.length} heads of department & crew...`);
        const crewToInsert = seed_data_1.INITIAL_CREW.map((crew) => ({
            name: crew.name,
            slug: crew.slug,
            role: crew.role,
            category: crew.category,
            rating: crew.rating,
            reviewCount: crew.reviewCount,
            location: crew.location,
            credits: crew.credits,
            bio: crew.bio,
            skills: crew.skills,
            workingKit: crew.workingKit,
            dayRate10h: crew.dayRate10h,
            nextAvailable: crew.nextAvailable,
            imageUrl: crew.imageUrl,
            galleryImages: crew.galleryImages,
            imageAlt: crew.imageAlt,
            unionAffiliation: crew.unionAffiliation,
            standardKitIncluded: crew.standardKitIncluded,
            featured: crew.featured,
            publicationStatus: 'published',
        }));
        const createdCrew = await professional_model_1.ProfessionalProfile.insertMany(crewToInsert);
        console.log(`✅ ${createdCrew.length} crew profiles inserted`);
        // 6. Seed Cinema Equipment Packages
        console.log(`📦 Seeding ${seed_data_1.INITIAL_EQUIPMENT.length} equipment kits...`);
        const equipmentToInsert = seed_data_1.INITIAL_EQUIPMENT.map((eq) => ({
            name: eq.name,
            slug: eq.slug,
            category: eq.category,
            categoryLabel: eq.categoryLabel,
            brand: eq.brand,
            rating: eq.rating,
            dayRate: eq.dayRate,
            weeklyRate: eq.weeklyRate,
            replacementValue: eq.replacementValue,
            description: eq.description,
            keySpecs: eq.keySpecs,
            includedAccessories: eq.includedAccessories,
            powerRequirement: eq.powerRequirement,
            mountType: eq.mountType,
            imageUrl: eq.imageUrl,
            galleryImages: eq.galleryImages,
            imageAlt: eq.imageAlt,
            featured: eq.featured,
            publicationStatus: 'published',
        }));
        const createdEquipment = await equipment_model_1.Equipment.insertMany(equipmentToInsert);
        console.log(`✅ ${createdEquipment.length} equipment packages inserted`);
        // 7. Seed Sample Booking Inquiries for Dashboards
        console.log('📋 Creating initial production booking holds...');
        const firstStudio = createdStudios[0];
        const secondStudio = createdStudios[1];
        await booking_model_1.BookingRequest.create([
            {
                customer: customerUser._id,
                listingType: 'studio',
                studio: firstStudio._id,
                studioOwner: ownerUser._id,
                requestedDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // in 5 days
                shiftType: '10h Standard Shoot Day',
                durationHours: 10,
                productionName: 'Nike Fall/Winter Campaign Shoot',
                contactEmail: customerUser.email,
                contactPhone: '(212) 555-0199',
                powerAddon: true,
                riggingAddon: false,
                estimatedTotal: firstStudio.dayRate10h + 250,
                specialInstructions: 'Need 600A Camlock tie-in early at 6:30 AM call time for lighting pre-rig.',
                status: 'pending',
            },
            {
                customer: customerUser._id,
                listingType: 'studio',
                studio: secondStudio._id,
                studioOwner: ownerUser._id,
                requestedDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000), // in 12 days
                shiftType: '12h Heavy Feature Day',
                durationHours: 12,
                productionName: 'HBO Pilot Production Wrap',
                contactEmail: customerUser.email,
                contactPhone: '(212) 555-0199',
                powerAddon: true,
                riggingAddon: true,
                estimatedTotal: secondStudio.dayRate10h * 1.2 + 500,
                specialInstructions: 'Sound-critical dialogue scenes requiring continuous silent chilled-water HVAC.',
                status: 'confirmed',
            },
        ]);
        console.log('✅ 2 sample booking holds created');
        // 8. Seed Saved Shortlist for Customer
        console.log('⭐ Creating initial customer saved shortlist...');
        await saved_item_model_1.SavedItem.create([
            {
                user: customerUser._id,
                itemType: 'studio',
                itemId: firstStudio.slug,
                studio: firstStudio._id,
            },
            {
                user: customerUser._id,
                itemType: 'crew',
                itemId: createdCrew[0].slug,
                crew: createdCrew[0]._id,
            },
        ]);
        console.log('✅ Sample saved items created');
        console.log('\n======================================================');
        console.log('🎉 DATABASE SEEDING COMPLETED SUCCESSFULLY!');
        console.log(`• Users: 3 (Admin: admin@bookmystudio.com, Owner: operator@apexcinema.com, Customer: producer@agency.com)`);
        console.log(`• Passwords: AdminPassword123! / StageOperator123! / Producer123!`);
        console.log(`• Studios: ${createdStudios.length}`);
        console.log(`• Filming Locations: ${createdLocations.length}`);
        console.log(`• Heads of Department: ${createdCrew.length}`);
        console.log(`• Cinema Packages: ${createdEquipment.length}`);
        console.log('======================================================\n');
    }
    catch (error) {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    }
    finally {
        await (0, database_1.disconnectDatabase)();
    }
}
// Execute if run directly from CLI
if (require.main === module) {
    seedDatabase().then(() => process.exit(0));
}
//# sourceMappingURL=seed.js.map