"use client";

import React, { useState } from "react";
import {
  ALL_TEETH,
  CATEGORY_COLORS,
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
  Layers,
  ArrowRight,
} from "lucide-react";

interface DentalChartProps {
  teethRecords: ToothRecord[];
  onUpdateTooth: (record: ToothRecord) => void;
  onUpdateMultipleTeeth?: (records: ToothRecord[]) => void;
  onRemoveTooth: (toothNumber: number) => void;
  onRemoveMultipleTeeth?: (toothNumbers: number[]) => void;
  readonly?: boolean;
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

  // Mobile-first Jaw View: "upper" (18-28), "lower" (48-38), or "all" (Full panorama)
  const [jawView, setJawView] = useState<"upper" | "lower" | "all">("upper");

  // Map tooth records by number for fast lookup
  const recordsMap = new Map<number, ToothRecord>(
    teethRecords.map((r) => [r.toothNumber, r])
  );

  // Group teeth into Upper and Lower jaws
  const upperRightTeeth = ALL_TEETH.filter((t) => t.jaw === "upper" && t.side === "right");
  const upperLeftTeeth = ALL_TEETH.filter((t) => t.jaw === "upper" && t.side === "left");
  const lowerRightTeeth = ALL_TEETH.filter((t) => t.jaw === "lower" && t.side === "right");
  const lowerLeftTeeth = ALL_TEETH.filter((t) => t.jaw === "lower" && t.side === "left");

  const upperTeethNumbers = ALL_TEETH.filter((t) => t.jaw === "upper").map((t) => t.number);
  const lowerTeethNumbers = ALL_TEETH.filter((t) => t.jaw === "lower").map((t) => t.number);
  const allTeethNumbers = ALL_TEETH.map((t) => t.number);

  // When clicking on a tooth:
  const handleToothClick = (tooth: ToothInfo) => {
    if (readonly) return;

    const existingRecord = recordsMap.get(tooth.number);

    // If Erase tool is active: remove treatment
    if (activeTool === "erase") {
      if (existingRecord) {
        onRemoveTooth(tooth.number);
      }
      setSelectedTeethNumbers([tooth.number]);
      setTreatmentNote("");
      return;
    }

    // If tooth already has THIS status: toggle off (remove)
    if (existingRecord && existingRecord.status === activeTool) {
      onRemoveTooth(tooth.number);
      setSelectedTeethNumbers([tooth.number]);
      setTreatmentNote("");
      return;
    }

    // Otherwise: IMMEDIATELY apply the active procedure tool and store!
    const newRecord: ToothRecord = {
      toothNumber: tooth.number,
      status: activeTool,
      procedure: TREATMENT_METADATA[activeTool].label,
      notes: treatmentNote.trim() || existingRecord?.notes || undefined,
      updatedAt: Date.now(),
    };

    onUpdateTooth(newRecord);
    setSelectedTeethNumbers([tooth.number]);
    setTreatmentNote(existingRecord?.notes || "");
  };

  // Quick selection helpers
  const handleSelectUpper = () => {
    setSelectedTeethNumbers(upperTeethNumbers);
    setJawView("upper");
  };
  const handleSelectLower = () => {
    setSelectedTeethNumbers(lowerTeethNumbers);
    setJawView("lower");
  };
  const handleSelectAll = () => {
    setSelectedTeethNumbers(allTeethNumbers);
    setJawView("all");
  };
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

  // Render individual tooth item with responsive sizing
  const renderToothItem = (tooth: ToothInfo, isLarge: boolean = false) => {
    const record = recordsMap.get(tooth.number);
    const isSelected = selectedTeethNumbers.includes(tooth.number);

    return (
      <button
        key={tooth.number}
        type="button"
        disabled={readonly}
        onClick={() => handleToothClick(tooth)}
        title={`${tooth.number} - ${tooth.name} (${tooth.arabicName})${
          record ? ` • ${TREATMENT_METADATA[record.status].label}` : " • Click to mark"
        }`}
        className={`
          relative flex flex-col items-center justify-between rounded-xl transition-all duration-200 cursor-pointer group active:scale-95
          ${
            isLarge
              ? "p-1.5 sm:p-2 min-w-[36px] sm:min-w-[44px]"
              : "p-0.5 sm:p-1.5 min-w-[28px] sm:min-w-[38px]"
          }
          ${
            isSelected
              ? "bg-indigo-100 dark:bg-indigo-950 ring-2 ring-indigo-500 scale-105 z-20 shadow-md shadow-indigo-500/25"
              : "hover:bg-slate-100/80 dark:hover:bg-slate-800/60"
          }
          ${record && !isSelected ? "bg-emerald-50/70 dark:bg-emerald-950/40 ring-1 ring-emerald-500/30" : ""}
        `}
      >
        {/* Upper number label (if upper jaw) */}
        {tooth.jaw === "upper" && (
          <span
            className={`font-mono transition-colors leading-none mb-1 ${
              isLarge ? "text-xs sm:text-sm font-black" : "text-[10px] sm:text-xs font-bold"
            } ${
              isSelected
                ? "text-indigo-600 dark:text-indigo-400 font-extrabold scale-110"
                : record
                ? "text-emerald-600 dark:text-emerald-400 font-extrabold"
                : "text-slate-600 dark:text-slate-400"
            }`}
          >
            {tooth.number}
          </span>
        )}

        {/* 3D Realistic Tooth Silhouette Graphic */}
        <div
          className={`flex items-center justify-center ${
            isLarge
              ? "w-7 sm:w-10 h-14 sm:h-20"
              : "w-5 sm:w-8 h-12 sm:h-16"
          }`}
        >
          <Tooth3DGraphic
            category={tooth.category}
            jaw={tooth.jaw}
            toothNumber={tooth.number}
            status={record?.status}
            isSelected={isSelected}
          />
        </div>

        {/* Lower number label (if lower jaw) */}
        {tooth.jaw === "lower" && (
          <span
            className={`font-mono transition-colors leading-none mt-1 ${
              isLarge ? "text-xs sm:text-sm font-black" : "text-[10px] sm:text-xs font-bold"
            } ${
              isSelected
                ? "text-indigo-600 dark:text-indigo-400 font-extrabold scale-110"
                : record
                ? "text-emerald-600 dark:text-emerald-400 font-extrabold"
                : "text-slate-600 dark:text-slate-400"
            }`}
          >
            {tooth.number}
          </span>
        )}

        {/* Tiny Status Indicator Dot */}
        {record && (
          <span
            className="w-1.5 h-1.5 rounded-full mt-0.5"
            style={{ backgroundColor: TREATMENT_METADATA[record.status].color }}
          />
        )}
      </button>
    );
  };

  const selectedCount = selectedTeethNumbers.length;
  const singleSelectedTooth =
    selectedCount === 1
      ? ALL_TEETH.find((t) => t.number === selectedTeethNumbers[0])
      : null;
  const singleRecord =
    selectedCount === 1 ? recordsMap.get(selectedTeethNumbers[0]) : null;

  return (
    <div className="w-full flex flex-col bg-slate-50/70 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800 rounded-2xl sm:rounded-3xl p-2.5 sm:p-5 shadow-inner select-none backdrop-blur-xs">
      {/* ================= 1. JAW VIEW SWITCHER (MOBILE-FIRST) ================= */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex-1 grid grid-cols-3 p-1 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <button
            type="button"
            onClick={() => setJawView("upper")}
            className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              jawView === "upper"
                ? "bg-indigo-600 text-white shadow-sm shadow-indigo-600/25"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
            }`}
          >
            <span>Upper (18-28)</span>
          </button>
          <button
            type="button"
            onClick={() => setJawView("lower")}
            className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              jawView === "lower"
                ? "bg-indigo-600 text-white shadow-sm shadow-indigo-600/25"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
            }`}
          >
            <span>Lower (48-38)</span>
          </button>
          <button
            type="button"
            onClick={() => setJawView("all")}
            className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              jawView === "all"
                ? "bg-indigo-600 text-white shadow-sm shadow-indigo-600/25"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
            }`}
          >
            <span>Both (32)</span>
          </button>
        </div>
      </div>

      {/* ================= 2. PROCEDURE TOOLBAR ================= */}
      <div className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-2.5 sm:p-4 rounded-2xl border border-indigo-200/80 dark:border-indigo-800/80 shadow-md mb-3.5">
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
                Upper
              </button>
              <button
                type="button"
                onClick={handleSelectLower}
                className="px-2 py-0.5 rounded-lg text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-indigo-600 cursor-pointer"
              >
                Lower
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

      {/* ================= 3. ODONTOGRAM DISPLAY (MOBILE-FIRST) ================= */}
      {jawView === "upper" && (
        /* UPPER JAW DEDICATED VIEW: Roomy, big teeth for easy thumb tapping */
        <div className="w-full flex flex-col items-center animate-in fade-in duration-200">
          <div className="w-full flex items-center justify-between px-2 mb-2">
            <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300">
              Upper Jaw (Maxilla)
            </span>
            <span className="text-[11px] text-slate-400">16 Teeth • 18 → 28</span>
          </div>

          {/* Quadrant Row Container */}
          <div className="w-full p-2 sm:p-4 rounded-2xl bg-white/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col gap-3">
            {/* Quadrant 1: Right Upper (18 to 11) */}
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center justify-between px-1">
                <span>Right Quadrant (18 → 11)</span>
                <span className="text-indigo-500 font-normal">يمين</span>
              </div>
              <div className="grid grid-cols-8 gap-0.5 sm:gap-1.5 p-1 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800">
                {upperRightTeeth.map((t) => renderToothItem(t, true))}
              </div>
            </div>

            {/* Midline Divider */}
            <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-indigo-500 uppercase tracking-wider">
              <div className="h-[1px] flex-1 bg-indigo-200 dark:bg-indigo-900/60" />
              <span className="px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                Central Midline (خط المنتصف)
              </span>
              <div className="h-[1px] flex-1 bg-indigo-200 dark:bg-indigo-900/60" />
            </div>

            {/* Quadrant 2: Left Upper (21 to 28) */}
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center justify-between px-1">
                <span>Left Quadrant (21 → 28)</span>
                <span className="text-indigo-500 font-normal">يسار</span>
              </div>
              <div className="grid grid-cols-8 gap-0.5 sm:gap-1.5 p-1 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800">
                {upperLeftTeeth.map((t) => renderToothItem(t, true))}
              </div>
            </div>
          </div>
        </div>
      )}

      {jawView === "lower" && (
        /* LOWER JAW DEDICATED VIEW: Roomy, big teeth for easy thumb tapping */
        <div className="w-full flex flex-col items-center animate-in fade-in duration-200">
          <div className="w-full flex items-center justify-between px-2 mb-2">
            <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300">
              Lower Jaw (Mandible)
            </span>
            <span className="text-[11px] text-slate-400">16 Teeth • 48 → 38</span>
          </div>

          <div className="w-full p-2 sm:p-4 rounded-2xl bg-white/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col gap-3">
            {/* Quadrant 4: Right Lower (48 to 41) */}
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center justify-between px-1">
                <span>Right Lower Quadrant (48 → 41)</span>
                <span className="text-indigo-500 font-normal">يمين</span>
              </div>
              <div className="grid grid-cols-8 gap-0.5 sm:gap-1.5 p-1 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800">
                {lowerRightTeeth.map((t) => renderToothItem(t, true))}
              </div>
            </div>

            {/* Midline Divider */}
            <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-indigo-500 uppercase tracking-wider">
              <div className="h-[1px] flex-1 bg-indigo-200 dark:bg-indigo-900/60" />
              <span className="px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                Central Midline (خط المنتصف)
              </span>
              <div className="h-[1px] flex-1 bg-indigo-200 dark:bg-indigo-900/60" />
            </div>

            {/* Quadrant 3: Left Lower (31 to 38) */}
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center justify-between px-1">
                <span>Left Lower Quadrant (31 → 38)</span>
                <span className="text-indigo-500 font-normal">يسار</span>
              </div>
              <div className="grid grid-cols-8 gap-0.5 sm:gap-1.5 p-1 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800">
                {lowerLeftTeeth.map((t) => renderToothItem(t, true))}
              </div>
            </div>
          </div>
        </div>
      )}

      {jawView === "all" && (
        /* FULL 32-TEETH PANORAMIC VIEW: Touch-scrollable arch without breaking container */
        <div className="w-full flex flex-col items-center">
          <p className="text-[11px] text-slate-400 mb-1.5 sm:hidden">
            👉 Tip: Swipe horizontally to view both sides, or switch to Upper/Lower tab above
          </p>

          <div className="w-full overflow-x-auto pb-2">
            <div className="min-w-[580px] max-w-4xl mx-auto flex flex-col items-center">
              {/* Upper Jaw Heading */}
              <div className="text-center font-bold text-xs sm:text-sm text-purple-900 dark:text-purple-300 mb-1">
                Upper jaw (Maxilla)
              </div>

              {/* Upper Teeth Row (18-11 and 21-28) */}
              <div className="relative flex items-center justify-center gap-1 sm:gap-2 p-2 rounded-2xl bg-white/80 dark:bg-slate-900/80 shadow-xs border border-slate-200/80 dark:border-slate-800">
                <div className="flex items-center gap-0.5 sm:gap-1">
                  {upperRightTeeth.map((t) => renderToothItem(t, false))}
                </div>

                <div className="h-14 sm:h-20 w-[1.5px] bg-indigo-500/40 mx-1 flex flex-col justify-center items-center">
                  <span className="text-[9px] font-bold text-indigo-400 rotate-90 uppercase tracking-tighter">
                    Midline
                  </span>
                </div>

                <div className="flex items-center gap-0.5 sm:gap-1">
                  {upperLeftTeeth.map((t) => renderToothItem(t, false))}
                </div>
              </div>

              {/* Occlusal Plane Band */}
              <div className="w-full my-3 flex items-center justify-between px-2">
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                  Right (يمين)
                </span>
                <div className="flex-1 mx-4 h-3.5 rounded-full bg-gradient-to-r from-rose-200/70 via-rose-300/85 to-rose-200/70 dark:from-rose-950/70 dark:via-rose-900/70 dark:to-rose-950/70 border border-rose-300/40 dark:border-rose-900/40 flex items-center justify-center shadow-xs">
                  <span className="text-[10px] font-bold text-rose-700/90 dark:text-rose-300/90 uppercase tracking-widest">
                    Occlusal Plane
                  </span>
                </div>
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                  Left (يسار)
                </span>
              </div>

              {/* Lower Teeth Row (48-41 and 31-38) */}
              <div className="relative flex items-center justify-center gap-1 sm:gap-2 p-2 rounded-2xl bg-white/80 dark:bg-slate-900/80 shadow-xs border border-slate-200/80 dark:border-slate-800">
                <div className="flex items-center gap-0.5 sm:gap-1">
                  {lowerRightTeeth.map((t) => renderToothItem(t, false))}
                </div>

                <div className="h-14 sm:h-20 w-[1.5px] bg-indigo-500/40 mx-1 flex flex-col justify-center items-center">
                  <span className="text-[9px] font-bold text-indigo-400 rotate-90 uppercase tracking-tighter">
                    Midline
                  </span>
                </div>

                <div className="flex items-center gap-0.5 sm:gap-1">
                  {lowerLeftTeeth.map((t) => renderToothItem(t, false))}
                </div>
              </div>

              <div className="text-center font-bold text-xs sm:text-sm text-purple-900 dark:text-purple-300 mt-1.5">
                Lower jaw (Mandible)
              </div>
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
