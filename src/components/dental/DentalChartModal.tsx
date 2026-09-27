"use client";

import React, { useState, useEffect } from "react";
import { X, CheckCircle2, Zap, Coins } from "lucide-react";
import { Patient, formatIQD } from "@/types/patient";
import { ToothRecord } from "@/types/dental";
import { ClinicMaterial } from "@/types/material";
import { DentalChart } from "./DentalChart";
import { PatientAvatar } from "../PatientAvatar";

interface DentalChartModalProps {
  isOpen: boolean;
  patient: Patient | null;
  onClose: () => void;
  onSaveTeeth: (patientId: string, teeth: ToothRecord[], syncedTotalAmount?: number) => void;
  clinicMaterials?: ClinicMaterial[];
}

export function DentalChartModal({
  isOpen,
  patient,
  onClose,
  onSaveTeeth,
  clinicMaterials = [],
}: DentalChartModalProps) {
  const [localTeeth, setLocalTeeth] = useState<ToothRecord[]>([]);
  const [isSynced, setIsSynced] = useState<boolean>(false);

  // Initialize teeth when modal opens for this patient ID
  useEffect(() => {
    if (isOpen && patient) {
      setLocalTeeth(patient.teeth || []);
      setIsSynced(false);
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

  const totalChartPrice = localTeeth.reduce((sum, r) => sum + (r.price || 0), 0);

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

  const handleSyncToBill = () => {
    onSaveTeeth(patient.id, localTeeth, totalChartPrice);
    setIsSynced(true);
    setTimeout(() => setIsSynced(false), 3000);
  };

  const handleDone = () => {
    onSaveTeeth(patient.id, localTeeth);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-slate-950/80 transition-opacity animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          handleDone();
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="dental-chart-title"
    >
      <div className="w-full h-full sm:h-auto sm:max-h-[95vh] max-w-5xl bg-white dark:bg-slate-900 border-0 sm:border border-slate-200 dark:border-slate-800 rounded-none sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95">
        {/* Modal Header */}
        <div className="px-3 sm:px-6 py-2.5 sm:py-3 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/90 dark:bg-slate-900/90 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <PatientAvatar gender={patient.gender} size="sm" />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h2
                  id="dental-chart-title"
                  className="text-xs sm:text-base font-bold text-slate-900 dark:text-slate-100 truncate"
                >
                  {patient.name}
                </h2>
                <span className="text-[10px] sm:text-[11px] px-1.5 py-0.2 rounded-full font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 flex-shrink-0">
                  {localTeeth.length} Worked
                </span>
                {totalChartPrice > 0 && (
                  <span className="text-[10px] sm:text-[11px] px-2 py-0.2 rounded-full font-mono font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex-shrink-0">
                    {formatIQD(totalChartPrice)}
                  </span>
                )}
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1 truncate">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold truncate">
                  Auto-saved
                </span>
                <span>• FDI Odontogram</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 flex-shrink-0">
            {localTeeth.length > 0 && (
              <button
                type="button"
                onClick={handleClearAll}
                className="text-xs text-rose-500 hover:text-rose-600 dark:hover:text-rose-400 font-semibold px-2 py-1 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
              >
                Clear
              </button>
            )}
            <button
              onClick={handleDone}
              aria-label="Close dialog"
              className="p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body: Interactive Dental Chart */}
        <div className="p-1 sm:p-5 overflow-y-auto flex-1">
          <DentalChart
            teethRecords={localTeeth}
            onUpdateTooth={handleUpdateTooth}
            onUpdateMultipleTeeth={handleUpdateMultipleTeeth}
            onRemoveTooth={handleRemoveTooth}
            onRemoveMultipleTeeth={handleRemoveMultipleTeeth}
            clinicMaterials={clinicMaterials}
          />
        </div>

        {/* Modal Footer */}
        <div className="px-3 sm:px-6 py-2 sm:py-3 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/90 dark:bg-slate-900/90 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          {/* Left: Total fees & Sync to Bill Button */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Total Dental Fee:</span>
              <span className="text-xs sm:text-sm font-mono font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/80 px-2 py-0.5 rounded-lg border border-emerald-300 dark:border-emerald-800">
                {formatIQD(totalChartPrice)}
              </span>
            </div>

            {totalChartPrice > 0 && (
              <button
                type="button"
                onClick={handleSyncToBill}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95 ${
                  isSynced
                    ? "bg-emerald-700 text-white ring-2 ring-emerald-400"
                    : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20"
                }`}
                title="Sync this dental procedure fee directly into the patient's billing balance"
              >
                <Zap className="w-3.5 h-3.5 fill-current" />
                <span>{isSynced ? "✓ Synced to Bill!" : "Sync to Patient Bill"}</span>
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={handleDone}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20 active:scale-[0.98] transition-all cursor-pointer"
          >
            <span>Done & Close</span>
          </button>
        </div>
      </div>
    </div>
  );
}
