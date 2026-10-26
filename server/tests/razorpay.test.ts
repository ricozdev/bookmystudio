import assert from 'assert';
import http from 'http';
import express, { Express } from 'express';
import { spawn, ChildProcess } from 'child_process';
import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import { razorpayService } from '../src/services/razorpay.service';
import { bookingRouter } from '../src/routes/booking.routes';
import { BookingRequest } from '../src/models/booking.model';
import { Payment } from '../src/models/payment.model';
import { Studio } from '../src/models/studio.model';
import { User } from '../src/models/user.model';

async function runRazorpayTestSuite() {
  console.log('\n======================================================');
  console.log('🧪 RUNNING BOOKMYSTUDIO RAZORPAY TEST MODE SUITE');
  console.log('======================================================\n');

  let passed = 0;
  let failed = 0;

  async function test(name: string, fn: () => Promise<void> | void) {
    try {
      await fn();
      console.log(`  ✅ PASS: ${name}`);
      passed++;
    } catch (err: any) {
      console.error(`  ❌ FAIL: ${name}`);
      console.error(`     Error: ${err.message}`);
      failed++;
    }
  }

  // =========================================================================
  // 1. UNIT TESTS: Razorpay Service Cryptographic Signatures & Orders
  // =========================================================================

  test('RazorpayService detects Test Mode credentials correctly', () => {
    assert.strictEqual(razorpayService.isConfigured(), true);
    assert.strictEqual(razorpayService.isTestMode(), true);
    assert.strictEqual(razorpayService.getPublicKeyId(), 'rzp_test_Ts7WT70m70q3Pf');
  });

  test('RazorpayService generates and verifies valid HMAC-SHA256 payment signature', () => {
    const orderId = 'order_test_1234567890';
    const paymentId = 'pay_test_0987654321';
    const validSignature = razorpayService.generateTestSignature(orderId, paymentId);

    const isVerified = razorpayService.verifyPaymentSignature({
      razorpayOrderId: orderId,
      razorpayPaymentId: paymentId,
      razorpaySignature: validSignature,
    });

    assert.strictEqual(isVerified, true, 'Valid signature must be verified as true');
  });

  test('RazorpayService rejects tampered payment signature', () => {
    const orderId = 'order_test_1234567890';
    const paymentId = 'pay_test_0987654321';
    const tamperedSignature = 'a'.repeat(64);

    const isVerified = razorpayService.verifyPaymentSignature({
      razorpayOrderId: orderId,
      razorpayPaymentId: paymentId,
      razorpaySignature: tamperedSignature,
    });

    assert.strictEqual(isVerified, false, 'Tampered signature must be rejected');
  });

  test('RazorpayService rejects signature with mismatched order or payment ID', () => {
    const orderId = 'order_test_1234567890';
    const paymentId = 'pay_test_0987654321';
    const signatureForOrder1 = razorpayService.generateTestSignature(orderId, paymentId);

    const isVerified = razorpayService.verifyPaymentSignature({
      razorpayOrderId: 'order_test_DIFFERENT_ORDER',
      razorpayPaymentId: paymentId,
      razorpaySignature: signatureForOrder1,
    });

    assert.strictEqual(isVerified, false, 'Mismatched order must reject signature');
  });

  test('RazorpayService verifies valid webhook signature against raw request body', () => {
    const rawPayload = JSON.stringify({
      event: 'payment.captured',
      payload: {
        payment: { entity: { id: 'pay_test_xyz', order_id: 'order_test_abc', amount: 150000 } },
      },
    });

    const signature = razorpayService.generateWebhookSignature(rawPayload);
    const isVerified = razorpayService.verifyWebhookSignature(rawPayload, signature);

    assert.strictEqual(isVerified, true, 'Valid webhook signature must pass');
  });

  test('RazorpayService rejects invalid or tampered webhook signature', () => {
    const rawPayload = JSON.stringify({ event: 'payment.captured' });
    const isVerified = razorpayService.verifyWebhookSignature(rawPayload, 'invalid_signature_hex');

    assert.strictEqual(isVerified, false, 'Invalid webhook signature must fail');
  });

  // =========================================================================
  // 2. IN-PROCESS DATABASE & TEST SERVER SETUP
  // =========================================================================

  const tmpDbDir = path.join('/tmp', `bms-rzp-test-${Date.now()}`);
  fs.mkdirSync(tmpDbDir, { recursive: true });
  const socketPath = path.join(tmpDbDir, 'mongod.sock');

  console.log(`ℹ️ Spawning in-process test MongoDB on Unix socket: ${socketPath}`);
  const mongoChild: ChildProcess = spawn(
    'mongod',
    ['--dbpath', tmpDbDir, '--bind_ip', socketPath, '--unixSocketPrefix', tmpDbDir],
    { stdio: 'ignore' }
  );

  // Allow mongod child process to initialize socket
  await new Promise((r) => setTimeout(r, 1200));

  const mongoUri = `mongodb://${encodeURIComponent(socketPath)}/bookmystudio_test`;
  await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
  console.log('✅ In-process test MongoDB connected successfully.');

  // Clean test database collections
  if (mongoose.connection.db) {
    const cols = await mongoose.connection.db.listCollections().toArray();
    for (const c of cols) {
      await mongoose.connection.db.collection(c.name).deleteMany({});
    }
  }

  // Seed test Studio
  const testStudio = await Studio.create({
    name: 'Soundstage Stage C',
    slug: 'studio-stage-c',
    category: 'soundstage',
    categoryLabel: 'Soundstage',
    location: 'Mumbai, Maharashtra',
    submarket: 'Andheri West',
    imageUrl: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04',
    imageAlt: 'Soundstage Stage C',
    rating: 4.9,
    reviewCount: 24,
    hourlyRate: 150,
    dayRate10h: 1200,
    publicationStatus: 'published',
    reviewStatus: 'APPROVED',
    description: 'Premier acoustically treated soundstage',
    specs: { sqFt: 6000, gridHeight: '24ft', power: '1200A 3-Phase', access: 'Direct Drive-in' },
    amenities: ['Green Room', 'VIP Lounge', 'Production Office'],
    features: { camlockPower: true, driveInAccess: true, stc60Certified: true, northDaylight: false, gripPackageIncluded: true },
  });

  // Seed test Customer User
  const customerUser = await User.create({
    fullName: 'Christopher Nolan',
    email: 'nolan@syncopyfilms.com',
    phone: '+919876543210',
    companyName: 'Syncopy Films',
    roles: ['CUSTOMER'],
    passwordHash: 'dummy_hash_for_test',
  });

  // Seed second Customer User (Intruder)
  const intruderUser = await User.create({
    fullName: 'Intruder Agency',
    email: 'intruder@otheragency.com',
    phone: '+919876500000',
    companyName: 'Other Agency LLC',
    roles: ['CUSTOMER'],
    passwordHash: 'dummy_hash_for_test',
  });

  // Build Express app with session & rawBody capture
  const app: Express = express();
  app.use(
    express.json({
      verify: (req: any, _res, buf) => {
        req.rawBody = buf;
      },
    })
  );

  let activeTestUser: any = customerUser;

  app.use((req: any, _res, next) => {
    if (activeTestUser) {
      req.user = activeTestUser;
      req.session = {
        userId: activeTestUser._id.toString(),
        destroy: (cb: any) => {
          if (cb) cb();
        },
      };
    } else {
      req.user = undefined;
      req.session = undefined;
    }
    next();
  });

  app.use('/api/booking-requests', bookingRouter);

  const server = http.createServer(app);
  let baseUrl = '';

  await new Promise<void>((resolve) => {
    server.listen(0, () => {
      const port = (server.address() as any).port;
      baseUrl = `http://127.0.0.1:${port}`;
      resolve();
    });
  });

  async function makeRequest(path: string, options: RequestInit = {}) {
    const headers = new Headers(options.headers || {});
    if (options.body && typeof options.body === 'string' && !headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }
    const res = await fetch(`${baseUrl}${path}`, { ...options, headers });
    let body: any = null;
    const text = await res.text();
    try {
      body = JSON.parse(text);
    } catch {
      body = { text };
    }
    return { status: res.status, body };
  }

  // =========================================================================
  // 3. INTEGRATION TESTS: Complete Booking & Razorpay Flow
  // =========================================================================

  let createdBookingId = '';
  let createdOrderId = '';

  await test('Unauthenticated user is rejected when creating checkout order (401)', async () => {
    activeTestUser = null;
    const res = await makeRequest('/api/booking-requests/checkout-order', {
      method: 'POST',
      body: JSON.stringify({
        studioId: testStudio.slug,
        requestedDate: '2026-11-20',
        productionName: 'Unauthorized Shoot',
        contactEmail: 'anon@example.com',
      }),
    });
    activeTestUser = customerUser;
    assert.strictEqual(res.status, 401);
    assert.strictEqual(res.body.success, false);
  });

  await test('Missing required booking details returns validation error (400/422)', async () => {
    const res = await makeRequest('/api/booking-requests/checkout-order', {
      method: 'POST',
      body: JSON.stringify({
        productionName: 'Incomplete Shoot',
      }),
    });
    assert.ok(res.status === 400 || res.status === 422, `Expected 400 or 422 validation error, got ${res.status}`);
    assert.strictEqual(res.body.success, false);
  });

  await test('Customer creates checkout order: sets pending booking, 15m hold, & INR paise amount (201)', async () => {
    const res = await makeRequest('/api/booking-requests/checkout-order', {
      method: 'POST',
      body: JSON.stringify({
        listingType: 'studio',
        studioId: testStudio.slug,
        requestedDate: '2026-11-20',
        startTime: '09:00',
        durationHours: 10,
        productionName: 'Oppenheimer Sequel Commercial',
        contactEmail: customerUser.email,
        contactPhone: customerUser.phone,
        powerAddon: true, // ₹350
        riggingAddon: false,
      }),
    });

    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.body.success, true);
    assert.ok(res.body.data.orderId, 'Must return Razorpay orderId');
    assert.ok(res.body.data.bookingId, 'Must return Booking ID');
    assert.strictEqual(res.body.data.currency, 'INR');

    // 10h Day Rate (₹1200) + Power Addon (₹350) = ₹1550 -> 155,000 paise
    assert.strictEqual(res.body.data.estimatedTotal, 1550);
    assert.strictEqual(res.body.data.amount, 155000);
    assert.strictEqual(res.body.data.keyId, 'rzp_test_Ts7WT70m70q3Pf');

    createdBookingId = res.body.data.bookingId;
    createdOrderId = res.body.data.orderId;

    // Verify database state: status must be pending, paymentStatus unpaid
    const inDb = await BookingRequest.findById(createdBookingId);
    assert.ok(inDb);
    assert.strictEqual(inDb.status, 'pending');
    assert.strictEqual(inDb.paymentStatus, 'unpaid');
    assert.strictEqual(inDb.razorpayOrderId, createdOrderId);
    assert.ok(inDb.holdExpiresAt !== null, 'Hold expiration must be set');

    // Verify Payment record created in DB
    const paymentInDb = await Payment.findOne({ razorpayOrderId: createdOrderId });
    assert.ok(paymentInDb);
    assert.strictEqual(paymentInDb.status, 'created');
    assert.strictEqual(paymentInDb.amount, 155000);
  });

  await test('Client amount tampering is ignored; server calculates authoritative amount', async () => {
    const res = await makeRequest('/api/booking-requests/checkout-order', {
      method: 'POST',
      body: JSON.stringify({
        listingType: 'studio',
        studioId: testStudio.slug,
        requestedDate: '2026-11-20',
        startTime: '09:00',
        durationHours: 10,
        productionName: 'Tampered Amount Shoot',
        contactEmail: customerUser.email,
        contactPhone: customerUser.phone,
        powerAddon: false,
        riggingAddon: false,
        estimatedTotal: 1, // Malicious client attempt: ₹1
      }),
    });

    assert.strictEqual(res.status, 201);
    // Must be calculated from dayRate10h (₹1200 -> 120,000 paise), NOT ₹1
    assert.strictEqual(res.body.data.estimatedTotal, 1200);
    assert.strictEqual(res.body.data.amount, 120000);
    createdOrderId = res.body.data.orderId;
  });

  await test('Idempotent order creation: repeated clicks for same slot refresh hold without duplicate bookings', async () => {
    const beforeCount = await BookingRequest.countDocuments({ customer: customerUser._id });

    const res = await makeRequest('/api/booking-requests/checkout-order', {
      method: 'POST',
      body: JSON.stringify({
        listingType: 'studio',
        studioId: testStudio.slug,
        requestedDate: '2026-11-20',
        startTime: '09:00',
        durationHours: 10,
        productionName: 'Oppenheimer Shoot',
        contactEmail: customerUser.email,
      }),
    });

    assert.strictEqual(res.status, 201);
    const afterCount = await BookingRequest.countDocuments({ customer: customerUser._id });
    assert.strictEqual(afterCount, beforeCount, 'Must reuse pending booking record for same customer/slot');
    createdOrderId = res.body.data.orderId;
  });

  await test('Concurrency protection: another customer attempting to book the held slot is rejected with 409', async () => {
    activeTestUser = intruderUser;

    const res = await makeRequest('/api/booking-requests/checkout-order', {
      method: 'POST',
      body: JSON.stringify({
        listingType: 'studio',
        studioId: testStudio.slug,
        requestedDate: '2026-11-20',
        startTime: '09:00',
        durationHours: 10,
        productionName: 'Intruder Production',
        contactEmail: intruderUser.email,
        contactPhone: intruderUser.phone,
      }),
    });

    activeTestUser = customerUser;

    assert.strictEqual(res.status, 409, 'Must reject concurrent booking attempt on active hold with 409 Conflict');
    assert.strictEqual(res.body.success, false);
    assert.ok(res.body.error.includes('unavailable') || res.body.error.includes('available'));
  });

  await test('Payment verification requires authentication (401)', async () => {
    activeTestUser = null;
    const res = await makeRequest('/api/booking-requests/verify-payment', {
      method: 'POST',
      body: JSON.stringify({
        bookingId: createdBookingId,
        razorpay_order_id: createdOrderId,
        razorpay_payment_id: 'pay_test_dummy',
        razorpay_signature: 'dummy_sig',
      }),
    });
    activeTestUser = customerUser;
    assert.strictEqual(res.status, 401);
  });

  await test('Another customer cannot verify or access someone elses booking (403)', async () => {
    activeTestUser = intruderUser;

    const validSig = razorpayService.generateTestSignature(createdOrderId, 'pay_test_intruder');
    const res = await makeRequest('/api/booking-requests/verify-payment', {
      method: 'POST',
      body: JSON.stringify({
        bookingId: createdBookingId,
        razorpay_order_id: createdOrderId,
        razorpay_payment_id: 'pay_test_intruder',
        razorpay_signature: validSig,
      }),
    });

    activeTestUser = customerUser;
    assert.strictEqual(res.status, 403, 'Unauthorized customer must receive 403 Forbidden');
    assert.strictEqual(res.body.success, false);
  });

  await test('Payment verification with mismatched order ID is rejected (400)', async () => {
    const validSig = razorpayService.generateTestSignature('order_test_WRONG_ORDER', 'pay_test_123');

    const res = await makeRequest('/api/booking-requests/verify-payment', {
      method: 'POST',
      body: JSON.stringify({
        bookingId: createdBookingId,
        razorpay_order_id: 'order_test_WRONG_ORDER',
        razorpay_payment_id: 'pay_test_123',
        razorpay_signature: validSig,
      }),
    });

    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.body.code, 'ORDER_MISMATCH');
  });

  await test('Payment verification with invalid cryptographic signature is rejected (400)', async () => {
    const tamperedSignature = 'b'.repeat(64);

    const res = await makeRequest('/api/booking-requests/verify-payment', {
      method: 'POST',
      body: JSON.stringify({
        bookingId: createdBookingId,
        razorpay_order_id: createdOrderId,
        razorpay_payment_id: 'pay_test_tampered',
        razorpay_signature: tamperedSignature,
      }),
    });

    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.body.code, 'INVALID_SIGNATURE');

    // Booking must remain unconfirmed
    const inDb = await BookingRequest.findById(createdBookingId);
    assert.strictEqual(inDb?.status, 'pending');
    assert.notStrictEqual(inDb?.paymentStatus, 'paid');
  });

  await test('Successful payment verification with valid HMAC-SHA256 confirms booking & marks paid (200)', async () => {
    const paymentId = 'pay_test_verified_999888';
    const validSignature = razorpayService.generateTestSignature(createdOrderId, paymentId);

    const res = await makeRequest('/api/booking-requests/verify-payment', {
      method: 'POST',
      body: JSON.stringify({
        bookingId: createdBookingId,
        razorpay_order_id: createdOrderId,
        razorpay_payment_id: paymentId,
        razorpay_signature: validSignature,
      }),
    });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.data.status, 'confirmed');
    assert.strictEqual(res.body.data.paymentStatus, 'paid');

    // Verify database state: hold converted to permanent reservation
    const inDb = await BookingRequest.findById(createdBookingId);
    assert.ok(inDb);
    assert.strictEqual(inDb.status, 'confirmed');
    assert.strictEqual(inDb.paymentStatus, 'paid');
    assert.strictEqual(inDb.razorpayPaymentId, paymentId);
    assert.strictEqual(inDb.holdExpiresAt, null, 'Hold expiration must be cleared upon confirmation');
    assert.ok(inDb.paidAt !== null, 'Paid timestamp must be set');

    // Verify Payment collection
    const paymentInDb = await Payment.findOne({ razorpayOrderId: createdOrderId });
    assert.ok(paymentInDb);
    assert.strictEqual(paymentInDb.status, 'captured');
    assert.strictEqual(paymentInDb.razorpayPaymentId, paymentId);
    assert.ok(paymentInDb.verifiedAt !== null);
  });

  await test('Duplicate payment verification callback is handled idempotently without duplicate work (200)', async () => {
    const paymentId = 'pay_test_verified_999888';
    const validSignature = razorpayService.generateTestSignature(createdOrderId, paymentId);

    const res = await makeRequest('/api/booking-requests/verify-payment', {
      method: 'POST',
      body: JSON.stringify({
        bookingId: createdBookingId,
        razorpay_order_id: createdOrderId,
        razorpay_payment_id: paymentId,
        razorpay_signature: validSignature,
      }),
    });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(res.body.message.includes('already verified'));
  });

  await test('Payment failure endpoint preserves hold in recoverable state without releasing slot', async () => {
    // Create another pending booking to test failure reporting
    const orderRes = await makeRequest('/api/booking-requests/checkout-order', {
      method: 'POST',
      body: JSON.stringify({
        listingType: 'studio',
        studioId: testStudio.slug,
        requestedDate: '2026-11-25',
        startTime: '10:00',
        durationHours: 5,
        productionName: 'Commercial Shoot Test',
        contactEmail: customerUser.email,
        contactPhone: customerUser.phone,
      }),
    });

    assert.strictEqual(orderRes.status, 201);
    const failBookingId = orderRes.body.data.bookingId;
    const failOrderId = orderRes.body.data.orderId;

    const res = await makeRequest('/api/booking-requests/payment-failed', {
      method: 'POST',
      body: JSON.stringify({
        bookingId: failBookingId,
        razorpay_order_id: failOrderId,
        reason: 'Customer dismissed checkout modal before card input',
      }),
    });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.data.paymentStatus, 'failed');

    const inDb = await BookingRequest.findById(failBookingId);
    assert.ok(inDb);
    assert.strictEqual(inDb.status, 'pending', 'Must remain pending so customer can retry');
    assert.strictEqual(inDb.paymentStatus, 'failed');
    assert.ok(inDb.holdExpiresAt !== null, 'Hold must not be prematurely deleted');
  });

  await test('Webhook listener rejects missing signature header (400)', async () => {
    const res = await makeRequest('/api/booking-requests/webhook', {
      method: 'POST',
      body: JSON.stringify({ event: 'payment.captured' }),
    });
    assert.strictEqual(res.status, 400);
  });

  await test('Webhook listener rejects invalid HMAC signature (400)', async () => {
    const payload = JSON.stringify({ event: 'payment.captured' });
    const res = await makeRequest('/api/booking-requests/webhook', {
      method: 'POST',
      headers: {
        'x-razorpay-signature': '0000000000000000000000000000000000000000000000000000000000000000',
      },
      body: payload,
    });
    assert.strictEqual(res.status, 400);
  });

  await test('Webhook listener with valid signature for payment.captured confirms booking idempotently (200)', async () => {
    // Create a pending booking
    const orderRes = await makeRequest('/api/booking-requests/checkout-order', {
      method: 'POST',
      body: JSON.stringify({
        listingType: 'studio',
        studioId: testStudio.slug,
        requestedDate: '2026-11-28',
        startTime: '09:00',
        durationHours: 10,
        productionName: 'Webhook Shoot',
        contactEmail: customerUser.email,
        contactPhone: customerUser.phone,
      }),
    });

    assert.strictEqual(orderRes.status, 201);
    const webhookOrderId = orderRes.body.data.orderId;
    const webhookPaymentId = 'pay_webhook_live_test_777';

    const webhookPayload = JSON.stringify({
      event: 'payment.captured',
      event_id: 'evt_test_777',
      payload: {
        payment: {
          entity: {
            id: webhookPaymentId,
            order_id: webhookOrderId,
            amount: 120000,
            status: 'captured',
          },
        },
      },
    });

    const validSig = razorpayService.generateWebhookSignature(webhookPayload);

    const res = await makeRequest('/api/booking-requests/webhook', {
      method: 'POST',
      headers: {
        'x-razorpay-signature': validSig,
      },
      body: webhookPayload,
    });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.status, 'ok');

    // Check DB: booking must be confirmed
    const inDb = await BookingRequest.findOne({ razorpayOrderId: webhookOrderId });
    assert.ok(inDb);
    assert.strictEqual(inDb.status, 'confirmed');
    assert.strictEqual(inDb.paymentStatus, 'paid');
    assert.strictEqual(inDb.razorpayPaymentId, webhookPaymentId);

    // Verify webhook event logged in Payment collection
    const paymentRecord = await Payment.findOne({ razorpayOrderId: webhookOrderId });
    assert.ok(paymentRecord);
    assert.ok(paymentRecord.webhookEvents.length > 0);
    assert.strictEqual(paymentRecord.webhookEvents[0].event, 'payment.captured');
  });

  // =========================================================================
  // 4. CLEANUP & TEARDOWN
  // =========================================================================

  await new Promise<void>((resolve) => server.close(() => resolve()));
  await mongoose.disconnect();
  mongoChild.kill();
  try {
    fs.rmSync(tmpDbDir, { recursive: true, force: true });
  } catch {}

  console.log('\n------------------------------------------------------');
  console.log(`Results: ${passed} passed, ${failed} failed`);
  console.log('======================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runRazorpayTestSuite().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
