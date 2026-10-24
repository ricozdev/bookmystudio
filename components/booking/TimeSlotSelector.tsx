'use client';

import React, { useMemo } from 'react';
import { AvailabilitySlot } from '@/lib/types';

interface TimeSlotSelectorProps {
  slots: AvailabilitySlot[];
  selectedStartTime: string;
  selectedDuration: number;
  onSelectStartTime: (timeStr: string) => void;
  onSelectDuration: (hours: number) => void;
  isLoading?: boolean;
}

// Convert "09:00" to minutes
function timeToMinutes(t: string): number {
  const [h, m] = t.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

// Convert minutes to "09:00"
function minutesToTime(m: number): string {
  const h = Math.floor(m / 60);
  const min = m % 60;
  return `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
}

// Format "09:00" to "09:00 AM"
function format12h(timeStr: string): string {
  const [hStr, mStr] = timeStr.split(':');
  let h = Number(hStr);
  const m = mStr || '00';
  const period = h >= 12 ? 'PM' : 'AM';
  if (h === 0) h = 12;
  else if (h > 12) h -= 12;
  return `${String(h).padStart(2, '0')}:${m} ${period}`;
}

const DURATION_OPTIONS = [
  { hours: 1, label: '1 Hour', tag: 'Hourly' },
  { hours: 2, label: '2 Hours', tag: 'Quick Shoot' },
  { hours: 3, label: '3 Hours', tag: 'Session' },
  { hours: 5, label: '5 Hours', tag: 'Half-Day' },
  { hours: 10, label: '10 Hours', tag: 'Standard Shoot Day' },
  { hours: 12, label: '12 Hours', tag: 'Extended Day' },
];

export function TimeSlotSelector({
  slots,
  selectedStartTime,
  selectedDuration,
  onSelectStartTime,
  onSelectDuration,
  isLoading = false,
}: TimeSlotSelectorProps) {
  // Map of start times to slot objects
  const slotMap = useMemo(() => {
    const map = new Map<string, AvailabilitySlot>();
    slots.forEach((s) => map.set(s.start, s));
    return map;
  }, [slots]);

  // Operating window limits
  const latestPossibleEndMin = useMemo(() => {
    if (slots.length === 0) return 20 * 60; // 8:00 PM
    const last = slots[slots.length - 1];
    return timeToMinutes(last.end);
  }, [slots]);

  // Evaluate candidate starting slots
  const evaluatedSlots = useMemo(() => {
    if (slots.length === 0) {
      // Default slots fallback if API slots still loading
      const fallbackTimes = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'];
      return fallbackTimes.map((t) => ({
        start: t,
        label: format12h(t),
        isAvailable: true,
        reason: undefined,
      }));
    }

    return slots.map((s) => {
      const startMin = timeToMinutes(s.start);
      const endMin = startMin + selectedDuration * 60;
      const endTimeStr = minutesToTime(endMin);

      // Check if interval extends past operating closing time
      if (endMin > latestPossibleEndMin) {
        return {
          start: s.start,
          label: format12h(s.start),
          isAvailable: false,
          reason: `Exceeds stage operating hours (closes ${format12h(minutesToTime(latestPossibleEndMin))})`,
        };
      }

      // Check all hourly intervals in this duration
      let isAvailable = true;
      let reason: string | undefined;

      for (let cur = startMin; cur < endMin; cur += 60) {
        const curTimeStr = minutesToTime(cur);
        const subSlot = slotMap.get(curTimeStr);

        if (!subSlot) {
          isAvailable = false;
          reason = 'Time interval not available';
          break;
        }

        if (subSlot.status !== 'available') {
          isAvailable = false;
          if (subSlot.status === 'past') {
            reason = 'Time slot has passed';
          } else if (subSlot.status === 'blocked') {
            reason = 'Stage reserved for maintenance';
          } else {
            reason = 'Reserved by another production';
          }
          break;
        }
      }

      return {
        start: s.start,
        label: format12h(s.start),
        endTimeStr,
        isAvailable,
        reason,
      };
    });
  }, [slots, selectedDuration, slotMap, latestPossibleEndMin]);

  // Selected window summary string
  const selectedWindowSummary = useMemo(() => {
    if (!selectedStartTime) return null;
    const startMin = timeToMinutes(selectedStartTime);
    const endMin = startMin + selectedDuration * 60;
    return `${format12h(selectedStartTime)} – ${format12h(minutesToTime(endMin))} (${selectedDuration}h)`;
  }, [selectedStartTime, selectedDuration]);

  return (
    <div className="w-full bg-white dark:bg-[#121216] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 transition-all space-y-5">
      {/* 1. Duration Selection */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
            Booking Duration
          </label>
          <span className="text-[11px] text-amber-600 dark:text-amber-400 font-mono font-medium">
            {selectedDuration}h shoot window
          </span>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
          {DURATION_OPTIONS.map((opt) => {
            const isSelected = selectedDuration === opt.hours;
            return (
              <button
                key={opt.hours}
                type="button"
                onClick={() => onSelectDuration(opt.hours)}
                className={`py-2 px-1.5 rounded-xl border text-center transition-all ${
                  isSelected
                    ? 'bg-amber-500 text-black border-amber-400 font-extrabold shadow-[0_0_12px_rgba(245,158,11,0.3)]'
                    : 'bg-zinc-50 dark:bg-zinc-900/60 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 hover:text-zinc-900 dark:hover:text-white'
                }`}
              >
                <div className="text-xs font-bold">{opt.label}</div>
                <div className={`text-[10px] truncate ${isSelected ? 'text-black/80 font-semibold' : 'text-zinc-500'}`}>
                  {opt.tag}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Start Time Slots */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
            Choose Your Time Slot
          </label>
          {isLoading && (
            <span className="text-[11px] text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
              Checking availability...
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {evaluatedSlots.map((slot) => {
            const isSelected = selectedStartTime === slot.start;
            const isClickable = slot.isAvailable;

            return (
              <button
                key={slot.start}
                type="button"
                disabled={!isClickable}
                onClick={() => onSelectStartTime(slot.start)}
                title={slot.reason || `Start at ${slot.label}`}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'bg-amber-500 text-black border-amber-400 font-extrabold shadow-[0_0_14px_rgba(245,158,11,0.35)]'
                    : isClickable
                    ? 'bg-zinc-50 dark:bg-zinc-900/70 text-zinc-800 dark:text-zinc-200 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 active:scale-95'
                    : 'bg-zinc-100/60 dark:bg-zinc-950/40 text-zinc-400 dark:text-zinc-600 border-zinc-200 dark:border-zinc-900 cursor-not-allowed opacity-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold font-mono tracking-tight">{slot.label}</span>
                  {isSelected && (
                    <span className="w-2 h-2 rounded-full bg-black animate-pulse" />
                  )}
                </div>
                <div className="text-[10px] mt-0.5 truncate">
                  {isClickable ? (
                    <span className={isSelected ? 'text-black/80 font-medium' : 'text-emerald-700 dark:text-emerald-400 font-medium'}>
                      Available
                    </span>
                  ) : (
                    <span className="text-zinc-500 italic">
                      {slot.reason?.includes('Exceeds') ? 'Exceeds hrs' : 'Reserved'}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Selected Interval Banner */}
      {selectedWindowSummary && (
        <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 rounded-xl flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span className="text-zinc-700 dark:text-zinc-300 font-medium">Selected Shoot Window:</span>
          </div>
          <span className="font-mono font-bold text-amber-700 dark:text-amber-400">{selectedWindowSummary}</span>
        </div>
      )}
    </div>
  );
}

