"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  X,
  Check,
  RotateCcw,
} from "lucide-react";

interface BetterDatePickerModalProps {
  isOpen: boolean;
  initialDate?: string; // YYYY-MM-DD
  patientName?: string;
  onClose: () => void;
  onSaveDate: (dateString: string) => void;
}

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

export function BetterDatePickerModal({
  isOpen,
  initialDate,
  patientName,
  onClose,
  onSaveDate,
}: BetterDatePickerModalProps) {
  // Parse initialDate or fallback to today
  const todayStr = useMemo(() => new Date().toISOString().substring(0, 10), []);

  const [selectedDate, setSelectedDate] = useState<string>(
    initialDate || todayStr
  );

  // View state: current year and month being browsed in the calendar grid
  const [viewYear, setViewYear] = useState<number>(() => {
    const d = initialDate ? new Date(initialDate) : new Date();
    return isNaN(d.getFullYear()) ? new Date().getFullYear() : d.getFullYear();
  });

  const [viewMonth, setViewMonth] = useState<number>(() => {
    const d = initialDate ? new Date(initialDate) : new Date();
    return isNaN(d.getMonth()) ? new Date().getMonth() : d.getMonth();
  });

  useEffect(() => {
    if (isOpen) {
      const d = initialDate ? new Date(initialDate) : new Date();
      const valid = !isNaN(d.getTime());
      const yr = valid ? d.getFullYear() : new Date().getFullYear();
      const mo = valid ? d.getMonth() : new Date().getMonth();
      setSelectedDate(initialDate || todayStr);
      setViewYear(yr);
      setViewMonth(mo);
    }
  }, [isOpen, initialDate, todayStr]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Month navigation
  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  // Calendar days grid computation
  const daysGrid = useMemo(() => {
    const firstDayIndex = new Date(viewYear, viewMonth, 1).getDay(); // 0 = Sun
    const daysInCurrentMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

    const cells: {
      year: number;
      month: number;
      day: number;
      dateStr: string;
      isCurrentMonth: boolean;
    }[] = [];

    // Prev month padding
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const d = daysInPrevMonth - i;
      const m = viewMonth === 0 ? 11 : viewMonth - 1;
      const y = viewMonth === 0 ? viewYear - 1 : viewYear;
      const dateStr = `${y}-${String(m + 1).padStart(2, "0")}-${String(
        d
      ).padStart(2, "0")}`;
      cells.push({ year: y, month: m, day: d, dateStr, isCurrentMonth: false });
    }

    // Current month days
    for (let d = 1; d <= daysInCurrentMonth; d++) {
      const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(
        2,
        "0"
      )}-${String(d).padStart(2, "0")}`;
      cells.push({
        year: viewYear,
        month: viewMonth,
        day: d,
        dateStr,
        isCurrentMonth: true,
      });
    }

    // Next month padding to reach a complete 35 or 42 grid
    const remaining = (7 - (cells.length % 7)) % 7;
    for (let d = 1; d <= remaining; d++) {
      const m = viewMonth === 11 ? 0 : viewMonth + 1;
      const y = viewMonth === 11 ? viewYear + 1 : viewYear;
      const dateStr = `${y}-${String(m + 1).padStart(2, "0")}-${String(
        d
      ).padStart(2, "0")}`;
      cells.push({ year: y, month: m, day: d, dateStr, isCurrentMonth: false });
    }

    return cells;
  }, [viewYear, viewMonth]);

  const viewMonthName = new Date(viewYear, viewMonth, 1).toLocaleDateString(
    "en-US",
    {
      month: "long",
      year: "numeric",
    }
  );

  // Formatted date preview for selectedDate
  const formattedSelected = useMemo(() => {
    try {
      const [y, m, d] = selectedDate.split("-").map((v) => parseInt(v, 10));
      const dt = new Date(y, m - 1, d);
      return dt.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return selectedDate;
    }
  }, [selectedDate]);

  // Quick Preset Handlers
  const setQuickDate = (offsetDays: number) => {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    const dateStr = d.toISOString().substring(0, 10);
    setSelectedDate(dateStr);
    setViewYear(d.getFullYear());
    setViewMonth(d.getMonth());
  };

  const handleSave = () => {
    onSaveDate(selectedDate);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full sm:max-w-md bg-white dark:bg-slate-900 border-t sm:border border-slate-200 dark:border-slate-800 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-5 sm:zoom-in-95 duration-200 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-900/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
              <CalendarIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100">
                Choose Visit Date
              </h3>
              {patientName ? (
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[200px]">
                  {patientName}
                </p>
              ) : (
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Touch any day to update case date
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Selected Date Preview Strip */}
        <div className="px-5 py-3 bg-gradient-to-r from-indigo-50/80 to-purple-50/80 dark:from-indigo-950/40 dark:to-purple-950/40 border-b border-indigo-100/60 dark:border-indigo-900/40 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-500 dark:text-indigo-400 block">
              Selected Visit Date
            </span>
            <span className="text-base font-black text-indigo-950 dark:text-indigo-100">
              {formattedSelected}
            </span>
          </div>

          {selectedDate === todayStr && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
              Today
            </span>
          )}
        </div>

        {/* Quick Date Shortcuts */}
        <div className="px-5 pt-3.5 pb-1 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setQuickDate(0)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              selectedDate === todayStr
                ? "bg-indigo-600 text-white shadow-xs font-bold"
                : "bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
            }`}
          >
            Today
          </button>

          <button
            type="button"
            onClick={() => setQuickDate(-1)}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-all cursor-pointer"
          >
            Yesterday
          </button>

          <button
            type="button"
            onClick={() => setQuickDate(1)}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-all cursor-pointer"
          >
            Tomorrow
          </button>

          <button
            type="button"
            onClick={() => setQuickDate(-7)}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-all cursor-pointer"
          >
            1 Week Ago
          </button>
        </div>

        {/* Month Navigation */}
        <div className="px-5 py-2.5 flex items-center justify-between">
          <button
            type="button"
            onClick={prevMonth}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Previous Month"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <span className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100">
            {viewMonthName}
          </span>

          <button
            type="button"
            onClick={nextMonth}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Next Month"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="px-4 pb-4">
          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 text-center mb-1">
            {WEEKDAYS.map((w, idx) => (
              <div
                key={w}
                className={`py-1 text-[11px] font-bold ${
                  idx === 5 || idx === 0
                    ? "text-indigo-500 dark:text-indigo-400"
                    : "text-slate-400 dark:text-slate-500"
                }`}
              >
                {w}
              </div>
            ))}
          </div>

          {/* Days */}
          <div className="grid grid-cols-7 gap-1">
            {daysGrid.map((cell) => {
              const isSelected = cell.dateStr === selectedDate;
              const isToday = cell.dateStr === todayStr;

              return (
                <button
                  key={cell.dateStr}
                  type="button"
                  onClick={() => setSelectedDate(cell.dateStr)}
                  className={`h-10 sm:h-9.5 rounded-xl flex flex-col items-center justify-center relative text-xs font-semibold transition-all cursor-pointer ${
                    isSelected
                      ? "bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/30 scale-105 z-10"
                      : cell.isCurrentMonth
                      ? "text-slate-800 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-600"
                      : "text-slate-300 dark:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800/40"
                  } ${
                    isToday && !isSelected
                      ? "ring-1.5 ring-indigo-500 text-indigo-600 dark:text-indigo-400 font-bold"
                      : ""
                  }`}
                >
                  <span>{cell.day}</span>
                  {isToday && (
                    <span
                      className={`w-1 h-1 rounded-full absolute bottom-1 ${
                        isSelected ? "bg-white" : "bg-indigo-500"
                      }`}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between gap-2 px-5 py-3.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/70">
          <button
            type="button"
            onClick={() => setQuickDate(0)}
            className="inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Today</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 active:scale-95 transition-all cursor-pointer"
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
              <span>Set Date</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
