"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.razorpayRouteService = exports.RazorpayRouteService = void 0;
const env_1 = require("../config/env");
class RazorpayRouteService {
    keyId;
    keySecret;
    routeEnabled;
    constructor() {
        this.keyId = env_1.env.RAZORPAY_KEY_ID || '';
        this.keySecret = env_1.env.RAZORPAY_KEY_SECRET || '';
        this.routeEnabled = env_1.env.RAZORPAY_ROUTE_ENABLED || false;
    }
    /**
     * Returns whether Razorpay Route credentials and flags are active.
     */
    isConfigured() {
        return Boolean(this.keyId && this.keySecret && this.routeEnabled);
    }
    /**
     * Diagnostics status without exposing raw credentials.
     */
    getConfigStatus() {
        const keyIdPresent = Boolean(this.keyId && this.keyId.trim().length > 0);
        const keySecretPresent = Boolean(this.keySecret && this.keySecret.trim().length > 0);
        const isTestMode = this.keyId.startsWith('rzp_test_');
        return {
            configured: this.isConfigured(),
            keyIdPresent,
            keySecretPresent,
            routeEnabled: this.routeEnabled,
            isTestMode,
        };
    }
    /**
     * Initiates linked account creation on Razorpay Route via the documented REST API.
     * Documentation: https://razorpay.com/docs/payments/route/linked-accounts/
     */
    async createLinkedAccount(input) {
        if (!this.isConfigured()) {
            throw new Error('Razorpay Route integration is not configured on this BookMyStudio instance. Platform Route activation required.');
        }
        const authHeader = Buffer.from(`${this.keyId}:${this.keySecret}`).toString('base64');
        const payload = {
            email: input.email,
            phone: input.phone || undefined,
            type: 'standard',
            legal_business_name: input.accountHolderType === 'business' && input.legalBusinessName
                ? input.legalBusinessName
                : input.fullName,
            business_type: input.accountHolderType === 'business'
                ? input.businessType || 'private_limited'
                : 'individual',
            contact_name: input.fullName,
            profile: {
                category: 'services',
                subcategory: 'photography_studios',
                description: 'BookMyStudio Host / Production Vendor',
            },
            notes: {
                platform: 'BookMyStudio',
            },
        };
        try {
            const response = await fetch('https://api.razorpay.com/v1/accounts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Basic ${authHeader}`,
                },
                body: JSON.stringify(payload),
            });
            const data = (await response.json());
            if (!response.ok) {
                const errorDetail = data?.error?.description ||
                    data?.error?.message ||
                    `Razorpay API rejected request with status ${response.status}`;
                throw new Error(`Razorpay Route error: ${errorDetail}`);
            }
            return data;
        }
        catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to communicate with Razorpay Route API';
            console.error('Razorpay Route account creation failed:', message);
            throw new Error(message);
        }
    }
    /**
     * Fetches latest verification status of a linked account from Razorpay.
     */
    async fetchAccountStatus(accountId) {
        if (!this.isConfigured() || !accountId) {
            return null;
        }
        const authHeader = Buffer.from(`${this.keyId}:${this.keySecret}`).toString('base64');
        try {
            const response = await fetch(`https://api.razorpay.com/v1/accounts/${accountId}`, {
                method: 'GET',
                headers: {
                    Authorization: `Basic ${authHeader}`,
                },
            });
            if (!response.ok) {
                return null;
            }
            return (await response.json());
        }
        catch (err) {
            console.warn('Failed to fetch Razorpay account status:', err instanceof Error ? err.message : err);
            return null;
        }
    }
}
exports.RazorpayRouteService = RazorpayRouteService;
exports.razorpayRouteService = new RazorpayRouteService();
//# sourceMappingURL=razorpay-route.service.js.map