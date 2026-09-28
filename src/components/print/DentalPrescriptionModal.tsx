"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Printer,
  Plus,
  Trash2,
  Stethoscope,
  Pill,
  Sparkles,
  AlertTriangle,
  RotateCcw,
} from "lucide-react";
import { Patient } from "@/types/patient";
import { useClinicSettings } from "@/context/ClinicSettingsContext";
import { useLanguage } from "@/context/LanguageContext";
import { formatStaticDate } from "@/utils/date";
import { ClinicLogo } from "../ClinicLogo";

interface MedicationItem {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

interface DentalPrescriptionModalProps {
  isOpen: boolean;
  patient: Patient | null;
  onClose: () => void;
}

const COMMON_PRESETS = [
  {
    label: "Acute Infection (Augmentin + Flagyl)",
    meds: [
      {
        name: "Augmentin 625mg (Amoxicillin / Clavulanate)",
        dosage: "1 tablet",
        frequency: "1x3 (every 8 hrs)",
        duration: "7 days",
        instructions: "Take with or right after food",
      },
      {
        name: "Flagyl 500mg (Metronidazole)",
        dosage: "1 tablet",
        frequency: "1x3 (every 8 hrs)",
        duration: "5 days",
        instructions: "Take with a full glass of water. Avoid alcohol",
      },
    ],
  },
  {
    label: "Dental Pain & Swelling (Ibuprofen + Paracetamol)",
    meds: [
      {
        name: "Ibuprofen (Brufen) 400mg",
        dosage: "1 tablet",
        frequency: "1x3 (every 8 hrs)",
        duration: "3-5 days",
        instructions: "Strictly after meals with plenty of water",
      },
      {
        name: "Paracetamol 500mg",
        dosage: "1-2 tablets",
        frequency: "Every 6-8 hrs",
        duration: "As needed",
        instructions: "For breakthrough pain or fever",
      },
    ],
  },
  {
    label: "Post-Surgical / Extraction (Cataflam + Mouthwash)",
    meds: [
      {
        name: "Cataflam 50mg (Diclofenac Potassium)",
        dosage: "1 tablet",
        frequency: "1x3 daily",
        duration: "3 days",
        instructions: "Take after meals",
      },
      {
        name: "Chlorhexidine 0.2% Antiseptic Mouthwash",
        dosage: "15 ml rinse",
        frequency: "2 times daily",
        duration: "7 days",
        instructions: "Gently rinse for 1 min 30m after brushing. Do not swallow",
      },
    ],
  },
  {
    label: "Penicillin Allergy (Azithromycin)",
    meds: [
      {
        name: "Azithromycin 500mg",
        dosage: "1 tablet",
        frequency: "1x1 (once daily)",
        duration: "3 days",
        instructions: "Take 1 hour before or 2 hours after meals",
      },
    ],
  },
];

export function DentalPrescriptionModal({
  isOpen,
  patient,
  onClose,
}: DentalPrescriptionModalProps) {
  const { t, language } = useLanguage();
  const { settings } = useClinicSettings();

  const [date, setDate] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [instructions, setInstructions] = useState("");
  const [medications, setMedications] = useState<MedicationItem[]>([]);

  useEffect(() => {
    if (isOpen && patient) {
      setDate(patient.date || new Date().toISOString().slice(0, 10));
      setDiagnosis(patient.notes || "");
      setInstructions("Maintain good oral hygiene. Return for follow-up if symptoms persist.");
      setMedications([
        {
          id: `med-${Date.now()}-1`,
          name: "Amoxicillin 500mg",
          dosage: "1 capsule",
          frequency: "1x3 (every 8 hrs)",
          duration: "5 days",
          instructions: "Take after meals",
        },
        {
          id: `med-${Date.now()}-2`,
          name: "Ibuprofen 400mg",
          dosage: "1 tablet",
          frequency: "1x3 as needed",
          duration: "3 days",
          instructions: "Take after food with water",
        },
      ]);
    }
  }, [isOpen, patient]);

  if (!isOpen || !patient) return null;

  const formattedDate = formatStaticDate(date, language);
  const rxNumber = `RX-${patient.id.replace(/\D/g, "").slice(-4) || "101"}-${new Date().getFullYear()}`;

  const handleAddMedication = () => {
    const newMed: MedicationItem = {
      id: `med-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      name: "",
      dosage: "1 tablet",
      frequency: "1x3 daily",
      duration: "5 days",
      instructions: "",
    };
    setMedications([...medications, newMed]);
  };

  const handleUpdateMedication = (id: string, field: keyof MedicationItem, value: string) => {
    setMedications((prev) =>
      prev.map((m) => (m.id === id ? { ...m, [field]: value } : m))
    );
  };

  const handleRemoveMedication = (id: string) => {
    setMedications((prev) => prev.filter((m) => m.id !== id));
  };

  const handleApplyPreset = (preset: (typeof COMMON_PRESETS)[0]) => {
    const newItems: MedicationItem[] = preset.meds.map((m, idx) => ({
      id: `med-${Date.now()}-${idx}`,
      ...m,
    }));
    setMedications(newItems);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      className="print-modal-overlay fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="print-modal-card relative w-full max-w-4xl bg-slate-100 dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-300 dark:border-slate-800 overflow-hidden flex flex-col my-auto max-h-[96vh]">
        {/* On-Screen Action Bar */}
        <div className="no-print flex items-center justify-between px-5 py-3.5 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100">
                {t.printPrescription}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {patient.name} • {rxNumber}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-bold text-xs sm:text-sm shadow-md shadow-indigo-600/25 transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>{t.printNow}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Quick Presets Bar (Screen Only) */}
        <div className="no-print px-5 py-2.5 bg-indigo-50/70 dark:bg-indigo-950/30 border-b border-indigo-100 dark:border-indigo-900/40 flex items-center gap-2 overflow-x-auto">
          <span className="text-[11px] font-bold text-indigo-900 dark:text-indigo-200 flex items-center gap-1 flex-shrink-0">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>{t.quickPresets}:</span>
          </span>
          <div className="flex items-center gap-1.5 flex-nowrap">
            {COMMON_PRESETS.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleApplyPreset(p)}
                className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-800/60 hover:border-indigo-400 text-[11px] font-medium text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all cursor-pointer whitespace-nowrap shadow-2xs"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Printable Prescription Body */}
        <div className="print-modal-scroll flex-1 overflow-y-auto p-3 sm:p-6 flex justify-center bg-slate-200/60 dark:bg-slate-950">
          <div
            id="printable-prescription"
            className="printable-document w-full max-w-[210mm] bg-white text-slate-900 shadow-xl rounded-2xl p-6 sm:p-8 flex flex-col justify-between border border-slate-200"
          >
            {/* Top Medical Letterhead */}
            <div>
              <div className="flex items-start justify-between gap-4 pb-4 border-b-2 border-indigo-600">
                <div className="flex items-center gap-3.5">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 p-2 flex items-center justify-center flex-shrink-0">
                    <ClinicLogo className="w-full h-full" />
                  </div>
                  <div>
                    <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-tight">
                      {settings.clinicName || "Dental & Oral Surgery Clinic"}
                    </h1>
                    <p className="text-xs font-bold text-indigo-700 mt-0.5">
                      {settings.doctorName || "Dr. Dental Specialist"}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {settings.address && `${settings.address} • `}
                      {settings.phone && `Tel: ${settings.phone}`}
                    </p>
                  </div>
                </div>

                <div className="text-right rtl:text-left flex-shrink-0">
                  <div className="text-2xl font-black text-indigo-600 font-serif leading-none tracking-wider">
                    ℞
                  </div>
                  <div className="text-[11px] font-mono text-slate-500 mt-1">
                    #{rxNumber}
                  </div>
                  <div className="text-xs font-semibold text-slate-700 mt-0.5">
                    {formattedDate}
                  </div>
                </div>
              </div>

              {/* Patient Demographics Banner */}
              <div className="mt-4 p-3.5 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">{t.name}</span>
                  <span className="font-bold text-slate-900">{patient.name}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">{t.gender} & {t.age}</span>
                  <span className="font-semibold text-slate-800">
                    {patient.gender === "male" ? t.male : t.female}
                    {patient.age ? ` • ${patient.age}y` : ""}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">{t.phone}</span>
                  <span className="font-mono text-slate-800">{patient.phone || "—"}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">{t.date}</span>
                  <span className="text-slate-800">{formattedDate}</span>
                </div>
              </div>

              {/* Allergies / Medical Alert Warning if present */}
              {patient.medicalHistory && (
                <div className="mt-2.5 px-3.5 py-2 rounded-xl bg-amber-50 border border-amber-200 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  <div>
                    <span className="font-bold text-amber-800 uppercase text-[10px]">
                      {t.allergiesAlert}:{" "}
                    </span>
                    <span className="font-semibold text-amber-950">
                      {patient.medicalHistory}
                    </span>
                  </div>
                </div>
              )}

              {/* Diagnosis / Clinical Note Input (Screen editable) */}
              <div className="mt-4">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[10px] uppercase font-bold text-slate-500">
                    {t.diagnosis}
                  </label>
                </div>
                <input
                  type="text"
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  placeholder="e.g. Acute apical periodontitis / Post surgical extraction"
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-900 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              {/* Formatted Rx Medications Table */}
              <div className="mt-5">
                <div className="flex items-center justify-between pb-1.5 border-b-2 border-slate-200">
                  <div className="flex items-center gap-2">
                    <span className="text-base font-black text-indigo-700 font-serif">℞</span>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Prescribed Medications
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddMedication}
                    className="no-print inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-[11px] transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{t.addMedication}</span>
                  </button>
                </div>

                <div className="divide-y divide-slate-100 mt-2">
                  {medications.map((med, index) => (
                    <div
                      key={med.id}
                      className="py-3 flex items-start justify-between gap-3 group"
                    >
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-1">
                          {index + 1}
                        </span>

                        <div className="flex-1 space-y-1.5">
                          {/* Medication Name */}
                          <input
                            type="text"
                            value={med.name}
                            onChange={(e) =>
                              handleUpdateMedication(med.id, "name", e.target.value)
                            }
                            placeholder="Drug name (e.g. Augmentin 625mg)"
                            className="w-full font-bold text-sm text-slate-900 bg-transparent border-0 border-b border-transparent hover:border-slate-200 focus:border-indigo-500 focus:outline-none py-0.5"
                          />

                          {/* Dosage & Frequency details */}
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                            <input
                              type="text"
                              value={med.dosage}
                              onChange={(e) =>
                                handleUpdateMedication(med.id, "dosage", e.target.value)
                              }
                              placeholder="Dosage (1 tab)"
                              className="px-2 py-1 rounded border border-slate-200 bg-slate-50 text-[11px] text-slate-800"
                            />
                            <input
                              type="text"
                              value={med.frequency}
                              onChange={(e) =>
                                handleUpdateMedication(med.id, "frequency", e.target.value)
                              }
                              placeholder="Frequency (1x3 daily)"
                              className="px-2 py-1 rounded border border-slate-200 bg-slate-50 text-[11px] text-slate-800"
                            />
                            <input
                              type="text"
                              value={med.duration}
                              onChange={(e) =>
                                handleUpdateMedication(med.id, "duration", e.target.value)
                              }
                              placeholder="Duration (5 days)"
                              className="px-2 py-1 rounded border border-slate-200 bg-slate-50 text-[11px] text-slate-800"
                            />
                            <input
                              type="text"
                              value={med.instructions}
                              onChange={(e) =>
                                handleUpdateMedication(med.id, "instructions", e.target.value)
                              }
                              placeholder="Instructions (after food)"
                              className="px-2 py-1 rounded border border-slate-200 bg-slate-50 text-[11px] text-slate-800"
                            />
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveMedication(med.id)}
                        className="no-print p-1.5 rounded-lg text-slate-300 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Remove drug"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}

                  {medications.length === 0 && (
                    <div className="py-6 text-center text-xs text-slate-400 italic">
                      No medications added yet. Click &quot;Add Medication&quot; or choose a preset above.
                    </div>
                  )}
                </div>
              </div>

              {/* Special Instructions / Advice */}
              <div className="mt-5 p-3 rounded-xl bg-slate-50 border border-slate-200">
                <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
                  {t.instructions} & Patient Advice
                </label>
                <textarea
                  rows={2}
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  className="w-full bg-transparent border-0 text-xs text-slate-800 focus:outline-none resize-none leading-relaxed"
                />
              </div>
            </div>

            {/* Bottom Doctor Signature & Stamp Area */}
            <div className="mt-10 pt-4 border-t border-slate-200">
              <div className="flex items-end justify-between gap-6 text-xs text-slate-500">
                <div className="max-w-xs">
                  <p className="font-semibold text-slate-700">
                    Next Consultation / Review in 5-7 days
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Valid for 30 days from date of issue.
                  </p>
                </div>

                <div className="text-center min-w-[180px]">
                  <div className="h-14 border-b border-dashed border-slate-400 mb-1 flex items-end justify-center pb-1">
                    <span className="text-[10px] text-slate-300 italic font-serif">Doctor Stamp & Signature</span>
                  </div>
                  <span className="text-[11px] font-bold text-slate-800 block">
                    {settings.doctorName || "Dr. Dental Surgeon"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
