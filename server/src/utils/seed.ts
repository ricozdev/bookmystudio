import { connectDatabase, disconnectDatabase } from '../config/database';
import { User } from '../models/user.model';
import { Studio } from '../models/studio.model';
import { FilmingLocationModel } from '../models/location.model';
import { ProfessionalProfile } from '../models/professional.model';
import { Equipment } from '../models/equipment.model';
import { BookingRequest } from '../models/booking.model';
import { SavedItem } from '../models/saved-item.model';

import {
  INITIAL_STUDIOS,
  INITIAL_LOCATIONS,
  INITIAL_CREW,
  INITIAL_EQUIPMENT,
} from './seed-data';

export async function seedDatabase() {
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
    await connectDatabase();

    // 1. Clean existing records for fresh seed
    console.log('🧹 Purging legacy seed records...');
    await Promise.all([
      User.deleteMany({ email: { $in: ['admin@bookmystudio.com', 'operator@apexcinema.com', 'producer@agency.com'] } }),
      Studio.deleteMany({}),
      FilmingLocationModel.deleteMany({}),
      ProfessionalProfile.deleteMany({}),
      Equipment.deleteMany({}),
      BookingRequest.deleteMany({}),
      SavedItem.deleteMany({}),
    ]);

    // 2. Create Users
    console.log('👤 Creating default users...');

    const adminPasswordHash = await User.hashPassword('AdminPassword123!');
    const adminUser = await User.create({
      fullName: 'Antigravity Executive Director',
      email: 'admin@bookmystudio.com',
      passwordHash: adminPasswordHash,
      roles: ['ADMIN', 'STUDIO_OWNER', 'CUSTOMER'],
      isVerified: true,
      accountStatus: 'ACTIVE',
      companyName: 'BookMyStudio Global Operations',
    });

    const ownerPasswordHash = await User.hashPassword('StageOperator123!');
    const ownerUser = await User.create({
      fullName: 'Apex Stage Management',
      email: 'operator@apexcinema.com',
      passwordHash: ownerPasswordHash,
      roles: ['STUDIO_OWNER'],
      isVerified: true,
      accountStatus: 'ACTIVE',
      companyName: 'Apex Cinema Lots NYC',
    });

    const producerPasswordHash = await User.hashPassword('Producer123!');
    const customerUser = await User.create({
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
    console.log(`🎬 Seeding ${INITIAL_STUDIOS.length} commercial studios...`);
    const studiosToInsert = INITIAL_STUDIOS.map((s) => ({
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
    const createdStudios = await Studio.insertMany(studiosToInsert);
    console.log(`✅ ${createdStudios.length} studios inserted`);

    // 4. Seed Filming Locations
    console.log(`📍 Seeding ${INITIAL_LOCATIONS.length} filming locations...`);
    const locationsToInsert = INITIAL_LOCATIONS.map((loc) => ({
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
    const createdLocations = await FilmingLocationModel.insertMany(locationsToInsert);
    console.log(`✅ ${createdLocations.length} locations inserted`);

    // 5. Seed Professionals / Crew
    console.log(`🎥 Seeding ${INITIAL_CREW.length} heads of department & crew...`);
    const crewToInsert = INITIAL_CREW.map((crew) => ({
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
    const createdCrew = await ProfessionalProfile.insertMany(crewToInsert);
    console.log(`✅ ${createdCrew.length} crew profiles inserted`);

    // 6. Seed Cinema Equipment Packages
    console.log(`📦 Seeding ${INITIAL_EQUIPMENT.length} equipment kits...`);
    const equipmentToInsert = INITIAL_EQUIPMENT.map((eq) => ({
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
    const createdEquipment = await Equipment.insertMany(equipmentToInsert);
    console.log(`✅ ${createdEquipment.length} equipment packages inserted`);

    // 7. Seed Sample Booking Inquiries for Dashboards
    console.log('📋 Creating initial production booking holds...');
    const firstStudio = createdStudios[0];
    const secondStudio = createdStudios[1];

    await BookingRequest.create([
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
    await SavedItem.create([
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
  } catch (error: any) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    await disconnectDatabase();
  }
}

// Execute if run directly from CLI
if (require.main === module) {
  seedDatabase().then(() => process.exit(0));
}
