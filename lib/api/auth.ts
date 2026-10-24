import { apiClient } from './client';

export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  roles: ('CUSTOMER' | 'STUDIO_OWNER' | 'PROFESSIONAL' | 'ADMIN' | 'SUPER_ADMIN' | 'SUPPORT')[];
  isVerified: boolean;
  accountStatus: 'ACTIVE' | 'SUSPENDED' | 'PENDING';
  companyName?: string | null;
  phone?: string | null;
  isPhoneVerified?: boolean;
  phoneVerifiedAt?: string | null;
  bio?: string | null;
  avatarUrl?: string | null;
  lastSeenAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  user?: AuthUser;
  simulatedOtp?: string;
  simulatedToken?: string;
  error?: string;
  code?: string;
  details?: Record<string, string>;
}

export interface PhoneVerificationStatus {
  success: boolean;
  phone: string | null;
  maskedPhone: string | null;
  isPhoneVerified: boolean;
  phoneVerifiedAt: string | null;
  cooldownRemainingSeconds: number;
  error?: string;
}

export interface SendPhoneOtpResponse {
  success: boolean;
  message?: string;
  maskedPhone?: string;
  cooldownSeconds?: number;
  expiresInSeconds?: number;
  simulatedOtp?: string;
  error?: string;
  code?: string;
  retryAfter?: number;
}

export interface VerifyPhoneOtpResponse {
  success: boolean;
  message?: string;
  user?: AuthUser;
  error?: string;
  code?: string;
  remainingAttempts?: number;
}

export const authApi = {
  login: async (credentials: { email: string; password: string }): Promise<AuthResponse> => {
    return apiClient.post<AuthResponse>('/auth/login', credentials);
  },

  register: async (data: {
    fullName: string;
    email: string;
    password: string;
    role?: 'CUSTOMER' | 'STUDIO_OWNER' | 'PROFESSIONAL';
  }): Promise<AuthResponse> => {
    return apiClient.post<AuthResponse>('/auth/register', data);
  },

  logout: async (): Promise<{ success: boolean; message: string }> => {
    return apiClient.post<{ success: boolean; message: string }>('/auth/logout');
  },

  getMe: async (): Promise<{ success: boolean; user: AuthUser }> => {
    return apiClient.get<{ success: boolean; user: AuthUser }>('/auth/me');
  },

  verifyEmail: async (payload: { email: string; otp?: string; token?: string }): Promise<AuthResponse> => {
    return apiClient.post<AuthResponse>('/auth/verify-email', payload);
  },

  resendVerification: async (payload: { email: string }): Promise<AuthResponse> => {
    return apiClient.post<AuthResponse>('/auth/resend-verification', payload);
  },

  forgotPassword: async (payload: { email: string }): Promise<AuthResponse> => {
    return apiClient.post<AuthResponse>('/auth/forgot-password', payload);
  },

  resetPassword: async (payload: { token: string; password: string }): Promise<AuthResponse> => {
    return apiClient.post<AuthResponse>('/auth/reset-password', payload);
  },

  updateProfile: async (updates: {
    fullName?: string;
    companyName?: string | null;
    phone?: string | null;
    bio?: string | null;
    avatarUrl?: string | null;
  }): Promise<AuthResponse> => {
    return apiClient.patch<AuthResponse>('/auth/profile', updates);
  },

  becomeVendor: async (payload: {
    vendorTypes?: ('studio' | 'location' | 'crew' | 'equipment')[];
    role?: 'STUDIO_OWNER' | 'PROFESSIONAL';
    companyName?: string | null;
    phone?: string | null;
    bio?: string | null;
  }): Promise<AuthResponse> => {
    return apiClient.post<AuthResponse>('/auth/become-vendor', payload);
  },

  sendPhoneOtp: async (phone: string): Promise<SendPhoneOtpResponse> => {
    return apiClient.post<SendPhoneOtpResponse>('/auth/phone/send-otp', { phone });
  },

  verifyPhoneOtp: async (otp: string): Promise<VerifyPhoneOtpResponse> => {
    return apiClient.post<VerifyPhoneOtpResponse>('/auth/phone/verify-otp', { otp });
  },

  getPhoneStatus: async (): Promise<PhoneVerificationStatus> => {
    return apiClient.get<PhoneVerificationStatus>('/auth/phone/status');
  },

  removePhone: async (): Promise<{ success: boolean; message: string; user?: AuthUser; error?: string }> => {
    return apiClient.delete<{ success: boolean; message: string; user?: AuthUser; error?: string }>('/auth/phone');
  },
};

