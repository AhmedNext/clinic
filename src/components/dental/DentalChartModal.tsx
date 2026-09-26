"use client";

import React, { useState, useEffect } from "react";
import { X, CheckCircle2 } from "lucide-react";
import { Patient } from "@/types/patient";
import { ToothRecord } from "@/types/dental";
import { DentalChart } from "./DentalChart";
import { PatientAvatar } from "../PatientAvatar";

interface DentalChartModalProps {
  isOpen: boolean;
  patient: Patient | null;
  onClose: () => void;
  onSaveTeeth: (patientId: string, teeth: ToothRecord[]) => void;
}

export function DentalChartModal({
  isOpen,
  patient,
  onClose,
  onSaveTeeth,
}: DentalChartModalProps) {
  const [localTeeth, setLocalTeeth] = useState<ToothRecord[]>([]);

  // Initialize teeth when modal opens for this patient ID
  useEffect(() => {
    if (isOpen && patient) {
      setLocalTeeth(patient.teeth || []);
    }
  }, [isOpen, patient?.id]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !patient) return null;

  // Immediately auto-save whenever a single tooth is updated
  const handleUpdateTooth = (record: ToothRecord) => {
    const exists = localTeeth.some((t) => t.toothNumber === record.toothNumber);
    const updated = exists
      ? localTeeth.map((t) => (t.toothNumber === record.toothNumber ? record : t))
      : [...localTeeth, record];
    setLocalTeeth(updated);
    onSaveTeeth(patient.id, updated);
  };

  // Immediately auto-save whenever multiple teeth are updated
  const handleUpdateMultipleTeeth = (records: ToothRecord[]) => {
    const map = new Map<number, ToothRecord>(localTeeth.map((t) => [t.toothNumber, t]));
    for (const rec of records) {
      map.set(rec.toothNumber, rec);
    }
    const updated = Array.from(map.values());
    setLocalTeeth(updated);
    onSaveTeeth(patient.id, updated);
  };

  // Immediately auto-save when a tooth is removed
  const handleRemoveTooth = (toothNumber: number) => {
    const updated = localTeeth.filter((t) => t.toothNumber !== toothNumber);
    setLocalTeeth(updated);
    onSaveTeeth(patient.id, updated);
  };

  // Immediately auto-save when multiple teeth are removed
  const handleRemoveMultipleTeeth = (toothNumbers: number[]) => {
    const set = new Set(toothNumbers);
    const updated = localTeeth.filter((t) => !set.has(t.toothNumber));
    setLocalTeeth(updated);
    onSaveTeeth(patient.id, updated);
  };

  // Clear all teeth and auto-save
  const handleClearAll = () => {
    setLocalTeeth([]);
    onSaveTeeth(patient.id, []);
  };

  const handleDone = () => {
    onSaveTeeth(patient.id, localTeeth);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-5 bg-slate-950/80 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          handleDone();
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="dental-chart-title"
    >
      <div className="w-full h-full sm:h-auto sm:max-h-[94vh] max-w-5xl bg-white dark:bg-slate-900 border-0 sm:border border-slate-200 dark:border-slate-800 rounded-none sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95">
        {/* Modal Header */}
        <div className="px-4 sm:px-6 py-3 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/90 dark:bg-slate-900/90 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <PatientAvatar gender={patient.gender} size="sm" />
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2
                  id="dental-chart-title"
                  className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 truncate"
                >
                  {patient.name}
                </h2>
                <span className="text-[11px] px-2 py-0.5 rounded-full font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 flex-shrink-0">
                  {localTeeth.length} Worked
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 truncate">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold truncate">
                  Auto-saved
                </span>
                <span>• FDI Odontogram</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0">
            {localTeeth.length > 0 && (
              <button
                type="button"
                onClick={handleClearAll}
                className="text-xs text-rose-500 hover:text-rose-600 dark:hover:text-rose-400 font-semibold px-2.5 py-1.5 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
              >
                Clear
              </button>
            )}
            <button
              onClick={handleDone}
              aria-label="Close dialog"
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body: Interactive Dental Chart */}
        <div className="p-2 sm:p-5 overflow-y-auto flex-1">
          <DentalChart
            teethRecords={localTeeth}
            onUpdateTooth={handleUpdateTooth}
            onUpdateMultipleTeeth={handleUpdateMultipleTeeth}
            onRemoveTooth={handleRemoveTooth}
            onRemoveMultipleTeeth={handleRemoveMultipleTeeth}
          />
        </div>

        {/* Modal Footer */}
        <div className="px-4 sm:px-6 py-2.5 sm:py-3.5 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/90 dark:bg-slate-900/90 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="hidden sm:flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
            <CheckCircle2 className="w-4 h-4" />
            <span>All selections are stored directly in patient case #{patient.id.slice(0, 6)}</span>
          </div>

          <button
            type="button"
            onClick={handleDone}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20 active:scale-[0.98] transition-all cursor-pointer"
          >
            <span>Done & Close</span>
          </button>
        </div>
      </div>
    </div>
  );

}
