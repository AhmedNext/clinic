"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { Clock, X, Check, Sun, Moon } from "lucide-react";

interface CircleClockPickerModalProps {
  isOpen: boolean;
  initialTime?: string; // e.g. "04:30 PM" or "10:00 AM" or "16:30"
  patientName?: string;
  onClose: () => void;
  onSaveTime: (timeString: string) => void;
}

const PRESET_TIMES = [
  "09:00 AM",
  "10:30 AM",
  "12:00 PM",
  "02:00 PM",
  "04:30 PM",
  "06:00 PM",
  "07:30 PM",
];

export function CircleClockPickerModal({
  isOpen,
  initialTime,
  patientName,
  onClose,
  onSaveTime,
}: CircleClockPickerModalProps) {
  // Parse initialTime or default to current / 10:00 AM
  const parsed = useMemo(() => {
    let hour = 10;
    let minute = 0;
    let period: "AM" | "PM" = "AM";

    if (initialTime && initialTime.trim()) {
      const match12 = initialTime.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
      if (match12) {
        hour = parseInt(match12[1], 10);
        minute = parseInt(match12[2], 10);
        period = match12[3].toUpperCase() as "AM" | "PM";
      } else {
        const match24 = initialTime.match(/(\d{1,2}):(\d{2})/);
        if (match24) {
          const h24 = parseInt(match24[1], 10);
          minute = parseInt(match24[2], 10);
          if (h24 === 0) {
            hour = 12;
            period = "AM";
          } else if (h24 === 12) {
            hour = 12;
            period = "PM";
          } else if (h24 > 12) {
            hour = h24 - 12;
            period = "PM";
          } else {
            hour = h24;
            period = "AM";
          }
        }
      }
    }
    if (hour < 1 || hour > 12) hour = 10;
    if (minute < 0 || minute > 59) minute = 0;

    return { hour, minute, period };
  }, [initialTime]);

  const [selectedHour, setSelectedHour] = useState<number>(parsed.hour);
  const [selectedMinute, setSelectedMinute] = useState<number>(parsed.minute);
  const [period, setPeriod] = useState<"AM" | "PM">(parsed.period);
  const [mode, setMode] = useState<"hour" | "minute">("hour");
  const clockRef = useRef<HTMLDivElement>(null);

  // Sync state whenever modal opens or initialTime changes
  useEffect(() => {
    if (isOpen) {
      setSelectedHour(parsed.hour);
      setSelectedMinute(parsed.minute);
      setPeriod(parsed.period);
      setMode("hour");
    }
  }, [isOpen, parsed]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Clock geometry constants
  const CLOCK_SIZE = 240; // px
  const CENTER = CLOCK_SIZE / 2; // 120
  const RADIUS = 92; // px radius for number centers

  // Angles calculation for numbers
  const hours = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  const minutes = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

  // Calculate pointer angle
  const activeAngle =
    mode === "hour"
      ? (selectedHour % 12) * 30 // 30 deg per hour (12 = 0 deg)
      : selectedMinute * 6; // 6 deg per minute (60 * 6 = 360)

  const handleClockTouch = (clientX: number, clientY: number) => {
    if (!clockRef.current) return;
    const rect = clockRef.current.getBoundingClientRect();
    const x = clientX - (rect.left + rect.width / 2);
    const y = clientY - (rect.top + rect.height / 2);

    // Calculate angle in degrees from top (12 o'clock) clockwise
    let angleRad = Math.atan2(y, x);
    let angleDeg = (angleRad * 180) / Math.PI + 90;
    if (angleDeg < 0) angleDeg += 360;

    if (mode === "hour") {
      let h = Math.round(angleDeg / 30);
      if (h === 0) h = 12;
      setSelectedHour(h);
      // Auto-transition to minute selection after choosing hour
      setTimeout(() => setMode("minute"), 260);
    } else {
      let m = Math.round(angleDeg / 6) % 60;
      setSelectedMinute(m);
    }
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    handleClockTouch(e.clientX, e.clientY);
  };

  const formattedTimeString = `${String(selectedHour).padStart(2, "0")}:${String(
    selectedMinute
  ).padStart(2, "0")} ${period}`;

  const handleSave = () => {
    onSaveTime(formattedTimeString);
    onClose();
  };

  const handleClear = () => {
    onSaveTime("");
    onClose();
  };

  const applyPreset = (preset: string) => {
    const m = preset.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
    if (m) {
      setSelectedHour(parseInt(m[1], 10));
      setSelectedMinute(parseInt(m[2], 10));
      setPeriod(m[3].toUpperCase() as "AM" | "PM");
    }
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
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100">
                Choose Time
              </h3>
              {patientName ? (
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[200px]">
                  {patientName}
                </p>
              ) : (
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Touch clock face to set hours & minutes
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

        {/* Content Body */}
        <div className="p-5 flex flex-col items-center">
          {/* Digital Time & AM/PM Banner */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700/60 shadow-inner">
              {/* Hour display button */}
              <button
                type="button"
                onClick={() => setMode("hour")}
                className={`px-3.5 py-1.5 rounded-xl text-2xl font-black transition-all cursor-pointer ${
                  mode === "hour"
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30 scale-105"
                    : "text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400"
                }`}
              >
                {String(selectedHour).padStart(2, "0")}
              </button>

              <span className="text-2xl font-black text-slate-400 dark:text-slate-500 px-1 animate-pulse">
                :
              </span>

              {/* Minute display button */}
              <button
                type="button"
                onClick={() => setMode("minute")}
                className={`px-3.5 py-1.5 rounded-xl text-2xl font-black transition-all cursor-pointer ${
                  mode === "minute"
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30 scale-105"
                    : "text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400"
                }`}
              >
                {String(selectedMinute).padStart(2, "0")}
              </button>
            </div>

            {/* AM / PM selector */}
            <div className="flex flex-col rounded-xl bg-slate-100 dark:bg-slate-800/80 p-1 border border-slate-200 dark:border-slate-700/60">
              <button
                type="button"
                onClick={() => setPeriod("AM")}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  period === "AM"
                    ? "bg-amber-500 text-white shadow-xs"
                    : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100"
                }`}
              >
                <Sun className="w-3 h-3" />
                <span>AM</span>
              </button>
              <button
                type="button"
                onClick={() => setPeriod("PM")}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 mt-0.5 ${
                  period === "PM"
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100"
                }`}
              >
                <Moon className="w-3 h-3" />
                <span>PM</span>
              </button>
            </div>
          </div>

          {/* Mode switch helper indicator */}
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Currently choosing:
            </span>
            <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
              {mode === "hour" ? "Hours (1 - 12)" : "Minutes (00 - 59)"}
            </span>
          </div>

          {/* CIRCLE CLOCK FACE */}
          <div
            ref={clockRef}
            onPointerDown={handlePointerDown}
            className="relative select-none touch-none rounded-full bg-slate-100/90 dark:bg-slate-800/90 border-4 border-slate-200 dark:border-slate-700/60 shadow-inner flex items-center justify-center cursor-pointer transition-colors"
            style={{ width: CLOCK_SIZE, height: CLOCK_SIZE }}
          >
            {/* Clock center pivot */}
            <div className="absolute w-3.5 h-3.5 rounded-full bg-indigo-600 z-20 shadow-sm" />

            {/* Clock hand line */}
            <div
              className="absolute z-10 origin-bottom pointer-events-none transition-transform duration-150"
              style={{
                width: 2,
                height: RADIUS,
                backgroundColor: "rgb(99, 102, 241)", // indigo-500
                bottom: CENTER,
                left: CENTER - 1,
                transform: `rotate(${activeAngle}deg)`,
              }}
            >
              {/* Hand pointer head circle */}
              <div
                className="absolute -top-4 -left-3.5 w-8 h-8 rounded-full bg-indigo-600/90 border-2 border-white dark:border-slate-900 shadow-md flex items-center justify-center"
              />
            </div>

            {/* Render Numbers */}
            {mode === "hour"
              ? hours.map((h) => {
                  const angle = ((h % 12) * 30 - 90) * (Math.PI / 180);
                  const x = CENTER + RADIUS * Math.cos(angle);
                  const y = CENTER + RADIUS * Math.sin(angle);
                  const isSelected = selectedHour === h;

                  return (
                    <button
                      key={`h-${h}`}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedHour(h);
                        setTimeout(() => setMode("minute"), 240);
                      }}
                      className={`absolute w-7 h-7 -translate-x-1/2 -translate-y-1/2 rounded-full flex items-center justify-center text-xs font-bold transition-all cursor-pointer z-20 ${
                        isSelected
                          ? "text-white font-black scale-110"
                          : "text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:scale-110"
                      }`}
                      style={{ left: x, top: y }}
                    >
                      {h}
                    </button>
                  );
                })
              : minutes.map((m) => {
                  const angle = ((m / 60) * 360 - 90) * (Math.PI / 180);
                  const x = CENTER + RADIUS * Math.cos(angle);
                  const y = CENTER + RADIUS * Math.sin(angle);
                  const isSelected = selectedMinute === m;

                  return (
                    <button
                      key={`m-${m}`}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedMinute(m);
                      }}
                      className={`absolute w-7 h-7 -translate-x-1/2 -translate-y-1/2 rounded-full flex items-center justify-center text-[11px] font-bold transition-all cursor-pointer z-20 ${
                        isSelected
                          ? "text-white font-black scale-110"
                          : "text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:scale-110"
                      }`}
                      style={{ left: x, top: y }}
                    >
                      {String(m).padStart(2, "0")}
                    </button>
                  );
                })}
          </div>

          {/* Quick Clinic Presets */}
          <div className="w-full mt-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5 text-center">
              Quick Clinic Times
            </span>
            <div className="flex items-center justify-center gap-1.5 flex-wrap">
              {PRESET_TIMES.map((timeStr) => {
                const isActive = formattedTimeString === timeStr;
                return (
                  <button
                    key={timeStr}
                    type="button"
                    onClick={() => applyPreset(timeStr)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      isActive
                        ? "bg-indigo-600 text-white shadow-xs font-bold"
                        : "bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"
                    }`}
                  >
                    {timeStr}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between gap-2 px-5 py-3.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/70">
          <button
            type="button"
            onClick={handleClear}
            className="px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
          >
            Clear Time
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
              <span>Set {formattedTimeString}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
