"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
} from "lucide-react";
import { formatStaticDate, getMonthName } from "@/utils/date";
import { useLanguage } from "@/context/LanguageContext";

interface DatePickerPopoverProps {
  value: string; // YYYY-MM-DD
  onChange: (dateStr: string) => void;
  id?: string;
  className?: string;
}

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

export function DatePickerPopover({
  value,
  onChange,
  id,
  className = "",
}: DatePickerPopoverProps) {
  const { language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const todayStr = new Date().toISOString().substring(0, 10);

  // Browse year & month state
  const [viewYear, setViewYear] = useState<number>(() => {
    const d = value ? new Date(value) : new Date();
    return isNaN(d.getFullYear()) ? new Date().getFullYear() : d.getFullYear();
  });
  const [viewMonth, setViewMonth] = useState<number>(() => {
    const d = value ? new Date(value) : new Date();
    return isNaN(d.getMonth()) ? new Date().getMonth() : d.getMonth();
  });

  // Keep view in sync when value changes or popover opens
  useEffect(() => {
    if (value) {
      const d = new Date(value);
      if (!isNaN(d.getTime())) {
        setViewYear(d.getFullYear());
        setViewMonth(d.getMonth());
      }
    }
  }, [value, isOpen]);

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const handleGoToday = () => {
    const now = new Date();
    setViewYear(now.getFullYear());
    setViewMonth(now.getMonth());
    onChange(todayStr);
    setIsOpen(false);
  };

  // Build grid days
  const calendarDays = React.useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

    const toYMD = (y: number, m: number, d: number) => {
      const mm = String(m + 1).padStart(2, "0");
      const dd = String(d).padStart(2, "0");
      return `${y}-${mm}-${dd}`;
    };

    const days: {
      dateString: string;
      dayNumber: number;
      isCurrentMonth: boolean;
      isToday: boolean;
      isSelected: boolean;
    }[] = [];

    // 1. Previous month trailing
    for (let i = firstDay - 1; i >= 0; i--) {
      const dayNum = daysInPrevMonth - i;
      const prevM = viewMonth === 0 ? 11 : viewMonth - 1;
      const prevY = viewMonth === 0 ? viewYear - 1 : viewYear;
      const dStr = toYMD(prevY, prevM, dayNum);
      days.push({
        dateString: dStr,
        dayNumber: dayNum,
        isCurrentMonth: false,
        isToday: dStr === todayStr,
        isSelected: dStr === value,
      });
    }

    // 2. Current month
    for (let day = 1; day <= daysInMonth; day++) {
      const dStr = toYMD(viewYear, viewMonth, day);
      days.push({
        dateString: dStr,
        dayNumber: day,
        isCurrentMonth: true,
        isToday: dStr === todayStr,
        isSelected: dStr === value,
      });
    }

    // 3. Next month trailing (to complete 42 or 35 slots)
    const totalSlots = Math.ceil(days.length / 7) * 7;
    const remaining = totalSlots - days.length;
    for (let day = 1; day <= remaining; day++) {
      const nextM = viewMonth === 11 ? 0 : viewMonth + 1;
      const nextY = viewMonth === 11 ? viewYear + 1 : viewYear;
      const dStr = toYMD(nextY, nextM, day);
      days.push({
        dateString: dStr,
        dayNumber: day,
        isCurrentMonth: false,
        isToday: dStr === todayStr,
        isSelected: dStr === value,
      });
    }

    return days;
  }, [viewYear, viewMonth, todayStr, value]);

  const monthLabel = `${getMonthName(viewMonth, language)} ${viewYear}`;
  const displayFormattedDate = value ? formatStaticDate(value, language) : "Select date";

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {/* Clean button trigger */}
      <button
        id={id}
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all cursor-pointer select-none text-start hover:border-slate-300 dark:hover:border-slate-600"
      >
        <CalendarIcon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <span className={value ? "text-slate-900 dark:text-slate-100 font-medium truncate" : "text-slate-400 font-normal truncate"}>
          {displayFormattedDate}
        </span>
      </button>

      {/* Popover Dropdown Calendar */}
      {isOpen && (
        <div className="absolute z-50 mt-1 start-0 sm:start-auto sm:end-0 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-3 w-[280px] sm:w-[300px] animate-in fade-in zoom-in-95 duration-150 ring-1 ring-black/5">
          {/* Calendar Header with Navigation */}
          <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-100 dark:border-slate-800">
            <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
              {monthLabel}
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                aria-label="Previous month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleNextMonth}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                aria-label="Next month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 text-center mb-1">
            {WEEKDAYS.map((wd) => (
              <span
                key={wd}
                className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase"
              >
                {wd}
              </span>
            ))}
          </div>

          {/* Day Grid */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {calendarDays.map((d) => (
              <button
                key={d.dateString}
                type="button"
                onClick={() => {
                  onChange(d.dateString);
                  setIsOpen(false);
                }}
                className={`h-7 w-7 mx-auto rounded-lg text-xs font-semibold flex items-center justify-center transition-all cursor-pointer ${
                  d.isSelected
                    ? "bg-sky-600 text-white shadow-xs font-bold scale-105"
                    : d.isToday
                    ? "bg-sky-50 dark:bg-sky-950/80 text-sky-600 dark:text-sky-400 font-bold border border-sky-300 dark:border-sky-800"
                    : d.isCurrentMonth
                    ? "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                    : "text-slate-300 dark:text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                }`}
              >
                {d.dayNumber}
              </button>
            ))}
          </div>

          {/* Bottom Quick-Jump to Today */}
          <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <button
              type="button"
              onClick={handleGoToday}
              className="inline-flex items-center gap-1 text-[11px] font-bold text-sky-600 dark:text-sky-400 hover:underline cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Today</span>
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-[11px] font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
