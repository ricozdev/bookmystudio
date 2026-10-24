export interface LocationGeoPoint {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
}

export interface LocationAddressDetails {
  formatted?: string;
  street?: string;
  building?: string;
  locality?: string;
  city?: string;
  state?: string;
  pincode?: string;
  country?: string;
  accuracy?: 'rooftop' | 'street' | 'locality' | 'city' | 'approximate' | 'manual';
  isExactAddressPublic?: boolean;
  placeId?: string;
  landmark?: string;
  arrivalInstructions?: string;
  mapUrl?: string | null;
}

export interface UserLocationState {
  id?: string;
  name: string;
  locality: string;
  city: string;
  state: string;
  pincode: string;
  coordinates: [number, number]; // [longitude, latitude]
  radiusKm: number | 'all';
  isGps?: boolean;
}

export type StudioCategory =
  | 'cyclorama'
  | 'soundstage'
  | 'daylight'
  | 'podcast'
  | 'kitchen'
  | 'industrial';

export interface StudioSpace {
  id: string;
  name: string;
  slug: string;
  category: StudioCategory;
  categoryLabel: string;
  badgeTopLeft: string;
  badgeTopSecondary?: string;
  rating: number;
  reviewCount: number;
  location: string;
  submarket: string;
  locationGeo?: LocationGeoPoint;
  locationAddress?: LocationAddressDetails;
  mapUrl?: string | null;
  distanceKm?: number | null;
  description: string;
  specs: {
    sqFt: number;
    gridHeight: string;
    power: string;
    access: string;
  };
  amenities: string[];
  equipmentHighlight: string;
  hourlyRate: number;
  dayRate10h: number;
  imageUrl: string;
  galleryImages: string[];
  imageAlt: string;
  features: {
    camlockPower: boolean;
    driveInAccess: boolean;
    stc60Certified: boolean;
    northDaylight: boolean;
    gripPackageIncluded: boolean;
  };
}

export type LocationCategory =
  | 'industrial'
  | 'loft'
  | 'warehouse'
  | 'rooftop'
  | 'commercial'
  | 'outdoor';

export interface FilmingLocation {
  id: string;
  name: string;
  slug: string;
  category: LocationCategory;
  categoryLabel: string;
  rating: number;
  reviewCount: number;
  location: string;
  submarket: string;
  locationGeo?: LocationGeoPoint;
  locationAddress?: LocationAddressDetails;
  mapUrl?: string | null;
  distanceKm?: number | null;
  description: string;
  areaSqFt: number;
  ceilingHeight: string;
  powerSupply: string;
  vehicleAccess: string;
  curfewRestrictions: string;
  permitsRequired: string;
  amenities: string[];
  dayRate10h: number;
  hourlyRate: number;
  imageUrl: string;
  galleryImages: string[];
  imageAlt: string;
  featured: boolean;
}

export type CrewRoleCategory =
  | 'camera_lighting'
  | 'grip_sound'
  | 'styling_art'
  | 'post_production'
  | 'production';

export interface ProductionCrewMember {
  id: string;
  name: string;
  slug: string;
  role: string;
  category: CrewRoleCategory;
  rating: number;
  reviewCount: number;
  location: string;
  locationGeo?: LocationGeoPoint;
  locationAddress?: LocationAddressDetails;
  serviceRadiusKm?: number;
  distanceKm?: number | null;
  credits: string;
  bio: string;
  skills: string[];
  workingKit: string;
  dayRate10h: number;
  nextAvailable: string;
  imageUrl: string;
  galleryImages: string[];
  imageAlt: string;
  unionAffiliation: string;
  standardKitIncluded: boolean;
  featured: boolean;
}

export type EquipmentCategory =
  | 'cameras'
  | 'lighting'
  | 'grip'
  | 'audio'
  | 'monitoring'
  | 'packages';

export interface EquipmentItem {
  id: string;
  name: string;
  slug: string;
  category: EquipmentCategory;
  categoryLabel: string;
  brand: string;
  rating: number;
  dayRate: number;
  weeklyRate: number;
  replacementValue: number;
  description: string;
  keySpecs: string[];
  includedAccessories: string[];
  powerRequirement: string;
  mountType?: string;
  location?: string;
  pickupLocation?: string;
  deliveryCoverageKm?: number;
  locationGeo?: LocationGeoPoint;
  locationAddress?: LocationAddressDetails;
  mapUrl?: string | null;
  distanceKm?: number | null;
  imageUrl: string;
  galleryImages: string[];
  imageAlt: string;
  featured: boolean;
}

export interface StudioDirectoryCategory {
  id: string;
  name: string;
  categoryKey: StudioCategory;
  count: number;
  description: string;
  iconName: string;
}

export interface FacilityComparisonRow {
  id: string;
  specification: string;
  iconName: string;
  standardDryHire: string;
  turnkeyStage: string;
}

export type AvailabilitySlotStatus = 'available' | 'unavailable' | 'blocked' | 'past';
export type DayAvailabilityStatus = 'available' | 'partially_available' | 'fully_booked' | 'blocked' | 'past';

export interface AvailabilitySlot {
  start: string; // "09:00"
  end: string;   // "10:00"
  label: string; // "09:00 AM – 10:00 AM"
  status: AvailabilitySlotStatus;
  reason?: string;
}

export interface MonthDayAvailability {
  date: string; // "YYYY-MM-DD"
  status: DayAvailabilityStatus;
  availableSlotsCount: number;
  totalSlotsCount: number;
}

export interface DateAvailabilityResponse {
  listingId: string;
  category: string;
  date: string;
  timezone: string;
  status: DayAvailabilityStatus;
  operatingHours: {
    daysOfWeek: number[];
    openingTime: string;
    closingTime: string;
    slotDurationMinutes: number;
    timezone: string;
  };
  slots: AvailabilitySlot[];
  availableSlotsCount: number;
  totalSlotsCount: number;
  monthOverview?: MonthDayAvailability[];
}

export interface BookingPricingBreakdown {
  baseRate: number;
  rateType: 'hourly' | 'daily' | 'weekly';
  durationUnits: number;
  subtotal: number;
  addonsTotal: number;
  insurancePolicyFee: number;
  taxes: number;
  total: number;
}

export interface BookingQuoteResponse {
  requestedDate: string;
  startTime: string;
  endTime: string;
  durationHours: number;
  estimatedTotal: number;
  pricingBreakdown: BookingPricingBreakdown;
}

export interface BookingRecord {
  id: string;
  listingType: 'studio' | 'location' | 'equipment' | 'crew';
  studio?: StudioSpace | null;
  location?: FilmingLocation | null;
  equipment?: EquipmentItem | null;
  crew?: ProductionCrewMember | null;
  customer?: {
    id: string;
    fullName: string;
    email: string;
    phone?: string;
    companyName?: string;
  };
  requestedDate: string;
  startTime: string;
  endTime: string;
  startDateTime?: string;
  endDateTime?: string;
  shiftType: string;
  durationHours: number;
  attendeesCount?: number;
  productionName: string;
  contactEmail: string;
  contactPhone?: string;
  powerAddon: boolean;
  riggingAddon: boolean;
  estimatedTotal: number;
  pricingBreakdown?: BookingPricingBreakdown;
  specialInstructions?: string;
  status: 'pending' | 'reviewed' | 'confirmed' | 'declined' | 'cancelled';
  holdExpiresAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

