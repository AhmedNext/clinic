"use client";

import React, { useState } from "react";
import {
  ALL_TEETH,
  TREATMENT_METADATA,
  ToothInfo,
  ToothRecord,
  ToothTreatment,
} from "@/types/dental";
import { Tooth3DGraphic } from "./Tooth3DGraphic";
import {
  Check,
  Activity,
  Eraser,
  MousePointer,
  CheckCircle2,
  FileText,
  X,
  Sparkles,
} from "lucide-react";

interface DentalChartProps {
  teethRecords: ToothRecord[];
  onUpdateTooth: (record: ToothRecord) => void;
  onUpdateMultipleTeeth?: (records: ToothRecord[]) => void;
  onRemoveTooth: (toothNumber: number) => void;
  onRemoveMultipleTeeth?: (toothNumbers: number[]) => void;
  readonly?: boolean;
}

// FDI category definitions & exact colors matching the anatomical reference chart
export const FDI_CATEGORIES = {
  molars: {
    label: "molaires",
    color: "#a21caf",
    textColor: "text-fuchsia-700 dark:text-fuchsia-400",
    borderClass: "border-fuchsia-500",
    bgClass: "bg-fuchsia-500",
  },
  premolars: {
    label: "Prémolaires",
    color: "#16a34a",
    textColor: "text-emerald-600 dark:text-emerald-400",
    borderClass: "border-emerald-500",
    bgClass: "bg-emerald-500",
  },
  canine: {
    label: "canine",
    color: "#ea580c",
    textColor: "text-orange-600 dark:text-orange-400",
    borderClass: "border-orange-500",
    bgClass: "bg-orange-500",
  },
  incisors: {
    label: "incisives",
    color: "#0284c7",
    textColor: "text-sky-600 dark:text-sky-400",
    borderClass: "border-sky-500",
    bgClass: "bg-sky-500",
  },
} as const;

export function getFdiCategory(toothNumber: number) {
  // Molars: 18, 17, 16 / 26, 27, 28 / 48, 47, 46 / 36, 37, 38
  if ([18, 17, 16, 26, 27, 28, 48, 47, 46, 36, 37, 38].includes(toothNumber)) {
    return FDI_CATEGORIES.molars;
  }
  // Premolars: 15, 14 / 24, 25 / 45, 44 / 34, 35
  if ([15, 14, 24, 25, 45, 44, 34, 35].includes(toothNumber)) {
    return FDI_CATEGORIES.premolars;
  }
  // Canines: 13, 23, 43, 33
  if ([13, 23, 43, 33].includes(toothNumber)) {
    return FDI_CATEGORIES.canine;
  }
  // Incisors: 12, 11, 21, 22 / 42, 41, 31, 32
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
  const [selectedTeethNumbers, setSelectedTeethNumbers] = useState<number[]>([]);
  const [treatmentNote, setTreatmentNote] = useState("");
  const [activeTooth, setActiveTooth] = useState<ToothInfo | null>(null);

  // Map tooth records by number for fast lookup
  const recordsMap = new Map<number, ToothRecord>(
    teethRecords.map((r) => [r.toothNumber, r])
  );

  // Exact 16 Upper Teeth in horizontal FDI order (Right to Left): 18 -> 28
  const upperTeethSequence = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28].map(
    (num) => ALL_TEETH.find((t) => t.number === num)!
  );

  // Exact 16 Lower Teeth in horizontal FDI order (Right to Left): 48 -> 38
  const lowerTeethSequence = [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38].map(
    (num) => ALL_TEETH.find((t) => t.number === num)!
  );

  const upperTeethNumbers = upperTeethSequence.map((t) => t.number);
  const lowerTeethNumbers = lowerTeethSequence.map((t) => t.number);
  const allTeethNumbers = [...upperTeethNumbers, ...lowerTeethNumbers];

  // Quick preset chips for rapid charting
  const NOTE_PRESETS = [
    "Composite filling",
    "Deep cavity",
    "Root canal session",
    "Crown fitted",
    "Extraction needed",
    "Sensitive to cold",
    "Fractured cusp",
  ];

  // When clicking on a tooth:
  const handleToothClick = (tooth: ToothInfo) => {
    if (readonly) return;

    setActiveTooth(tooth);
    setSelectedTeethNumbers([tooth.number]);

    const existingRecord = recordsMap.get(tooth.number);
    setTreatmentNote(existingRecord?.notes || "");

    // If Erase tool is active:
    if (activeTool === "erase") {
      if (existingRecord) {
        onRemoveTooth(tooth.number);
      }
      return;
    }

    // If tooth does not have a record yet, create one with activeTool
    if (!existingRecord) {
      const newRecord: ToothRecord = {
        toothNumber: tooth.number,
        status: activeTool,
        procedure: TREATMENT_METADATA[activeTool].label,
        notes: undefined,
        updatedAt: Date.now(),
      };
      onUpdateTooth(newRecord);
    }
  };

  // Immediate note editing for the active tooth
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
  const handleSelectUpper = () => setSelectedTeethNumbers(upperTeethNumbers);
  const handleSelectLower = () => setSelectedTeethNumbers(lowerTeethNumbers);
  const handleSelectAll = () => setSelectedTeethNumbers(allTeethNumbers);
  const handleClearSelection = () => {
    setSelectedTeethNumbers([]);
    setTreatmentNote("");
  };

  // Apply a status to all currently selected teeth
  const handleApplyStatusToSelected = (status: ToothTreatment) => {
    if (selectedTeethNumbers.length === 0) return;

    const newRecords: ToothRecord[] = selectedTeethNumbers.map((num) => ({
      toothNumber: num,
      status,
      procedure: TREATMENT_METADATA[status].label,
      notes: treatmentNote.trim() || undefined,
      updatedAt: Date.now(),
    }));

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

  // Save clinical note for selected teeth
  const handleSaveNote = () => {
    if (selectedTeethNumbers.length === 0) return;
    const updated: ToothRecord[] = [];
    for (const num of selectedTeethNumbers) {
      const existing = recordsMap.get(num);
      if (existing) {
        updated.push({
          ...existing,
          notes: treatmentNote.trim() || undefined,
          updatedAt: Date.now(),
        });
      }
    }

    if (updated.length > 0) {
      if (onUpdateMultipleTeeth) {
        onUpdateMultipleTeeth(updated);
      } else {
        updated.forEach((rec) => onUpdateTooth(rec));
      }
    }
  };

  const selectedCount = selectedTeethNumbers.length;
  const singleSelectedTooth =
    selectedCount === 1
      ? ALL_TEETH.find((t) => t.number === selectedTeethNumbers[0])
      : null;
  const singleRecord =
    selectedCount === 1 ? recordsMap.get(selectedTeethNumbers[0]) : null;

  // Render individual tooth item in the column
  const renderToothItem = (tooth: ToothInfo) => {
    const record = recordsMap.get(tooth.number);
    const isSelected =
      activeTooth?.number === tooth.number || selectedTeethNumbers.includes(tooth.number);
    const hasNote = Boolean(record?.notes);

    return (
      <button
        key={tooth.number}
        type="button"
        disabled={readonly}
        onClick={() => handleToothClick(tooth)}
        title={`${tooth.number} - ${tooth.name} (${tooth.arabicName})${
          record ? ` • ${TREATMENT_METADATA[record.status].label}` : " • Click to mark"
        }${record?.notes ? ` • Note: ${record.notes}` : ""}`}
        className={`
          relative flex flex-col items-center justify-center p-0.5 sm:p-1 rounded-xl transition-all duration-150 cursor-pointer group active:scale-95
          ${
            isSelected
              ? "bg-indigo-100/90 dark:bg-indigo-950/80 ring-2 ring-indigo-500 scale-105 z-20 shadow-md shadow-indigo-500/25"
              : "hover:bg-slate-100/80 dark:hover:bg-slate-800/60"
          }
          ${record && !isSelected ? "ring-1 ring-emerald-500/40 bg-emerald-50/50 dark:bg-emerald-950/30" : ""}
        `}
      >
        {/* Note indicator badge icon */}
        {hasNote && (
          <span
            className="absolute top-0 right-0 z-20 text-[10px] leading-none drop-shadow-xs"
            title={`Note: ${record?.notes}`}
          >
            📝
          </span>
        )}

        <div className="w-5 sm:w-7 md:w-8 lg:w-9 h-14 sm:h-18 md:h-20 flex items-center justify-center">
          <Tooth3DGraphic
            category={tooth.category}
            jaw={tooth.jaw}
            toothNumber={tooth.number}
            status={record?.status}
            isSelected={isSelected}
          />
        </div>

        {/* Small badge dot if worked */}
        {record && (
          <span
            className="w-1.5 h-1.5 rounded-full mt-0.5"
            style={{ backgroundColor: TREATMENT_METADATA[record.status].color }}
          />
        )}
      </button>
    );
  };

  return (
    <div className="w-full flex flex-col bg-slate-50/70 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800 rounded-2xl sm:rounded-3xl p-2.5 sm:p-5 shadow-inner select-none backdrop-blur-xs">
      {/* ================= 1. PROCEDURE TOOLBAR ================= */}
      <div className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-2.5 sm:p-3.5 rounded-2xl border border-indigo-200/80 dark:border-indigo-800/80 shadow-md mb-3.5">
        <div className="flex flex-col gap-2">
          {/* Header row: Status label + Auto-save badge */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <MousePointer className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Tap Tooth to Apply Tool:
              </span>
            </div>
            <span className="text-[10px] sm:text-[11px] px-2 py-0.5 rounded-full font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Instant Auto-Save</span>
            </span>
          </div>

          {/* Horizontally scrollable smooth carousel for tools */}
          <div className="overflow-x-auto no-scrollbar flex items-center gap-1.5 py-0.5">
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
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
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

          {/* Quick Selection Strip */}
          <div className="flex items-center justify-between gap-1 pt-1.5 border-t border-slate-100 dark:border-slate-800 text-xs">
            <div className="flex items-center gap-1">
              <span className="text-[11px] text-slate-400 font-semibold mr-1">Select:</span>
              <button
                type="button"
                onClick={handleSelectUpper}
                className="px-2 py-0.5 rounded-lg text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-indigo-600 cursor-pointer"
              >
                Upper (16)
              </button>
              <button
                type="button"
                onClick={handleSelectLower}
                className="px-2 py-0.5 rounded-lg text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-indigo-600 cursor-pointer"
              >
                Lower (16)
              </button>
              <button
                type="button"
                onClick={handleSelectAll}
                className="px-2 py-0.5 rounded-lg text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-indigo-600 cursor-pointer"
              >
                All (32)
              </button>
            </div>

            {selectedCount > 0 && (
              <button
                type="button"
                onClick={handleClearSelection}
                className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 hover:underline cursor-pointer"
              >
                Clear Selection ({selectedCount})
              </button>
            )}
          </div>
        </div>

        {/* Selected Tooth Live Inspector Strip */}
        {selectedCount > 0 && (
          <div className="mt-2.5 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-slate-900 dark:text-slate-100">
                {singleSelectedTooth
                  ? `#${singleSelectedTooth.number} ${singleSelectedTooth.name}`
                  : `${selectedCount} Selected`}
              </span>
              {singleRecord ? (
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                    TREATMENT_METADATA[singleRecord.status].badgeBg
                  } ${TREATMENT_METADATA[singleRecord.status].badgeBorder} ${
                    TREATMENT_METADATA[singleRecord.status].badgeText
                  }`}
                >
                  {TREATMENT_METADATA[singleRecord.status].label}
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-500">
                  Untreated
                </span>
              )}
            </div>

            {/* Note input with auto-save */}
            <div className="flex items-center gap-2 w-full sm:w-auto sm:flex-1 sm:max-w-xs">
              <input
                type="text"
                placeholder="Clinical note..."
                value={treatmentNote}
                onChange={(e) => setTreatmentNote(e.target.value)}
                onBlur={handleSaveNote}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSaveNote();
                }}
                className="flex-1 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <button
                type="button"
                onClick={handleSaveNote}
                className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold cursor-pointer flex-shrink-0"
              >
                Save
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ================= 2. PANORAMIC FDI ODONTOGRAM (EXACT REFERENCE DIAGRAM) ================= */}
      <div className="w-full bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 rounded-2xl sm:rounded-3xl p-3 sm:p-5 shadow-sm">
        {/* Title & Top Direction */}
        <div className="flex flex-col items-center justify-center mb-3">
          <h3 className="text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-slate-100">
            Numérotation dentaire
          </h3>
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mt-0.5 uppercase tracking-wider">
            Haut <span className="text-[10px] font-normal text-slate-400">(Upper / الفك العلوي)</span>
          </span>
        </div>

        {/* Scrollable FDI Panoramic Container */}
        <div className="w-full overflow-x-auto pb-2 select-none">
          <div className="min-w-[620px] max-w-4xl mx-auto flex items-center justify-between gap-1 sm:gap-3">
            {/* Left Side Label (Dentist Right / Droite) */}
            <div className="flex flex-col items-center justify-center text-center px-1 flex-shrink-0">
              <span className="text-xs sm:text-sm font-black text-slate-800 dark:text-slate-200">
                Droite
              </span>
              <span className="text-[10px] font-bold text-indigo-500">
                Right (يمين)
              </span>
            </div>

            {/* Main Center Teeth FDI Matrix */}
            <div className="flex-1 relative flex flex-col items-center">
              {/* Soft Gingival Wash / Gum Blush Band (matching red halo in reference image) */}
              <div className="absolute inset-x-2 top-1/2 -translate-y-1/2 h-24 sm:h-32 rounded-full bg-gradient-to-r from-rose-200/25 via-rose-300/40 to-rose-200/25 dark:from-rose-950/20 dark:via-rose-900/35 dark:to-rose-950/20 pointer-events-none blur-xs" />

              {/* Central Midline Subtle Guide */}
              <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-[1px] bg-indigo-500/25 dark:bg-indigo-400/20 pointer-events-none z-10" />

              {/* ─── ROW 1: UPPER CATEGORIES & COLORED UNDERLINES ─── */}
              <div className="w-full grid grid-cols-[repeat(16,minmax(0,1fr))] gap-0.5 sm:gap-1 text-center mb-1">
                {/* 18, 17, 16: Molaires */}
                <div className="col-span-3 flex flex-col items-center">
                  <span className="text-[10px] sm:text-xs font-semibold text-fuchsia-700 dark:text-fuchsia-400 truncate">
                    molaires
                  </span>
                  <div className="w-full h-0.5 sm:h-1 rounded-full bg-fuchsia-500/80 mt-0.5" />
                </div>

                {/* 15, 14: Prémolaires */}
                <div className="col-span-2 flex flex-col items-center">
                  <span className="text-[10px] sm:text-xs font-semibold text-emerald-600 dark:text-emerald-400 truncate">
                    Prémolaires
                  </span>
                  <div className="w-full h-0.5 sm:h-1 rounded-full bg-emerald-500/80 mt-0.5" />
                </div>

                {/* 13: Canine */}
                <div className="col-span-1 flex flex-col items-center">
                  <span className="text-[10px] sm:text-xs font-semibold text-orange-600 dark:text-orange-400 truncate">
                    canine
                  </span>
                  <div className="w-full h-0.5 sm:h-1 rounded-full bg-orange-500/80 mt-0.5" />
                </div>

                {/* 12, 11: Incisives */}
                <div className="col-span-2 flex flex-col items-center">
                  <span className="text-[10px] sm:text-xs font-semibold text-sky-600 dark:text-sky-400 truncate">
                    incisives
                  </span>
                  <div className="w-full h-0.5 sm:h-1 rounded-full bg-sky-500/80 mt-0.5" />
                </div>

                {/* 21, 22: Incisives */}
                <div className="col-span-2 flex flex-col items-center">
                  <span className="text-[10px] sm:text-xs font-semibold text-sky-600 dark:text-sky-400 truncate">
                    incisives
                  </span>
                  <div className="w-full h-0.5 sm:h-1 rounded-full bg-sky-500/80 mt-0.5" />
                </div>

                {/* 23: Canine */}
                <div className="col-span-1 flex flex-col items-center">
                  <span className="text-[10px] sm:text-xs font-semibold text-orange-600 dark:text-orange-400 truncate">
                    canine
                  </span>
                  <div className="w-full h-0.5 sm:h-1 rounded-full bg-orange-500/80 mt-0.5" />
                </div>

                {/* 24, 25: Prémolaires */}
                <div className="col-span-2 flex flex-col items-center">
                  <span className="text-[10px] sm:text-xs font-semibold text-emerald-600 dark:text-emerald-400 truncate">
                    Prémolaires
                  </span>
                  <div className="w-full h-0.5 sm:h-1 rounded-full bg-emerald-500/80 mt-0.5" />
                </div>

                {/* 26, 27, 28: Molaires */}
                <div className="col-span-3 flex flex-col items-center">
                  <span className="text-[10px] sm:text-xs font-semibold text-fuchsia-700 dark:text-fuchsia-400 truncate">
                    molaires
                  </span>
                  <div className="w-full h-0.5 sm:h-1 rounded-full bg-fuchsia-500/80 mt-0.5" />
                </div>
              </div>

              {/* ─── ROW 2: UPPER TOOTH NUMBERS (COLORED MATCHING CATEGORY) ─── */}
              <div className="w-full grid grid-cols-[repeat(16,minmax(0,1fr))] gap-0.5 sm:gap-1 text-center mb-0.5">
                {upperTeethSequence.map((tooth) => {
                  const cat = getFdiCategory(tooth.number);
                  const isSelected = activeTooth?.number === tooth.number || selectedTeethNumbers.includes(tooth.number);
                  const rec = recordsMap.get(tooth.number);
                  const hasNote = Boolean(rec?.notes);

                  return (
                    <button
                      key={tooth.number}
                      type="button"
                      onClick={() => handleToothClick(tooth)}
                      className={`relative flex items-center justify-center gap-0.5 text-[11px] sm:text-xs md:text-sm font-bold font-mono transition-transform cursor-pointer ${
                        isSelected ? "scale-125 font-black text-indigo-600" : cat.textColor
                      }`}
                      title={hasNote ? `Tooth ${tooth.number} Note: ${rec?.notes}` : `Tooth ${tooth.number}`}
                    >
                      <span>{tooth.number}</span>
                      {hasNote && <span className="text-[10px]" title={rec?.notes}>📝</span>}
                    </button>
                  );
                })}
              </div>

              {/* ─── ROW 3: UPPER TEETH GRAPHICS (18 TO 28, ROOTS UP, CROWNS DOWN) ─── */}
              <div className="w-full grid grid-cols-[repeat(16,minmax(0,1fr))] gap-0.5 sm:gap-1 items-end relative z-10">
                {upperTeethSequence.map((tooth) => (
                  <div key={tooth.number} className="flex justify-center">
                    {renderToothItem(tooth)}
                  </div>
                ))}
              </div>

              {/* ─── ROW 4: LOWER TEETH GRAPHICS (48 TO 38, CROWNS UP, ROOTS DOWN) ─── */}
              <div className="w-full grid grid-cols-[repeat(16,minmax(0,1fr))] gap-0.5 sm:gap-1 items-start relative z-10 mt-1">
                {lowerTeethSequence.map((tooth) => (
                  <div key={tooth.number} className="flex justify-center">
                    {renderToothItem(tooth)}
                  </div>
                ))}
              </div>

              {/* ─── ROW 5: LOWER TOOTH NUMBERS (COLORED MATCHING CATEGORY) ─── */}
              <div className="w-full grid grid-cols-[repeat(16,minmax(0,1fr))] gap-0.5 sm:gap-1 text-center mt-1 mb-0.5">
                {lowerTeethSequence.map((tooth) => {
                  const cat = getFdiCategory(tooth.number);
                  const isSelected = activeTooth?.number === tooth.number || selectedTeethNumbers.includes(tooth.number);
                  const rec = recordsMap.get(tooth.number);
                  const hasNote = Boolean(rec?.notes);

                  return (
                    <button
                      key={tooth.number}
                      type="button"
                      onClick={() => handleToothClick(tooth)}
                      className={`relative flex items-center justify-center gap-0.5 text-[11px] sm:text-xs md:text-sm font-bold font-mono transition-transform cursor-pointer ${
                        isSelected ? "scale-125 font-black text-indigo-600" : cat.textColor
                      }`}
                      title={hasNote ? `Tooth ${tooth.number} Note: ${rec?.notes}` : `Tooth ${tooth.number}`}
                    >
                      <span>{tooth.number}</span>
                      {hasNote && <span className="text-[10px]" title={rec?.notes}>📝</span>}
                    </button>
                  );
                })}
              </div>

              {/* ─── ROW 6: LOWER CATEGORIES & COLORED UNDERLINES ─── */}
              <div className="w-full grid grid-cols-[repeat(16,minmax(0,1fr))] gap-0.5 sm:gap-1 text-center mt-0.5">
                {/* 48, 47, 46: Molaires */}
                <div className="col-span-3 flex flex-col items-center">
                  <div className="w-full h-0.5 sm:h-1 rounded-full bg-fuchsia-500/80 mb-0.5" />
                  <span className="text-[10px] sm:text-xs font-semibold text-fuchsia-700 dark:text-fuchsia-400 truncate">
                    molaires
                  </span>
                </div>

                {/* 45, 44: Prémolaires */}
                <div className="col-span-2 flex flex-col items-center">
                  <div className="w-full h-0.5 sm:h-1 rounded-full bg-emerald-500/80 mb-0.5" />
                  <span className="text-[10px] sm:text-xs font-semibold text-emerald-600 dark:text-emerald-400 truncate">
                    Prémolaires
                  </span>
                </div>

                {/* 43: Canine */}
                <div className="col-span-1 flex flex-col items-center">
                  <div className="w-full h-0.5 sm:h-1 rounded-full bg-orange-500/80 mb-0.5" />
                  <span className="text-[10px] sm:text-xs font-semibold text-orange-600 dark:text-orange-400 truncate">
                    canine
                  </span>
                </div>

                {/* 42, 41: Incisives */}
                <div className="col-span-2 flex flex-col items-center">
                  <div className="w-full h-0.5 sm:h-1 rounded-full bg-sky-500/80 mb-0.5" />
                  <span className="text-[10px] sm:text-xs font-semibold text-sky-600 dark:text-sky-400 truncate">
                    incisives
                  </span>
                </div>

                {/* 31, 32: Incisives */}
                <div className="col-span-2 flex flex-col items-center">
                  <div className="w-full h-0.5 sm:h-1 rounded-full bg-sky-500/80 mb-0.5" />
                  <span className="text-[10px] sm:text-xs font-semibold text-sky-600 dark:text-sky-400 truncate">
                    incisives
                  </span>
                </div>

                {/* 33: Canine */}
                <div className="col-span-1 flex flex-col items-center">
                  <div className="w-full h-0.5 sm:h-1 rounded-full bg-orange-500/80 mb-0.5" />
                  <span className="text-[10px] sm:text-xs font-semibold text-orange-600 dark:text-orange-400 truncate">
                    canine
                  </span>
                </div>

                {/* 34, 35: Prémolaires */}
                <div className="col-span-2 flex flex-col items-center">
                  <div className="w-full h-0.5 sm:h-1 rounded-full bg-emerald-500/80 mb-0.5" />
                  <span className="text-[10px] sm:text-xs font-semibold text-emerald-600 dark:text-emerald-400 truncate">
                    Prémolaires
                  </span>
                </div>

                {/* 36, 37, 38: Molaires */}
                <div className="col-span-3 flex flex-col items-center">
                  <div className="w-full h-0.5 sm:h-1 rounded-full bg-fuchsia-500/80 mb-0.5" />
                  <span className="text-[10px] sm:text-xs font-semibold text-fuchsia-700 dark:text-fuchsia-400 truncate">
                    molaires
                  </span>
                </div>
              </div>
            </div>

            {/* Right Side Label (Dentist Left / Gauche) */}
            <div className="flex flex-col items-center justify-center text-center px-1 flex-shrink-0">
              <span className="text-xs sm:text-sm font-black text-slate-800 dark:text-slate-200">
                Gauche
              </span>
              <span className="text-[10px] font-bold text-indigo-500">
                Left (يسار)
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Direction Label */}
        <div className="flex items-center justify-center mt-2 pt-1 border-t border-slate-100 dark:border-slate-800/80">
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Bas <span className="text-[10px] font-normal text-slate-400">(Lower / الفك السفلي)</span>
          </span>
        </div>
      </div>

      {/* ================= 3. SELECTED TOOTH CLINICAL NOTE & DETAIL PANEL ================= */}
      {activeTooth && (
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
              onClick={() => setActiveTooth(null)}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-white dark:hover:bg-slate-800 transition-colors cursor-pointer flex-shrink-0"
              title="Close note panel"
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
                onClick={() => setActiveTooth(null)}
                className="px-4 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm shadow-indigo-600/20 cursor-pointer transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= 4. SUMMARY OF WORKED TEETH ================= */}
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
