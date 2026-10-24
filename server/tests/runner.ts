process.env.NODE_ENV = 'test';
import { Server } from 'http';
import mongoose from 'mongoose';
import { connectDatabase, disconnectDatabase, assertIsTestDatabase } from '../src/config/database';
import { createApp } from '../src/app';
import { User } from '../src/models/user.model';

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
}

class TestClient {
  private cookie: string = '';
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  public setCookie(cookie: string) {
    this.cookie = cookie;
  }

  public clearCookie() {
    this.cookie = '';
  }

  async request(path: string, options: RequestInit = {}): Promise<{ status: number; body: any; headers: Headers }> {
    const headers = new Headers(options.headers || {});
    if (this.cookie) {
      headers.set('Cookie', this.cookie);
    }
    if (options.body && typeof options.body === 'string' && !headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }

    const res = await fetch(`${this.baseUrl}${path}`, {
      ...options,
      headers,
    });

    const setCookie = res.headers.get('set-cookie');
    if (setCookie) {
      const match = setCookie.match(/bms_sid=[^;]+/);
      if (match) {
        this.cookie = match[0];
      }
    }

    let body: any = null;
    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      body = await res.json();
    } else {
      body = await res.text();
    }

    return { status: res.status, body, headers: res.headers };
  }
}

async function runTests() {
  console.log('\n======================================================');
  console.log('🧪 RUNNING BOOKMYSTUDIO BACKEND INTEGRATION TEST SUITE');
  console.log('======================================================\n');

  process.env.NODE_ENV = 'test';
  await connectDatabase(undefined, { isTest: true });
  assertIsTestDatabase('Test Suite Pre-Flight Clean');

  // Purge isolated test database collections so test run starts in a pristine, isolated state
  if (mongoose.connection.db) {
    const collections = await mongoose.connection.db.listCollections().toArray();
    for (const col of collections) {
      await mongoose.connection.db.collection(col.name).deleteMany({});
    }
  }

  const app = createApp();
  const port = 4999;
  let server: Server;

  await new Promise<void>((resolve) => {
    server = app.listen(port, () => resolve());
  });

  const client = new TestClient(`http://localhost:${port}`);
  const hostClient = new TestClient(`http://localhost:${port}`);
  const adminClient = new TestClient(`http://localhost:${port}`);
  const upgradeClient = new TestClient(`http://localhost:${port}`);
  const results: TestResult[] = [];

  const runTest = async (name: string, fn: () => Promise<void>) => {
    try {
      await fn();
      results.push({ name, passed: true });
      console.log(`  ✅ PASS: ${name}`);
    } catch (err: any) {
      results.push({ name, passed: false, error: err.message });
      console.error(`  ❌ FAIL: ${name}`);
      console.error(`     Error: ${err.message}`);
    }
  };

  try {
    // 1. Health check
    await runTest('GET /api/health returns healthy database status', async () => {
      const res = await client.request('/api/health');
      if (res.status !== 200) throw new Error(`Expected status 200, got ${res.status}`);
      if (res.body.database !== 'connected') throw new Error('Database not connected in health response');
    });

    // 2. Authentication: Register Customer
    const testEmail = `test.producer.${Date.now()}@agency.com`;
    let verificationOtp = '';

    await runTest('POST /api/auth/register creates a new user and returns OTP code', async () => {
      const res = await client.request('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          fullName: 'Test Automation Producer',
          email: testEmail,
          password: 'SecurePassword123!',
          role: 'CUSTOMER',
        }),
      });

      if (res.status !== 201) throw new Error(`Expected 201, got ${res.status}: ${JSON.stringify(res.body)}`);
      if (!res.body.user || res.body.user.email !== testEmail) throw new Error('User not returned correctly');
      if (res.body.user.passwordHash) throw new Error('Security hazard: passwordHash leaked in response!');
      verificationOtp = res.body.simulatedOtp;
    });

    // 3. Duplicate Registration Rejection
    await runTest('POST /api/auth/register rejects duplicate email with 409', async () => {
      const res = await client.request('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          fullName: 'Duplicate Producer',
          email: testEmail,
          password: 'SecurePassword123!',
        }),
      });
      if (res.status !== 409) throw new Error(`Expected status 409 Conflict, got ${res.status}`);
      if (res.body.code !== 'EMAIL_ALREADY_EXISTS') throw new Error(`Expected code EMAIL_ALREADY_EXISTS, got ${res.body.code}`);
    });

    // 4. Invalid credentials rejection
    await runTest('POST /api/auth/login rejects incorrect password with 401', async () => {
      const res = await client.request('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: testEmail,
          password: 'WrongPassword999!',
        }),
      });
      if (res.status !== 401) throw new Error(`Expected status 401, got ${res.status}`);
      if (res.body.code !== 'INVALID_CREDENTIALS') throw new Error('Expected INVALID_CREDENTIALS code');
    });

    // 5. Successful Login & Session Creation
    await runTest('POST /api/auth/login succeeds with correct password and sets session cookie', async () => {
      const res = await client.request('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: testEmail,
          password: 'SecurePassword123!',
        }),
      });
      if (res.status !== 200) throw new Error(`Expected status 200, got ${res.status}`);
      if (!res.body.user || res.body.user.email !== testEmail) throw new Error('User data mismatch');
    });

    // 6. Active Session Hydration
    await runTest('GET /api/auth/me returns authenticated user from active session', async () => {
      const res = await client.request('/api/auth/me');
      if (res.status !== 200) throw new Error(`Expected status 200, got ${res.status}`);
      if (res.body.user.email !== testEmail) throw new Error('Authenticated user mismatch');
    });

    // 7. Email OTP Verification
    await runTest('POST /api/auth/verify-email verifies account with 6-digit code', async () => {
      const res = await client.request('/api/auth/verify-email', {
        method: 'POST',
        body: JSON.stringify({
          email: testEmail,
          otp: verificationOtp,
        }),
      });
      if (res.status !== 200) throw new Error(`Expected status 200, got ${res.status}: ${JSON.stringify(res.body)}`);
      if (!res.body.user.isVerified) throw new Error('User isVerified should be true');
    });

    // 8. Forgot Password Dispatch
    let resetToken = '';
    await runTest('POST /api/auth/forgot-password generates recovery token', async () => {
      const res = await client.request('/api/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email: testEmail }),
      });
      if (res.status !== 200) throw new Error(`Expected status 200, got ${res.status}`);
      resetToken = res.body.simulatedToken;
    });

    // 9. Reset Password Execution
    await runTest('POST /api/auth/reset-password securely updates password with valid token', async () => {
      const res = await client.request('/api/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({
          token: resetToken,
          password: 'BrandNewSecurePassword456!',
        }),
      });
      if (res.status !== 200) throw new Error(`Expected status 200, got ${res.status}`);
    });

    // =========================================================================
    // MULTI-TYPE LISTING CREATION, LIFECYCLE & ADMIN CURATION REVIEW TESTS
    // =========================================================================

    // 10. Host Registration & Authentication
    const hostEmail = `host.operator.${Date.now()}@studios.com`;
    let hostUserId = '';

    await runTest('POST /api/auth/register registers a verified host/studio owner', async () => {
      const res = await hostClient.request('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          fullName: 'Stage Operator Host',
          email: hostEmail,
          password: 'HostPassword123!',
          role: 'STUDIO_OWNER',
        }),
      });
      if (res.status !== 201) throw new Error(`Expected 201, got ${res.status}`);
      hostUserId = res.body.user.id;
      await User.updateOne({ _id: hostUserId }, { $set: { isVerified: true } });
    });

    // =========================================================================
    // PHONE NUMBER & OTP VERIFICATION TESTS
    // =========================================================================

    const hostPhone = '+919' + Math.floor(100000000 + Math.random() * 899999999);
    let hostOtp = '';

    await runTest('GET /api/auth/phone/status returns unverified status for new user', async () => {
      const res = await hostClient.request('/api/auth/phone/status');
      if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
      if (res.body.isPhoneVerified !== false) throw new Error(`Expected isPhoneVerified=false`);
    });

    await runTest('POST /api/auth/phone/send-otp validates phone number format', async () => {
      const res = await hostClient.request('/api/auth/phone/send-otp', {
        method: 'POST',
        body: JSON.stringify({ phone: '123' }),
      });
      if (res.status !== 400 && res.status !== 422) {
        throw new Error(`Expected 400 or 422 for invalid phone, got ${res.status}`);
      }
    });

    await runTest('POST /api/auth/phone/send-otp dispatches OTP and returns masked phone', async () => {
      const res = await hostClient.request('/api/auth/phone/send-otp', {
        method: 'POST',
        body: JSON.stringify({ phone: hostPhone }),
      });
      if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}: ${JSON.stringify(res.body)}`);
      if (!res.body.maskedPhone) throw new Error('Expected maskedPhone in response');
      if (!res.body.simulatedOtp) throw new Error('Expected simulatedOtp in test response');
      hostOtp = res.body.simulatedOtp;
    });

    await runTest('POST /api/auth/phone/send-otp enforces 60-second cooldown rate limit', async () => {
      const res = await hostClient.request('/api/auth/phone/send-otp', {
        method: 'POST',
        body: JSON.stringify({ phone: hostPhone }),
      });
      if (res.status !== 429) throw new Error(`Expected 429, got ${res.status}`);
      if (res.body.code !== 'OTP_COOLDOWN_ACTIVE') throw new Error(`Expected code OTP_COOLDOWN_ACTIVE`);
    });

    await runTest('POST /api/auth/phone/verify-otp rejects invalid code and tracks attempt limit', async () => {
      const res = await hostClient.request('/api/auth/phone/verify-otp', {
        method: 'POST',
        body: JSON.stringify({ otp: '000000' }),
      });
      if (res.status !== 400) throw new Error(`Expected 400, got ${res.status}`);
      if (res.body.code !== 'INVALID_OTP') throw new Error(`Expected code INVALID_OTP`);
      if (res.body.remainingAttempts !== 4) throw new Error(`Expected remainingAttempts=4, got ${res.body.remainingAttempts}`);
    });

    await runTest('POST /api/auth/phone/verify-otp verifies phone number with valid OTP', async () => {
      const res = await hostClient.request('/api/auth/phone/verify-otp', {
        method: 'POST',
        body: JSON.stringify({ otp: hostOtp }),
      });
      if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
      if (res.body.user.isPhoneVerified !== true) throw new Error('Expected isPhoneVerified=true');
    });

    await runTest('GET /api/auth/phone/status returns verified phone status', async () => {
      const res = await hostClient.request('/api/auth/phone/status');
      if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
      if (res.body.isPhoneVerified !== true) throw new Error('Expected isPhoneVerified=true');
      if (res.body.phone !== hostPhone) throw new Error(`Expected phone=${hostPhone}`);
    });

    await runTest('POST /api/auth/phone/send-otp prevents reusing verified phone on another account', async () => {
      const otherClient = new TestClient(`http://localhost:${port}`);
      await otherClient.request('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          fullName: 'Duplicate Phone Tester',
          email: `dup.phone.${Date.now()}@agency.com`,
          password: 'Password123!',
          role: 'CUSTOMER',
        }),
      });
      const res = await otherClient.request('/api/auth/phone/send-otp', {
        method: 'POST',
        body: JSON.stringify({ phone: hostPhone }),
      });
      if (res.status !== 409) throw new Error(`Expected 409 Conflict, got ${res.status}`);
      if (res.body.code !== 'PHONE_ALREADY_VERIFIED') {
        throw new Error(`Expected code PHONE_ALREADY_VERIFIED, got ${res.body.code}`);
      }
    });

    await runTest('POST /api/my-listings/:type/:id/publish blocks unverified users with 403', async () => {
      const unverifiedClient = new TestClient(`http://localhost:${port}`);
      const regRes = await unverifiedClient.request('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          fullName: 'Unverified Operator',
          email: `unverified.${Date.now()}@studios.com`,
          password: 'Password123!',
          role: 'STUDIO_OWNER',
        }),
      });
      if (regRes.status !== 201) throw new Error(`Expected 201 on register, got ${regRes.status}`);
      await User.updateOne({ _id: regRes.body.user.id }, { $set: { isVerified: true } });

      const draftRes = await unverifiedClient.request('/api/studios', {
        method: 'POST',
        body: JSON.stringify({
          name: `Unverified Draft Studio ${Date.now()}`,
          category: 'soundstage',
          location: 'Andheri West, Mumbai',
          submarket: 'Andheri West',
          dayRate10h: 1200,
          hourlyRate: 150,
          description: 'A soundstage draft listing',
          specs: {
            sqFt: 3000,
            gridHeight: '18 ft',
            power: '400A Camlock',
            access: 'Ground floor drive-in gate',
          },
          imageUrl: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04',
          isDraft: true,
        }),
      });
      if (draftRes.status !== 201) throw new Error(`Expected 201 on draft create, got ${draftRes.status}: ${JSON.stringify(draftRes.body)}`);
      const draftId = draftRes.body.data._id || draftRes.body.data.id;

      const pubRes = await unverifiedClient.request(`/api/my-listings/studio/${draftId}/publish`, {
        method: 'POST',
      });
      if (pubRes.status !== 403) throw new Error(`Expected 403, got ${pubRes.status}`);
      if (pubRes.body.code !== 'PHONE_VERIFICATION_REQUIRED') {
        throw new Error(`Expected code PHONE_VERIFICATION_REQUIRED, got ${pubRes.body.code}`);
      }
    });

    await runTest('DELETE /api/auth/phone removes phone number and resets verification status', async () => {
      const tempClient = new TestClient(`http://localhost:${port}`);
      const regRes = await tempClient.request('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          fullName: 'Temp Phone User',
          email: `temp.phone.${Date.now()}@studios.com`,
          password: 'Password123!',
          role: 'STUDIO_OWNER',
        }),
      });
      await User.updateOne({ _id: regRes.body.user.id }, { $set: { isVerified: true } });

      // Send & verify OTP
      const tempPhone = '+919' + Math.floor(100000000 + Math.random() * 899999999);
      const sendRes = await tempClient.request('/api/auth/phone/send-otp', {
        method: 'POST',
        body: JSON.stringify({ phone: tempPhone }),
      });
      await tempClient.request('/api/auth/phone/verify-otp', {
        method: 'POST',
        body: JSON.stringify({ otp: sendRes.body.simulatedOtp }),
      });

      // Remove phone
      const delRes = await tempClient.request('/api/auth/phone', { method: 'DELETE' });
      if (delRes.status !== 200) throw new Error(`Expected 200, got ${delRes.status}`);

      // Verify status is reset
      const statusRes = await tempClient.request('/api/auth/phone/status');
      if (statusRes.body.isPhoneVerified !== false) throw new Error('Expected isPhoneVerified=false');
      if (statusRes.body.phone !== null) throw new Error('Expected phone=null');
    });

    // 11. Multi-Type Listing Creation: Studio Space (Immediate Publication)
    let createdStudioId = '';
    let createdStudioSlug = '';
    const uniqueStudioName = `Apex Stage C Soundstage ${Date.now()}`;

    await runTest('POST /api/studios creates studio and publishes immediately without admin review', async () => {
      const res = await hostClient.request('/api/studios', {
        method: 'POST',
        body: JSON.stringify({
          name: uniqueStudioName,
          category: 'soundstage',
          categoryLabel: 'Acoustic Soundstage',
          location: 'Andheri West, Mumbai, Maharashtra',
          submarket: 'Andheri West',
          locationGeo: { type: 'Point', coordinates: [72.8277, 19.1363] },
          locationAddress: {
            formatted: 'Plot 42, Off New Link Road, Andheri West, Mumbai, Maharashtra - 400053',
            building: 'Apex Soundstage Stage C',
            street: 'Off New Link Road',
            locality: 'Andheri West',
            city: 'Mumbai',
            state: 'Maharashtra',
            pincode: '400053',
            country: 'India',
            accuracy: 'rooftop',
            isExactAddressPublic: true,
            mapUrl: 'https://maps.google.com/?q=19.1363,72.8277',
          },
          mapUrl: 'https://maps.google.com/?q=19.1363,72.8277',
          description: 'High-clearance commercial stage with 600A Camlock distro.',
          specs: {
            sqFt: 4500,
            gridHeight: '22 ft',
            power: '600A 3-Phase Camlock',
            access: 'Ground floor 16ft roll-up gate',
          },
          amenities: ['HMU', 'Client Lounge', 'Fiber'],
          equipmentHighlight: 'Full 5-ton grip package',
          hourlyRate: 200,
          dayRate10h: 1800,
          imageUrl: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04',
          features: {
            camlockPower: true,
            driveInAccess: true,
            stc60Certified: true,
            northDaylight: false,
            gripPackageIncluded: true,
          },
        }),
      });
      if (res.status !== 201) throw new Error(`Expected 201, got ${res.status}: ${JSON.stringify(res.body)}`);
      if (res.body.data.publicationStatus !== 'published') {
        throw new Error(`Expected publicationStatus=published, got ${res.body.data.publicationStatus}`);
      }
      if (res.body.data.reviewStatus !== 'APPROVED') {
        throw new Error(`Expected reviewStatus=APPROVED, got ${res.body.data.reviewStatus}`);
      }
      createdStudioId = res.body.data._id || res.body.data.id;
      createdStudioSlug = res.body.data.slug;
    });

    // 12. Multi-Type Listing Creation: Filming Location (Immediate Publication)
    let createdLocationId = '';
    let createdLocationSlug = '';
    const uniqueLocName = `Industrial Brick Terminal ${Date.now()}`;

    await runTest('POST /api/locations creates location and publishes immediately', async () => {
      const res = await hostClient.request('/api/locations', {
        method: 'POST',
        body: JSON.stringify({
          name: uniqueLocName,
          category: 'warehouse',
          categoryLabel: 'Industrial Warehouse',
          location: 'Film City, Goregaon East, Mumbai, Maharashtra',
          submarket: 'Goregaon East',
          locationGeo: { type: 'Point', coordinates: [72.8872, 19.1601] },
          locationAddress: {
            formatted: 'Dadasaheb Phalke Chitranagari, Film City, Goregaon East, Mumbai, Maharashtra - 400065',
            locality: 'Goregaon East',
            city: 'Mumbai',
            state: 'Maharashtra',
            pincode: '400065',
            country: 'India',
            accuracy: 'street',
            isExactAddressPublic: true,
            mapUrl: 'https://maps.google.com/?q=19.1601,72.8872',
          },
          mapUrl: 'https://maps.google.com/?q=19.1601,72.8872',
          description: 'Sprawling concrete and red brick filming warehouse.',
          areaSqFt: 8000,
          ceilingHeight: '26 ft',
          powerSupply: '800A 3-Phase Camlock',
          vehicleAccess: 'Dual loading docks',
          curfewRestrictions: '24/7 Filming Permitted',
          permitsRequired: 'Standard NYC Permit',
          amenities: ['Parking', 'Docks', 'Restrooms'],
          dayRate10h: 2800,
          hourlyRate: 320,
          imageUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f',
        }),
      });
      if (res.status !== 201) throw new Error(`Expected 201, got ${res.status}: ${JSON.stringify(res.body)}`);
      if (res.body.data.publicationStatus !== 'published') {
        throw new Error(`Expected publicationStatus=published, got ${res.body.data.publicationStatus}`);
      }
      if (res.body.data.reviewStatus !== 'APPROVED') {
        throw new Error(`Expected reviewStatus=APPROVED, got ${res.body.data.reviewStatus}`);
      }
      createdLocationId = res.body.data._id || res.body.data.id;
      createdLocationSlug = res.body.data.slug;
    });

    // 13. Multi-Type Listing Creation: Professional Crew (Immediate Publication)
    let createdCrewId = '';
    let createdCrewSlug = '';
    const uniqueCrewName = `Elena Rostova DP ${Date.now()}`;

    await runTest('POST /api/professionals creates crew profile and publishes immediately', async () => {
      const res = await hostClient.request('/api/professionals', {
        method: 'POST',
        body: JSON.stringify({
          name: uniqueCrewName,
          role: 'Director of Photography',
          category: 'camera_lighting',
          location: 'Bandra West, Mumbai (Local Hire)',
          locationGeo: { type: 'Point', coordinates: [72.8335, 19.0596] },
          locationAddress: {
            formatted: 'Bandra West, Mumbai, Maharashtra',
            locality: 'Bandra West',
            city: 'Mumbai',
            state: 'Maharashtra',
            pincode: '400050',
            country: 'India',
            accuracy: 'locality',
            isExactAddressPublic: false,
          },
          serviceRadiusKm: 50,
          credits: 'Vogue, Nike, HBO Documentary',
          bio: 'Commercial DP specializing in high-speed motion control and anamorphic glass.',
          skills: ['ARRI Alexa 35', 'Technocrane', 'Color Grading'],
          workingKit: 'SmallHD Cine 7, Teradek 4K',
          dayRate10h: 1600,
          nextAvailable: 'Next Monday',
          imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb',
          unionAffiliation: 'IATSE Local 600',
          standardKitIncluded: true,
        }),
      });
      if (res.status !== 201) throw new Error(`Expected 201, got ${res.status}: ${JSON.stringify(res.body)}`);
      if (res.body.data.publicationStatus !== 'published') {
        throw new Error(`Expected publicationStatus=published, got ${res.body.data.publicationStatus}`);
      }
      if (res.body.data.reviewStatus !== 'APPROVED') {
        throw new Error(`Expected reviewStatus=APPROVED, got ${res.body.data.reviewStatus}`);
      }
      createdCrewId = res.body.data._id || res.body.data.id;
      createdCrewSlug = res.body.data.slug;
    });

    // 14. Multi-Type Listing Creation: Cinema Equipment (Immediate Publication)
    let createdEquipId = '';
    let createdEquipSlug = '';
    const uniqueEquipName = `Alexa 35 Cinema Kit ${Date.now()}`;

    await runTest('POST /api/equipment creates equipment item and publishes immediately', async () => {
      const res = await hostClient.request('/api/equipment', {
        method: 'POST',
        body: JSON.stringify({
          name: uniqueEquipName,
          category: 'cameras',
          categoryLabel: 'CINEMA CAMERAS',
          brand: 'ARRI',
          location: 'Andheri West, Mumbai',
          pickupLocation: 'GearHub Vault, Andheri West, Mumbai, Maharashtra 400053',
          deliveryCoverageKm: 30,
          locationGeo: { type: 'Point', coordinates: [72.8277, 19.1363] },
          locationAddress: {
            formatted: 'GearHub Vault, Andheri West, Mumbai, Maharashtra - 400053',
            street: 'Veera Desai Industrial Estate',
            locality: 'Andheri West',
            city: 'Mumbai',
            state: 'Maharashtra',
            pincode: '400053',
            country: 'India',
            accuracy: 'street',
          },
          dayRate: 1400,
          weeklyRate: 4200,
          replacementValue: 85000,
          description: 'ARRI Alexa 35 camera kit with full accessories and flight case.',
          keySpecs: ['4.6K Super 35', '17 stops DR'],
          includedAccessories: ['Codex drives', 'Baseplate', 'EVF'],
          powerRequirement: 'B-Mount 24V Native',
          mountType: 'LPL Mount',
          imageUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32',
        }),
      });
      if (res.status !== 201) throw new Error(`Expected 201, got ${res.status}: ${JSON.stringify(res.body)}`);
      if (res.body.data.publicationStatus !== 'published') {
        throw new Error(`Expected publicationStatus=published, got ${res.body.data.publicationStatus}`);
      }
      if (res.body.data.reviewStatus !== 'APPROVED') {
        throw new Error(`Expected reviewStatus=APPROVED, got ${res.body.data.reviewStatus}`);
      }
      createdEquipId = res.body.data._id || res.body.data.id;
      createdEquipSlug = res.body.data.slug;
    });

    // 15. Instant Public Directory Availability
    await runTest('GET /api/studios immediately includes newly created studio without admin review', async () => {
      const publicRes = await client.request('/api/studios');
      if (publicRes.status !== 200) throw new Error(`Expected 200, got ${publicRes.status}`);
      const found = publicRes.body.data.find((s: any) => s.name === uniqueStudioName);
      if (!found) {
        throw new Error('New studio listing was not immediately available in public catalogue!');
      }
    });

    // 16. Host Dashboard "My Listings" Aggregation & Metrics
    await runTest('GET /api/my-listings aggregates all 4 owned listing types with published metrics', async () => {
      const res = await hostClient.request('/api/my-listings');
      if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
      if (!Array.isArray(res.body.data) || res.body.data.length < 4) {
        throw new Error(`Expected at least 4 listings, got ${res.body.data?.length}`);
      }
      if (res.body.counts.published < 4) {
        throw new Error(`Expected published count >= 4, got ${res.body.counts.published}`);
      }
    });

    // 17. Draft Creation and Separation
    let draftStudioId = '';
    let draftStudioSlug = '';
    const uniqueDraftName = `Draft Unlisted Soundstage ${Date.now()}`;
    await runTest('POST /api/studios with isDraft=true saves draft and hides from public catalogue', async () => {
      const draftRes = await hostClient.request('/api/studios', {
        method: 'POST',
        body: JSON.stringify({
          name: uniqueDraftName,
          category: 'cyclorama',
          location: 'Draft Unverified Studio',
          submarket: 'Draft Submarket',
          description: 'Draft unlisted space that should remain private until published.',
          specs: { sqFt: 2500, gridHeight: '16 ft', power: '200A', access: 'Elevator' },
          amenities: ['Lounge'],
          hourlyRate: 120,
          dayRate10h: 1100,
          imageUrl: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04',
          features: { camlockPower: false, driveInAccess: false, stc60Certified: false, northDaylight: false, gripPackageIncluded: false },
          isDraft: true,
        }),
      });
      if (draftRes.status !== 201) throw new Error(`Expected 201, got ${draftRes.status}`);
      if (draftRes.body.data.publicationStatus !== 'draft') {
        throw new Error(`Expected publicationStatus=draft, got ${draftRes.body.data.publicationStatus}`);
      }
      draftStudioId = draftRes.body.data._id || draftRes.body.data.id;
      draftStudioSlug = draftRes.body.data.slug;

      // Verify NOT in public catalogue
      const publicRes = await client.request('/api/studios');
      const found = publicRes.body.data.find((s: any) => s.name === uniqueDraftName);
      if (found) {
        throw new Error('Draft listing leaked into public catalogue!');
      }
    });

    // 18. Direct Publish Endpoint: Gated by Location Completeness
    await runTest('POST /api/my-listings/studio/:id/publish rejects incomplete location and succeeds after update', async () => {
      // 1. Incomplete location publication rejection
      const failPubRes = await hostClient.request(`/api/my-listings/studio/${draftStudioId}/publish`, {
        method: 'POST',
      });
      if (failPubRes.status !== 400) {
        throw new Error(`Expected 400 Bad Request on incomplete draft publish, got ${failPubRes.status}`);
      }
      if (!Array.isArray(failPubRes.body.missingFields) || failPubRes.body.missingFields.length === 0) {
        throw new Error('Expected missingFields array in 400 error response');
      }

      // 2. Update location details via PATCH /api/my-listings/studio/:id/location
      const updateLocRes = await hostClient.request(`/api/my-listings/studio/${draftStudioId}/location`, {
        method: 'PATCH',
        body: JSON.stringify({
          locationGeo: { type: 'Point', coordinates: [78.3845, 17.4483] },
          locationAddress: {
            formatted: 'Plot 10, Hitec City, Hyderabad, Telangana - 500081',
            building: 'CyberStudio One',
            street: 'Hitec City Main Road',
            locality: 'Madhapur',
            city: 'Hyderabad',
            state: 'Telangana',
            pincode: '500081',
            country: 'India',
            accuracy: 'rooftop',
            isExactAddressPublic: true,
            mapUrl: 'https://maps.google.com/?q=17.4483,78.3845',
          },
          mapUrl: 'https://maps.google.com/?q=17.4483,78.3845',
          location: 'Madhapur, Hyderabad',
          submarket: 'Madhapur',
        }),
      });
      if (updateLocRes.status !== 200) {
        throw new Error(`Expected 200 on location update, got ${updateLocRes.status}: ${JSON.stringify(updateLocRes.body)}`);
      }

      // 3. Publish draft now succeeds
      const pubRes = await hostClient.request(`/api/my-listings/studio/${draftStudioId}/publish`, {
        method: 'POST',
      });
      if (pubRes.status !== 200) throw new Error(`Expected 200, got ${pubRes.status}: ${JSON.stringify(pubRes.body)}`);
      if (pubRes.body.data.publicationStatus !== 'published') {
        throw new Error(`Expected publicationStatus=published, got ${pubRes.body.data.publicationStatus}`);
      }

      // Verify now present in public catalogue
      const publicRes = await client.request('/api/studios');
      const found = publicRes.body.data.find((s: any) => s.name === uniqueDraftName);
      if (!found) {
        throw new Error('Published draft not found in public catalogue after publishing!');
      }
    });

    // 19. Ownership Enforcement: Other Users Cannot Modify Listing
    await runTest('PATCH /api/studios/:id rejects unauthorized modification by another user with 403', async () => {
      const res = await client.request(`/api/studios/${createdStudioId}`, {
        method: 'PATCH',
        body: JSON.stringify({ name: 'Hacked Studio Name' }),
      });
      if (res.status !== 403) {
        throw new Error(`Expected 403 Forbidden on non-owner update, got ${res.status}`);
      }
    });

    // 20. Owner Can Manage and Update Their Listing
    await runTest('PATCH /api/studios/:id allows owner to update their listing and remains published', async () => {
      const res = await hostClient.request(`/api/studios/${createdStudioId}`, {
        method: 'PATCH',
        body: JSON.stringify({
          description: 'Updated description by owner with new amenities.',
          hourlyRate: 220,
        }),
      });
      if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}: ${JSON.stringify(res.body)}`);
      if (res.body.data.hourlyRate !== 220) throw new Error('Update did not persist');
      if (res.body.data.publicationStatus !== 'published') {
        throw new Error('Listing should remain published after owner update');
      }
    });

    // 20a. Google Maps Location Link: Rejection of Invalid/Unrelated URL
    await runTest('POST /api/studios rejects invalid or unrelated map URLs with 400 and INVALID_MAPS_URL', async () => {
      const invalidUrls = [
        'https://evil.com/fake-google-maps',
        'https://google.com.evil.com/maps',
        'javascript:alert(1)',
        'not a valid url',
      ];
      for (const badUrl of invalidUrls) {
        const res = await hostClient.request('/api/studios', {
          method: 'POST',
          body: JSON.stringify({
            name: `Bad URL Stage ${Date.now()}`,
            category: 'soundstage',
            location: 'Andheri West, Mumbai',
            submarket: 'Andheri West',
            mapUrl: badUrl,
            locationGeo: { type: 'Point', coordinates: [72.8277, 19.1363] },
            locationAddress: {
              formatted: 'Plot 42, Andheri West, Mumbai - 400053',
              locality: 'Andheri West',
              city: 'Mumbai',
              state: 'Maharashtra',
              pincode: '400053',
            },
            description: 'Stage testing invalid map url rejection.',
            specs: { sqFt: 3000, gridHeight: '18 ft', power: '400A', access: 'Gate 1' },
            hourlyRate: 150,
            dayRate10h: 1400,
            imageUrl: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04',
          }),
        });
        if (res.status !== 400) {
          throw new Error(`Expected 400 Bad Request for bad URL "${badUrl}", got ${res.status}`);
        }
        if (res.body.code !== 'INVALID_MAPS_URL') {
          throw new Error(`Expected code INVALID_MAPS_URL, got ${res.body.code}`);
        }
      }
    });

    // 20b. Google Maps Location Link: Mandatory for Live Publication
    await runTest('POST /api/studios rejects live publication when Google Maps location link is missing', async () => {
      const res = await hostClient.request('/api/studios', {
        method: 'POST',
        body: JSON.stringify({
          name: `No Maps Link Stage ${Date.now()}`,
          category: 'soundstage',
          location: 'Andheri West, Mumbai',
          submarket: 'Andheri West',
          // No mapUrl provided
          locationGeo: { type: 'Point', coordinates: [72.8277, 19.1363] },
          locationAddress: {
            formatted: 'Plot 42, Andheri West, Mumbai - 400053',
            locality: 'Andheri West',
            city: 'Mumbai',
            state: 'Maharashtra',
            pincode: '400053',
          },
          description: 'Stage testing missing map link rejection.',
          specs: { sqFt: 3000, gridHeight: '18 ft', power: '400A', access: 'Gate 1' },
          hourlyRate: 150,
          dayRate10h: 1400,
          imageUrl: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04',
          isDraft: false,
        }),
      });
      if (res.status !== 400) {
        throw new Error(`Expected 400 when mapUrl is omitted from live publication, got ${res.status}`);
      }
      if (!Array.isArray(res.body.missingFields) || !res.body.missingFields.includes('Google Maps location link')) {
        throw new Error(`Expected missingFields to contain 'Google Maps location link', got ${JSON.stringify(res.body.missingFields)}`);
      }
    });

    // 20c. Google Maps Location Link: Draft Creation Allowed Without Link
    await runTest('POST /api/studios with isDraft=true permits saving draft without Google Maps location link', async () => {
      const res = await hostClient.request('/api/studios', {
        method: 'POST',
        body: JSON.stringify({
          name: `Draft No Map Link ${Date.now()}`,
          category: 'soundstage',
          location: 'Andheri West, Mumbai',
          submarket: 'Andheri West',
          description: 'Draft without location link is allowed.',
          specs: { sqFt: 2500, gridHeight: '16 ft', power: '200A', access: 'Gate 2' },
          hourlyRate: 150,
          dayRate10h: 1400,
          imageUrl: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04',
          isDraft: true,
        }),
      });
      if (res.status !== 201) {
        throw new Error(`Expected 201 Created for draft without map link, got ${res.status}: ${JSON.stringify(res.body)}`);
      }
    });

    // 20d. Google Maps Location Link: Accepts Share Links (maps.app.goo.gl) and Standard URLs
    await runTest('POST /api/studios accepts share links (maps.app.goo.gl) and standard URLs', async () => {
      const shareUrl = 'https://maps.app.goo.gl/s4r3gVp7Yh6tN3z9A';
      const res = await hostClient.request('/api/studios', {
        method: 'POST',
        body: JSON.stringify({
          name: `Share Link Stage ${Date.now()}`,
          category: 'soundstage',
          location: 'Andheri West, Mumbai',
          submarket: 'Andheri West',
          mapUrl: shareUrl,
          locationGeo: { type: 'Point', coordinates: [72.8277, 19.1363] },
          locationAddress: {
            formatted: 'Plot 42, Andheri West, Mumbai - 400053',
            locality: 'Andheri West',
            city: 'Mumbai',
            state: 'Maharashtra',
            pincode: '400053',
            mapUrl: shareUrl,
          },
          description: 'Stage testing valid share link acceptance.',
          specs: { sqFt: 3000, gridHeight: '18 ft', power: '400A', access: 'Gate 1' },
          hourlyRate: 150,
          dayRate10h: 1400,
          imageUrl: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04',
        }),
      });
      if (res.status !== 201) {
        throw new Error(`Expected 201 Created for share link, got ${res.status}: ${JSON.stringify(res.body)}`);
      }
      if (res.body.data.mapUrl !== shareUrl) {
        throw new Error(`Expected mapUrl=${shareUrl}, got ${res.body.data.mapUrl}`);
      }
    });

    // 20e. Google Maps Location Link: Owner Can Edit/Update Saved Link
    await runTest('PATCH /api/studios/:id allows owner to edit their saved Google Maps link', async () => {
      const updatedLink = 'https://www.google.com/maps/place/Film+City/@19.1643,72.8856,17z';
      const res = await hostClient.request(`/api/studios/${createdStudioId}`, {
        method: 'PATCH',
        body: JSON.stringify({
          mapUrl: updatedLink,
        }),
      });
      if (res.status !== 200) {
        throw new Error(`Expected 200 on mapUrl update, got ${res.status}: ${JSON.stringify(res.body)}`);
      }
      if (res.body.data.mapUrl !== updatedLink) {
        throw new Error(`Expected updated mapUrl=${updatedLink}, got ${res.body.data.mapUrl}`);
      }
    });

    // 21. Owner Can Unpublish to Draft
    await runTest('POST /api/my-listings/studio/:id/unpublish allows owner to move listing to draft', async () => {
      const res = await hostClient.request(`/api/my-listings/studio/${draftStudioId}/unpublish`, {
        method: 'POST',
      });
      if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
      if (res.body.data.publicationStatus !== 'draft') {
        throw new Error('Expected draft status');
      }
    });

    // 22. Public Detail Endpoint by Slug
    await runTest('GET /api/studios/:slug returns accurate stage technical specs', async () => {
      const res = await client.request(`/api/studios/${createdStudioSlug}`);
      if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
      if (res.body.data.name !== uniqueStudioName) throw new Error('Studio name mismatch');
      if (!res.body.data.specs?.power) throw new Error('Missing specs.power');
    });

    // 22b. Draft Protection & 404 Tests
    await runTest('GET /api/studios/:slugOrId blocks public from draft with 403 and permits owner', async () => {
      // Non-owner customer requesting draft
      const unauthRes = await client.request(`/api/studios/${draftStudioSlug}`);
      if (unauthRes.status !== 403) throw new Error(`Expected 403 for non-owner viewing draft, got ${unauthRes.status}`);
      if (unauthRes.body.code !== 'LISTING_UNPUBLISHED') throw new Error(`Expected code LISTING_UNPUBLISHED, got ${unauthRes.body.code}`);

      // Owner host requesting draft
      const ownerRes = await hostClient.request(`/api/studios/${draftStudioSlug}`);
      if (ownerRes.status !== 200) throw new Error(`Expected 200 for owner viewing draft, got ${ownerRes.status}`);
      if (!ownerRes.body.isDraftPreview) throw new Error('Expected isDraftPreview=true for owner draft preview');
    });

    await runTest('GET /api/studios/:slugOrId returns 404 with STUDIO_NOT_FOUND for nonexistent slug', async () => {
      const res = await client.request('/api/studios/completely-nonexistent-studio-slug-xyz-999');
      if (res.status !== 404) throw new Error(`Expected 404, got ${res.status}`);
      if (res.body.code !== 'STUDIO_NOT_FOUND') throw new Error(`Expected code STUDIO_NOT_FOUND, got ${res.body.code}`);
    });

    // 23. Public Location Listing & Detail
    await runTest('GET /api/locations returns published filming locations', async () => {
      const res = await client.request('/api/locations');
      if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
      if (!Array.isArray(res.body.data) || res.body.data.length === 0) throw new Error('Expected locations');
    });

    await runTest('GET /api/locations/:slug returns location technical specs', async () => {
      const res = await client.request(`/api/locations/${createdLocationSlug}`);
      if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
      if (res.body.data.name !== uniqueLocName) throw new Error('Location name mismatch');
      if (!res.body.data.powerSupply) throw new Error('Missing powerSupply');
    });

    // 24. Public Crew Listing & Detail
    await runTest('GET /api/professionals returns verified heads of department', async () => {
      const res = await client.request('/api/professionals');
      if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
      if (!Array.isArray(res.body.data) || res.body.data.length === 0) throw new Error('Expected crew');
    });

    await runTest('GET /api/professionals/:slug returns verified crew details', async () => {
      const res = await client.request(`/api/professionals/${createdCrewSlug}`);
      if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
      if (res.body.data.name !== uniqueCrewName) throw new Error('Crew name mismatch');
      if (!res.body.data.workingKit) throw new Error('Missing workingKit');
    });

    // 25. Public Equipment Listing & Detail
    await runTest('GET /api/equipment returns cinema gear packages', async () => {
      const res = await client.request('/api/equipment');
      if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
      if (!Array.isArray(res.body.data) || res.body.data.length === 0) throw new Error('Expected equipment');
    });

    await runTest('GET /api/equipment/:slug returns cinema equipment package details', async () => {
      const res = await client.request(`/api/equipment/${createdEquipSlug}`);
      if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
      if (res.body.data.name !== uniqueEquipName) throw new Error('Equipment name mismatch');
      if (!res.body.data.brand) throw new Error('Missing brand');
    });

    // 26. User Features: Save Item to Shortlist
    let savedItemId = '';
    await runTest('POST /api/saved-items saves stage to user shortlist', async () => {
      const res = await client.request('/api/saved-items', {
        method: 'POST',
        body: JSON.stringify({
          itemType: 'studio',
          itemId: createdStudioId,
        }),
      });
      if (res.status !== 201 && res.status !== 200) throw new Error(`Expected 201/200, got ${res.status}`);
      savedItemId = res.body.data.id;
    });

    // 27. User Features: Get Saved Items
    await runTest('GET /api/saved-items returns user shortlist with populated references', async () => {
      const res = await client.request('/api/saved-items');
      if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
      if (!Array.isArray(res.body.data) || res.body.data.length === 0) throw new Error('Shortlist empty');
    });

    // 28. User Features: Remove Saved Item
    await runTest('DELETE /api/saved-items/:id removes item from shortlist', async () => {
      const res = await client.request(`/api/saved-items/${savedItemId}`, {
        method: 'DELETE',
      });
      if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    });

    // 29. User Features: Add to Studio Compare Matrix
    await runTest('POST /api/compare adds studio to comparison dock', async () => {
      const res = await client.request('/api/compare', {
        method: 'POST',
        body: JSON.stringify({ studioId: createdStudioId }),
      });
      if (res.status !== 201 && res.status !== 200) throw new Error(`Expected 201/200, got ${res.status}`);
    });

    // 30. User Features: Retrieve Compare Matrix
    await runTest('GET /api/compare returns active compared studios', async () => {
      const res = await client.request('/api/compare');
      if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
      if (!Array.isArray(res.body.data) || res.body.data.length === 0) throw new Error('Compare dock empty');
    });

    // 31. Booking Requests: Submit Production Hold Inquiry
    await runTest('POST /api/booking-requests submits genuine stage booking inquiry', async () => {
      const res = await client.request('/api/booking-requests', {
        method: 'POST',
        body: JSON.stringify({
          listingType: 'studio',
          studioId: createdStudioId,
          requestedDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          shiftType: '10h Standard Shoot Day',
          durationHours: 10,
          productionName: 'Vogue Commercial Editorial',
          contactEmail: testEmail,
          contactPhone: '(212) 555-0188',
          powerAddon: true,
          riggingAddon: false,
          estimatedTotal: 2000,
          specialInstructions: 'Need early power drop for key lighting.',
        }),
      });
      if (res.status !== 201) throw new Error(`Expected 201, got ${res.status}: ${JSON.stringify(res.body)}`);
      if (res.body.data.status !== 'pending') throw new Error('Status should be pending');
    });

    // 32. Booking Requests: Retrieve Inquiries
    await runTest('GET /api/booking-requests returns customer inquiry history', async () => {
      const res = await client.request('/api/booking-requests');
      if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
      if (!Array.isArray(res.body.data) || res.body.data.length === 0) throw new Error('No bookings found');
    });

    // 33. RBAC Security: Customer Cannot Delete Studio Listing
    await runTest('DELETE /api/studios/:id blocks unauthorized customer with 403', async () => {
      const res = await client.request(`/api/studios/${createdStudioId}`, {
        method: 'DELETE',
      });
      if (res.status !== 403) throw new Error(`Expected 403 Forbidden, got ${res.status}`);
    });

    // =========================================================================
    // VENDOR ONBOARDING & CUSTOMER ROLE UPGRADE INTEGRATION TESTS
    // =========================================================================
    const upgradeUserEmail = `customer.to.vendor.${Date.now()}@filmmaker.io`;
    let upgradeUserId = '';
    let customerCreatedStudioId = '';

    await runTest('Customer registers with default CUSTOMER role and creates customer data', async () => {
      const regRes = await upgradeClient.request('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          fullName: 'Arjun Producer & Host',
          email: upgradeUserEmail,
          password: 'UpgradePass123!',
          role: 'CUSTOMER',
        }),
      });
      if (regRes.status !== 201) throw new Error(`Expected 201, got ${regRes.status}`);
      upgradeUserId = regRes.body.user.id;
      if (!regRes.body.user.roles.includes('CUSTOMER')) throw new Error('Expected user to have CUSTOMER role');
      if (regRes.body.user.roles.includes('STUDIO_OWNER')) throw new Error('Customer should not initially have STUDIO_OWNER role');

      // Mark verified
      await User.updateOne({ _id: upgradeUserId }, { $set: { isVerified: true } });

      // Save an item as customer
      const saveRes = await upgradeClient.request('/api/saved-items', {
        method: 'POST',
        body: JSON.stringify({
          itemType: 'studio',
          itemId: createdStudioId,
        }),
      });
      if (saveRes.status !== 201 && saveRes.status !== 200) throw new Error(`Failed to save item as customer: ${saveRes.status}`);
    });

    await runTest('POST /api/auth/become-vendor onboards customer without losing customer bookings or history', async () => {
      const onboardRes = await upgradeClient.request('/api/auth/become-vendor', {
        method: 'POST',
        body: JSON.stringify({
          vendorTypes: ['studio', 'crew'],
          companyName: 'BMS Soundstages India',
          phone: '+91 91234 56789',
          bio: 'Premier commercial soundstage operator with high-clearance cyclorama.',
        }),
      });

      if (onboardRes.status !== 200) {
        throw new Error(`Expected 200, got ${onboardRes.status}: ${JSON.stringify(onboardRes.body)}`);
      }
      const updatedUser = onboardRes.body.user;
      if (!updatedUser.roles.includes('CUSTOMER')) throw new Error('CUSTOMER role was lost after vendor onboarding!');
      if (!updatedUser.roles.includes('STUDIO_OWNER')) throw new Error('STUDIO_OWNER role missing after onboarding!');
      if (!updatedUser.roles.includes('PROFESSIONAL')) throw new Error('PROFESSIONAL role missing after onboarding!');
      if (updatedUser.roles.includes('ADMIN')) throw new Error('Security hazard: ADMIN role was granted!');
      if (updatedUser.companyName !== 'BMS Soundstages India') throw new Error('companyName was not updated');
      if (updatedUser.phone !== '+91 91234 56789') throw new Error('phone was not updated');

      // Verify GET /api/auth/me returns updated roles immediately
      const meRes = await upgradeClient.request('/api/auth/me');
      if (meRes.status !== 200) throw new Error(`Expected 200 on /me, got ${meRes.status}`);
      if (!meRes.body.user.roles.includes('STUDIO_OWNER') || !meRes.body.user.roles.includes('CUSTOMER')) {
        throw new Error('Session /me does not reflect upgraded roles');
      }

      // Verify saved items created prior to vendor upgrade are intact
      const savedRes = await upgradeClient.request('/api/saved-items');
      if (savedRes.status !== 200 || !Array.isArray(savedRes.body.data) || savedRes.body.data.length === 0) {
        throw new Error('Customer saved items were lost after becoming a vendor');
      }
    });

    await runTest('POST /api/studios allows upgraded customer to create and publish studio listing', async () => {
      const uniqueName = `Arjun CineStage ${Date.now()}`;
      const res = await upgradeClient.request('/api/studios', {
        method: 'POST',
        body: JSON.stringify({
          name: uniqueName,
          category: 'cyclorama',
          categoryLabel: 'Two-Wall Seamless Cyclorama',
          location: 'Andheri West, Mumbai, Maharashtra',
          submarket: 'Andheri West',
          locationGeo: { type: 'Point', coordinates: [72.8277, 19.1363] },
          locationAddress: {
            formatted: 'Plot 42, Off New Link Road, Andheri West, Mumbai, Maharashtra - 400053',
            building: 'Arjun Soundstage',
            street: 'Off New Link Road',
            locality: 'Andheri West',
            city: 'Mumbai',
            state: 'Maharashtra',
            pincode: '400053',
            country: 'India',
            accuracy: 'rooftop',
            isExactAddressPublic: true,
            mapUrl: 'https://maps.google.com/?q=19.1363,72.8277',
          },
          mapUrl: 'https://maps.google.com/?q=19.1363,72.8277',
          description: 'Acoustically isolated two-wall cyc stage with pre-rigged lighting grid.',
          specs: {
            sqFt: 3800,
            gridHeight: '20 ft',
            power: '600A 3-Phase Camlock',
            access: 'Ground Floor Roll-Up Door',
          },
          amenities: ['HMU Suite', 'Client Lounge', 'Fiber Internet'],
          hourlyRate: 150,
          dayRate10h: 1350,
          imageUrl: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=1200',
          features: {
            camlockPower: true,
            driveInAccess: true,
            stc60Certified: true,
            northDaylight: false,
            gripPackageIncluded: true,
          },
          isDraft: false,
        }),
      });

      if (res.status !== 201) {
        throw new Error(`Expected 201 Created on studio creation by upgraded vendor, got ${res.status}: ${JSON.stringify(res.body)}`);
      }
      customerCreatedStudioId = res.body.data._id || res.body.data.id;
      if (!customerCreatedStudioId) throw new Error('No studio id returned in response data');
      if (res.body.data.publicationStatus !== 'published') throw new Error('Listing was not published');
    });

    await runTest('PATCH /api/studios/:id rejects modification from a non-owner vendor with 403', async () => {
      // hostClient attempts to modify arjun's studio
      const res = await hostClient.request(`/api/studios/${customerCreatedStudioId}`, {
        method: 'PATCH',
        body: JSON.stringify({
          description: 'Malicious modification of another host listing',
        }),
      });

      if (res.status !== 403) {
        throw new Error(`Expected 403 Forbidden for non-owner patch, got ${res.status}`);
      }
    });

    await runTest('Owner can update their newly created studio successfully', async () => {
      const res = await upgradeClient.request(`/api/studios/${customerCreatedStudioId}`, {
        method: 'PATCH',
        body: JSON.stringify({
          description: 'Updated acoustics and new 800A power distribution grid.',
        }),
      });

      if (res.status !== 200) {
        throw new Error(`Expected 200 OK for owner patch, got ${res.status}`);
      }
      if (res.body.data.description !== 'Updated acoustics and new 800A power distribution grid.') {
        throw new Error('Description was not updated by owner');
      }
    });

    // 34. Admin Request Changes with Feedback
    await runTest('POST /api/admin/listings/:type/:id/review requests changes with required feedback', async () => {
      const adminEmail = `admin.curator.${Date.now()}@bookmystudio.internal`;
      const regRes = await adminClient.request('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          fullName: 'Senior Platform Curator',
          email: adminEmail,
          password: 'AdminPassword123!',
          role: 'STUDIO_OWNER',
        }),
      });
      if (regRes.status !== 201) throw new Error(`Expected 201, got ${regRes.status}`);
      const adminUserId = regRes.body.user.id;
      await User.updateOne(
        { _id: adminUserId },
        { $set: { roles: ['ADMIN', 'STUDIO_OWNER'], isVerified: true } }
      );

      const res = await adminClient.request(`/api/admin/listings/equipment/${createdEquipId}/review`, {
        method: 'POST',
        body: JSON.stringify({
          action: 'REQUEST_CHANGES',
          feedback: 'Please upload serial number verification and recent sensor calibration certification.',
        }),
      });
      if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
      if (res.body.data.reviewStatus !== 'CHANGES_REQUESTED') {
        throw new Error(`Expected CHANGES_REQUESTED, got ${res.body.data.reviewStatus}`);
      }
      if (!res.body.data.reviewFeedback) {
        throw new Error('reviewFeedback was not saved on listing');
      }
    });

    // 35. Host Direct Re-Publication Lifecycle
    await runTest('POST /api/my-listings/:type/:id/publish publishes listing directly and clears revisions feedback', async () => {
      const res = await hostClient.request(`/api/my-listings/equipment/${createdEquipId}/publish`, {
        method: 'POST',
      });
      if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
      if (res.body.data.publicationStatus !== 'published') {
        throw new Error(`Expected published, got ${res.body.data.publicationStatus}`);
      }
      if (res.body.data.reviewStatus !== 'APPROVED') {
        throw new Error(`Expected APPROVED, got ${res.body.data.reviewStatus}`);
      }
      if (res.body.data.reviewFeedback !== null && res.body.data.reviewFeedback !== undefined) {
        throw new Error('reviewFeedback should be reset on publication');
      }
    });

    // 36. Logout & Session Invalidation
    await runTest('POST /api/auth/logout invalidates session and subsequent /api/auth/me returns 401', async () => {
      const res = await client.request('/api/auth/logout', { method: 'POST' });
      if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);

      const meRes = await client.request('/api/auth/me');
      if (meRes.status !== 401) throw new Error(`Expected 401 Unauthenticated, got ${meRes.status}`);
    });

    // 37. Location Geocode Search
    await runTest('GET /api/location/search?q=Madhapur returns Indian hub coordinates', async () => {
      const res = await client.request('/api/location/search?q=Madhapur');
      if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
      if (!res.body.success || !Array.isArray(res.body.data) || res.body.data.length === 0) {
        throw new Error('Expected successful array of location matches');
      }
      const match = res.body.data[0];
      if (!match.locality.includes('Madhapur') || !match.coordinates) {
        throw new Error(`Expected Madhapur match, got ${match.name}`);
      }
    });

    // 38. Location Reverse Geocode
    await runTest('GET /api/location/reverse?lat=17.4483&lng=78.3845 returns resolved address', async () => {
      const res = await client.request('/api/location/reverse?lat=17.4483&lng=78.3845');
      if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
      if (!res.body.success || !res.body.data || !res.body.data.city) {
        throw new Error('Expected resolved reverse geocode data');
      }
    });

    // 39. Location Hubs Directory
    await runTest('GET /api/location/hubs returns default location and popular hubs', async () => {
      const res = await client.request('/api/location/hubs');
      if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
      if (!res.body.data.defaultLocation || !Array.isArray(res.body.data.popularHubs)) {
        throw new Error('Expected defaultLocation and popularHubs');
      }
      if (res.body.data.defaultLocation.pincode !== '500081') {
        throw new Error(`Expected Madhapur pincode 500081, got ${res.body.data.defaultLocation.pincode}`);
      }
    });

    // 40. Geospatial Discovery Query on Studios
    await runTest('GET /api/studios?lat=19.1363&lng=72.8277&radiusKm=25 returns studios within radius with distanceKm', async () => {
      const res = await client.request('/api/studios?lat=19.1363&lng=72.8277&radiusKm=25');
      if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
      if (!Array.isArray(res.body.data) || res.body.data.length === 0) {
        throw new Error('Expected studios within 25km radius of Mumbai test studio');
      }
      for (const item of res.body.data) {
        if (item.distanceKm === undefined || item.distanceKm === null) {
          throw new Error('Expected distanceKm to be computed on returned item');
        }
        if (item.distanceKm > 25) {
          throw new Error(`Item distance ${item.distanceKm} exceeds 25km filter`);
        }
      }
    });

    // 41. Geospatial Discovery Query on Locations, Crew, and Equipment
    await runTest('Geospatial queries on locations, crew, and equipment compute distanceKm and respect radius', async () => {
      const [locRes, crewRes, eqRes] = await Promise.all([
        client.request('/api/locations?lat=19.1363&lng=72.8277&radiusKm=50'),
        client.request('/api/professionals?lat=19.1363&lng=72.8277&radiusKm=50'),
        client.request('/api/equipment?lat=19.1363&lng=72.8277&radiusKm=50'),
      ]);

      if (locRes.status !== 200) throw new Error(`Location query failed: ${locRes.status}`);
      if (crewRes.status !== 200) throw new Error(`Crew query failed: ${crewRes.status}`);
      if (eqRes.status !== 200) throw new Error(`Equipment query failed: ${eqRes.status}`);

      if (!Array.isArray(locRes.body.data) || !Array.isArray(crewRes.body.data) || !Array.isArray(eqRes.body.data)) {
        throw new Error('Expected arrays for all 3 verticals');
      }

      // Check distanceKm is present on items
      if (locRes.body.data.length > 0 && typeof locRes.body.data[0].distanceKm !== 'number') {
        throw new Error('Expected distanceKm on filming location');
      }
      if (crewRes.body.data.length > 0 && typeof crewRes.body.data[0].distanceKm !== 'number') {
        throw new Error('Expected distanceKm on crew profile');
      }
      if (eqRes.body.data.length > 0 && typeof eqRes.body.data[0].distanceKm !== 'number') {
        throw new Error('Expected distanceKm on equipment item');
      }
    });

    // 42. India-Wide Search - Mumbai / Bandra
    await runTest('GET /api/location/search?q=Bandra returns Mumbai hub and never Hyderabad', async () => {
      const res = await client.request('/api/location/search?q=Bandra');
      if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
      if (!res.body.success || !Array.isArray(res.body.data) || res.body.data.length === 0) {
        throw new Error('Expected results for Bandra');
      }
      const match = res.body.data[0];
      if (!match.city.includes('Mumbai') && !match.name.includes('Mumbai')) {
        throw new Error(`Expected Mumbai result for Bandra, got ${match.name}`);
      }
      if (match.city.includes('Hyderabad')) {
        throw new Error('Error: Silent substitution of Hyderabad detected for Bandra search');
      }
    });

    // 43. 6-Digit PIN Code Search - Bengaluru 560034
    await runTest('GET /api/location/search?q=560034 resolves Indian PIN code to Bengaluru hub', async () => {
      const res = await client.request('/api/location/search?q=560034');
      if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
      if (!res.body.success || !Array.isArray(res.body.data) || res.body.data.length === 0) {
        throw new Error('Expected results for PIN 560034');
      }
      const match = res.body.data[0];
      if (match.pincode !== '560034') {
        throw new Error(`Expected pincode 560034, got ${match.pincode}`);
      }
    });

    // 44. No Silent Fallback for Unknown Search
    await runTest('GET /api/location/search with unknown query returns empty array, never Hyderabad', async () => {
      const res = await client.request('/api/location/search?q=xyznonexistentplace9999');
      if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
      if (!res.body.success || !Array.isArray(res.body.data)) {
        throw new Error('Expected successful array response');
      }
      if (res.body.data.length > 0) {
        throw new Error(`Expected empty array for unknown location, got ${res.body.data.length} fake items`);
      }
    });

    // 45. All-India Nationwide Query without Coordinates
    await runTest('GET /api/studios?radiusKm=all returns nationwide studios without requiring coords', async () => {
      const res = await client.request('/api/studios?radiusKm=all');
      if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
      if (!res.body.success || !Array.isArray(res.body.data)) {
        throw new Error('Expected nationwide studios array');
      }
      if (res.body.locationMeta.hasCoords !== false) {
        throw new Error('Expected hasCoords to be false for all-India query');
      }
    });

    // 46. Rejection of Invalid Coordinate Bounds [lng, lat]
    await runTest('PATCH /api/my-listings/studio/:id/location rejects out-of-range coordinates with 400', async () => {
      const res = await hostClient.request(`/api/my-listings/studio/${createdStudioId}/location`, {
        method: 'PATCH',
        body: JSON.stringify({
          locationGeo: { type: 'Point', coordinates: [195.5, 95.0] }, // invalid coordinates > 180 and > 90
        }),
      });
      if (res.status !== 400) {
        throw new Error(`Expected 400 Bad Request for out-of-range coords, got ${res.status}`);
      }
    });

    // 47. Creative Professional Privacy Safeguard (No Home Address Demanded)
    await runTest('Professional profile location requires working base and service radius but never demands street address', async () => {
      const crewRes = await hostClient.request(`/api/professionals/${createdCrewSlug}`);
      if (crewRes.status !== 200) throw new Error(`Expected 200, got ${crewRes.status}`);
      const crewData = crewRes.body.data;
      if (crewData.locationAddress && crewData.locationAddress.isExactAddressPublic !== false) {
        throw new Error('Creative professional profile should default to isExactAddressPublic=false');
      }
      if (!crewData.locationGeo || !crewData.locationGeo.coordinates) {
        throw new Error('Crew must have confirmed base coordinates for nearby discovery');
      }
      if (!crewData.serviceRadiusKm || crewData.serviceRadiusKm < 1) {
        throw new Error('Crew must have service radius >= 1 km');
      }
    });

    // 48. Equipment Pickup Location and Delivery Coverage
    await runTest('Equipment listing requires pickup location and delivery coverage radius', async () => {
      const eqRes = await hostClient.request(`/api/equipment/${createdEquipSlug}`);
      if (eqRes.status !== 200) throw new Error(`Expected 200, got ${eqRes.status}`);
      const eqData = eqRes.body.data;
      if (!eqData.pickupLocation) {
        throw new Error('Equipment must have pickup facility location');
      }
      if (eqData.deliveryCoverageKm === undefined || eqData.deliveryCoverageKm < 0) {
        throw new Error('Equipment must specify delivery coverage km');
      }
    });

    // =========================================================================
    // PARTNER REFACTORING & ROUTE INTEGRITY TESTS
    // =========================================================================

    // 49. Obsolete Payout Settings Routes are cleanly retired (404)
    await runTest('GET and PUT /api/payout-settings return 404 following payout route retirement', async () => {
      const getRes = await hostClient.request('/api/payout-settings');
      if (getRes.status !== 404) throw new Error(`Expected 404 for GET /api/payout-settings, got ${getRes.status}`);

      const putRes = await hostClient.request('/api/payout-settings', {
        method: 'PUT',
        body: JSON.stringify({ accountHolderName: 'Test' }),
      });
      if (putRes.status !== 404) throw new Error(`Expected 404 for PUT /api/payout-settings, got ${putRes.status}`);
    });

    // 50. Partner Onboarding & Role Separation
    await runTest('POST /api/auth/become-vendor elevates customer privileges to partner vendor without disrupting account history', async () => {
      const partnerClient = new TestClient(`http://localhost:${port}`);
      const partnerEmail = `partner-test-${Date.now()}@studio.com`;
      await partnerClient.request('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          fullName: 'Partner Candidate',
          email: partnerEmail,
          password: 'Password123!',
          role: 'CUSTOMER',
        }),
      });
      await partnerClient.request('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: partnerEmail,
          password: 'Password123!',
        }),
      });

      // Verify user starts as CUSTOMER
      const meBefore = await partnerClient.request('/api/auth/me');
      if (meBefore.body.user.roles.includes('STUDIO_OWNER')) {
        throw new Error('New customer should not have STUDIO_OWNER role initially');
      }

      // Upgrade to vendor
      const upgradeRes = await partnerClient.request('/api/auth/become-vendor', {
        method: 'POST',
        body: JSON.stringify({
          vendorTypes: ['studio', 'location'],
          companyName: 'Apex Partner Stages LLC',
        }),
      });

      if (upgradeRes.status !== 200) {
        throw new Error(`Expected 200 on become-vendor, got ${upgradeRes.status}: ${JSON.stringify(upgradeRes.body)}`);
      }
      if (!upgradeRes.body.user.roles.includes('STUDIO_OWNER')) {
        throw new Error('Expected STUDIO_OWNER role after vendor upgrade');
      }
      if (!upgradeRes.body.user.roles.includes('CUSTOMER')) {
        throw new Error('Expected CUSTOMER role to be preserved after vendor upgrade');
      }
    });

    // =========================================================================
    // AVAILABILITY CALENDAR & CONCURRENT BOOKING CONFLICT INTEGRATION TESTS
    // =========================================================================
    const indieClient = new TestClient(`http://localhost:${port}`);
    const indieEmail = `indie.director.${Date.now()}@cinema.org`;
    await indieClient.request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        fullName: 'Indie Film Director',
        email: indieEmail,
        password: 'DirectorPass123!',
      }),
    });

    const testShootDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const testShootMonth = testShootDate.slice(0, 7);

    // 59. Query Single Day Availability
    await runTest('GET /api/availability/studio/:slug returns hourly slot breakdown', async () => {
      const res = await indieClient.request(`/api/availability/studio/${createdStudioSlug}?date=${testShootDate}`);
      if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}: ${JSON.stringify(res.body)}`);
      if (!res.body.success || !Array.isArray(res.body.data.slots)) {
        throw new Error('Expected slots array in availability response');
      }
      if (res.body.data.slots.length === 0) {
        throw new Error('Expected at least 1 slot');
      }
    });

    // 60. Query Month Overview
    await runTest('GET /api/availability/studio/:slug?month=YYYY-MM returns calendar day overview', async () => {
      const res = await indieClient.request(`/api/availability/studio/${createdStudioSlug}?month=${testShootMonth}`);
      if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}: ${JSON.stringify(res.body)}`);
      if (!res.body.success || !Array.isArray(res.body.data.days)) {
        throw new Error('Expected days array in month overview');
      }
      const targetDay = res.body.data.days.find((d: any) => d.date === testShootDate);
      if (!targetDay) throw new Error(`Target day ${testShootDate} not found in month overview`);
    });

    // 61. Recalculate Authoritative Booking Quote
    await runTest('POST /api/availability/quote returns authoritative price breakdown', async () => {
      const res = await indieClient.request('/api/availability/quote', {
        method: 'POST',
        body: JSON.stringify({
          category: 'studio',
          listingId: createdStudioSlug,
          requestedDate: testShootDate,
          startTime: '10:00',
          durationHours: 5,
          powerAddon: true,
          riggingAddon: false,
        }),
      });
      if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}: ${JSON.stringify(res.body)}`);
      if (!res.body.data.pricingBreakdown || typeof res.body.data.estimatedTotal !== 'number') {
        throw new Error('Expected pricingBreakdown and estimatedTotal');
      }
      if (res.body.data.endTime !== '15:00') {
        throw new Error(`Expected endTime to be 15:00, got ${res.body.data.endTime}`);
      }
    });

    // 62. Submit Booking Hold for Slot
    await runTest('POST /api/booking-requests creates reservation hold with holdExpiresAt', async () => {
      const res = await indieClient.request('/api/booking-requests', {
        method: 'POST',
        body: JSON.stringify({
          listingType: 'studio',
          studioId: createdStudioId,
          requestedDate: testShootDate,
          startTime: '10:00',
          durationHours: 4,
          shiftType: '4h Morning Production',
          productionName: 'Commercial Shoot Alfa',
          contactEmail: indieEmail,
        }),
      });
      if (res.status !== 201) throw new Error(`Expected 201, got ${res.status}: ${JSON.stringify(res.body)}`);
      if (!res.body.data.holdExpiresAt) {
        throw new Error('Expected holdExpiresAt in booking response');
      }
    });

    // 63. Reject Overlapping Booking Slot (Conflict Detection)
    await runTest('POST /api/booking-requests rejects overlapping reservation with 409 Conflict', async () => {
      const res = await upgradeClient.request('/api/booking-requests', {
        method: 'POST',
        body: JSON.stringify({
          listingType: 'studio',
          studioId: createdStudioId,
          requestedDate: testShootDate,
          startTime: '11:00', // Overlaps with 10:00-14:00
          durationHours: 3,
          shiftType: '3h Session',
          productionName: 'Conflicting Booking Shoot',
          contactEmail: upgradeUserEmail,
        }),
      });
      if (res.status !== 409) {
        throw new Error(`Expected 409 Conflict for overlapping booking, got ${res.status}: ${JSON.stringify(res.body)}`);
      }
      if (res.body.code !== 'BOOKING_CONFLICT') {
        throw new Error(`Expected BOOKING_CONFLICT code, got ${res.body.code}`);
      }
    });

    // 64. Stage Owner Blocks Maintenance Date
    const blockedShootDate = new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    await runTest('POST /api/availability/studio/:id/block allows stage owner to block dates', async () => {
      const res = await hostClient.request(`/api/availability/studio/${createdStudioId}/block`, {
        method: 'POST',
        body: JSON.stringify({
          startDate: blockedShootDate,
          endDate: blockedShootDate,
          reason: 'Stage acoustic repainting & truss maintenance',
        }),
      });
      if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}: ${JSON.stringify(res.body)}`);
    });

    // 65. Reject Booking on Blocked Date
    await runTest('POST /api/booking-requests rejects reservation on owner-blocked date with 409', async () => {
      const res = await indieClient.request('/api/booking-requests', {
        method: 'POST',
        body: JSON.stringify({
          listingType: 'studio',
          studioId: createdStudioId,
          requestedDate: blockedShootDate,
          startTime: '10:00',
          durationHours: 5,
          productionName: 'Shoot on Blocked Date',
          contactEmail: indieEmail,
        }),
      });
      if (res.status !== 409) {
        throw new Error(`Expected 409 Conflict for blocked date, got ${res.status}: ${JSON.stringify(res.body)}`);
      }
    });

    // =========================================================================
    // ROLE-BASED ACCESS CONTROL (RBAC) & ADMIN PLATFORM SECURITY TESTS
    // =========================================================================

    const superAdminClient = new TestClient(`http://localhost:${port}`);
    const unauthClient = new TestClient(`http://localhost:${port}`);

    // 66. Unauthorized Request Barrier
    await runTest('GET /api/admin/metrics rejects unauthenticated requests with 401', async () => {
      const res = await unauthClient.request('/api/admin/metrics');
      if (res.status !== 401) throw new Error(`Expected 401, got ${res.status}: ${JSON.stringify(res.body)}`);
      if (res.body.code !== 'UNAUTHENTICATED') throw new Error(`Expected UNAUTHENTICATED code, got ${res.body.code}`);
    });

    // 67. Customer Access Barrier to Admin Endpoints
    await runTest('GET /api/admin/metrics rejects non-admin customer requests with 403', async () => {
      // Re-authenticate customer client
      await client.request('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: testEmail,
          password: 'BrandNewSecurePassword456!',
        }),
      });

      const res = await client.request('/api/admin/metrics');
      if (res.status !== 403) throw new Error(`Expected 403 Forbidden, got ${res.status}: ${JSON.stringify(res.body)}`);
      if (res.body.code !== 'FORBIDDEN_NOT_ADMIN') throw new Error(`Expected FORBIDDEN_NOT_ADMIN code, got ${res.body.code}`);
    });

    // 68. Super Admin Authentication & Verified Roles
    const testSaEmail = `test.superadmin.${Date.now()}@bookmystudio.internal`;
    const testSaPass = 'SuperAdminPass#2026!';
    let testSaId = '';

    await runTest('POST /api/auth/login authenticates Super Admin and returns SUPER_ADMIN role', async () => {
      const hash = await User.hashPassword(testSaPass);
      const saDoc = await User.create({
        fullName: 'Test Executive Super Admin',
        email: testSaEmail,
        passwordHash: hash,
        roles: ['SUPER_ADMIN', 'ADMIN', 'CUSTOMER'],
        isVerified: true,
        accountStatus: 'ACTIVE',
      });
      testSaId = saDoc._id.toString();

      const res = await superAdminClient.request('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: testSaEmail,
          password: testSaPass,
        }),
      });

      if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}: ${JSON.stringify(res.body)}`);
      if (!res.body.user.roles.includes('SUPER_ADMIN')) {
        throw new Error(`User does not have SUPER_ADMIN role: ${res.body.user.roles}`);
      }
    });

    // 69. Aggregated Live Database Admin Metrics
    await runTest('GET /api/admin/metrics returns real database metrics to Super Admin', async () => {
      const res = await superAdminClient.request('/api/admin/metrics');
      if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}: ${JSON.stringify(res.body)}`);
      if (!res.body.data || typeof res.body.data.users?.total !== 'number') {
        throw new Error(`Invalid metrics payload: ${JSON.stringify(res.body)}`);
      }
      if (typeof res.body.data.listings?.total !== 'number') {
        throw new Error('Listings metrics missing from response');
      }
      if (typeof res.body.data.bookings?.total !== 'number') {
        throw new Error('Bookings metrics missing from response');
      }
    });

    // 70. Paginated Users Registry
    let targetUserId = '';
    await runTest('GET /api/admin/users returns verified accounts registry with pagination', async () => {
      const res = await superAdminClient.request('/api/admin/users?limit=10');
      if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
      if (!Array.isArray(res.body.data) || res.body.data.length === 0) {
        throw new Error('Expected at least 1 user in admin directory');
      }
      targetUserId = res.body.data[0].id;
      if (!res.body.pagination || typeof res.body.pagination.total !== 'number') {
        throw new Error('Pagination metadata missing');
      }
    });

    // 71. User Account Status Toggle & Audit Logging
    await runTest('PATCH /api/admin/users/:id/status updates account status and logs action', async () => {
      // Find a customer user (not super admin) to update
      const customerUser = await User.findOne({ email: testEmail });
      if (!customerUser) throw new Error('Customer user not found');

      const res = await superAdminClient.request(`/api/admin/users/${customerUser._id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({
          status: 'SUSPENDED',
          reason: 'Test safety compliance hold',
        }),
      });

      if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}: ${JSON.stringify(res.body)}`);
      if (res.body.data.accountStatus !== 'SUSPENDED') {
        throw new Error(`Expected SUSPENDED status, got ${res.body.data.accountStatus}`);
      }

      // Restore to active
      await superAdminClient.request(`/api/admin/users/${customerUser._id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({
          status: 'ACTIVE',
          reason: 'Hold resolved',
        }),
      });
    });

    // 72. Super Admin Safeguard: Cannot Demote Themselves
    await runTest('POST /api/admin/access-management/assign prevents Super Admin self-demotion', async () => {
      const res = await superAdminClient.request('/api/admin/access-management/assign', {
        method: 'POST',
        body: JSON.stringify({
          userId: testSaId,
          role: 'SUPER_ADMIN',
          action: 'REVOKE',
        }),
      });

      if (res.status !== 400) {
        throw new Error(`Expected 400 Bad Request for self-demotion, got ${res.status}: ${JSON.stringify(res.body)}`);
      }
    });

    // 73. Super Admin Only Barrier for Role Management
    await runTest('GET /api/admin/access-management rejects standard ADMIN role with 403', async () => {
      // adminClient has role ADMIN, but not SUPER_ADMIN
      const res = await adminClient.request('/api/admin/access-management');
      if (res.status !== 403) {
        throw new Error(`Expected 403 Forbidden for non-superadmin, got ${res.status}: ${JSON.stringify(res.body)}`);
      }
      if (res.body.code !== 'FORBIDDEN_NOT_SUPER_ADMIN') {
        throw new Error(`Expected FORBIDDEN_NOT_SUPER_ADMIN code, got ${res.body.code}`);
      }
    });

    // 74. Super Admin Can Retrieve Audit Log Ledger
    await runTest('GET /api/admin/audit-logs returns immutable security audit trail', async () => {
      const res = await superAdminClient.request('/api/admin/audit-logs?limit=10');
      if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}: ${JSON.stringify(res.body)}`);
      if (!Array.isArray(res.body.data)) throw new Error('Audit logs data must be an array');
      if (res.body.data.length === 0) throw new Error('Expected at least one audit log entry from previous actions');
    });

  } finally {
    if (server!) {
      server!.close();
    }
    if (mongoose.connection.readyState === 1) {
      assertIsTestDatabase('Test Suite Teardown Clean');
      try {
        await mongoose.connection.db?.dropDatabase();
        console.log('🧹 Isolated test database "bookmystudio_test" dropped successfully.');
      } catch (err: any) {
        console.warn('⚠️ Could not drop test database:', err.message);
      }
    }
    await disconnectDatabase();
  }

  const passedCount = results.filter((r) => r.passed).length;
  const failedCount = results.filter((r) => !r.passed).length;

  console.log('\n======================================================');
  console.log(`📊 TEST SUITE SUMMARY: ${passedCount} PASSED, ${failedCount} FAILED (${results.length} total)`);
  console.log('======================================================\n');

  if (failedCount > 0) {
    process.exit(1);
  }
}

runTests();
