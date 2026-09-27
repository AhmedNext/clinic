"use client";

import React, { useState } from "react";
import {
  ALL_TEETH,
  TREATMENT_METADATA,
  ToothInfo,
  ToothRecord,
  ToothTreatment,
} from "@/types/dental";
import {
  CROWN_POLYGONS,
  CrownPolygon,
} from "./crownPolygons";
import {
  Check,
  Activity,
  Eraser,
  MousePointer,
  CheckCircle2,
  FileText,
  X,
  Sparkles,
  CheckSquare,
  Layers,
  RotateCcw,
  Maximize2,
  Minimize2,
} from "lucide-react";

interface DentalChartProps {
  teethRecords: ToothRecord[];
  onUpdateTooth: (record: ToothRecord) => void;
  onUpdateMultipleTeeth?: (records: ToothRecord[]) => void;
  onRemoveTooth: (toothNumber: number) => void;
  onRemoveMultipleTeeth?: (toothNumbers: number[]) => void;
  readonly?: boolean;
}

export const FDI_CATEGORIES = {
  molars: {
    label: "molaires",
    color: "#a21caf",
    textColor: "text-fuchsia-700 dark:text-fuchsia-400",
  },
  premolars: {
    label: "Prémolaires",
    color: "#16a34a",
    textColor: "text-emerald-600 dark:text-emerald-400",
  },
  canine: {
    label: "canine",
    color: "#ea580c",
    textColor: "text-orange-600 dark:text-orange-400",
  },
  incisors: {
    label: "incisives",
    color: "#0284c7",
    textColor: "text-sky-600 dark:text-sky-400",
  },
} as const;

export function getFdiCategory(toothNumber: number) {
  if ([18, 17, 16, 26, 27, 28, 48, 47, 46, 36, 37, 38].includes(toothNumber)) {
    return FDI_CATEGORIES.molars;
  }
  if ([15, 14, 24, 25, 45, 44, 34, 35].includes(toothNumber)) {
    return FDI_CATEGORIES.premolars;
  }
  if ([13, 23, 43, 33].includes(toothNumber)) {
    return FDI_CATEGORIES.canine;
  }
  return FDI_CATEGORIES.incisors;
}

export function DentalChart({
  teethRecords,
  onUpdateTooth,
  onUpdateMultipleTeeth,
  onRemoveTooth,
  onRemoveMultipleTeeth,
  readonly = false,
}: DentalChartProps) {
  // Active procedure tool (default: "treated")
  const [activeTool, setActiveTool] = useState<ToothTreatment | "erase">("treated");
  // Multi-select toggle mode (default OFF)
  const [isMultiSelectMode, setIsMultiSelectMode] = useState<boolean>(false);
  // Mobile Zoom toggle: false = fit to screen, true = zoomed 150%
  const [isZoomed, setIsZoomed] = useState<boolean>(false);

  const [selectedTeethNumbers, setSelectedTeethNumbers] = useState<number[]>([]);
  const [treatmentNote, setTreatmentNote] = useState("");
  const [batchNote, setBatchNote] = useState("");
  const [activeTooth, setActiveTooth] = useState<ToothInfo | null>(null);

  // Map tooth records by number for fast lookup
  const recordsMap = new Map<number, ToothRecord>(
    teethRecords.map((r) => [r.toothNumber, r])
  );

  const upperTeethNumbers = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28];
  const lowerTeethNumbers = [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38];
  const allTeethNumbers = [...upperTeethNumbers, ...lowerTeethNumbers];

  // Quadrants & Anatomical groups
  const quadrantGroups = [
    { label: "Upper (16)", teeth: upperTeethNumbers },
    { label: "Lower (16)", teeth: lowerTeethNumbers },
    { label: "Q1: Sup. Droit", teeth: [18, 17, 16, 15, 14, 13, 12, 11] },
    { label: "Q2: Sup. Gauche", teeth: [21, 22, 23, 24, 25, 26, 27, 28] },
    { label: "Q3: Inf. Gauche", teeth: [31, 32, 33, 34, 35, 36, 37, 38] },
    { label: "Q4: Inf. Droit", teeth: [48, 47, 46, 45, 44, 43, 42, 41] },
    { label: "Molars (12)", teeth: [18, 17, 16, 26, 27, 28, 48, 47, 46, 36, 37, 38] },
    { label: "Premolars (8)", teeth: [15, 14, 24, 25, 45, 44, 34, 35] },
    { label: "Anteriors (12)", teeth: [13, 12, 11, 21, 22, 23, 43, 42, 41, 31, 32, 33] },
  ];

  const NOTE_PRESETS = [
    "Composite filling",
    "Deep cavity",
    "Root canal session",
    "Crown fitted",
    "Extraction needed",
    "Sensitive to cold",
    "Fractured cusp",
  ];

  // Handle clicking on a tooth (supports single select by default, multi-select ONLY if toggled or Shift held)
  const handleToothClick = (
    toothNum: number,
    event?: React.MouseEvent
  ) => {
    if (readonly) return;

    const tooth = ALL_TEETH.find((t) => t.number === toothNum);
    if (!tooth) return;

    const isMulti =
      isMultiSelectMode ||
      event?.shiftKey ||
      event?.ctrlKey ||
      event?.metaKey;

    if (isMulti) {
      // Toggle tooth in/out of multiple selection
      setSelectedTeethNumbers((prev) => {
        const isAlreadySelected = prev.includes(toothNum);
        let updated: number[];
        if (isAlreadySelected) {
          updated = prev.filter((n) => n !== toothNum);
        } else {
          updated = [...prev, toothNum];
        }

        if (updated.length === 1) {
          const single = ALL_TEETH.find((t) => t.number === updated[0]);
          setActiveTooth(single || null);
          setTreatmentNote(recordsMap.get(updated[0])?.notes || "");
        } else if (updated.length === 0) {
          setActiveTooth(null);
          setTreatmentNote("");
        } else {
          setActiveTooth(tooth);
        }

        return updated;
      });
    } else {
      // DEFAULT SINGLE SELECTION:
      // Clicking a tooth immediately deselects any previously selected tooth!
      if (selectedTeethNumbers.length === 1 && selectedTeethNumbers[0] === toothNum) {
        setSelectedTeethNumbers([]);
        setActiveTooth(null);
        setTreatmentNote("");
      } else {
        setSelectedTeethNumbers([toothNum]);
        setActiveTooth(tooth);
        const existingRecord = recordsMap.get(toothNum);
        setTreatmentNote(existingRecord?.notes || "");
      }
    }
  };

  // Immediate note editing for the active single tooth
  const handleActiveToothNoteChange = (text: string) => {
    setTreatmentNote(text);
    if (!activeTooth) return;

    const existingRecord = recordsMap.get(activeTooth.number);
    const updatedRecord: ToothRecord = {
      toothNumber: activeTooth.number,
      status: existingRecord?.status || (activeTool === "erase" ? "treated" : activeTool),
      procedure:
        existingRecord?.procedure ||
        TREATMENT_METADATA[activeTool === "erase" ? "treated" : activeTool].label,
      notes: text.trim() || undefined,
      updatedAt: Date.now(),
    };
    onUpdateTooth(updatedRecord);
  };

  // Immediate status change for the active tooth
  const handleActiveToothStatusChange = (status: ToothTreatment | "erase") => {
    if (!activeTooth) return;

    if (status === "erase") {
      onRemoveTooth(activeTooth.number);
      return;
    }

    const existingRecord = recordsMap.get(activeTooth.number);
    const updatedRecord: ToothRecord = {
      toothNumber: activeTooth.number,
      status,
      procedure: TREATMENT_METADATA[status].label,
      notes: treatmentNote.trim() || existingRecord?.notes || undefined,
      updatedAt: Date.now(),
    };
    onUpdateTooth(updatedRecord);
  };

  const handleAppendPreset = (preset: string) => {
    const newNote = treatmentNote.trim() ? `${treatmentNote.trim()}, ${preset}` : preset;
    handleActiveToothNoteChange(newNote);
  };

  // Quick selection helpers
  const handleSelectGroup = (teeth: number[]) => {
    setSelectedTeethNumbers(teeth);
    if (teeth.length === 1) {
      const t = ALL_TEETH.find((x) => x.number === teeth[0]);
      setActiveTooth(t || null);
      setTreatmentNote(recordsMap.get(teeth[0])?.notes || "");
    } else {
      setActiveTooth(null);
    }
  };

  const handleSelectAll = () => {
    setSelectedTeethNumbers(allTeethNumbers);
    setActiveTooth(null);
  };

  const handleClearSelection = () => {
    setSelectedTeethNumbers([]);
    setActiveTooth(null);
    setTreatmentNote("");
    setBatchNote("");
  };

  // Apply a status to all currently selected teeth
  const handleApplyStatusToSelected = (status: ToothTreatment) => {
    if (selectedTeethNumbers.length === 0) return;

    const newRecords: ToothRecord[] = selectedTeethNumbers.map((num) => {
      const existing = recordsMap.get(num);
      return {
        toothNumber: num,
        status,
        procedure: TREATMENT_METADATA[status].label,
        notes: existing?.notes,
        updatedAt: Date.now(),
      };
    });

    if (onUpdateMultipleTeeth) {
      onUpdateMultipleTeeth(newRecords);
    } else {
      newRecords.forEach((rec) => onUpdateTooth(rec));
    }
  };

  // Erase status from selected teeth
  const handleClearSelectedTreatments = () => {
    if (selectedTeethNumbers.length === 0) return;

    if (onRemoveMultipleTeeth) {
      onRemoveMultipleTeeth(selectedTeethNumbers);
    } else {
      selectedTeethNumbers.forEach((num) => onRemoveTooth(num));
    }
  };

  // Apply batch note to all currently selected teeth
  const handleApplyBatchNote = () => {
    if (selectedTeethNumbers.length === 0 || !batchNote.trim()) return;

    const updated: ToothRecord[] = selectedTeethNumbers.map((num) => {
      const existing = recordsMap.get(num);
      const combinedNote = existing?.notes
        ? `${existing.notes} | ${batchNote.trim()}`
        : batchNote.trim();

      return {
        toothNumber: num,
        status: existing?.status || (activeTool === "erase" ? "treated" : activeTool),
        procedure:
          existing?.procedure ||
          TREATMENT_METADATA[activeTool === "erase" ? "treated" : activeTool].label,
        notes: combinedNote,
        updatedAt: Date.now(),
      };
    });

    if (onUpdateMultipleTeeth) {
      onUpdateMultipleTeeth(updated);
    } else {
      updated.forEach((rec) => onUpdateTooth(rec));
    }

    setBatchNote("");
  };

  const selectedCount = selectedTeethNumbers.length;
  const isMultipleSelected = selectedCount > 1;
  const singleSelectedTooth =
    selectedCount === 1
      ? ALL_TEETH.find((t) => t.number === selectedTeethNumbers[0])
      : null;
  const singleRecord =
    selectedCount === 1 ? recordsMap.get(selectedTeethNumbers[0]) : null;

  return (
    <div className="w-full flex flex-col bg-slate-50/70 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800 rounded-xl sm:rounded-3xl p-1.5 sm:p-5 shadow-inner select-none backdrop-blur-xs">
      {/* ================= 1. PROCEDURE & MULTI-SELECT TOOLBAR ================= */}
      <div className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-2 sm:p-4 rounded-xl sm:rounded-2xl border border-indigo-200/80 dark:border-indigo-800/80 shadow-md mb-2.5 sm:mb-3.5 space-y-2 sm:space-y-3">
        {/* Row 1: Mode Switcher & Tools */}
        <div className="flex items-center justify-between gap-1.5 flex-wrap">
          {/* Multi-Select Mode Toggle */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setIsMultiSelectMode(!isMultiSelectMode)}
              className={`
                px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold flex items-center gap-1.5 border transition-all cursor-pointer shadow-xs active:scale-95
                ${
                  isMultiSelectMode
                    ? "bg-indigo-600 text-white border-indigo-700 ring-2 ring-indigo-500/50 shadow-indigo-500/20"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-indigo-400"
                }
              `}
              title="Toggle multi-select mode"
            >
              <CheckSquare className="w-3.5 h-3.5" />
              <span>Multi-Select</span>
              <span
                className={`text-[9px] px-1 py-0.2 rounded-full font-bold uppercase ${
                  isMultiSelectMode
                    ? "bg-white/25 text-white"
                    : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                }`}
              >
                {isMultiSelectMode ? "ON" : "OFF"}
              </span>
            </button>
          </div>

          {/* Instant Auto-Save status badge */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] sm:text-[11px] px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1 shadow-xs">
              <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="hidden sm:inline">Changes Stored Instantly</span>
              <span className="sm:hidden">Auto-Saved</span>
            </span>
          </div>
        </div>

        {/* Row 2: Procedure Tools Strip (smooth horizontal scroll on phone) */}
        <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap mr-0.5 flex items-center gap-1">
            <MousePointer className="w-3 h-3 text-indigo-500" />
            <span className="hidden sm:inline">Apply:</span>
          </span>

          {(
            [
              "treated",
              "filling",
              "root_canal",
              "crown",
              "extraction",
              "decay",
            ] as ToothTreatment[]
          ).map((statusKey) => {
            const meta = TREATMENT_METADATA[statusKey];
            const isActive = activeTool === statusKey;

            return (
              <button
                key={statusKey}
                type="button"
                onClick={() => {
                  setActiveTool(statusKey);
                  if (selectedCount > 0) {
                    handleApplyStatusToSelected(statusKey);
                  }
                }}
                className={`
                  px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold flex items-center gap-1 border transition-all cursor-pointer whitespace-nowrap flex-shrink-0 active:scale-95
                  ${
                    isActive
                      ? "ring-2 ring-indigo-500 scale-105 shadow-xs"
                      : "opacity-85 hover:opacity-100"
                  }
                  ${meta.badgeBg} ${meta.badgeBorder} ${meta.badgeText}
                `}
              >
                <span
                  className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full flex-shrink-0 shadow-xs"
                  style={{ backgroundColor: meta.color }}
                />
                <span>{meta.label}</span>
                {isActive && <Check className="w-3 h-3 ml-0.5" />}
              </button>
            );
          })}

          {/* Erase Tool */}
          <button
            type="button"
            onClick={() => {
              setActiveTool("erase");
              if (selectedCount > 0) {
                handleClearSelectedTreatments();
              }
            }}
            className={`
              px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold flex items-center gap-1 border transition-all cursor-pointer whitespace-nowrap flex-shrink-0 active:scale-95
              ${
                activeTool === "erase"
                  ? "ring-2 ring-rose-500 bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-800 shadow-xs"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-rose-50 hover:text-rose-600"
              }
            `}
          >
            <Eraser className="w-3 h-3 text-rose-500" />
            <span>Erase</span>
          </button>
        </div>

        {/* Row 3: Quick Select Strip (horizontally scrollable on mobile) */}
        <div className="pt-1.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-1.5 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-1 flex-nowrap text-xs flex-shrink-0">
            <span className="text-[10px] sm:text-[11px] text-slate-400 font-bold mr-0.5 flex items-center gap-0.5">
              <Layers className="w-3 h-3 text-indigo-500" />
              <span>Select:</span>
            </span>

            {quadrantGroups.map((group) => (
              <button
                key={group.label}
                type="button"
                onClick={() => handleSelectGroup(group.teeth)}
                className="px-2 py-0.5 rounded-md sm:rounded-lg text-[10px] sm:text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors cursor-pointer whitespace-nowrap"
              >
                {group.label}
              </button>
            ))}

            <button
              type="button"
              onClick={handleSelectAll}
              className="px-2 py-0.5 rounded-md sm:rounded-lg text-[10px] sm:text-[11px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 transition-colors cursor-pointer whitespace-nowrap"
            >
              All (32)
            </button>
          </div>

          {selectedCount > 0 && (
            <button
              type="button"
              onClick={handleClearSelection}
              className="text-[10px] sm:text-[11px] font-bold text-rose-600 dark:text-rose-400 hover:underline cursor-pointer flex items-center gap-0.5 ml-auto flex-shrink-0 whitespace-nowrap"
            >
              <RotateCcw className="w-2.5 h-2.5" />
              <span>Deselect ({selectedCount})</span>
            </button>
          )}
        </div>
      </div>

      {/* ================= 2. BATCH ACTION BAR (WHEN MULTIPLE TEETH ARE SELECTED) ================= */}
      {isMultipleSelected && (
        <div className="mb-2.5 sm:mb-3.5 p-2.5 sm:p-4 rounded-xl sm:rounded-2xl bg-gradient-to-r from-indigo-50 via-white to-indigo-50 dark:from-indigo-950/80 dark:via-slate-900/90 dark:to-indigo-950/80 border-2 border-indigo-400/80 dark:border-indigo-600/80 shadow-md animate-in slide-in-from-top-2 duration-200">
          <div className="flex flex-col gap-2">
            {/* Header: Count & Selected Teeth List */}
            <div className="flex items-center justify-between gap-1.5 flex-wrap">
              <div className="flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-indigo-600 text-white font-black text-xs flex items-center justify-center shadow-xs">
                  {selectedCount}
                </span>
                <span className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-slate-100">
                  Selected Teeth:
                </span>
              </div>

              <div className="flex items-center gap-1 flex-wrap max-w-xl">
                {selectedTeethNumbers.map((num) => (
                  <span
                    key={num}
                    className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-md text-[11px] font-mono font-bold bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 shadow-2xs"
                  >
                    #{num}
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedTeethNumbers((prev) => prev.filter((n) => n !== num))
                      }
                      className="hover:text-rose-600 cursor-pointer ml-0.5"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Batch Procedure Quick Buttons */}
            <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap pt-1.5 border-t border-indigo-100 dark:border-indigo-900/60">
              <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Apply to all:
              </span>
              {(
                [
                  "treated",
                  "filling",
                  "root_canal",
                  "crown",
                  "extraction",
                  "decay",
                ] as ToothTreatment[]
              ).map((statusKey) => {
                const meta = TREATMENT_METADATA[statusKey];
                return (
                  <button
                    key={statusKey}
                    type="button"
                    onClick={() => handleApplyStatusToSelected(statusKey)}
                    className={`px-2 py-0.5 rounded-lg text-[11px] font-bold border transition-all cursor-pointer shadow-xs active:scale-95 ${meta.badgeBg} ${meta.badgeBorder} ${meta.badgeText}`}
                  >
                    + {meta.label}
                  </button>
                );
              })}

              <button
                type="button"
                onClick={handleClearSelectedTreatments}
                className="px-2 py-0.5 rounded-lg text-[11px] font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 hover:bg-rose-100 cursor-pointer flex items-center gap-1 shadow-xs"
              >
                <Eraser className="w-3 h-3" />
                <span>Clear</span>
              </button>
            </div>

            {/* Batch Note Input */}
            <div className="flex items-center gap-1.5 pt-1.5 border-t border-indigo-100 dark:border-indigo-900/60">
              <input
                type="text"
                placeholder={`Note for all ${selectedCount} selected teeth...`}
                value={batchNote}
                onChange={(e) => setBatchNote(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleApplyBatchNote();
                }}
                className="flex-1 px-2.5 py-1 rounded-lg border border-indigo-200 dark:border-indigo-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-xs"
              />
              <button
                type="button"
                onClick={handleApplyBatchNote}
                disabled={!batchNote.trim()}
                className="px-3 py-1 rounded-lg bg-indigo-600 disabled:opacity-50 hover:bg-indigo-500 text-white text-xs font-bold cursor-pointer transition-colors shadow-xs"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= 3. PANORAMIC FDI ODONTOGRAM (RESPONSIVE PHONE & DESKTOP) ================= */}
      <div className="flex items-center justify-between mb-1 px-1">
        <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">
          FDI Chart • Click white crown
        </span>

        {/* Mobile Zoom / Fit Toggle */}
        <button
          type="button"
          onClick={() => setIsZoomed(!isZoomed)}
          className="sm:hidden px-2 py-0.5 rounded-lg text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 flex items-center gap-1 cursor-pointer shadow-2xs"
          title="Toggle between fitting to phone screen or zoomed 150% view"
        >
          {isZoomed ? <Minimize2 className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
          <span>{isZoomed ? "Fit Screen" : "Zoom 150%"}</span>
        </button>
      </div>

      <div className="w-full overflow-x-auto pb-1 select-none no-scrollbar">
        <div
          className={`
            relative aspect-[1537/1023] mx-auto overflow-hidden rounded-xl sm:rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm
            ${isZoomed ? "min-w-[620px]" : "w-full max-w-4xl"}
          `}
        >
          {/* Original high-resolution FDI illustration */}
          <img
            src="/teeth.png"
            alt="Numérotation dentaire FDI"
            className="w-full h-full object-contain pointer-events-none select-none block"
            draggable={false}
          />

          {/* SVG Overlay tracing ONLY the white enamel crown contours */}
          <svg
            viewBox="0 0 1537 1023"
            className="absolute inset-0 w-full h-full pointer-events-auto"
          >
            {CROWN_POLYGONS.map((poly) => {
              const isSelected = selectedTeethNumbers.includes(poly.num);
              const record = recordsMap.get(poly.num);
              const hasNote = Boolean(record?.notes);
              const toothInfo = ALL_TEETH.find((t) => t.number === poly.num);

              return (
                <g key={poly.num} className="cursor-pointer group">
                  {/* Traced crown enamel polygon */}
                  <polygon
                    points={poly.points}
                    onClick={(e) => handleToothClick(poly.num, e)}
                    className={`
                      transition-all duration-150
                      ${
                        isSelected
                          ? "fill-indigo-600/40 stroke-indigo-600 stroke-[3.5px] filter drop-shadow-md"
                          : "fill-transparent stroke-transparent hover:fill-indigo-500/25 hover:stroke-indigo-500/80 hover:stroke-[2px]"
                      }
                      ${
                        record && !isSelected
                          ? "stroke-emerald-500/80 stroke-[2px] fill-emerald-500/15"
                          : ""
                      }
                    `}
                  >
                    <title>{`Tooth #${poly.num} - ${toothInfo?.name || ""} (${toothInfo?.arabicName || ""})${
                      record ? ` • ${TREATMENT_METADATA[record.status].label}` : " • Click to select"
                    }${record?.notes ? ` • Note: ${record.notes}` : ""}`}</title>
                  </polygon>

                  {/* Treatment indicators centered on the crown */}
                  {record && (
                    <g pointerEvents="none">
                      {record.status === "extraction" && (
                        <g stroke="#e11d48" strokeWidth="4" strokeLinecap="round">
                          <line
                            x1={poly.centerX - 10}
                            y1={poly.centerY - 10}
                            x2={poly.centerX + 10}
                            y2={poly.centerY + 10}
                          />
                          <line
                            x1={poly.centerX + 10}
                            y1={poly.centerY - 10}
                            x2={poly.centerX - 10}
                            y2={poly.centerY + 10}
                          />
                        </g>
                      )}

                      {record.status === "crown" && (
                        <text
                          x={poly.centerX}
                          y={poly.centerY + 5}
                          textAnchor="middle"
                          fontSize="13"
                          className="select-none filter drop-shadow-xs"
                        >
                          👑
                        </text>
                      )}

                      {record.status === "filling" && (
                        <circle
                          cx={poly.centerX}
                          cy={poly.centerY}
                          r="6.5"
                          fill="#3b82f6"
                          stroke="#ffffff"
                          strokeWidth="2"
                          className="filter drop-shadow-xs"
                        />
                      )}

                      {record.status === "root_canal" && (
                        <line
                          x1={poly.centerX}
                          y1={poly.centerY - 12}
                          x2={poly.centerX}
                          y2={poly.centerY + 12}
                          stroke="#9333ea"
                          strokeWidth="3.5"
                          strokeDasharray="4 2"
                          strokeLinecap="round"
                        />
                      )}

                      {record.status === "decay" && (
                        <g>
                          <circle
                            cx={poly.centerX}
                            cy={poly.centerY}
                            r="6.5"
                            fill="#e11d48"
                            stroke="#ffffff"
                            strokeWidth="2"
                          />
                          <text
                            x={poly.centerX}
                            y={poly.centerY + 3.5}
                            textAnchor="middle"
                            fill="#ffffff"
                            fontSize="9"
                            fontWeight="900"
                          >
                            !
                          </text>
                        </g>
                      )}

                      {record.status === "treated" && (
                        <g>
                          <circle
                            cx={poly.centerX}
                            cy={poly.centerY}
                            r="6.5"
                            fill="#10b981"
                            stroke="#ffffff"
                            strokeWidth="2"
                          />
                          <text
                            x={poly.centerX}
                            y={poly.centerY + 3.5}
                            textAnchor="middle"
                            fill="#ffffff"
                            fontSize="9"
                            fontWeight="900"
                          >
                            ✓
                          </text>
                        </g>
                      )}
                    </g>
                  )}

                  {/* Note indicator icon */}
                  {hasNote && (
                    <text
                      x={poly.centerX + 10}
                      y={poly.centerY - 6}
                      fontSize="11"
                      className="select-none filter drop-shadow-xs"
                      pointerEvents="none"
                    >
                      📝
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* ================= 4. SINGLE SELECTED TOOTH CLINICAL NOTE & DETAIL PANEL ================= */}
      {selectedCount === 1 && activeTooth && (
        <div className="mt-2.5 sm:mt-3.5 p-2.5 sm:p-5 rounded-xl sm:rounded-3xl bg-indigo-50/90 dark:bg-indigo-950/60 border-2 border-indigo-500/50 shadow-lg animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between gap-2 pb-2 sm:pb-3 border-b border-indigo-200/70 dark:border-indigo-800/70">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-xl sm:text-2xl flex-shrink-0">🦷</span>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-black text-xs sm:text-base text-slate-900 dark:text-slate-100">
                    Tooth #{activeTooth.number} — {activeTooth.name}
                  </span>
                  <span className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400">
                    ({activeTooth.arabicName})
                  </span>
                </div>
                <div className="flex items-center gap-1.5 mt-0.5 text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400">
                  <span className="font-semibold text-indigo-700 dark:text-indigo-300 truncate">
                    {activeTooth.jaw === "upper"
                      ? "Upper (العلوي)"
                      : "Lower (السفلي)"}
                  </span>
                  <span>•</span>
                  <span className="capitalize font-semibold text-slate-600 dark:text-slate-300">
                    {getFdiCategory(activeTooth.number).label}
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleClearSelection()}
              className="p-1 sm:p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-white dark:hover:bg-slate-800 transition-colors cursor-pointer flex-shrink-0"
              title="Close panel"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>

          {/* Condition / Procedure Selector */}
          <div className="py-2 sm:py-3">
            <label className="block text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
              Tooth Condition / Status:
            </label>
            <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap">
              {(
                [
                  "treated",
                  "filling",
                  "root_canal",
                  "crown",
                  "extraction",
                  "decay",
                ] as ToothTreatment[]
              ).map((statusKey) => {
                const meta = TREATMENT_METADATA[statusKey];
                const isCurrentStatus =
                  recordsMap.get(activeTooth.number)?.status === statusKey;
                return (
                  <button
                    key={statusKey}
                    type="button"
                    onClick={() => handleActiveToothStatusChange(statusKey)}
                    className={`px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold flex items-center gap-1 border transition-all cursor-pointer ${
                      isCurrentStatus
                        ? "ring-2 ring-indigo-500 scale-105 shadow-xs"
                        : "opacity-75 hover:opacity-100"
                    } ${meta.badgeBg} ${meta.badgeBorder} ${meta.badgeText}`}
                  >
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: meta.color }}
                    />
                    <span>{meta.label}</span>
                    {isCurrentStatus && <Check className="w-3 h-3 ml-0.5" />}
                  </button>
                );
              })}

              <button
                type="button"
                onClick={() => handleActiveToothStatusChange("erase")}
                className="px-2 py-0.5 sm:py-1 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 hover:bg-rose-100 cursor-pointer flex items-center gap-1"
              >
                <Eraser className="w-3 h-3" />
                <span>Remove</span>
              </button>
            </div>
          </div>

          {/* Clinical Note Input Box */}
          <div className="pt-1">
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>Clinical Note:</span>
              </label>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-0.5">
                <CheckCircle2 className="w-3 h-3" />
                <span>Auto-saved</span>
              </span>
            </div>

            <textarea
              rows={2}
              placeholder={`Diagnosis or clinical note for Tooth #${activeTooth.number}...`}
              value={treatmentNote}
              onChange={(e) => handleActiveToothNoteChange(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-xs resize-none"
            />

            {/* Quick Note Suggestions */}
            <div className="flex items-center gap-1 flex-wrap mt-1.5">
              <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-0.5">
                <Sparkles className="w-3 h-3 text-amber-500" />
                <span>Quick:</span>
              </span>
              {NOTE_PRESETS.slice(0, 5).map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => handleAppendPreset(preset)}
                  className="px-1.5 py-0.2 rounded-md text-[10px] font-medium bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-indigo-400 hover:text-indigo-600 transition-colors cursor-pointer"
                >
                  + {preset}
                </button>
              ))}
            </div>

            <div className="flex items-center justify-end gap-1.5 mt-2 pt-2 border-t border-indigo-200/50 dark:border-indigo-900/50">
              {treatmentNote && (
                <button
                  type="button"
                  onClick={() => handleActiveToothNoteChange("")}
                  className="px-2.5 py-1 rounded-lg text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 transition-colors cursor-pointer"
                >
                  Clear Note
                </button>
              )}
              <button
                type="button"
                onClick={() => handleClearSelection()}
                className="px-3.5 py-1 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm cursor-pointer transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= 5. SUMMARY OF WORKED TEETH ================= */}
      <div className="mt-2.5 pt-2 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-1.5 flex-wrap">
          <Activity className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
          <span className="text-[11px] sm:text-xs">
            Worked Teeth ({teethRecords.length}):{" "}
            {teethRecords.length > 0 ? (
              <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                {teethRecords.map((r) => `#${r.toothNumber}`).join(", ")}
              </span>
            ) : (
              <em className="text-slate-400">Tap any tooth crown to mark</em>
            )}
          </span>
        </div>

        <div className="flex items-center gap-1 text-[10px] sm:text-[11px]">
          <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>Stored Instantly</span>
          </span>
        </div>
      </div>
    </div>
  );
}
