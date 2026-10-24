'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { adminApi } from '@/lib/api/admin';
import { AuthUser } from '@/lib/api/auth';
import { useAuth } from '@/context/AuthContext';
import { ShieldPolicyIcon, AlertCircleIcon } from '@/components/ui/Icons';

export default function AdminAccessManagementPage() {
  const { user: currentAdmin, isSuperAdmin } = useAuth();
  const [admins, setAdmins] = useState<AuthUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Promote / Assign Role Form State
  const [targetEmail, setTargetEmail] = useState('');
  const [selectedRole, setSelectedRole] = useState<'ADMIN' | 'SUPER_ADMIN' | 'SUPPORT'>('ADMIN');
  const [isPromoting, setIsPromoting] = useState(false);

  // Revoke Action Confirmation State
  const [revokeTarget, setRevokeTarget] = useState<AuthUser | null>(null);
  const [revokeRole, setRevokeRole] = useState<'ADMIN' | 'SUPER_ADMIN' | 'SUPPORT'>('ADMIN');
  const [isRevoking, setIsRevoking] = useState(false);

  const fetchAdmins = useCallback(async () => {
    try {
      setErrorMsg(null);
      const res = await adminApi.getAccessManagement();
      if (res.success && Array.isArray(res.data)) {
        setAdmins(res.data);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to retrieve administrative personnel.';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    if (isSuperAdmin) {
      adminApi
        .getAccessManagement()
        .then((res) => {
          if (!ignore && res.success && Array.isArray(res.data)) {
            setAdmins(res.data);
          }
        })
        .catch((err: unknown) => {
          if (!ignore) {
            setErrorMsg(err instanceof Error ? err.message : 'Failed to retrieve administrative personnel.');
          }
        })
        .finally(() => {
          if (!ignore) setLoading(false);
        });
    }
    return () => {
      ignore = true;
    };
  }, [isSuperAdmin]);

  // Non-super-admin barrier
  if (!isSuperAdmin) {
    return (
      <div className="py-16 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 mx-auto flex items-center justify-center border border-purple-500/30">
          <ShieldPolicyIcon className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Privileged Section Restricted</h2>
        <p className="text-xs text-zinc-600 dark:text-zinc-400 max-w-md mx-auto">
          Access Management is strictly restricted to designated platform Super Administrators.
        </p>
      </div>
    );
  }

  // Handle Role Assignment / Promotion
  const handleAssignRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetEmail.trim()) {
      setErrorMsg('Please enter the work email address of the user to assign.');
      return;
    }

    setIsPromoting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      // 1. Locate user by email first
      const userLookup = await adminApi.getUsers({ search: targetEmail.trim() });
      const found = userLookup.data?.find((u) => u.email.toLowerCase() === targetEmail.trim().toLowerCase());

      if (!found) {
        throw new Error(`User "${targetEmail.trim()}" not found in user registry. User must register an account first.`);
      }

      // 2. Assign role
      const res = await adminApi.assignAdminRole({
        userId: found.id,
        role: selectedRole,
        action: 'ASSIGN',
      });

      if (res.success) {
        setSuccessMsg(`Successfully granted ${selectedRole} permissions to ${targetEmail}.`);
        setTargetEmail('');
        fetchAdmins();
      } else {
        throw new Error(res.message || 'Failed to assign role.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error executing role assignment.';
      setErrorMsg(msg);
    } finally {
      setIsPromoting(false);
    }
  };

  // Handle Role Revocation
  const handleExecuteRevoke = async () => {
    if (!revokeTarget) return;

    setIsRevoking(true);
    setErrorMsg(null);

    try {
      const res = await adminApi.assignAdminRole({
        userId: revokeTarget.id,
        role: revokeRole,
        action: 'REVOKE',
      });

      if (res.success) {
        setSuccessMsg(`Successfully revoked ${revokeRole} from ${revokeTarget.email}.`);
        setRevokeTarget(null);
        fetchAdmins();
      } else {
        throw new Error(res.message || 'Failed to revoke role.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error revoking administrator role.';
      setErrorMsg(msg);
    } finally {
      setIsRevoking(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-purple-500 dark:bg-purple-400 animate-pulse" />
            <span className="text-[10px] font-mono uppercase font-bold tracking-widest text-purple-600 dark:text-purple-400">
              SECURITY &amp; PRIVILEGE DESK
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-zinc-900 dark:text-white mt-1">
            Administrator Access Management
          </h1>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">
            Safely authorize, assign, and audit administrative personnel across BookMyStudio
          </p>
        </div>

        <button
          type="button"
          onClick={fetchAdmins}
          className="px-3 py-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-xs font-semibold text-zinc-800 dark:text-zinc-200 border border-zinc-300 dark:border-zinc-700 cursor-pointer self-start sm:self-auto transition-colors"
        >
          ↻ Refresh Personnel
        </button>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs flex items-center justify-between">
          <span>✓ {successMsg}</span>
          <button onClick={() => setSuccessMsg(null)} className="text-emerald-600 dark:text-emerald-400 hover:text-zinc-900 dark:hover:text-white">✕</button>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs flex items-center justify-between">
          <span>✕ {errorMsg}</span>
          <button onClick={() => setErrorMsg(null)} className="text-rose-600 dark:text-rose-400 hover:text-zinc-900 dark:hover:text-white">✕</button>
        </div>
      )}

      {/* Top Form: Grant Role to an Existing Account */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#121216] border border-zinc-200 dark:border-zinc-800 space-y-4 shadow-xs">
        <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
          <div>
            <h2 className="text-sm font-bold text-zinc-900 dark:text-white">Authorize New Administrator</h2>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">
              Elevate an existing verified account to an operational administrator role
            </p>
          </div>
          <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-purple-500/10 text-purple-700 dark:text-purple-400 border border-purple-500/30 font-semibold">
            SUPER_ADMIN ACTION
          </span>
        </div>

        <form onSubmit={handleAssignRole} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
          <div className="sm:col-span-6 space-y-1">
            <label className="text-[10px] font-mono text-zinc-600 dark:text-zinc-400 uppercase">
              Target User Email Address
            </label>
            <input
              type="email"
              value={targetEmail}
              onChange={(e) => setTargetEmail(e.target.value)}
              placeholder="e.g. curator@bookmystudio.com"
              required
              className="w-full px-3.5 py-2 rounded-xl bg-zinc-50 dark:bg-[#18181E] border border-zinc-300 dark:border-zinc-700 text-xs text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="sm:col-span-3 space-y-1">
            <label className="text-[10px] font-mono text-zinc-600 dark:text-zinc-400 uppercase">
              Administrative Privilege Tier
            </label>
            <select
              value={selectedRole}
              onChange={(e) =>
                setSelectedRole(e.target.value as 'ADMIN' | 'SUPER_ADMIN' | 'SUPPORT')
              }
              className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-[#18181E] border border-zinc-300 dark:border-zinc-700 text-xs text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-purple-500 cursor-pointer"
            >
              <option value="ADMIN">ADMIN (Curation &amp; Ops)</option>
              <option value="SUPER_ADMIN">SUPER_ADMIN (Full Platform Authority)</option>
              <option value="SUPPORT">SUPPORT (Restricted Inquiries)</option>
            </select>
          </div>

          <div className="sm:col-span-3">
            <button
              type="submit"
              disabled={isPromoting || !targetEmail.trim()}
              className="w-full py-2 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white font-bold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>{isPromoting ? 'Authorizing...' : '+ Grant Role'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Authorized Personnel Table */}
      <div className="rounded-2xl bg-white dark:bg-[#121216] border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-xs">
        <div className="p-4 bg-zinc-50 dark:bg-[#18181E] border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <span className="text-xs font-bold text-zinc-900 dark:text-white uppercase font-mono tracking-wider">
            Active Administrative Personnel ({admins.length})
          </span>
          <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
            Backed by live database authorization
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-100/70 dark:bg-[#141418] text-zinc-600 dark:text-zinc-400 uppercase font-mono text-[10px] border-b border-zinc-200 dark:border-zinc-800">
              <tr>
                <th className="px-4 py-3">Administrator</th>
                <th className="px-4 py-3">Role Tier</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Date Granted</th>
                <th className="px-4 py-3 text-right">Safeguards &amp; Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800/80">
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-zinc-500 dark:text-zinc-400">
                    <div className="w-6 h-6 rounded-full border-2 border-purple-500 border-t-transparent animate-spin mx-auto mb-2" />
                    Querying administrative personnel...
                  </td>
                </tr>
              ) : admins.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-zinc-500 dark:text-zinc-400">
                    No administrative accounts found.
                  </td>
                </tr>
              ) : (
                admins.map((admin) => {
                  const isCurrent = currentAdmin?.id === admin.id;
                  const isTargetSuper = admin.roles?.includes('SUPER_ADMIN');

                  return (
                    <tr key={admin.id} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-850/40 transition-colors">
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold text-xs shrink-0">
                            {admin.fullName?.charAt(0) || 'A'}
                          </div>
                          <div>
                            <div className="font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                              <span>{admin.fullName}</span>
                              {isCurrent && (
                                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-700 dark:text-amber-300 font-bold">
                                  ACTIVE SESSION
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400">{admin.email}</div>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1 flex-wrap">
                          {admin.roles?.map((r) => (
                            <span
                              key={r}
                              className={`text-[9.5px] font-mono font-bold px-2 py-0.5 rounded border ${
                                r === 'SUPER_ADMIN'
                                  ? 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30'
                                  : r === 'ADMIN'
                                  ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30'
                                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-300 dark:border-zinc-700'
                              }`}
                            >
                              {r}
                            </span>
                          ))}
                        </div>
                      </td>

                      <td className="px-4 py-3.5">
                        <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 font-bold">
                          {admin.accountStatus}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 text-zinc-600 dark:text-zinc-400 font-mono text-[11px]">
                        {admin.createdAt ? new Date(admin.createdAt).toLocaleDateString() : '—'}
                      </td>

                      <td className="px-4 py-3.5 text-right">
                        {isCurrent ? (
                          <span className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500 italic">Self (Protected)</span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setRevokeTarget(admin);
                              setRevokeRole(isTargetSuper ? 'SUPER_ADMIN' : 'ADMIN');
                            }}
                            className="px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-700 dark:text-rose-400 border border-rose-500/30 text-[11px] font-bold transition-colors cursor-pointer"
                          >
                            Revoke Privileges
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Revocation Confirmation Modal */}
      {revokeTarget && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white dark:bg-[#141418] border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center gap-2.5 text-rose-600 dark:text-rose-400">
              <AlertCircleIcon className="w-5 h-5" />
              <h3 className="text-base font-bold text-zinc-900 dark:text-white">Revoke Administrative Privileges</h3>
            </div>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Are you sure you want to revoke <strong className="text-zinc-900 dark:text-white">{revokeRole}</strong> privileges from{' '}
              <strong className="text-zinc-900 dark:text-white">{revokeTarget.fullName}</strong> ({revokeTarget.email})?
            </p>

            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-700 dark:text-amber-300">
              ⚠️ This action will immediately block the user from accessing protected administrative panels and APIs. The event will be recorded in the audit ledger.
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-200 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setRevokeTarget(null)}
                className="px-3.5 py-2 rounded-xl text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isRevoking}
                onClick={handleExecuteRevoke}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                {isRevoking ? 'Revoking...' : 'Confirm Revocation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

