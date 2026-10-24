'use client';

import React, { useState } from 'react';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import { CheckCircleIcon } from '@/components/ui/Icons';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [inquiryType, setInquiryType] = useState('Stage Booking & Availability');
  const [shootDates, setShootDates] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
  };

  return (
    <div className="py-8 bg-white dark:bg-[#101010] min-h-[calc(100vh-140px)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumbs */}
        <Breadcrumbs
          items={[
            { label: 'Contact Support' },
          ]}
          className="mb-6"
        />

        {/* Page Header */}
        <div className="max-w-3xl pb-6 border-b border-slate-100 dark:border-[#262626]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span className="text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-[#8A8A8A]">
              PRODUCTION DESK
            </span>
          </div>

          <h1 className="mt-2 text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-[#F5F5F5]">
            Production Concierge &amp; Facility Support
          </h1>

          <p className="mt-2 text-xs sm:text-sm text-slate-500 dark:text-[#8A8A8A]">
            Direct assistance for commercial shoot holds, multi-stage RFPs, Certificate of Insurance (COI) issuance, and technical stage specifications.
          </p>
        </div>

        {/* 3 Contact Support Channels */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-5 rounded-xl border border-slate-200 dark:border-[#262626] bg-slate-50/60 dark:bg-[#181818]">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-[#F5F5F5]">
              Production Concierge Hotline
            </h2>
            <div className="mt-2 text-lg font-extrabold text-slate-900 dark:text-[#F5F5F5]">
              (888) 550-STUDIO
            </div>
            <p className="mt-1 text-xs text-slate-500 dark:text-[#8A8A8A] leading-relaxed">
              Mon — Sun · 06:00 — 23:00 EST for immediate stage checks, hold verification, and quote assistance.
            </p>
          </div>

          <div className="p-5 rounded-xl border border-slate-200 dark:border-[#262626] bg-slate-50/60 dark:bg-[#181818]">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-[#F5F5F5]">
              Emergency Active Shoot Desk
            </h2>
            <div className="mt-2 text-lg font-extrabold text-amber-600 dark:text-amber-400">
              24/7 Shoot Day Line
            </div>
            <p className="mt-1 text-xs text-slate-500 dark:text-[#8A8A8A] leading-relaxed">
              For confirmed productions currently on stage needing immediate electrical, access gate, or coordinator support.
            </p>
          </div>

          <div className="p-5 rounded-xl border border-slate-200 dark:border-[#262626] bg-slate-50/60 dark:bg-[#181818]">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-[#F5F5F5]">
              Production Hubs
            </h2>
            <div className="mt-2 text-xs font-bold text-slate-800 dark:text-[#F5F5F5]">
              Brooklyn &amp; Los Angeles
            </div>
            <p className="mt-1 text-xs text-slate-500 dark:text-[#8A8A8A] leading-relaxed">
              NYC: 180 West Street, Greenpoint, NY 11222<br />
              LA: 742 S Anderson St, Arts District, CA 90023
            </p>
          </div>
        </div>

        {/* Contact Form Section */}
        <div className="mt-12 max-w-2xl">
          <div className="p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-[#262626] bg-white dark:bg-[#181818] shadow-sm">
            <div className="pb-4 border-b border-slate-100 dark:border-[#262626]">
              <h2 className="text-lg font-bold text-slate-900 dark:text-[#F5F5F5]">
                Submit a Production Inquiry or RFP
              </h2>
              <p className="text-xs text-slate-500 dark:text-[#8A8A8A] mt-0.5">
                A facility coordinator will review your production requirements and respond within 2 hours.
              </p>
            </div>

            {isSubmitted ? (
              <div className="mt-6 p-6 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 text-emerald-950 dark:text-emerald-300 space-y-3">
                <div className="flex items-center gap-2 font-bold text-base">
                  <CheckCircleIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  <span>Inquiry Transmitted to Support Desk!</span>
                </div>
                <p className="text-xs text-emerald-800 dark:text-emerald-200 leading-relaxed">
                  Thank you, <strong className="font-semibold">{name}</strong>. Your inquiry regarding <strong className="font-semibold">{inquiryType}</strong> has been logged. Our commercial production team will contact you at <strong className="font-semibold">{email}</strong>.
                </p>
                <div className="pt-2 border-t border-emerald-200/60 dark:border-emerald-800/40 text-[11px] text-emerald-700 dark:text-emerald-400">
                  <strong>Frontend Demonstration:</strong> No automated email was sent. This is an interactive marketplace prototype.
                </div>
                <button
                  type="button"
                  onClick={() => setIsSubmitted(false)}
                  className="mt-2 px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                >
                  Submit Another Inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-[#B3B3B3] mb-1">
                      Producer / Contact Name
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Maya Chen"
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-[#202020] border border-slate-200 dark:border-[#303030] rounded-lg text-xs text-slate-900 dark:text-[#F5F5F5] focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white dark:focus:bg-[#181818]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-[#B3B3B3] mb-1">
                      Production Company / Agency
                    </label>
                    <input
                      type="text"
                      required
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      placeholder="e.g. Apex Visuals LLC"
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-[#202020] border border-slate-200 dark:border-[#303030] rounded-lg text-xs text-slate-900 dark:text-[#F5F5F5] focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white dark:focus:bg-[#181818]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-[#B3B3B3] mb-1">
                      Work Email
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="maya@apexvisuals.com"
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-[#202020] border border-slate-200 dark:border-[#303030] rounded-lg text-xs text-slate-900 dark:text-[#F5F5F5] focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white dark:focus:bg-[#181818]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-[#B3B3B3] mb-1">
                      Direct Contact Phone
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="(212) 555-0184"
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-[#202020] border border-slate-200 dark:border-[#303030] rounded-lg text-xs text-slate-900 dark:text-[#F5F5F5] focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white dark:focus:bg-[#181818]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-[#B3B3B3] mb-1">
                      Inquiry Category
                    </label>
                    <select
                      value={inquiryType}
                      onChange={(e) => setInquiryType(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-[#202020] border border-slate-200 dark:border-[#303030] rounded-lg text-xs text-slate-900 dark:text-[#F5F5F5] focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white dark:focus:bg-[#181818] cursor-pointer"
                    >
                      <option value="Stage Booking & Availability">Stage Booking &amp; Availability</option>
                      <option value="Multi-Stage RFP / Turnkey Commercial Quote">Multi-Stage Commercial RFP</option>
                      <option value="Certificate of Insurance (COI) Assistance">Insurance &amp; COI Endorsement</option>
                      <option value="Crew & Gear Package Coordination">Crew &amp; Gear Coordination</option>
                      <option value="Studio Host & Facility Onboarding">Host &amp; Stage Curation</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-[#B3B3B3] mb-1">
                      Estimated Shoot Dates / Timeline
                    </label>
                    <input
                      type="text"
                      value={shootDates}
                      onChange={(e) => setShootDates(e.target.value)}
                      placeholder="e.g. Dec 3-5, 2026 (3 Days)"
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-[#202020] border border-slate-200 dark:border-[#303030] rounded-lg text-xs text-slate-900 dark:text-[#F5F5F5] focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white dark:focus:bg-[#181818]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-[#B3B3B3] mb-1">
                    Production Scope &amp; Special Requirements
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Describe creative shoot scope, Camlock electrical requirements, vehicle drive-in needs, or sound isolation specs..."
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#202020] border border-slate-200 dark:border-[#303030] rounded-lg text-xs text-slate-900 dark:text-[#F5F5F5] focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white dark:focus:bg-[#181818] resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-zinc-900 hover:bg-zinc-800 dark:bg-amber-500 dark:hover:bg-amber-400 dark:text-zinc-950 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                >
                  Send Production Inquiry
                </button>
              </form>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
