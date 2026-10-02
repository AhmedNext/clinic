"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Clock, Sun, Moon, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "./dialog";
import { Button } from "./button";

interface CircleClockPickerModalProps {
  isOpen: boolean;
  initialTime?: string; // e.g. "04:30 PM" or "10:00 AM" or "16:30"
  patientName?: string;
  onClose: () => void;
  onSaveTime: (timeString: string) => void;
}

const PRESET_TIMES = [
  "09:00 AM",
  "10:00 AM",
  "11:30 AM",
  "01:00 PM",
  "02:30 PM",
  "04:00 PM",
  "05:30 PM",
  "07:00 PM",
];

export function CircleClockPickerModal({
  isOpen,
  initialTime,
  patientName,
  onClose,
  onSaveTime,
}: CircleClockPickerModalProps) {
  // Parse initialTime or default to 10:00 AM
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

  useEffect(() => {
    if (isOpen) {
      setSelectedHour(parsed.hour);
      setSelectedMinute(parsed.minute);
      setPeriod(parsed.period);
    }
  }, [isOpen, parsed]);

  const formattedTime = useMemo(() => {
    const hh = String(selectedHour).padStart(2, "0");
    const mm = String(selectedMinute).padStart(2, "0");
    return `${hh}:${mm} ${period}`;
  }, [selectedHour, selectedMinute, period]);

  const handleSave = () => {
    onSaveTime(formattedTime);
    onClose();
  };

  const handleSelectPreset = (preset: string) => {
    const m = preset.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
    if (m) {
      setSelectedHour(parseInt(m[1], 10));
      setSelectedMinute(parseInt(m[2], 10));
      setPeriod(m[3].toUpperCase() as "AM" | "PM");
    }
  };

  // Convert 12h to 24h format for native HTML5 time input
  const time24Value = useMemo(() => {
    let h = selectedHour;
    if (period === "AM" && h === 12) h = 0;
    if (period === "PM" && h !== 12) h += 12;
    return `${String(h).padStart(2, "0")}:${String(selectedMinute).padStart(2, "0")}`;
  }, [selectedHour, selectedMinute, period]);

  const handleNativeTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (!val) return;
    const [hStr, mStr] = val.split(":");
    const h24 = parseInt(hStr, 10);
    const mm = parseInt(mStr, 10);
    if (h24 === 0) {
      setSelectedHour(12);
      setPeriod("AM");
    } else if (h24 === 12) {
      setSelectedHour(12);
      setPeriod("PM");
    } else if (h24 > 12) {
      setSelectedHour(h24 - 12);
      setPeriod("PM");
    } else {
      setSelectedHour(h24);
      setPeriod("AM");
    }
    setSelectedMinute(mm);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base font-bold text-slate-900 dark:text-slate-100">
            <Clock className="w-5 h-5 text-sky-500" />
            <span>Select Appointment Time</span>
          </DialogTitle>
          <DialogDescription>
            {patientName
              ? `Choose appointment time for ${patientName}`
              : "Adjust hours and minutes, or tap a quick preset."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Digital Time Selector Box */}
          <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800">
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Hour input / selector */}
              <div className="flex flex-col items-center">
                <span className="text-[10px] font-bold uppercase text-slate-400 mb-1">Hour</span>
                <div className="flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-1 shadow-2xs">
                  <select
                    value={selectedHour}
                    onChange={(e) => setSelectedHour(Number(e.target.value))}
                    aria-label="Hour"
                    className="font-mono text-2xl font-bold text-slate-900 dark:text-slate-100 bg-transparent px-2 py-1 focus:outline-hidden cursor-pointer"
                  >
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => (
                      <option key={h} value={h} className="bg-white dark:bg-slate-900 text-base">
                        {String(h).padStart(2, "0")}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <span className="text-2xl font-black text-slate-400 select-none pt-4">:</span>

              {/* Minute input / selector */}
              <div className="flex flex-col items-center">
                <span className="text-[10px] font-bold uppercase text-slate-400 mb-1">Minute</span>
                <div className="flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-1 shadow-2xs">
                  <select
                    value={selectedMinute}
                    onChange={(e) => setSelectedMinute(Number(e.target.value))}
                    aria-label="Minute"
                    className="font-mono text-2xl font-bold text-slate-900 dark:text-slate-100 bg-transparent px-2 py-1 focus:outline-hidden cursor-pointer"
                  >
                    {Array.from({ length: 60 }, (_, i) => i).map((m) => (
                      <option key={m} value={m} className="bg-white dark:bg-slate-900 text-base">
                        {String(m).padStart(2, "0")}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* AM / PM Toggle */}
              <div className="flex flex-col items-center">
                <span className="text-[10px] font-bold uppercase text-slate-400 mb-1">Period</span>
                <div className="flex rounded-xl bg-slate-200/80 dark:bg-slate-800 p-1 gap-1">
                  <button
                    type="button"
                    onClick={() => setPeriod("AM")}
                    className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      period === "AM"
                        ? "bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-xs"
                        : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                    }`}
                  >
                    <Sun className="w-3.5 h-3.5" />
                    <span>AM</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPeriod("PM")}
                    className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      period === "PM"
                        ? "bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 shadow-xs"
                        : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                    }`}
                  >
                    <Moon className="w-3.5 h-3.5" />
                    <span>PM</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Native Time Input for quick browser / mobile wheel picker */}
            <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
              <span className="text-[11px]">Or system clock:</span>
              <input
                type="time"
                value={time24Value}
                onChange={handleNativeTimeChange}
                aria-label="System Time Picker"
                className="px-2 py-0.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-mono font-bold text-slate-800 dark:text-slate-200 cursor-pointer focus:outline-hidden"
              />
            </div>
          </div>

          {/* Quick Preset Buttons */}
          <div>
            <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              Common Clinic Hours
            </span>
            <div className="grid grid-cols-4 gap-1.5">
              {PRESET_TIMES.map((preset) => {
                const isSelected = preset === formattedTime;
                return (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => handleSelectPreset(preset)}
                    className={`px-2 py-2 rounded-xl text-xs font-semibold text-center transition-all cursor-pointer border ${
                      isSelected
                        ? "bg-sky-50 dark:bg-sky-950/80 text-sky-700 dark:text-sky-300 border-sky-300 dark:border-sky-700 shadow-xs font-bold"
                        : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200/80 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800"
                    }`}
                  >
                    {preset}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <DialogFooter className="mt-2">
          <Button variant="outline" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSave} className="gap-1.5">
            <Check className="w-4 h-4" />
            <span>Set Time</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Re-export as TimePickerModal for cleaner naming
export { CircleClockPickerModal as TimePickerModal };
