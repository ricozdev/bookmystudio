import { apiClient } from './client';
import {
  StudioSpace,
  FilmingLocation,
  ProductionCrewMember,
  EquipmentItem,
  DateAvailabilityResponse,
  BookingQuoteResponse,
} from '../types';

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface SingleResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
  code?: string;
}

export interface BookingPayload {
  listingType: 'studio' | 'location' | 'equipment' | 'crew';
  studioId?: string;
  locationId?: string;
  equipmentId?: string;
  crewId?: string;
  requestedDate: string;
  startTime?: string;
  endTime?: string;
  shiftType: string;
  durationHours: number;
  attendeesCount?: number;
  productionName: string;
  contactEmail: string;
  contactPhone?: string;
  powerAddon?: boolean;
  riggingAddon?: boolean;
  estimatedTotal?: number;
  specialInstructions?: string;
}

export type ListingType = 'studio' | 'location' | 'crew' | 'equipment';
export type ListingReviewStatus =
  | 'DRAFT'
  | 'PENDING_REVIEW'
  | 'APPROVED'
  | 'CHANGES_REQUESTED'
  | 'REJECTED'
  | 'SUSPENDED';

export interface MyListingSummary {
  id: string;
  type: ListingType;
  title: string;
  category: string;
  slug: string;
  thumbnail: string;
  rateLabel: string;
  location?: string;
  publicationStatus?: 'published' | 'draft' | 'archived';
  submittedAt?: string | null;
  updatedAt: string;
  reviewStatus: ListingReviewStatus;
  reviewFeedback?: string | null;
  reviewedAt?: string | null;
  raw: Record<string, unknown>;
}

export interface MyListingsResponse {
  success: boolean;
  data: MyListingSummary[];
  counts: {
    total: number;
    studios: number;
    locations: number;
    crew: number;
    equipment: number;
    published: number;
    pendingReview: number;
    approved: number;
    changesRequested: number;
    drafts: number;
  };
}

export interface PartnerOverviewData {
  listings: {
    total: number;
    active: number;
    drafts: number;
    studios: number;
    locations: number;
    crew: number;
    equipment: number;
  };
  bookings: {
    totalInquiries: number;
    pendingCount: number;
    confirmedCount: number;
    completedCount: number;
    declinedCount: number;
    cancelledCount: number;
  };
  earnings: {
    totalGross: number;
    totalNet: number;
    pendingPipelineGross: number;
    currency: string;
    payoutStatus: string;
    payoutStatusLabel: string;
  };
  recentActivity: Array<{
    id: string;
    productionName: string;
    clientName: string;
    clientCompany: string;
    targetName: string;
    listingType: string;
    requestedDate: string;
    shiftType: string;
    durationHours: number;
    totalAmount: number;
    status: string;
    createdAt: string;
  }>;
}

export interface PartnerOverviewResponse {
  success: boolean;
  data: PartnerOverviewData;
}

export interface AdminListingSummary extends MyListingSummary {
  createdAt: string;
  ownerInfo?: {
    id: string;
    name: string;
    email: string;
    companyName?: string;
    phone?: string;
  } | null;
  reviewedBy?: {
    name: string;
    email: string;
  } | null;
}

export interface AdminListingsResponse {
  success: boolean;
  data: AdminListingSummary[];
  counts: {
    total: number;
    pendingReview: number;
    approved: number;
    changesRequested: number;
    rejected: number;
    suspended: number;
    draft: number;
  };
}

const getRouteSegment = (type: ListingType): string => {
  switch (type) {
    case 'studio':
      return 'studios';
    case 'location':
      return 'locations';
    case 'crew':
      return 'professionals';
    case 'equipment':
      return 'equipment';
  }
};

export interface GeocodedLocationItem {
  id: string;
  name: string;
  street?: string;
  building?: string;
  locality: string;
  city: string;
  state: string;
  pincode: string;
  country?: string;
  coordinates: [number, number]; // [lng, lat]
  formatted: string;
  accuracy?: 'rooftop' | 'street' | 'locality' | 'city' | 'approximate' | 'manual';
  isCustom?: boolean;
}

export const locationApi = {
  search: async (query: string): Promise<{ success: boolean; data: GeocodedLocationItem[] }> => {
    return apiClient.get<{ success: boolean; data: GeocodedLocationItem[] }>(
      `/location/search?q=${encodeURIComponent(query)}`
    );
  },
  reverse: async (lat: number, lng: number): Promise<{ success: boolean; data: GeocodedLocationItem }> => {
    return apiClient.get<{ success: boolean; data: GeocodedLocationItem }>(
      `/location/reverse?lat=${lat}&lng=${lng}`
    );
  },
  getHubs: async (): Promise<{
    success: boolean;
    data: {
      defaultLocation: GeocodedLocationItem;
      popularHubs: GeocodedLocationItem[];
      allHubs: GeocodedLocationItem[];
    };
  }> => {
    return apiClient.get(`/location/hubs`);
  },
};

export const marketplaceApi = {
  // Studios
  getStudioCategories: async (): Promise<{
    success: boolean;
    data: Array<{
      id: string;
      categoryKey: string;
      name: string;
      count: number;
      description: string;
      iconName: string;
    }>;
  }> => {
    return apiClient.get('/studios/meta/categories');
  },

  getStudios: async (params?: Record<string, unknown>): Promise<PaginatedResponse<StudioSpace>> => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '') {
          searchParams.append(key, String(val));
        }
      });
    }
    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return apiClient.get<PaginatedResponse<StudioSpace>>(`/studios${query}`);
  },

  getStudioBySlug: async (slugOrId: string): Promise<SingleResponse<StudioSpace>> => {
    return apiClient.get<SingleResponse<StudioSpace>>(`/studios/${encodeURIComponent(slugOrId)}`);
  },

  // Filming Locations
  getLocations: async (params?: Record<string, unknown>): Promise<PaginatedResponse<FilmingLocation>> => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '') {
          searchParams.append(key, String(val));
        }
      });
    }
    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return apiClient.get<PaginatedResponse<FilmingLocation>>(`/locations${query}`);
  },

  getLocationBySlug: async (slugOrId: string): Promise<SingleResponse<FilmingLocation>> => {
    return apiClient.get<SingleResponse<FilmingLocation>>(`/locations/${encodeURIComponent(slugOrId)}`);
  },

  // Professionals / Heads of Department
  getProfessionals: async (params?: Record<string, unknown>): Promise<PaginatedResponse<ProductionCrewMember>> => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '') {
          searchParams.append(key, String(val));
        }
      });
    }
    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return apiClient.get<PaginatedResponse<ProductionCrewMember>>(`/professionals${query}`);
  },

  getProfessionalBySlug: async (slugOrId: string): Promise<SingleResponse<ProductionCrewMember>> => {
    return apiClient.get<SingleResponse<ProductionCrewMember>>(`/professionals/${encodeURIComponent(slugOrId)}`);
  },

  // Cinema Equipment
  getEquipment: async (params?: Record<string, unknown>): Promise<PaginatedResponse<EquipmentItem>> => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '') {
          searchParams.append(key, String(val));
        }
      });
    }
    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return apiClient.get<PaginatedResponse<EquipmentItem>>(`/equipment${query}`);
  },

  getEquipmentBySlug: async (slugOrId: string): Promise<SingleResponse<EquipmentItem>> => {
    return apiClient.get<SingleResponse<EquipmentItem>>(`/equipment/${encodeURIComponent(slugOrId)}`);
  },

  // Saved Items
  getSavedItems: async (): Promise<{ success: boolean; data: Record<string, unknown>[] }> => {
    return apiClient.get<{ success: boolean; data: Record<string, unknown>[] }>('/saved-items');
  },

  addSavedItem: async (itemType: string, itemId: string): Promise<SingleResponse<Record<string, unknown>>> => {
    return apiClient.post<SingleResponse<Record<string, unknown>>>('/saved-items', { itemType, itemId });
  },

  removeSavedItem: async (id: string): Promise<{ success: boolean; message: string }> => {
    return apiClient.delete<{ success: boolean; message: string }>(`/saved-items/${encodeURIComponent(id)}`);
  },

  // Studio Comparison
  getComparedStudios: async (): Promise<{ success: boolean; data: StudioSpace[] }> => {
    return apiClient.get<{ success: boolean; data: StudioSpace[] }>('/compare');
  },

  addStudioToCompare: async (studioId: string): Promise<SingleResponse<StudioSpace>> => {
    return apiClient.post<SingleResponse<StudioSpace>>('/compare', { studioId });
  },

  removeStudioFromCompare: async (studioId: string): Promise<{ success: boolean; message: string }> => {
    return apiClient.delete<{ success: boolean; message: string }>(`/compare/${encodeURIComponent(studioId)}`);
  },

  clearCompare: async (): Promise<{ success: boolean; message: string }> => {
    return apiClient.delete<{ success: boolean; message: string }>('/compare');
  },

  // Bookings & Availability
  getAvailability: async (
    category: string,
    listingId: string,
    params?: { date?: string; month?: string }
  ): Promise<SingleResponse<DateAvailabilityResponse>> => {
    const searchParams = new URLSearchParams();
    if (params?.date) searchParams.append('date', params.date);
    if (params?.month) searchParams.append('month', params.month);
    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return apiClient.get<SingleResponse<DateAvailabilityResponse>>(
      `/availability/${encodeURIComponent(category)}/${encodeURIComponent(listingId)}${query}`
    );
  },

  calculateQuote: async (payload: {
    category: string;
    listingId: string;
    requestedDate: string;
    startTime: string;
    durationHours: number;
    shiftType?: string;
    powerAddon?: boolean;
    riggingAddon?: boolean;
  }): Promise<SingleResponse<BookingQuoteResponse>> => {
    return apiClient.post<SingleResponse<BookingQuoteResponse>>('/availability/quote', payload);
  },

  addBlockedDate: async (
    category: string,
    listingId: string,
    payload: {
      startDate: string;
      endDate: string;
      startTime?: string;
      endTime?: string;
      reason?: string;
    }
  ): Promise<SingleResponse<Record<string, unknown>>> => {
    return apiClient.post<SingleResponse<Record<string, unknown>>>(
      `/availability/${encodeURIComponent(category)}/${encodeURIComponent(listingId)}/block`,
      payload
    );
  },

  removeBlockedDate: async (
    category: string,
    listingId: string,
    blockId: string
  ): Promise<SingleResponse<Record<string, unknown>>> => {
    return apiClient.post<SingleResponse<Record<string, unknown>>>(
      `/availability/${encodeURIComponent(category)}/${encodeURIComponent(listingId)}/unblock`,
      { blockId }
    );
  },

  createBooking: async (payload: BookingPayload): Promise<SingleResponse<Record<string, unknown>>> => {
    return apiClient.post<SingleResponse<Record<string, unknown>>>('/booking-requests', payload);
  },

  getBookings: async (params?: {
    as?: 'buyer' | 'partner';
  }): Promise<{ success: boolean; data: Record<string, unknown>[] }> => {
    const query = params?.as ? `?as=${params.as}` : '';
    return apiClient.get<{ success: boolean; data: Record<string, unknown>[] }>(`/booking-requests${query}`);
  },

  updateBookingStatus: async (
    id: string,
    status: 'pending' | 'reviewed' | 'confirmed' | 'declined' | 'cancelled'
  ): Promise<SingleResponse<Record<string, unknown>>> => {
    return apiClient.patch<SingleResponse<Record<string, unknown>>>(
      `/booking-requests/${encodeURIComponent(id)}/status`,
      { status }
    );
  },

  // Listing Management (Owner Operations)
  getMyListings: async (): Promise<MyListingsResponse> => {
    return apiClient.get<MyListingsResponse>('/my-listings');
  },

  getPartnerOverview: async (): Promise<PartnerOverviewResponse> => {
    return apiClient.get<PartnerOverviewResponse>('/my-listings/overview');
  },

  createListing: async (
    type: ListingType,
    payload: Record<string, unknown>
  ): Promise<SingleResponse<Record<string, unknown>>> => {
    const segment = getRouteSegment(type);
    return apiClient.post<SingleResponse<Record<string, unknown>>>(`/${segment}`, payload);
  },

  updateListing: async (
    type: ListingType,
    id: string,
    payload: Record<string, unknown>
  ): Promise<SingleResponse<Record<string, unknown>>> => {
    const segment = getRouteSegment(type);
    return apiClient.patch<SingleResponse<Record<string, unknown>>>(`/${segment}/${encodeURIComponent(id)}`, payload);
  },

  updateListingLocation: async (
    type: ListingType,
    id: string,
    payload: {
      locationGeo?: import('../types').LocationGeoPoint;
      locationAddress?: import('../types').LocationAddressDetails;
      location?: string;
      submarket?: string;
      pickupLocation?: string;
      serviceRadiusKm?: number;
      deliveryCoverageKm?: number;
    }
  ): Promise<SingleResponse<Record<string, unknown>>> => {
    return apiClient.patch<SingleResponse<Record<string, unknown>>>(
      `/my-listings/${type}/${encodeURIComponent(id)}/location`,
      payload
    );
  },

  deleteListing: async (type: ListingType, id: string): Promise<{ success: boolean; message: string }> => {
    const segment = getRouteSegment(type);
    return apiClient.delete<{ success: boolean; message: string }>(`/${segment}/${encodeURIComponent(id)}`);
  },

  submitListingForReview: async (
    type: ListingType,
    id: string
  ): Promise<SingleResponse<Record<string, unknown>>> => {
    return apiClient.post<SingleResponse<Record<string, unknown>>>(`/my-listings/${type}/${encodeURIComponent(id)}/publish`);
  },

  publishListing: async (
    type: ListingType,
    id: string
  ): Promise<SingleResponse<Record<string, unknown>>> => {
    return apiClient.post<SingleResponse<Record<string, unknown>>>(`/my-listings/${type}/${encodeURIComponent(id)}/publish`);
  },

  unpublishListing: async (
    type: ListingType,
    id: string
  ): Promise<SingleResponse<Record<string, unknown>>> => {
    return apiClient.post<SingleResponse<Record<string, unknown>>>(`/my-listings/${type}/${encodeURIComponent(id)}/unpublish`);
  },

  // Admin Review Operations
  getAdminListings: async (params?: { status?: string; type?: string }): Promise<AdminListingsResponse> => {
    const searchParams = new URLSearchParams();
    if (params) {
      if (params.status && params.status !== 'all') searchParams.append('status', params.status);
      if (params.type && params.type !== 'all') searchParams.append('type', params.type);
    }
    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return apiClient.get<AdminListingsResponse>(`/admin/listings${query}`);
  },

  reviewListing: async (
    type: ListingType,
    id: string,
    payload: { action: 'APPROVE' | 'REQUEST_CHANGES' | 'REJECT' | 'SUSPEND'; feedback?: string }
  ): Promise<SingleResponse<Record<string, unknown>>> => {
    return apiClient.post<SingleResponse<Record<string, unknown>>>(
      `/admin/listings/${type}/${encodeURIComponent(id)}/review`,
      payload
    );
  },
};
