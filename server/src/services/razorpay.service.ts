import crypto from 'crypto';
import { env } from '../config/env';

export interface RazorpayOrderInput {
  amount: number; // Smallest currency unit (paise for INR, e.g. 50000 = ₹500)
  currency?: string; // Default: 'INR'
  receipt: string;
  notes?: Record<string, string | number>;
}

export interface RazorpayOrderResponse {
  id: string;
  entity: 'order';
  amount: number;
  amount_paid: number;
  amount_due: number;
  currency: string;
  receipt: string;
  status: 'created' | 'attempted' | 'paid';
  attempts: number;
  notes?: Record<string, any>;
  created_at: number;
}

export interface RazorpayPaymentDetails {
  id: string;
  entity: 'payment';
  amount: number;
  currency: string;
  status: 'created' | 'authorized' | 'captured' | 'refunded' | 'failed';
  order_id: string;
  method: string;
  captured: boolean;
  description?: string;
  card_id?: string;
  bank?: string;
  wallet?: string;
  vpa?: string;
  email?: string;
  contact?: string;
  error_code?: string;
  error_description?: string;
  created_at: number;
}

export interface SignatureVerificationInput {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}

export class RazorpayService {
  private keyId: string;
  private keySecret: string;
  private webhookSecret: string;
  private apiBaseUrl: string = 'https://api.razorpay.com/v1';

  constructor() {
    this.keyId = env.RAZORPAY_KEY_ID || '';
    this.keySecret = env.RAZORPAY_KEY_SECRET || '';
    this.webhookSecret = env.RAZORPAY_WEBHOOK_SECRET || '';
  }

  /**
   * Returns true if Razorpay Key ID and Secret are configured.
   */
  public isConfigured(): boolean {
    return Boolean(this.keyId && this.keySecret && this.keyId.trim().length > 0 && this.keySecret.trim().length > 0);
  }

  /**
   * Returns true if configured credentials belong to Razorpay Test Mode ('rzp_test_...').
   */
  public isTestMode(): boolean {
    return this.keyId.startsWith('rzp_test_');
  }

  /**
   * Returns the public Key ID safe for client-side consumption.
   */
  public getPublicKeyId(): string {
    return this.keyId;
  }

  /**
   * Creates an order with Razorpay via Orders REST API.
   * Documentation: https://razorpay.com/docs/api/orders/create/
   */
  public async createOrder(input: RazorpayOrderInput): Promise<RazorpayOrderResponse> {
    const amount = Math.round(input.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      throw new Error(`Invalid order amount: ${input.amount}. Must be a positive integer in smallest currency subunit.`);
    }

    const currency = (input.currency || 'INR').toUpperCase();
    const payload = {
      amount,
      currency,
      receipt: input.receipt.slice(0, 40),
      notes: input.notes || {},
    };

    if (this.isConfigured()) {
      const authHeader = `Basic ${Buffer.from(`${this.keyId}:${this.keySecret}`).toString('base64')}`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      try {
        const response = await fetch(`${this.apiBaseUrl}/orders`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: authHeader,
          },
          body: JSON.stringify(payload),
          signal: controller.signal,
        });

        const data: any = await response.json().catch(() => null);

        if (!response.ok) {
          const errMsg = data?.error?.description || data?.error?.message || `Razorpay order creation failed (HTTP ${response.status})`;
          console.error(`[RazorpayService] Order creation error: ${errMsg}`);
          throw new Error(errMsg);
        }

        return data as RazorpayOrderResponse;
      } catch (err: any) {
        if (err.name === 'AbortError') {
          throw new Error('Razorpay order creation timed out after 10 seconds.');
        }
        // In local development or testing with network restrictions, fallback to simulated test order
        if (process.env.NODE_ENV === 'test' || !this.isConfigured()) {
          return this.createSimulatedTestOrder(payload);
        }
        throw err;
      } finally {
        clearTimeout(timeoutId);
      }
    }

    // Fallback simulation for offline testing
    return this.createSimulatedTestOrder(payload);
  }

  /**
   * Verifies payment signature using HMAC SHA-256 and constant-time string comparison.
   * Standard checkout verification formula: HMAC_SHA256(order_id + "|" + payment_id, secret) == signature
   * Documentation: https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/build-integration#step-4-verify-payment-signature
   */
  public verifyPaymentSignature(input: SignatureVerificationInput): boolean {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = input;

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return false;
    }

    const secret = this.keySecret;
    if (!secret) {
      console.warn('[RazorpayService] Cannot verify payment signature: RAZORPAY_KEY_SECRET is not configured.');
      return false;
    }

    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest('hex');

    const expectedBuf = Buffer.from(expectedSignature, 'utf8');
    const actualBuf = Buffer.from(razorpaySignature, 'utf8');

    if (expectedBuf.length !== actualBuf.length) {
      return false;
    }

    return crypto.timingSafeEqual(expectedBuf, actualBuf);
  }

  /**
   * Verifies Razorpay Webhook signature against raw request body using HMAC SHA-256.
   * Documentation: https://razorpay.com/docs/webhooks/validate-test/
   */
  public verifyWebhookSignature(rawBody: string | Buffer, signature: string, customSecret?: string): boolean {
    const secret = customSecret || this.webhookSecret;
    if (!secret) {
      console.warn('[RazorpayService] Cannot verify webhook: Webhook secret not configured.');
      return false;
    }
    if (!signature || !rawBody) {
      return false;
    }

    const bodyBuffer = Buffer.isBuffer(rawBody) ? rawBody : Buffer.from(rawBody, 'utf8');
    const expectedSignature = crypto.createHmac('sha256', secret).update(bodyBuffer).digest('hex');

    const expectedBuf = Buffer.from(expectedSignature, 'utf8');
    const actualBuf = Buffer.from(signature, 'utf8');

    if (expectedBuf.length !== actualBuf.length) {
      return false;
    }

    return crypto.timingSafeEqual(expectedBuf, actualBuf);
  }

  /**
   * Fetches payment details from Razorpay to check capture status.
   * Documentation: https://razorpay.com/docs/api/payments/#fetch-a-payment
   */
  public async fetchPayment(paymentId: string): Promise<RazorpayPaymentDetails | null> {
    if (!this.isConfigured() || !paymentId) {
      return null;
    }

    const authHeader = `Basic ${Buffer.from(`${this.keyId}:${this.keySecret}`).toString('base64')}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      const response = await fetch(`${this.apiBaseUrl}/payments/${paymentId}`, {
        method: 'GET',
        headers: {
          Authorization: authHeader,
        },
        signal: controller.signal,
      });

      if (!response.ok) {
        console.warn(`[RazorpayService] fetchPayment(${paymentId}) returned HTTP ${response.status}`);
        return null;
      }

      return (await response.json()) as RazorpayPaymentDetails;
    } catch (err: any) {
      console.warn(`[RazorpayService] fetchPayment error: ${err.message}`);
      return null;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * Generates a valid test signature for automated integration tests.
   */
  public generateTestSignature(orderId: string, paymentId: string, customSecret?: string): string {
    const secret = customSecret || this.keySecret;
    return crypto.createHmac('sha256', secret).update(`${orderId}|${paymentId}`).digest('hex');
  }

  /**
   * Generates a valid webhook signature for automated webhook integration tests.
   */
  public generateWebhookSignature(rawBody: string | Buffer, customSecret?: string): string {
    const secret = customSecret || this.webhookSecret;
    const bodyBuffer = Buffer.isBuffer(rawBody) ? rawBody : Buffer.from(rawBody, 'utf8');
    return crypto.createHmac('sha256', secret).update(bodyBuffer).digest('hex');
  }

  private createSimulatedTestOrder(payload: { amount: number; currency: string; receipt: string; notes?: any }): RazorpayOrderResponse {
    const rand = crypto.randomBytes(6).toString('hex');
    const simulatedId = `order_${rand}`;
    return {
      id: simulatedId,
      entity: 'order',
      amount: payload.amount,
      amount_paid: 0,
      amount_due: payload.amount,
      currency: payload.currency,
      receipt: payload.receipt,
      status: 'created',
      attempts: 0,
      notes: payload.notes || {},
      created_at: Math.floor(Date.now() / 1000),
    };
  }
}

export const razorpayService = new RazorpayService();

