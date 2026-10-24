import { apiClient } from './client';
import { AuthUser } from './auth';

export interface AdminBookingItem {
  id: string;
  productionName?: string;
  listingType: string;
  contactEmail: string;
  contactPhone?: string;
  requestedDate: string;
  shiftType?: string;
  durationHours?: number;
  estimatedTotal?: number;
  status: string;
  createdAt: string;
  customer?: {
    fullName?: string;
    email?: string;
    phone?: string;
  };
}

export interface AdminMetrics {
  users: {
    total: number;
    active: number;
    suspended: number;
    customers: number;
    partners: number;
    admins: number;
    superAdmins: number;
    onlinePresence?: {
      status: 'UNAVAILABLE';
      message: string;
    };
  };
  financials?: {
    realizedRevenue: number;
    realizedRevenueNote: string;
    estimatedHoldVolume: number;
    pendingHoldVolume: number;
    confirmedHoldVolume: number;
    currency: string;
  };
  listings: {
    total: number;
    studios: number;
    locations: number;
    crew: number;
    equipment: number;
    pendingReview: number;
    approved: number;
  };
  bookings: {
    total: number;
    pending: number;
    confirmed: number;
    declined?: number;
    cancelled?: number;
    estimatedTotalSum?: number;
  };
  monthlyTrends?: {
    registrations: { _id: string; count: number }[];
    bookings: { _id: string; count: number; value: number }[];
  };
  recentActivity: AdminAuditLogItem[];
  recentBookings: AdminBookingItem[];
}

export interface AdminAuditLogItem {
  id: string;
  adminId: string;
  adminEmail: string;
  adminName: string;
  action: string;
  targetType: string;
  targetId: string;
  targetLabel: string;
  details?: Record<string, unknown>;
  status: 'SUCCESS' | 'FAILURE';
  createdAt: string;
}

export interface AdminPagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface AdminUsersResponse {
  success: boolean;
  data: AuthUser[];
  pagination: AdminPagination;
}

export type AdminPartnerItem = AuthUser & {
  listingsCount: {
    studios: number;
    locations: number;
    crew: number;
    equipment: number;
    total: number;
  };
  bookingsCount?: number;
};

export interface AdminPartnersResponse {
  success: boolean;
  data: AdminPartnerItem[];
  pagination: AdminPagination;
}

export interface AdminBookingsResponse {
  success: boolean;
  data: AdminBookingItem[];
  pagination: AdminPagination;
}

export interface AdminAuditLogsResponse {
  success: boolean;
  data: AdminAuditLogItem[];
  pagination: AdminPagination;
}

export interface AccessManagementResponse {
  success: boolean;
  data: AuthUser[];
}

export const adminApi = {
  getMetrics: async () => {
    return apiClient.get<{ success: boolean; data: AdminMetrics }>('/admin/metrics');
  },

  getUsers: async (params?: { page?: number; limit?: number; search?: string; role?: string; status?: string }) => {
    const q = new URLSearchParams();
    if (params?.page) q.set('page', params.page.toString());
    if (params?.limit) q.set('limit', params.limit.toString());
    if (params?.search) q.set('search', params.search);
    if (params?.role) q.set('role', params.role);
    if (params?.status) q.set('status', params.status);
    const query = q.toString() ? `?${q.toString()}` : '';
    return apiClient.get<AdminUsersResponse>(`/admin/users${query}`);
  },

  updateUserStatus: async (userId: string, status: 'ACTIVE' | 'SUSPENDED' | 'PENDING', reason?: string) => {
    return apiClient.patch<{ success: boolean; message: string; user: AuthUser }>(`/admin/users/${userId}/status`, {
      status,
      reason,
    });
  },

  getPartners: async (params?: { page?: number; limit?: number; search?: string; status?: string }) => {
    const q = new URLSearchParams();
    if (params?.page) q.set('page', params.page.toString());
    if (params?.limit) q.set('limit', params.limit.toString());
    if (params?.search) q.set('search', params.search);
    if (params?.status) q.set('status', params.status);
    const query = q.toString() ? `?${q.toString()}` : '';
    return apiClient.get<AdminPartnersResponse>(`/admin/partners${query}`);
  },

  getBookings: async (params?: { page?: number; limit?: number; search?: string; status?: string }) => {
    const q = new URLSearchParams();
    if (params?.page) q.set('page', params.page.toString());
    if (params?.limit) q.set('limit', params.limit.toString());
    if (params?.search) q.set('search', params.search);
    if (params?.status) q.set('status', params.status);
    const query = q.toString() ? `?${q.toString()}` : '';
    return apiClient.get<AdminBookingsResponse>(`/admin/bookings${query}`);
  },

  updateBookingStatus: async (bookingId: string, status: string, note?: string) => {
    return apiClient.patch<{ success: boolean; message: string; data: AdminBookingItem }>(`/admin/bookings/${bookingId}/status`, {
      status,
      note,
    });
  },

  getAccessManagement: async () => {
    return apiClient.get<AccessManagementResponse>('/admin/access-management');
  },

  assignAdminRole: async (payload: { userId: string; role: 'SUPER_ADMIN' | 'ADMIN' | 'SUPPORT'; action: 'ASSIGN' | 'REVOKE' }) => {
    return apiClient.post<{ success: boolean; message: string; user: AuthUser }>('/admin/access-management/assign', payload);
  },

  getAuditLogs: async (params?: { page?: number; limit?: number; action?: string; targetType?: string }) => {
    const q = new URLSearchParams();
    if (params?.page) q.set('page', params.page.toString());
    if (params?.limit) q.set('limit', params.limit.toString());
    if (params?.action) q.set('action', params.action);
    if (params?.targetType) q.set('targetType', params.targetType);
    const query = q.toString() ? `?${q.toString()}` : '';
    return apiClient.get<AdminAuditLogsResponse>(`/admin/audit-logs${query}`);
  },
};

