'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { marketplaceApi } from '@/lib/api/marketplace';
import { MonthDayAvailability, DayAvailabilityStatus } from '@/lib/types';

interface BookingCalendarProps {
  category: string;
  listingId: string;
  selectedDate: string; // YYYY-MM-DD
  onSelectDate: (dateStr: string) => void;
  minDate?: string;
  maxDate?: string;
}

export function BookingCalendar({
  category,
  listingId,
  selectedDate,
  onSelectDate,
  minDate,
}: BookingCalendarProps) {
  const [clientToday, setClientToday] = useState('');

  // Initial current month state derived from selectedDate or stable fallback
  const [currentYearMonth, setCurrentYearMonth] = useState(() => {
    return selectedDate ? selectedDate.slice(0, 7) : '2026-11';
  });

  const [prevSelectedDate, setPrevSelectedDate] = useState(selectedDate);
  if (selectedDate !== prevSelectedDate) {
    setPrevSelectedDate(selectedDate);
    if (selectedDate) {
      setCurrentYearMonth(selectedDate.slice(0, 7));
    }
  }

  // Client-side initialization of current day
  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    queueMicrotask(() => {
      setClientToday(today);
      if (!selectedDate) {
        setCurrentYearMonth(today.slice(0, 7));
      }
    });
  }, [selectedDate]);

  const effectiveMinDate = minDate || clientToday;

  const [monthData, setMonthData] = useState<Record<string, MonthDayAvailability>>({});
  const [isLoading, setIsLoading] = useState(false);

  // Parse current year and month (0-indexed month)
  const [year, month] = useMemo(() => {
    const [y, m] = currentYearMonth.split('-').map(Number);
    return [y, m - 1];
  }, [currentYearMonth]);

  // Load availability month data when month changes or listing changes
  useEffect(() => {
    if (!category || !listingId) return;
    let cancelled = false;

    Promise.resolve()
      .then(() => {
        if (cancelled) return;
        setIsLoading(true);
        return marketplaceApi.getAvailability(category, listingId, { month: currentYearMonth });
      })
      .then((res) => {
        if (cancelled || !res?.success || !res.data) return;
        const rawDays: MonthDayAvailability[] =
          (res.data as unknown as { days?: MonthDayAvailability[] }).days || res.data.monthOverview || [];
        const map: Record<string, MonthDayAvailability> = {};
        rawDays.forEach((d) => {
          map[d.date] = d;
        });
        setMonthData(map);
      })
      .catch(() => {
        if (!cancelled) setMonthData({});
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [category, listingId, currentYearMonth]);

  // Month navigation
  const canGoPrev = useMemo(() => {
    return currentYearMonth > effectiveMinDate.slice(0, 7);
  }, [currentYearMonth, effectiveMinDate]);

  const handlePrevMonth = () => {
    if (!canGoPrev) return;
    const prevDate = new Date(year, month - 1, 1);
    const ym = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}`;
    setCurrentYearMonth(ym);
  };

  const handleNextMonth = () => {
    const nextDate = new Date(year, month + 1, 1);
    const ym = `${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, '0')}`;
    setCurrentYearMonth(ym);
  };

  // Month title formatted (e.g. "November 2026")
  const monthTitle = useMemo(() => {
    const d = new Date(year, month, 1);
    return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }, [year, month]);

  // Calendar days grid calculations
  const calendarCells = useMemo(() => {
    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 = Sun, 6 = Sat
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const cells: {
      dateStr: string;
      dayNumber: number;
      isCurrentMonth: boolean;
      status: DayAvailabilityStatus;
      isPast: boolean;
      isSelected: boolean;
      isAvailable: boolean;
      availableSlots?: number;
    }[] = [];

    // Empty lead cells
    for (let i = 0; i < firstDayIndex; i++) {
      cells.push({
        dateStr: `empty-${i}`,
        dayNumber: 0,
        isCurrentMonth: false,
        status: 'past',
        isPast: true,
        isSelected: false,
        isAvailable: false,
      });
    }

    // Days in current month
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const isPast = dateStr < effectiveMinDate;
      const isSelected = dateStr === selectedDate;
      const apiInfo = monthData[dateStr];
      const status: DayAvailabilityStatus = isPast
        ? 'past'
        : apiInfo?.status || 'available';

      const isAvailable = !isPast && status !== 'fully_booked' && status !== 'blocked';

      cells.push({
        dateStr,
        dayNumber: d,
        isCurrentMonth: true,
        status,
        isPast,
        isSelected,
        isAvailable,
        availableSlots: apiInfo?.availableSlotsCount,
      });
    }

    return cells;
  }, [year, month, effectiveMinDate, selectedDate, monthData]);

  const weekDayNames = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  return (
    <div className="w-full bg-white dark:bg-[#121216] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 select-none transition-all">
      {/* Month Header & Controls */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-white tracking-wide">
            {monthTitle}
          </h3>
          {isLoading && (
            <span
              className="inline-block w-3.5 h-3.5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"
              aria-label="Updating stage schedule"
            />
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handlePrevMonth}
            disabled={!canGoPrev}
            aria-label="Previous month"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            type="button"
            onClick={handleNextMonth}
            aria-label="Next month"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Weekday Headers */}
      <div className="grid grid-cols-7 gap-1 text-center mb-2">
        {weekDayNames.map((name) => (
          <div key={name} className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider py-1">
            {name}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-1 text-center" aria-label="Shoot Date Picker">
        {calendarCells.map((cell, idx) => {
          if (!cell.isCurrentMonth) {
            return <div key={`empty-${idx}`} className="h-10 sm:h-11" aria-hidden="true" />;
          }

          const { dateStr, dayNumber, isPast, isSelected, isAvailable, status } = cell;

          // Styling logic
          let buttonStyle = 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 hover:text-zinc-900 dark:hover:text-white border border-transparent';
          let indicator = null;

          if (isSelected) {
            buttonStyle = 'bg-amber-500 text-black font-extrabold shadow-[0_0_14px_rgba(245,158,11,0.35)] border border-amber-400';
          } else if (isPast) {
            buttonStyle = 'text-zinc-400 dark:text-zinc-600 opacity-40 cursor-not-allowed bg-transparent line-through';
          } else if (status === 'blocked') {
            buttonStyle = 'text-red-700 dark:text-red-400/80 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 cursor-not-allowed';
            indicator = <span className="absolute bottom-1 w-1 h-1 rounded-full bg-red-500" />;
          } else if (status === 'fully_booked') {
            buttonStyle = 'text-zinc-400 dark:text-zinc-500 bg-zinc-100 dark:bg-zinc-900/60 line-through cursor-not-allowed border border-zinc-200 dark:border-zinc-800/40';
          } else if (status === 'partially_available') {
            buttonStyle = 'text-zinc-900 dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800/90 border border-amber-500/40 bg-amber-500/10 dark:bg-amber-500/5';
            indicator = <span className="absolute bottom-1 w-1 h-1 rounded-full bg-amber-500" />;
          } else {
            buttonStyle = 'text-zinc-800 dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800/60';
          }

          return (
            <button
              key={dateStr}
              type="button"
              disabled={!isAvailable}
              onClick={() => onSelectDate(dateStr)}
              aria-label={`${dateStr} - ${status.replace('_', ' ')}`}
              aria-pressed={isSelected}
              className={`relative h-10 sm:h-11 rounded-xl flex flex-col items-center justify-center text-xs sm:text-sm font-medium transition-all ${buttonStyle} focus:outline-none focus:ring-2 focus:ring-amber-500/60 active:scale-95`}
            >
              <span>{dayNumber}</span>
              {!isSelected && indicator}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 pt-3 border-t border-zinc-200 dark:border-zinc-800/70 flex flex-wrap items-center justify-between gap-2 text-[10px] text-zinc-600 dark:text-zinc-400">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>Available</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-amber-500" />
          <span>Limited Slots</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-zinc-400 dark:bg-zinc-600" />
          <span>Fully Booked</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-red-500" />
          <span>Blocked</span>
        </div>
      </div>
    </div>
  );
}
