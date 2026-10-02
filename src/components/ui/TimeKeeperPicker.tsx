"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import { Clock } from "lucide-react";
import type { TimeOutput } from "react-timekeeper";

// Dynamic import with SSR disabled to guarantee Next.js App Router compatibility
const TimeKeeper = dynamic(() => import("react-timekeeper"), {
  ssr: false,
  loading: () => (
    <div className="w-[280px] h-[320px] flex items-center justify-center bg-white dark:bg-slate-900 rounded-2xl animate-pulse text-xs text-slate-400">
      Loading clock...
    </div>
  ),
});

interface TimeKeeperPickerProps {
  value: string; // e.g. "10:30 AM" or ""
  onChange: (newTime: string) => void;
  id?: string;
  placeholder?: string;
  className?: string;
}

export function TimeKeeperPicker({
  value,
  onChange,
  id,
  placeholder = "Select Time",
  className = "",
}: TimeKeeperPickerProps) {
  const [showClock, setShowClock] = useState(false);

  const handleTimeChange = (data: TimeOutput) => {
    // Formatted as standard 12-hour: e.g. "10:30 AM"
    const formatted = `${data.formattedSimple} ${data.meridiem.toUpperCase()}`;
    onChange(formatted);
  };

  return (
    <div className={`relative ${className}`}>
      {/* Read-Only Input Trigger */}
      <button
        id={id}
        type="button"
        onClick={() => setShowClock(true)}
        className="w-full flex items-center justify-between ps-8 pe-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all cursor-pointer select-none text-start hover:border-slate-300 dark:hover:border-slate-600"
      >
        <span
          className={
            value
              ? "text-slate-900 dark:text-slate-100 font-medium"
              : "text-slate-400 font-normal"
          }
        >
          {value ? `🕒 ${value}` : placeholder}
        </span>
        <span className="text-[10px] uppercase font-bold text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/60 px-1.5 py-0.5 rounded-md">
          Clock
        </span>
      </button>

      {/* Clock Icon on the left */}
      <div className="absolute inset-y-0 start-0 ps-2.5 flex items-center pointer-events-none text-slate-400">
        <Clock className="w-3.5 h-3.5" />
      </div>

      {/* Centered Fixed Modal Dialog for React-TimeKeeper */}
      {showClock && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in"
          onClick={() => setShowClock(false)}
        >
          <div
            className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden scale-100 animate-in zoom-in-95 flex flex-col items-center border border-slate-200 dark:border-slate-800"
            onClick={(e) => e.stopPropagation()}
          >
            <TimeKeeper
              time={value || "10:00 am"}
              onChange={handleTimeChange}
              onDoneClick={() => setShowClock(false)}
              switchToMinuteOnHourSelect
              doneButton={(_timeOutput) => (
                <button
                  type="button"
                  onClick={() => setShowClock(false)}
                  className="w-full py-3 bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs transition-colors cursor-pointer"
                >
                  Done
                </button>
              )}
            />
          </div>
        </div>
      )}
    </div>
  );
}
