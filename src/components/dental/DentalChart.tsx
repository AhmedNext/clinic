"use client";

import React, { useState } from "react";
import {
  ALL_TEETH,
  TREATMENT_METADATA,
  ToothInfo,
  ToothRecord,
  ToothTreatment,
} from "@/types/dental";
import { ClinicMaterial } from "@/types/material";
import { formatIQD } from "@/types/patient";
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
  Edit3,
  Coins,
  Tag,
  Plus,
  Minus,
  Zap,
  ChevronDown,
  ChevronUp,
  Package,
} from "lucide-react";

interface DentalChartProps {
  teethRecords: ToothRecord[];
  onUpdateTooth: (record: ToothRecord) => void;
  onUpdateMultipleTeeth?: (records: ToothRecord[]) => void;
  onRemoveTooth: (toothNumber: number) => void;
  onRemoveMultipleTeeth?: (toothNumbers: number[]) => void;
  clinicMaterials?: ClinicMaterial[];
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
  clinicMaterials = [],
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
  const [treatmentMaterial, setTreatmentMaterial] = useState<string>("");
  const [treatmentPrice, setTreatmentPrice] = useState<string>("");
  const [showAllMaterials, setShowAllMaterials] = useState<boolean>(false);

  const [batchNote, setBatchNote] = useState("");
  const [batchMaterial, setBatchMaterial] = useState<string>("");
  const [batchPrice, setBatchPrice] = useState<string>("");
  const [activeTooth, setActiveTooth] = useState<ToothInfo | null>(null);

  const [isQuadrantMenuOpen, setIsQuadrantMenuOpen] = useState<boolean>(false);
  const [isFeedExpanded, setIsFeedExpanded] = useState<boolean>(false);

  // Map tooth records by number for fast lookup
  const recordsMap = new Map<number, ToothRecord>(
    teethRecords.map((r) => [r.toothNumber, r])
  );

  // Total fees across all charted teeth
  const totalChartPrice = teethRecords.reduce((sum, r) => sum + (r.price || 0), 0);

  const upperTeethNumbers = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28];
  const lowerTeethNumbers = [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38];
  const allTeethNumbers = [...upperTeethNumbers, ...lowerTeethNumbers];

  // All teeth that have clinical notes or materials or prices or non-default status
  const activeChartedTeeth = teethRecords.filter(
    (r) =>
      (r.notes && r.notes.trim().length > 0) ||
      (r.material && r.material.trim().length > 0) ||
      (typeof r.price === "number" && r.price > 0) ||
      r.status !== "treated"
  );

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
          const r = recordsMap.get(updated[0]);
          setTreatmentNote(r?.notes || "");
          setTreatmentMaterial(r?.material || "");
          setTreatmentPrice(r?.price !== undefined ? String(r.price) : "");
        } else if (updated.length === 0) {
          setActiveTooth(null);
          setTreatmentNote("");
          setTreatmentMaterial("");
          setTreatmentPrice("");
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
        setTreatmentMaterial("");
        setTreatmentPrice("");
      } else {
        setSelectedTeethNumbers([toothNum]);
        setActiveTooth(tooth);
        const existingRecord = recordsMap.get(toothNum);
        setTreatmentNote(existingRecord?.notes || "");
        setTreatmentMaterial(existingRecord?.material || "");
        setTreatmentPrice(existingRecord?.price !== undefined ? String(existingRecord.price) : "");
      }
    }
  };

  // Immediate note editing for the active single tooth
  const handleActiveToothNoteChange = (text: string) => {
    setTreatmentNote(text);
    if (!activeTooth) return;

    const existingRecord = recordsMap.get(activeTooth.number);
    const parsedPrice = treatmentPrice.trim() !== "" ? Number(treatmentPrice) : undefined;
    const updatedRecord: ToothRecord = {
      toothNumber: activeTooth.number,
      status: existingRecord?.status || (activeTool === "erase" ? "treated" : activeTool),
      procedure:
        existingRecord?.procedure ||
        TREATMENT_METADATA[activeTool === "erase" ? "treated" : activeTool].label,
      material: treatmentMaterial.trim() || existingRecord?.material || undefined,
      price: typeof parsedPrice === "number" && !isNaN(parsedPrice) ? parsedPrice : existingRecord?.price,
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
    const parsedPrice = treatmentPrice.trim() !== "" ? Number(treatmentPrice) : undefined;
    const updatedRecord: ToothRecord = {
      toothNumber: activeTooth.number,
      status,
      procedure: TREATMENT_METADATA[status].label,
      material: treatmentMaterial.trim() || existingRecord?.material || undefined,
      price: typeof parsedPrice === "number" && !isNaN(parsedPrice) ? parsedPrice : existingRecord?.price,
      notes: treatmentNote.trim() || existingRecord?.notes || undefined,
      updatedAt: Date.now(),
    };
    onUpdateTooth(updatedRecord);
  };

  // Select clinic material (instantly populates material + auto-fills default procedure fee!)
  const handleSelectClinicMaterial = (mat: ClinicMaterial) => {
    if (!activeTooth) return;
    setTreatmentMaterial(mat.name || mat.supplier || "");
    setTreatmentPrice(String(mat.patientPrice ?? ""));

    const existingRecord = recordsMap.get(activeTooth.number);
    const updatedRecord: ToothRecord = {
      toothNumber: activeTooth.number,
      status: existingRecord?.status || (activeTool === "erase" ? "treated" : activeTool),
      procedure:
        existingRecord?.procedure ||
        TREATMENT_METADATA[activeTool === "erase" ? "treated" : activeTool].label,
      material: mat.name,
      price: mat.patientPrice,
      notes: treatmentNote.trim() || existingRecord?.notes || undefined,
      updatedAt: Date.now(),
    };
    onUpdateTooth(updatedRecord);
  };

  // Immediate material name edit for active single tooth
  const handleActiveToothMaterialChange = (text: string) => {
    setTreatmentMaterial(text);
    if (!activeTooth) return;

    const existingRecord = recordsMap.get(activeTooth.number);
    const parsedPrice = treatmentPrice.trim() !== "" ? Number(treatmentPrice) : undefined;
    const updatedRecord: ToothRecord = {
      toothNumber: activeTooth.number,
      status: existingRecord?.status || (activeTool === "erase" ? "treated" : activeTool),
      procedure:
        existingRecord?.procedure ||
        TREATMENT_METADATA[activeTool === "erase" ? "treated" : activeTool].label,
      material: text.trim() || undefined,
      price: typeof parsedPrice === "number" && !isNaN(parsedPrice) ? parsedPrice : existingRecord?.price,
      notes: treatmentNote.trim() || existingRecord?.notes || undefined,
      updatedAt: Date.now(),
    };
    onUpdateTooth(updatedRecord);
  };

  // Immediate fee/price change for active single tooth
  const handleActiveToothPriceChange = (valStr: string) => {
    setTreatmentPrice(valStr);
    if (!activeTooth) return;

    const existingRecord = recordsMap.get(activeTooth.number);
    const parsed = valStr.trim() === "" ? undefined : Number(valStr);
    const numPrice = typeof parsed === "number" && !isNaN(parsed) ? parsed : undefined;

    const updatedRecord: ToothRecord = {
      toothNumber: activeTooth.number,
      status: existingRecord?.status || (activeTool === "erase" ? "treated" : activeTool),
      procedure:
        existingRecord?.procedure ||
        TREATMENT_METADATA[activeTool === "erase" ? "treated" : activeTool].label,
      material: treatmentMaterial.trim() || existingRecord?.material || undefined,
      price: numPrice,
      notes: treatmentNote.trim() || existingRecord?.notes || undefined,
      updatedAt: Date.now(),
    };
    onUpdateTooth(updatedRecord);
  };

  // Quick price adjuster (+10k, -10k, etc.)
  const handleAdjustPrice = (delta: number) => {
    const current = treatmentPrice.trim() !== "" ? Number(treatmentPrice) : 0;
    const nextVal = Math.max(0, (isNaN(current) ? 0 : current) + delta);
    handleActiveToothPriceChange(String(nextVal));
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
      const r = recordsMap.get(teeth[0]);
      setTreatmentNote(r?.notes || "");
      setTreatmentMaterial(r?.material || "");
      setTreatmentPrice(r?.price !== undefined ? String(r.price) : "");
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
    setTreatmentMaterial("");
    setTreatmentPrice("");
    setBatchNote("");
    setBatchMaterial("");
    setBatchPrice("");
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
        material: existing?.material,
        price: existing?.price,
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

  // Apply clinic material + default fee to all selected teeth
  const handleApplyBatchClinicMaterial = (mat: ClinicMaterial) => {
    if (selectedTeethNumbers.length === 0) return;

    const newRecords: ToothRecord[] = selectedTeethNumbers.map((num) => {
      const existing = recordsMap.get(num);
      return {
        toothNumber: num,
        status: existing?.status || (activeTool === "erase" ? "treated" : activeTool),
        procedure:
          existing?.procedure ||
          TREATMENT_METADATA[activeTool === "erase" ? "treated" : activeTool].label,
        material: mat.name,
        price: mat.patientPrice,
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

  // Apply custom batch material and price
  const handleApplyBatchCustomMaterialAndPrice = () => {
    if (selectedTeethNumbers.length === 0) return;
    const parsedPrice = batchPrice.trim() !== "" ? Number(batchPrice) : undefined;
    const numPrice = typeof parsedPrice === "number" && !isNaN(parsedPrice) ? parsedPrice : undefined;

    const newRecords: ToothRecord[] = selectedTeethNumbers.map((num) => {
      const existing = recordsMap.get(num);
      return {
        toothNumber: num,
        status: existing?.status || (activeTool === "erase" ? "treated" : activeTool),
        procedure: existing?.procedure || TREATMENT_METADATA[activeTool === "erase" ? "treated" : activeTool].label,
        material: batchMaterial.trim() || existing?.material,
        price: numPrice !== undefined ? numPrice : existing?.price,
        notes: existing?.notes,
        updatedAt: Date.now(),
      };
    });

    if (onUpdateMultipleTeeth) {
      onUpdateMultipleTeeth(newRecords);
    } else {
      newRecords.forEach((rec) => onUpdateTooth(rec));
    }
    setBatchMaterial("");
    setBatchPrice("");
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
        material: existing?.material,
        price: existing?.price,
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

  // Active tooth status
  const activeToothStatus =
    (activeTooth && recordsMap.get(activeTooth.number)?.status) ||
    (activeTool === "erase" ? "treated" : activeTool);

  return (
    <div className="w-full flex flex-col bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 rounded-xl sm:rounded-3xl p-1.5 sm:p-5 shadow-inner select-none">
      {/* ================= 1. SLEEK MINIMAL HEADER TOOLBAR ================= */}
      <div className="sticky top-0 z-30 bg-white dark:bg-slate-900 px-3 py-2 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs mb-3 flex items-center justify-between gap-2 flex-wrap">
        {/* Left: Mode / Active Tool Switcher & Quadrant Selector */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Chart vs Erase Segmented Control */}
          <div className="inline-flex p-0.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setActiveTool("treated")}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTool !== "erase"
                  ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              <MousePointer className="w-3.5 h-3.5" />
              <span>Chart & Select</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTool("erase");
                if (selectedCount > 0) handleClearSelectedTreatments();
              }}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTool === "erase"
                  ? "bg-rose-500 text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-rose-600"
              }`}
              title="Erase mode"
            >
              <Eraser className="w-3.5 h-3.5" />
              <span>Erase</span>
            </button>
          </div>

          {/* Quadrants Popover Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsQuadrantMenuOpen(!isQuadrantMenuOpen)}
              className="px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700 flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Layers className="w-3.5 h-3.5 text-indigo-500" />
              <span>Quadrants</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {isQuadrantMenuOpen && (
              <div
                className="absolute left-0 top-full mt-1 w-52 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-50 p-1.5 space-y-0.5 animate-in fade-in zoom-in-95"
                onClick={() => setIsQuadrantMenuOpen(false)}
              >
                <div className="text-[10px] font-bold text-slate-400 px-2 py-1 uppercase tracking-wider">
                  Select Anatomical Group
                </div>
                {quadrantGroups.map((g) => (
                  <button
                    key={g.label}
                    type="button"
                    onClick={() => handleSelectGroup(g.teeth)}
                    className="w-full text-left px-2 py-1 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 hover:text-indigo-600 transition-colors flex items-center justify-between"
                  >
                    <span>{g.label}</span>
                    <span className="text-[10px] font-mono text-slate-400">{g.teeth.length} teeth</span>
                  </button>
                ))}
                <div className="border-t border-slate-100 dark:border-slate-800 pt-1 mt-1">
                  <button
                    type="button"
                    onClick={handleSelectAll}
                    className="w-full text-left px-2 py-1.5 rounded-lg text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition-colors"
                  >
                    Select All (32 Teeth)
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Multi-Select Toggle & Deselect & Mobile Zoom */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setIsMultiSelectMode(!isMultiSelectMode)}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all cursor-pointer shadow-2xs ${
              isMultiSelectMode
                ? "bg-indigo-600 text-white border-indigo-700 shadow-indigo-600/20"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200/80 dark:border-slate-700 hover:border-slate-300"
            }`}
            title="Toggle multi-select mode"
          >
            <CheckSquare className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Multi-Select</span>
            <span
              className={`text-[9px] px-1 py-0.2 rounded-full font-bold uppercase ${
                isMultiSelectMode
                  ? "bg-white/25 text-white"
                  : "bg-slate-200 dark:bg-slate-700 text-slate-500"
              }`}
            >
              {isMultiSelectMode ? "ON" : "OFF"}
            </span>
          </button>

          {selectedCount > 0 && (
            <button
              type="button"
              onClick={handleClearSelection}
              className="px-2.5 py-1.5 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors flex items-center gap-1 cursor-pointer"
              title="Deselect all"
            >
              <X className="w-3.5 h-3.5" />
              <span>Deselect ({selectedCount})</span>
            </button>
          )}

          {/* Mobile Zoom Button */}
          <button
            type="button"
            onClick={() => setIsZoomed(!isZoomed)}
            className="sm:hidden p-1.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 cursor-pointer"
            title="Zoom toggle"
          >
            {isZoomed ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* ================= 2. SLEEK BATCH ACTION PILL (WHEN MULTIPLE TEETH SELECTED) ================= */}
      {isMultipleSelected && (
        <div className="mb-3 px-3 py-2 rounded-2xl bg-indigo-950 text-white shadow-lg border border-indigo-800/80 flex items-center justify-between gap-2 flex-wrap animate-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-indigo-500 text-white font-black text-xs flex items-center justify-center shadow-xs">
              {selectedCount}
            </span>
            <span className="text-xs font-semibold text-indigo-200">
              Teeth: <span className="font-mono text-white font-bold">{selectedTeethNumbers.map((n) => `#${n}`).join(", ")}</span>
            </span>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            {/* Quick Status Dropdown */}
            <select
              onChange={(e) => {
                if (e.target.value) handleApplyStatusToSelected(e.target.value as ToothTreatment);
              }}
              defaultValue=""
              className="px-2.5 py-1 rounded-xl bg-indigo-900/90 text-white text-xs font-semibold border border-indigo-700 focus:outline-none cursor-pointer"
            >
              <option value="" disabled>Status...</option>
              {(["treated", "filling", "root_canal", "crown", "extraction", "decay"] as ToothTreatment[]).map((s) => (
                <option key={s} value={s}>{TREATMENT_METADATA[s].label}</option>
              ))}
            </select>

            {/* Material & Fee Dropdown (from doctor's clinic materials) */}
            {clinicMaterials.length > 0 && (
              <select
                onChange={(e) => {
                  const found = clinicMaterials.find((p) => p.name === e.target.value);
                  if (found) handleApplyBatchClinicMaterial(found);
                }}
                defaultValue=""
                className="px-2.5 py-1 rounded-xl bg-indigo-900/90 text-white text-xs font-semibold border border-indigo-700 focus:outline-none cursor-pointer"
              >
                <option value="" disabled>Apply Material...</option>
                {clinicMaterials.map((p) => (
                  <option key={p.id} value={p.name}>
                    {p.name} ({formatIQD(p.patientPrice)})
                  </option>
                ))}
              </select>
            )}

            <button
              type="button"
              onClick={handleClearSelectedTreatments}
              className="px-2 py-1 rounded-xl bg-rose-600/80 hover:bg-rose-600 text-white text-xs font-semibold cursor-pointer"
            >
              Clear
            </button>

            <button
              type="button"
              onClick={handleClearSelection}
              className="p-1 rounded-lg text-indigo-300 hover:text-white cursor-pointer"
              title="Deselect"
            >
              <X className="w-4 h-4" />
            </button>
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
              const hasNote = Boolean(record?.notes && record.notes.trim().length > 0);
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

                  {/* Direct note indicator tag directly on the chart */}
                  {hasNote && (
                    <g pointerEvents="none">
                      <rect
                        x={poly.centerX - 18}
                        y={poly.num < 30 ? poly.centerY - 24 : poly.centerY + 11}
                        width="36"
                        height="13"
                        rx="3"
                        fill="#ffffff"
                        stroke="#f59e0b"
                        strokeWidth="1"
                        className="filter drop-shadow-xs"
                      />
                      <text
                        x={poly.centerX}
                        y={poly.num < 30 ? poly.centerY - 15 : poly.centerY + 20}
                        textAnchor="middle"
                        fontSize="8.5"
                        fontWeight="bold"
                        fill="#b45309"
                      >
                        📝 Note
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* ================= 4. COLLAPSIBLE CHARTED TREATMENTS DRAWER ================= */}
      {activeChartedTeeth.length > 0 && (
        <div className="mt-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
          <button
            type="button"
            onClick={() => setIsFeedExpanded(!isFeedExpanded)}
            className="w-full px-3 sm:px-4 py-2 flex items-center justify-between gap-2 text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold text-xs flex items-center justify-center">
                {activeChartedTeeth.length}
              </span>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Charted Treatments & Fees
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-xs text-emerald-600 dark:text-emerald-400">
                {formatIQD(totalChartPrice)}
              </span>
              {isFeedExpanded ? (
                <ChevronUp className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              )}
            </div>
          </button>

          {isFeedExpanded && (
            <div className="p-2 sm:p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1.5 animate-in fade-in duration-150">
              {activeChartedTeeth.map((rec) => {
                const tooth = ALL_TEETH.find((t) => t.number === rec.toothNumber);
                const meta = TREATMENT_METADATA[rec.status];
                const isCurrentlyActive = activeTooth?.number === rec.toothNumber;

                return (
                  <div
                    key={rec.toothNumber}
                    onClick={() => {
                      if (tooth) {
                        setActiveTooth(tooth);
                        setSelectedTeethNumbers([tooth.number]);
                        setTreatmentNote(rec.notes || "");
                        setTreatmentMaterial(rec.material || "");
                        setTreatmentPrice(rec.price !== undefined ? String(rec.price) : "");
                      }
                    }}
                    className={`
                      p-2 rounded-xl bg-white dark:bg-slate-900 border transition-all cursor-pointer shadow-2xs flex items-center justify-between gap-1.5
                      ${
                        isCurrentlyActive
                          ? "border-indigo-500 ring-2 ring-indigo-500/30 shadow-xs"
                          : "border-slate-200 dark:border-slate-800 hover:border-indigo-400"
                      }
                    `}
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="px-1.5 py-0.2 rounded font-mono font-black text-[11px] bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 flex-shrink-0">
                        #{rec.toothNumber}
                      </span>
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate">
                        {rec.material || meta.label}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 flex-shrink-0">
                      {rec.price !== undefined && (
                        <span className="font-mono font-bold text-[11px] text-emerald-600 dark:text-emerald-400">
                          {formatIQD(rec.price)}
                        </span>
                      )}
                      <Edit3 className="w-3 h-3 text-slate-400" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ================= 5. SLEEK MINIMAL SELECTED TOOTH INSPECTOR ================= */}
      {selectedCount === 1 && activeTooth && (
        <div className="mt-3 p-3 sm:p-4 rounded-2xl bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800/80 shadow-md animate-in slide-in-from-top-2">
          {/* Header */}
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800 mb-2.5">
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-6 h-6 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-mono font-black text-xs flex items-center justify-center border border-indigo-200 dark:border-indigo-800 flex-shrink-0">
                #{activeTooth.number}
              </span>
              <div className="min-w-0">
                <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 truncate block">
                  {activeTooth.name} <span className="text-slate-400 font-normal text-xs">({activeTooth.arabicName})</span>
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {treatmentPrice && (
                <span className="px-2 py-0.5 rounded-lg text-xs font-mono font-bold bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  {formatIQD(Number(treatmentPrice))}
                </span>
              )}
              <button
                type="button"
                onClick={() => handleClearSelection()}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                title="Close panel"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Controls Grid (Compact 3-Column on desktop, 1-col on phone) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {/* 1. Condition Selector */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Condition
              </label>
              <select
                value={recordsMap.get(activeTooth.number)?.status || "treated"}
                onChange={(e) => handleActiveToothStatusChange(e.target.value as ToothTreatment)}
                className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                {(["treated", "filling", "root_canal", "crown", "extraction", "decay"] as ToothTreatment[]).map((s) => (
                  <option key={s} value={s}>{TREATMENT_METADATA[s].label}</option>
                ))}
              </select>
            </div>

            {/* 2. Clinic Material Dropdown / Input */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center justify-between">
                <span>Material</span>
                <span className="text-indigo-500 font-semibold text-[9px]">Procedure Pricing</span>
              </label>
              {clinicMaterials.length > 0 ? (
                <select
                  value={treatmentMaterial}
                  onChange={(e) => {
                    const found = clinicMaterials.find((m) => m.name === e.target.value);
                    if (found) {
                      handleSelectClinicMaterial(found);
                    } else {
                      handleActiveToothMaterialChange(e.target.value);
                    }
                  }}
                  className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                >
                  <option value="">Choose Material...</option>
                  {clinicMaterials.map((m) => (
                    <option key={m.id} value={m.name}>
                      {m.name} ({formatIQD(m.patientPrice)})
                    </option>
                  ))}
                  {treatmentMaterial && !clinicMaterials.some((m) => m.name === treatmentMaterial) && (
                    <option value={treatmentMaterial}>{treatmentMaterial} (Custom)</option>
                  )}
                </select>
              ) : (
                <input
                  type="text"
                  placeholder="e.g. Composite, Zirconia..."
                  value={treatmentMaterial}
                  onChange={(e) => handleActiveToothMaterialChange(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              )}
            </div>

            {/* 3. Fee Input with +/- 10k Quick Adjust */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Fee (IQD)
              </label>
              <div className="flex items-center gap-1">
                <div className="relative flex-1">
                  <input
                    type="number"
                    placeholder="0"
                    value={treatmentPrice}
                    onChange={(e) => handleActiveToothPriceChange(e.target.value)}
                    className="w-full pl-2.5 pr-8 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">
                    IQD
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleAdjustPrice(10000)}
                  className="px-1.5 py-1.5 rounded-lg text-[10px] font-bold bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-indigo-400 cursor-pointer"
                  title="Add 10,000 IQD"
                >
                  +10k
                </button>
                <button
                  type="button"
                  onClick={() => handleAdjustPrice(-10000)}
                  className="px-1.5 py-1.5 rounded-lg text-[10px] font-bold bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-indigo-400 cursor-pointer"
                  title="Subtract 10,000 IQD"
                >
                  -10k
                </button>
                <button
                  type="button"
                  onClick={() => handleActiveToothPriceChange("0")}
                  className="px-1.5 py-1.5 rounded-lg text-[10px] font-bold bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-rose-500 hover:border-rose-400 cursor-pointer"
                  title="Free (0 IQD)"
                >
                  0
                </button>
              </div>
            </div>
          </div>

          {/* Clinical Note Row (Clean single-line with presets & actions) */}
          <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 flex-wrap">
            <input
              type="text"
              placeholder={`Clinical note / diagnosis for Tooth #${activeTooth.number}...`}
              value={treatmentNote}
              onChange={(e) => handleActiveToothNoteChange(e.target.value)}
              className="flex-1 min-w-[200px] px-2.5 py-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <button
              type="button"
              onClick={() => handleActiveToothStatusChange("erase")}
              className="px-2.5 py-1 rounded-lg text-xs font-semibold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer whitespace-nowrap"
            >
              Remove
            </button>
            <button
              type="button"
              onClick={() => handleClearSelection()}
              className="px-3.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold cursor-pointer transition-colors shadow-xs whitespace-nowrap"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* ================= 6. SUMMARY OF WORKED TEETH & TOTAL FEES ================= */}
      <div className="mt-2.5 pt-2 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5">
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

          {totalChartPrice > 0 && (
            <div className="flex items-center gap-1 pl-2 border-l border-slate-300 dark:border-slate-700">
              <span className="text-[10px] text-slate-400 font-semibold uppercase">Total Fee:</span>
              <span className="text-xs font-mono font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/80 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
                {formatIQD(totalChartPrice)}
              </span>
            </div>
          )}
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
