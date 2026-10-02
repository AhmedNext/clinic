"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./dialog";
import { Button } from "./button";
import type { TimeOutput } from "react-timekeeper";

// Dynamic import with SSR disabled for Next.js App Router compatibility
const TimeKeeper = dynamic(() => import("react-timekeeper"), {
  ssr: false,
  loading: () => (
    <div className="w-[280px] h-[320px] flex items-center justify-center bg-white dark:bg-slate-900 rounded-2xl animate-pulse text-xs text-slate-400">
      Loading clock...
    </div>
  ),
});

interface CircleClockPickerModalProps {
  isOpen: boolean;
  initialTime?: string; // e.g. "04:30 PM" or "10:00 AM" or "16:30"
  patientName?: string;
  onClose: () => void;
  onSaveTime: (timeString: string) => void;
}

export function CircleClockPickerModal({
  isOpen,
  initialTime,
  patientName,
  onClose,
  onSaveTime,
}: CircleClockPickerModalProps) {
  const [selectedTime, setSelectedTime] = useState("10:00 am");

  useEffect(() => {
    if (initialTime && initialTime.trim()) {
      setSelectedTime(initialTime.trim());
    } else {
      setSelectedTime("10:00 am");
    }
  }, [initialTime, isOpen]);

  const handleTimeChange = (data: TimeOutput) => {
    const formatted = `${data.formattedSimple} ${data.meridiem.toUpperCase()}`;
    setSelectedTime(formatted);
  };

  const handleSave = () => {
    if (selectedTime) {
      onSaveTime(selectedTime);
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[340px] p-4 sm:p-5 rounded-3xl flex flex-col items-center">
        <DialogHeader className="w-full text-center sm:text-start pb-1">
          <DialogTitle className="text-base font-bold text-slate-900 dark:text-slate-100">
            Set Consultation Time
          </DialogTitle>
          {patientName && (
            <DialogDescription className="text-xs text-slate-500 truncate">
              {patientName}
            </DialogDescription>
          )}
        </DialogHeader>

        {/* Circular Analog Clock Face via react-timekeeper */}
        <div className="flex flex-col items-center justify-center my-1">
          <TimeKeeper
            time={selectedTime}
            onChange={handleTimeChange}
            onDoneClick={handleSave}
            switchToMinuteOnHourSelect
          />
        </div>

        {/* Action Buttons */}
        <div className="w-full flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-slate-500 hover:text-slate-800"
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleSave}
            className="bg-sky-600 hover:bg-sky-500 text-white font-semibold gap-1.5 shadow-xs"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Done</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Re-export as TimePickerModal for backward compatibility
export { CircleClockPickerModal as TimePickerModal };
