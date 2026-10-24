'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import { SettingsNav } from '@/components/settings/SettingsNav';
import { LockIcon, EyeIcon, EyeOffIcon, CheckCircleIcon } from '@/components/ui/Icons';
import { useAuth } from '@/context/AuthContext';
import { PhoneVerificationModal } from '@/components/auth/PhoneVerificationModal';
import { ThemeToggle } from '@/components/common/ThemeToggle';
import { authApi } from '@/lib/api/auth';

export default function AccountSettingsPage() {
  const router = useRouter();
  const { user, isLoading, isConfigured, signOut, refreshUser } = useAuth();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Phone verification state
  const [isPhoneModalOpen, setIsPhoneModalOpen] = useState(false);
  const [phoneActionMsg, setPhoneActionMsg] = useState<string | null>(null);
  const [isRemovingPhone, setIsRemovingPhone] = useState(false);

  // Notification state
  const [notifyCoi, setNotifyCoi] = useState(true);
  const [notifyCallSheet, setNotifyCallSheet] = useState(true);
  const [notifyOvertime, setNotifyOvertime] = useState(true);

  useEffect(() => {
    if (!isLoading && !user && isConfigured) {
      router.push('/login?next=/account/settings');
    }
  }, [user, isLoading, isConfigured, router]);

  const email = user?.email || 'producer@bookmystudio.com';
  const fullName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Producer';

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setUpdateSuccess(false);

    if (!password) {
      setErrorMsg('Please enter a new password.');
      return;
    }

    if (password.length < 8) {
      setErrorMsg('New password must be at least 8 characters in length.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setIsUpdating(true);

    try {
      setUpdateSuccess(true);
      setPassword('');
      setConfirmPassword('');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unable to update password.';
      setErrorMsg(msg);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
    router.refresh();
  };

  const handleRemovePhone = async () => {
    if (!window.confirm('Are you sure you want to remove your phone number? You will need to verify a phone number again to publish listings.')) {
      return;
    }
    setIsRemovingPhone(true);
    setPhoneActionMsg(null);
    try {
      const res = await authApi.removePhone();
      if (res.success) {
        await refreshUser();
        setPhoneActionMsg('Phone number removed.');
      } else {
        setPhoneActionMsg(res.error || 'Failed to remove phone number.');
      }
    } catch {
      setPhoneActionMsg('Network error removing phone number.');
    } finally {
      setIsRemovingPhone(false);
    }
  };

  return (
    <div className="py-8 bg-zinc-50 dark:bg-[#09090B] min-h-[calc(100vh-140px)] text-zinc-900 dark:text-zinc-100 transition-colors duration-150">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumbs */}
        <Breadcrumbs
          items={[
            { label: 'Production Dashboard', href: '/dashboard' },
            { label: 'Account Profile', href: '/account' },
            { label: 'Settings' },
          ]}
          className="mb-6"
        />

        {/* Page Header */}
        <div className="pb-6 border-b border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-950 dark:text-white">
              Account &amp; Security Settings
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
              Update your authentication credentials, theme preference, and shoot notification preferences.
            </p>
          </div>

          <button
            type="button"
            onClick={handleSignOut}
            className="px-3.5 py-2 min-h-[40px] rounded-xl border border-rose-200 dark:border-red-900/50 text-rose-600 dark:text-red-400 hover:bg-rose-50 dark:hover:bg-red-950/30 text-xs font-semibold transition-colors cursor-pointer self-start sm:self-auto"
          >
            Sign Out
          </button>
        </div>

        {/* Settings Navigation Tabs */}
        <SettingsNav />

        <div className="space-y-8">
          {/* Section: Interface Appearance */}
          <div className="p-6 sm:p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121216] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-950 dark:text-white mb-1">
                Interface Appearance
              </h2>
              <p className="text-xs text-zinc-600 dark:text-zinc-400">
                Switch between high-contrast editorial Light Mode and cinematic obsidian Dark Mode.
              </p>
            </div>
            <ThemeToggle variant="segmented" />
          </div>

          {/* Section 1: Connected Credentials */}
          <div className="p-6 sm:p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121216] shadow-xs">
            <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-950 dark:text-white mb-1">
              Production Entity Credentials
            </h2>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-4">
              Your registered primary contact email and commercial name.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-zinc-600 dark:text-zinc-400 font-medium mb-1">Entity Name</label>
                <div className="p-3 bg-zinc-100 dark:bg-[#18181E] border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-white font-semibold min-h-[44px] flex items-center">
                  {fullName}
                </div>
              </div>

              <div>
                <label className="block text-zinc-600 dark:text-zinc-400 font-medium mb-1">Registered Work Email</label>
                <div className="p-3 bg-zinc-100 dark:bg-[#18181E] border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-white font-semibold min-h-[44px] flex items-center">
                  {email}
                </div>
              </div>
            </div>
          </div>

          {/* Section: Production Phone & OTP Verification */}
          <div className="p-6 sm:p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121216] shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-950 dark:text-white mb-1 flex items-center gap-2">
                  <span>Production Phone Verification</span>
                  {user?.isPhoneVerified ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/80">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      Verified
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-400 border border-amber-200 dark:border-amber-800/80">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                      Unverified
                    </span>
                  )}
                </h2>
                <p className="text-xs text-zinc-600 dark:text-zinc-400">
                  Required to publish studio stages, receive shoot booking confirmations, and crew dispatch alerts.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsPhoneModalOpen(true)}
                className="px-4 py-2 min-h-[40px] bg-amber-500 hover:bg-amber-400 text-zinc-950 rounded-xl text-xs font-bold transition-all shadow-xs active:scale-95 cursor-pointer self-start sm:self-auto shrink-0"
              >
                {user?.isPhoneVerified ? 'Update Phone' : user?.phone ? 'Verify Phone' : 'Add Phone Number'}
              </button>
            </div>

            {phoneActionMsg && (
              <div className="mb-4 p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-300 text-xs">
                {phoneActionMsg}
              </div>
            )}

            <div className="p-4 rounded-xl bg-zinc-100 dark:bg-[#18181E] border border-zinc-200 dark:border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-zinc-800 border border-zinc-700/60 flex items-center justify-center text-zinc-400">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <div>
                  <div className="text-xs font-semibold text-white">
                    {user?.phone ? user.phone : 'No phone number registered'}
                  </div>
                  <div className="text-[11px] text-zinc-500">
                    {user?.isPhoneVerified && user?.phoneVerifiedAt
                      ? `Verified via SMS OTP on ${new Date(user.phoneVerifiedAt).toLocaleDateString()}`
                      : user?.phone
                      ? 'Action required: Complete SMS OTP verification to publish stages'
                      : 'Add a mobile number to enable marketplace listing publishing'}
                  </div>
                </div>
              </div>

              {user?.phone && (
                <button
                  type="button"
                  disabled={isRemovingPhone}
                  onClick={handleRemovePhone}
                  className="text-xs text-red-400 hover:text-red-300 hover:underline self-start sm:self-auto disabled:opacity-50 cursor-pointer"
                >
                  {isRemovingPhone ? 'Removing...' : 'Remove Phone'}
                </button>
              )}
            </div>
          </div>

          {/* Section 2: Update Password Form */}
          <div className="p-6 sm:p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121216] shadow-xs">
            <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-950 dark:text-white mb-1">
              Change Account Password
            </h2>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-4">
              Ensure your password is at least 8 characters in length.
            </p>

            {updateSuccess && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircleIcon className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Password updated successfully.</span>
              </div>
            )}

            {errorMsg && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-red-950/40 border border-rose-200 dark:border-red-900 text-rose-800 dark:text-red-300 text-xs">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handlePasswordUpdate} className="space-y-4 max-w-md">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-200 mb-1">
                  New Password
                </label>
                <div className="relative">
                  <LockIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 dark:text-zinc-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-10 py-2.5 min-h-[44px] bg-zinc-100 dark:bg-[#18181E] border border-zinc-200 dark:border-zinc-800 rounded-xl text-base sm:text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all shadow-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white p-1 min-w-[32px] min-h-[32px] flex items-center justify-center cursor-pointer"
                  >
                    {showPassword ? <EyeOffIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-200 mb-1">
                  Confirm New Password
                </label>
                <div className="relative">
                  <LockIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 dark:text-zinc-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-4 py-2.5 min-h-[44px] bg-zinc-100 dark:bg-[#18181E] border border-zinc-200 dark:border-zinc-800 rounded-xl text-base sm:text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all shadow-xs"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isUpdating}
                className="px-5 py-2.5 min-h-[44px] bg-amber-500 hover:bg-amber-400 text-zinc-950 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-xs active:scale-95 cursor-pointer disabled:opacity-50"
              >
                {isUpdating ? 'Updating Password...' : 'Save New Password'}
              </button>
            </form>
          </div>

          {/* Section 3: Shoot & Call Sheet Notification Preferences */}
          <div className="p-6 sm:p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121216] space-y-4 shadow-xs">
            <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-950 dark:text-white mb-1">
              Call Sheet &amp; Stage Notifications
            </h2>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-4">
              Configure automated notifications dispatched to your production team.
            </p>

            <div className="space-y-3 text-xs">
              <label className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 dark:bg-[#18181E] border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 cursor-pointer transition-colors shadow-xs">
                <div>
                  <div className="font-bold text-zinc-900 dark:text-white">Certificate of Insurance (COI) Endorsements</div>
                  <div className="text-[11px] text-zinc-500 dark:text-zinc-400">Receive automated copies of host COI certificates 24h prior to load-in.</div>
                </div>
                <input
                  type="checkbox"
                  checked={notifyCoi}
                  onChange={(e) => setNotifyCoi(e.target.checked)}
                  className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 dark:bg-[#18181E] border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 cursor-pointer transition-colors shadow-xs">
                <div>
                  <div className="font-bold text-zinc-900 dark:text-white">Call Sheet Crew Dispatch Updates</div>
                  <div className="text-[11px] text-zinc-500 dark:text-zinc-400">Alerts when selected department head agents accept 48h hold notices.</div>
                </div>
                <input
                  type="checkbox"
                  checked={notifyCallSheet}
                  onChange={(e) => setNotifyCallSheet(e.target.checked)}
                  className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 dark:bg-[#18181E] border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 cursor-pointer transition-colors shadow-xs">
                <div>
                  <div className="font-bold text-zinc-900 dark:text-white">Overtime &amp; Wrap Reminders</div>
                  <div className="text-[11px] text-zinc-500 dark:text-zinc-400">SMS / Email alerts at the 9-hour mark before commercial 1.5x overtime begins.</div>
                </div>
                <input
                  type="checkbox"
                  checked={notifyOvertime}
                  onChange={(e) => setNotifyOvertime(e.target.checked)}
                  className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Phone Verification Modal */}
        <PhoneVerificationModal
          isOpen={isPhoneModalOpen}
          onClose={() => setIsPhoneModalOpen(false)}
          initialPhone={user?.phone || ''}
          onSuccess={() => {
            setPhoneActionMsg('Phone verified successfully!');
            refreshUser();
          }}
        />
      </div>
    </div>
  );
}
