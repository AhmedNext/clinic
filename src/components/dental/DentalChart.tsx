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
  ChevronRight,
  RotateCcw,
} from "lucide-react";

interface DentalChartProps {
  teethRecords: ToothRecord[];
  onUpdateTooth: (record: ToothRecord) => void;
  onUpdateMultipleTeeth?: (records: ToothRecord[]) => void;
  onRemoveTooth: (toothNumber: number) => void;
  onRemoveMultipleTeeth?: (toothNumbers: number[]) => void;
  readonly?: boolean;
}

// Measured pixel coordinates from public/teeth.png (1537 x 1023)
export const UPPER_HOTSPOTS = [
  { num: 18, centerPct: 12.1, leftPct: 8.39, widthPct: 6.8 },
  { num: 17, centerPct: 18.28, leftPct: 15.19, widthPct: 6.2 },
  { num: 16, centerPct: 24.5, leftPct: 21.39, widthPct: 5.94 },
  { num: 15, centerPct: 30.16, leftPct: 27.33, widthPct: 5.22 },
  { num: 14, centerPct: 34.94, leftPct: 32.55, widthPct: 5.09 },
  { num: 13, centerPct: 40.34, leftPct: 37.64, widthPct: 4.88 },
  { num: 12, centerPct: 44.7, leftPct: 42.52, widthPct: 4.07 },
  { num: 11, centerPct: 48.47, leftPct: 46.58, widthPct: 4.08 },
  { num: 21, centerPct: 52.86, leftPct: 50.67, widthPct: 4.29 },
  { num: 22, centerPct: 57.06, leftPct: 54.96, widthPct: 4.33 },
  { num: 23, centerPct: 61.52, leftPct: 59.29, widthPct: 4.98 },
  { num: 24, centerPct: 67.01, leftPct: 64.26, widthPct: 5.14 },
  { num: 25, centerPct: 71.8, leftPct: 69.4, widthPct: 5.2 },
  { num: 26, centerPct: 77.42, leftPct: 74.61, widthPct: 5.82 },
  { num: 27, centerPct: 83.44, leftPct: 80.43, widthPct: 5.63 },
  { num: 28, centerPct: 88.68, leftPct: 86.06, widthPct: 5.76 },
];

export const LOWER_HOTSPOTS = [
  { num: 48, centerPct: 12.26, leftPct: 8.71, widthPct: 6.51 },
  { num: 47, centerPct: 18.18, leftPct: 15.22, widthPct: 6.59 },
  { num: 46, centerPct: 25.44, leftPct: 21.81, widthPct: 6.83 },
  { num: 45, centerPct: 31.85, leftPct: 28.64, widthPct: 5.48 },
  { num: 44, centerPct: 36.4, leftPct: 34.12, widthPct: 4.57 },
  { num: 43, centerPct: 40.99, leftPct: 38.7, widthPct: 4.77 },
  { num: 42, centerPct: 45.93, leftPct: 43.46, widthPct: 3.89 },
  { num: 41, centerPct: 48.76, leftPct: 47.35, widthPct: 2.85 },
  { num: 31, centerPct: 51.63, leftPct: 50.2, widthPct: 3.06 },
  { num: 32, centerPct: 54.88, leftPct: 53.25, widthPct: 4.16 },
  { num: 33, centerPct: 59.95, leftPct: 57.42, widthPct: 4.88 },
  { num: 34, centerPct: 64.64, leftPct: 62.3, widthPct: 4.62 },
  { num: 35, centerPct: 69.19, leftPct: 66.92, widthPct: 5.61 },
  { num: 36, centerPct: 75.86, leftPct: 72.53, widthPct: 6.64 },
  { num: 37, centerPct: 82.47, leftPct: 79.16, widthPct: 6.21 },
  { num: 38, centerPct: 88.29, leftPct: 85.38, widthPct: 6.41 },
];

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
  // Multi-select toggle mode
  const [isMultiSelectMode, setIsMultiSelectMode] = useState<boolean>(false);
  const [selectedTeethNumbers, setSelectedTeethNumbers] = useState<number[]>([]);
  const [treatmentNote, setTreatmentNote] = useState("");
  const [batchNote, setBatchNote] = useState("");
  const [activeTooth, setActiveTooth] = useState<ToothInfo | null>(null);

  // Map tooth records by number for fast lookup
  const recordsMap = new Map<number, ToothRecord>(
    teethRecords.map((r) => [r.toothNumber, r])
  );

  const upperTeethNumbers = UPPER_HOTSPOTS.map((s) => s.num);
  const lowerTeethNumbers = LOWER_HOTSPOTS.map((s) => s.num);
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

  // Handle clicking on a tooth (supports multi-select mode & Shift/Ctrl click)
  const handleToothClick = (
    toothNum: number,
    event?: React.MouseEvent<HTMLButtonElement>
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
      // Single selection mode
      setActiveTooth(tooth);
      setSelectedTeethNumbers([toothNum]);
      const existingRecord = recordsMap.get(toothNum);
      setTreatmentNote(existingRecord?.notes || "");

      // If active tool is Erase, erase immediately
      if (activeTool === "erase") {
        if (existingRecord) {
          onRemoveTooth(toothNum);
        }
        return;
      }

      // If tooth has no record yet, create one with active tool
      if (!existingRecord) {
        const newRecord: ToothRecord = {
          toothNumber: toothNum,
          status: activeTool,
          procedure: TREATMENT_METADATA[activeTool].label,
          notes: undefined,
          updatedAt: Date.now(),
        };
        onUpdateTooth(newRecord);
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

  // Save clinical note for single selected tooth
  const handleSaveSingleNote = () => {
    if (!activeTooth) return;
    const existing = recordsMap.get(activeTooth.number);
    onUpdateTooth({
      toothNumber: activeTooth.number,
      status: existing?.status || "treated",
      procedure: existing?.procedure || TREATMENT_METADATA["treated"].label,
      notes: treatmentNote.trim() || undefined,
      updatedAt: Date.now(),
    });
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
        status: existing?.status || activeTool === "erase" ? "treated" : activeTool,
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

  // Render a hotspot button overlay on top of teeth.png
  const renderHotspot = (
    spot: { num: number; leftPct: number; widthPct: number },
    topPct: string,
    heightPct: string,
    isUpper: boolean
  ) => {
    const record = recordsMap.get(spot.num);
    const toothInfo = ALL_TEETH.find((t) => t.number === spot.num);
    const isSelected = selectedTeethNumbers.includes(spot.num);
    const hasNote = Boolean(record?.notes);

    return (
      <button
        key={spot.num}
        type="button"
        disabled={readonly}
        onClick={(e) => handleToothClick(spot.num, e)}
        style={{
          left: `${spot.leftPct}%`,
          width: `${spot.widthPct}%`,
          top: topPct,
          height: heightPct,
        }}
        title={`Tooth #${spot.num} - ${toothInfo?.name || ""} (${toothInfo?.arabicName || ""})${
          record ? ` • ${TREATMENT_METADATA[record.status].label}` : " • Tap to select"
        }${record?.notes ? ` • Note: ${record.notes}` : ""}`}
        className={`
          absolute z-10 flex flex-col items-center justify-between p-0.5 rounded-xl transition-all duration-150 cursor-pointer select-none group
          ${
            isSelected
              ? "bg-indigo-600/30 ring-2 sm:ring-[3px] ring-indigo-500 shadow-lg shadow-indigo-500/40 z-20 scale-[1.02] backdrop-blur-[0.5px]"
              : "hover:bg-indigo-500/20 hover:ring-1 hover:ring-indigo-400/60"
          }
          ${record && !isSelected ? "ring-1 ring-emerald-500/60 bg-emerald-500/10" : ""}
        `}
      >
        {/* Floating Number Badge */}
        <span
          className={`
            text-[9px] sm:text-[11px] font-black font-mono px-1 py-0.2 rounded-md transition-all duration-150 shadow-xs
            ${isUpper ? "self-center mt-0.5" : "self-center mb-0.5 order-last"}
            ${
              isSelected
                ? "bg-indigo-600 text-white shadow-md scale-110"
                : "bg-white/80 dark:bg-slate-900/80 text-slate-700 dark:text-slate-300 group-hover:bg-indigo-50 group-hover:text-indigo-600"
            }
          `}
        >
          {spot.num}
        </span>

        {/* Note indicator badge icon */}
        {hasNote && (
          <span
            className="absolute top-1 right-1 z-30 text-[10px] sm:text-xs leading-none bg-amber-100/90 dark:bg-amber-950/90 text-amber-800 dark:text-amber-200 rounded-full px-1 py-0.5 shadow-xs border border-amber-300/80"
            title={`Note: ${record?.notes}`}
          >
            📝
          </span>
        )}

        {/* Treatment Graphic Overlay */}
        {record && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {record.status === "extraction" && (
              <svg
                className="w-full h-full stroke-rose-600 stroke-[4px] drop-shadow-sm opacity-90 animate-in zoom-in-50 duration-150"
                viewBox="0 0 40 40"
              >
                <line x1="8" y1="8" x2="32" y2="32" strokeLinecap="round" />
                <line x1="32" y1="8" x2="8" y2="32" strokeLinecap="round" />
              </svg>
            )}

            {record.status === "crown" && (
              <span className="bg-gradient-to-r from-amber-500 to-amber-600 text-white text-[8px] sm:text-[9.5px] font-black px-1.5 py-0.5 rounded shadow-md border border-amber-300">
                👑 CROWN
              </span>
            )}

            {record.status === "filling" && (
              <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-blue-500 border-2 border-white shadow-md ring-1 ring-blue-600" />
            )}

            {record.status === "root_canal" && (
              <svg
                className="w-full h-full stroke-purple-600 stroke-[3.5px] stroke-dasharray-[3_2] drop-shadow-sm opacity-90"
                viewBox="0 0 40 40"
              >
                <line x1="20" y1="6" x2="20" y2="34" strokeLinecap="round" />
              </svg>
            )}

            {record.status === "decay" && (
              <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-rose-600 border-2 border-white shadow-md ring-1 ring-rose-700 flex items-center justify-center text-[8px] text-white font-bold">
                !
              </div>
            )}

            {record.status === "treated" && (
              <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[9px] font-black shadow-md border border-white">
                ✓
              </div>
            )}
          </div>
        )}

        {/* Bottom indicator dot matching treatment color */}
        {record && (
          <span
            className={`w-2 h-2 rounded-full absolute ${
              isUpper ? "bottom-1" : "top-1"
            } z-20 shadow-xs border border-white`}
            style={{ backgroundColor: TREATMENT_METADATA[record.status].color }}
          />
        )}
      </button>
    );
  };

  return (
    <div className="w-full flex flex-col bg-slate-50/70 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800 rounded-2xl sm:rounded-3xl p-2.5 sm:p-5 shadow-inner select-none backdrop-blur-xs">
      {/* ================= 1. PROCEDURE & MULTI-SELECT TOOLBAR ================= */}
      <div className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-2.5 sm:p-4 rounded-2xl border border-indigo-200/80 dark:border-indigo-800/80 shadow-md mb-3.5 space-y-3">
        {/* Row 1: Mode Switcher & Tools */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          {/* Multi-Select Mode Toggle */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsMultiSelectMode(!isMultiSelectMode)}
              className={`
                px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all cursor-pointer shadow-xs active:scale-95
                ${
                  isMultiSelectMode
                    ? "bg-indigo-600 text-white border-indigo-700 ring-2 ring-indigo-500/50 shadow-indigo-500/20"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-indigo-400"
                }
              `}
              title="Toggle multi-select mode to select several teeth without holding modifier keys"
            >
              <CheckSquare className="w-4 h-4" />
              <span>Multi-Select Mode</span>
              <span
                className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold uppercase ${
                  isMultiSelectMode
                    ? "bg-white/25 text-white"
                    : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                }`}
              >
                {isMultiSelectMode ? "ON" : "OFF"}
              </span>
            </button>

            <span className="hidden md:inline-block text-[11px] text-slate-400 font-medium">
              (or hold <kbd className="px-1 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border text-[10px]">Shift</kbd> to multi-select)
            </span>
          </div>

          {/* Instant Auto-Save status badge */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] sm:text-[11px] px-2.5 py-1 rounded-full font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Changes Stored Instantly</span>
            </span>
          </div>
        </div>

        {/* Row 2: Procedure Tools Strip */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap mr-1 flex items-center gap-1">
            <MousePointer className="w-3.5 h-3.5 text-indigo-500" />
            <span>Apply Tool:</span>
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
                  px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all cursor-pointer whitespace-nowrap flex-shrink-0 active:scale-95
                  ${
                    isActive
                      ? "ring-2 ring-indigo-500 scale-105 shadow-xs"
                      : "opacity-85 hover:opacity-100"
                  }
                  ${meta.badgeBg} ${meta.badgeBorder} ${meta.badgeText}
                `}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0 shadow-xs"
                  style={{ backgroundColor: meta.color }}
                />
                <span>{meta.label}</span>
                {isActive && <Check className="w-3.5 h-3.5 ml-0.5" />}
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
              px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all cursor-pointer whitespace-nowrap flex-shrink-0 active:scale-95
              ${
                activeTool === "erase"
                  ? "ring-2 ring-rose-500 bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-800 shadow-xs"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-rose-50 hover:text-rose-600"
              }
            `}
          >
            <Eraser className="w-3.5 h-3.5 text-rose-500" />
            <span>Erase</span>
          </button>
        </div>

        {/* Row 3: Quick Region & Quadrant Selectors */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-1 flex-wrap text-xs">
            <span className="text-[11px] text-slate-400 font-bold mr-1 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-indigo-500" />
              <span>Select:</span>
            </span>

            {quadrantGroups.map((group) => (
              <button
                key={group.label}
                type="button"
                onClick={() => handleSelectGroup(group.teeth)}
                className="px-2 py-0.5 rounded-lg text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors cursor-pointer"
              >
                {group.label}
              </button>
            ))}

            <button
              type="button"
              onClick={handleSelectAll}
              className="px-2 py-0.5 rounded-lg text-[11px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 transition-colors cursor-pointer"
            >
              All (32)
            </button>
          </div>

          {selectedCount > 0 && (
            <button
              type="button"
              onClick={handleClearSelection}
              className="text-[11px] font-bold text-rose-600 dark:text-rose-400 hover:underline cursor-pointer flex items-center gap-1 ml-auto"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Deselect All ({selectedCount})</span>
            </button>
          )}
        </div>
      </div>

      {/* ================= 2. BATCH ACTION BAR (WHEN MULTIPLE TEETH ARE SELECTED) ================= */}
      {isMultipleSelected && (
        <div className="mb-3.5 p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-indigo-50 via-white to-indigo-50 dark:from-indigo-950/80 dark:via-slate-900/90 dark:to-indigo-950/80 border-2 border-indigo-400/80 dark:border-indigo-600/80 shadow-md animate-in slide-in-from-top-2 duration-200">
          <div className="flex flex-col gap-2.5">
            {/* Header: Count & Selected Teeth List */}
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-black text-xs flex items-center justify-center shadow-xs">
                  {selectedCount}
                </span>
                <span className="font-extrabold text-sm text-slate-900 dark:text-slate-100">
                  Multiple Teeth Selected:
                </span>
              </div>

              <div className="flex items-center gap-1 flex-wrap max-w-xl">
                {selectedTeethNumbers.map((num) => (
                  <span
                    key={num}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-mono font-bold bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 shadow-2xs"
                  >
                    #{num}
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedTeethNumbers((prev) => prev.filter((n) => n !== num))
                      }
                      className="hover:text-rose-600 cursor-pointer ml-0.5"
                      title={`Remove #${num} from selection`}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Batch Procedure Quick Buttons */}
            <div className="flex items-center gap-1.5 flex-wrap pt-2 border-t border-indigo-100 dark:border-indigo-900/60">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Apply to all {selectedCount}:
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
                    className={`px-2.5 py-1 rounded-xl text-xs font-bold border transition-all cursor-pointer shadow-xs active:scale-95 ${meta.badgeBg} ${meta.badgeBorder} ${meta.badgeText}`}
                  >
                    + {meta.label}
                  </button>
                );
              })}

              <button
                type="button"
                onClick={handleClearSelectedTreatments}
                className="px-2.5 py-1 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 hover:bg-rose-100 cursor-pointer flex items-center gap-1 shadow-xs"
              >
                <Eraser className="w-3.5 h-3.5" />
                <span>Clear Treatment</span>
              </button>
            </div>

            {/* Batch Note Input */}
            <div className="flex items-center gap-2 pt-2 border-t border-indigo-100 dark:border-indigo-900/60">
              <input
                type="text"
                placeholder={`Add note to all ${selectedCount} selected teeth (e.g. composite restoration, scaling & polishing)...`}
                value={batchNote}
                onChange={(e) => setBatchNote(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleApplyBatchNote();
                }}
                className="flex-1 px-3 py-1.5 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-xs"
              />
              <button
                type="button"
                onClick={handleApplyBatchNote}
                disabled={!batchNote.trim()}
                className="px-3.5 py-1.5 rounded-xl bg-indigo-600 disabled:opacity-50 hover:bg-indigo-500 text-white text-xs font-bold cursor-pointer transition-colors shadow-xs"
              >
                Apply Note
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= 3. PANORAMIC FDI ODONTOGRAM (ORIGINAL IMAGE + ENHANCED HOTSPOTS) ================= */}
      <div className="w-full overflow-x-auto pb-2 select-none">
        <div className="min-w-[620px] max-w-4xl mx-auto relative aspect-[1537/1023] overflow-hidden rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm">
          {/* Original FDI anatomical illustration from public/teeth.png */}
          <img
            src="/teeth.png"
            alt="Numérotation dentaire FDI"
            className="w-full h-full object-contain pointer-events-none select-none block"
            draggable={false}
          />

          {/* Upper Arch Hotspots (18 to 28) */}
          {UPPER_HOTSPOTS.map((spot) => renderHotspot(spot, "27.5%", "25%", true))}

          {/* Lower Arch Hotspots (48 to 38) */}
          {LOWER_HOTSPOTS.map((spot) => renderHotspot(spot, "52.5%", "28%", false))}
        </div>
      </div>

      {/* ================= 4. SINGLE SELECTED TOOTH CLINICAL NOTE & DETAIL PANEL ================= */}
      {selectedCount === 1 && activeTooth && (
        <div className="mt-3.5 p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl bg-indigo-50/90 dark:bg-indigo-950/60 border-2 border-indigo-500/50 shadow-lg animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between gap-3 pb-3 border-b border-indigo-200/70 dark:border-indigo-800/70">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="text-2xl flex-shrink-0">🦷</span>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-black text-sm sm:text-base text-slate-900 dark:text-slate-100">
                    Tooth #{activeTooth.number} — {activeTooth.name}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    ({activeTooth.arabicName})
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                  <span className="font-semibold text-indigo-700 dark:text-indigo-300">
                    {activeTooth.jaw === "upper"
                      ? "Upper Maxilla (الفك العلوي)"
                      : "Lower Mandible (الفك السفلي)"}
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
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-white dark:hover:bg-slate-800 transition-colors cursor-pointer flex-shrink-0"
              title="Close panel"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Condition / Procedure Selector */}
          <div className="py-3">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Tooth Condition / Status:
            </label>
            <div className="flex items-center gap-1.5 flex-wrap">
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
                    className={`px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all cursor-pointer ${
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
                    {isCurrentStatus && <Check className="w-3.5 h-3.5 ml-0.5" />}
                  </button>
                );
              })}

              <button
                type="button"
                onClick={() => handleActiveToothStatusChange("erase")}
                className="px-2.5 py-1 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 hover:bg-rose-100 cursor-pointer flex items-center gap-1"
              >
                <Eraser className="w-3.5 h-3.5" />
                <span>Remove Treatment</span>
              </button>
            </div>
          </div>

          {/* Clinical Note Input Box */}
          <div className="pt-1">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>Clinical Note for Tooth #{activeTooth.number}:</span>
              </label>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>Auto-saved to patient</span>
              </span>
            </div>

            <textarea
              rows={3}
              placeholder={`Write diagnosis or clinical note for Tooth #${activeTooth.number} (e.g. mesial occlusal caries, fractured cusp, sensitive to percussion)...`}
              value={treatmentNote}
              onChange={(e) => handleActiveToothNoteChange(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-white dark:bg-slate-900 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-xs resize-none"
            />

            {/* Quick Note Suggestions */}
            <div className="flex items-center gap-1.5 flex-wrap mt-2">
              <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-500" />
                <span>Quick:</span>
              </span>
              {NOTE_PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => handleAppendPreset(preset)}
                  className="px-2 py-0.5 rounded-lg text-[10px] font-medium bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-300 transition-colors cursor-pointer"
                >
                  + {preset}
                </button>
              ))}
            </div>

            <div className="flex items-center justify-end gap-2 mt-3 pt-2.5 border-t border-indigo-200/50 dark:border-indigo-900/50">
              {treatmentNote && (
                <button
                  type="button"
                  onClick={() => handleActiveToothNoteChange("")}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                >
                  Clear Note
                </button>
              )}
              <button
                type="button"
                onClick={() => handleClearSelection()}
                className="px-4 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm shadow-indigo-600/20 cursor-pointer transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= 5. SUMMARY OF WORKED TEETH ================= */}
      <div className="mt-3.5 pt-3 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-2 flex-wrap">
          <Activity className="w-4 h-4 text-emerald-500 flex-shrink-0" />
          <span>
            Worked Teeth ({teethRecords.length}):{" "}
            {teethRecords.length > 0 ? (
              <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                {teethRecords.map((r) => `#${r.toothNumber}`).join(", ")}
              </span>
            ) : (
              <em className="text-slate-400">No teeth marked yet • Tap any tooth above</em>
            )}
          </span>
        </div>

        <div className="flex items-center gap-2 text-[11px]">
          <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Changes Stored Instantly</span>
          </span>
        </div>
      </div>
    </div>
  );
}
