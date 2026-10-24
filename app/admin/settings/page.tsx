'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { apiClient } from '@/lib/api/client';
import { ShieldPolicyIcon } from '@/components/ui/Icons';

interface SmtpTestResult {
  success: boolean;
  message?: string;
  error?: string;
}

export default function AdminSettingsPage() {
  const { user, isSuperAdmin } = useAuth();
  const [smtpTesting, setSmtpTesting] = useState(false);
  const [smtpResult, setSmtpResult] = useState<SmtpTestResult | null>(null);

  const testSmtpConnection = async () => {
    setSmtpTesting(true);
    setSmtpResult(null);
    try {
      const res = await apiClient.get<SmtpTestResult>('/health/smtp');
      setSmtpResult(res);
    } catch (err: unknown) {
      setSmtpResult({ success: false, error: err instanceof Error ? err.message : 'Network failure' });
    } finally {
      setSmtpTesting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl animate-in fade-in duration-150">
      <div className="border-b border-zinc-200 dark:border-zinc-800 pb-5">
        <h1 className="text-xl sm:text-2xl font-black tracking-tight text-zinc-900 dark:text-white">System Architecture &amp; Settings</h1>
        <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">
          Platform configurations, environment diagnostics, and messaging services
        </p>
      </div>

      {/* System Status Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-[#121216] border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-2">
          <span className="text-[10px] font-mono text-zinc-500 dark:text-zinc-400 uppercase">Database Architecture</span>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-bold text-zinc-900 dark:text-white text-sm">MongoDB Replica / Standalone</span>
          </div>
          <p className="text-[11px] text-zinc-600 dark:text-zinc-400">
            Session storage: MongoStore (`sessions` collection, 7-day rolling TTL).
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#121216] border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-2">
          <span className="text-[10px] font-mono text-zinc-500 dark:text-zinc-400 uppercase">Backend Server</span>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-bold text-zinc-900 dark:text-white text-sm">Express + TypeScript (Port 4000)</span>
          </div>
          <p className="text-[11px] text-zinc-600 dark:text-zinc-400">
            CORS origin: http://localhost:3000 with credentials enabled.
          </p>
        </div>
      </div>

      {/* SMTP Email Delivery Service Diagnostic */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#121216] border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
          <div>
            <h2 className="text-sm font-bold text-zinc-900 dark:text-white">Transactional Email Delivery Service</h2>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">Dispatches account verification OTPs and stage reservation receipts</p>
          </div>
          <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
            Gmail SMTP Port 465
          </span>
        </div>

        <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed">
          Verify outbound handshake to Gmail SMTP without exposing production secrets. In local or offline test environments, email dispatch falls back to secure simulation mode.
        </p>

        <div>
          <button
            type="button"
            disabled={smtpTesting}
            onClick={testSmtpConnection}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs transition-colors cursor-pointer disabled:opacity-50"
          >
            {smtpTesting ? 'Testing SMTP Handshake...' : '⚡ Test SMTP Connection'}
          </button>
        </div>

        {smtpResult && (
          <div
            className={`p-4 rounded-2xl border text-xs font-mono space-y-1 ${
              smtpResult.success
                ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                : 'bg-rose-50 dark:bg-rose-950/30 border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-300'
            }`}
          >
            <div className="font-bold flex items-center gap-1.5">
              <span>{smtpResult.success ? '✓ SMTP Handshake Succeeded' : '✕ SMTP Handshake Failed'}</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              {smtpResult.message || smtpResult.error}
            </p>
          </div>
        )}
      </div>

      {/* Security & Access Allowlist */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#121216] border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
          <div>
            <h2 className="text-sm font-bold text-zinc-900 dark:text-white">Administrative Security Allowlist</h2>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">Configured secondary environment safeguard</p>
          </div>
          <ShieldPolicyIcon className="w-5 h-5 text-amber-500 dark:text-amber-400" />
        </div>

        <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-[#18181E] border border-zinc-200 dark:border-zinc-800 text-xs font-mono space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-zinc-500 dark:text-zinc-400">ADMIN_EMAILS:</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">raghuveerlinkedin@gmail.com</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-zinc-500 dark:text-zinc-400">Session Cookie Name:</span>
            <span className="text-zinc-800 dark:text-zinc-200">bms_sid (HttpOnly, SameSite)</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-zinc-500 dark:text-zinc-400">Active Admin ID:</span>
            <span className="text-zinc-800 dark:text-zinc-200">{user?.id || '—'}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-zinc-500 dark:text-zinc-400">Executive Clearance:</span>
            <span className={isSuperAdmin ? 'text-amber-600 dark:text-amber-400 font-bold' : 'text-zinc-700 dark:text-zinc-300'}>
              {isSuperAdmin ? 'SUPER_ADMIN ACTIVE' : 'ADMIN ROLE'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

