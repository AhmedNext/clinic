"use client";

import React from "react";
import { X, Printer, Banknote, ShieldCheck, CheckCircle2, AlertCircle } from "lucide-react";
import { Patient, calculateDebt, formatIQD } from "@/types/patient";
import { useClinicSettings } from "@/context/ClinicSettingsContext";
import { useLanguage } from "@/context/LanguageContext";
import { formatStaticDate } from "@/utils/date";
import { ClinicLogo } from "../ClinicLogo";

interface PrintReceiptModalProps {
  isOpen: boolean;
  patient: Patient | null;
  onClose: () => void;
}

export function PrintReceiptModal({ isOpen, patient, onClose }: PrintReceiptModalProps) {
  const { t, language } = useLanguage();
  const { settings } = useClinicSettings();

  if (!isOpen || !patient) return null;

  const totalDebt = calculateDebt(patient.totalAmount, patient.paidAmount, patient.debtAmount);
  const totalPaid = patient.paidAmount ?? 0;
  const totalFee = totalPaid + totalDebt;
  const isPaidInFull = totalDebt === 0 && totalFee > 0;

  const receiptSeq = Math.abs((patient.createdAt ? Number(patient.createdAt) : 1001) % 9000) + 1000;
  const receiptNumber = `REC-${receiptSeq}-${new Date().getFullYear()}`;
  const formattedDate = formatStaticDate(patient.date || new Date().toISOString().slice(0, 10), language);

  const handlePrint = () => {
    window.print();
  };

  const historyEntries = [...(patient.history || [])].sort((a, b) =>
    (b.date || "").localeCompare(a.date || "")
  );

  return (
    <div
      className="print-modal-overlay fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="print-modal-card relative w-full max-w-3xl bg-slate-100 dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-300 dark:border-slate-800 overflow-hidden flex flex-col my-auto max-h-[96vh]">
        {/* On-Screen Action Bar (Hidden when printed) */}
        <div className="no-print flex items-center justify-between px-5 py-3.5 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100">
                {t.printReceipt}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {patient.name} • {receiptNumber}
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

        {/* Printable Paper Document (Rendered cleanly on screen and in print) */}
        <div className="print-modal-scroll flex-1 overflow-y-auto p-3 sm:p-6 flex justify-center bg-slate-200/60 dark:bg-slate-950">
          <div
            id="printable-receipt"
            className="printable-document w-full max-w-[210mm] bg-white text-slate-900 shadow-xl rounded-2xl p-6 sm:p-8 flex flex-col justify-between border border-slate-200"
          >
            {/* Header Letterhead */}
            <div>
              <div className="flex items-start justify-between gap-4 pb-4 border-b-2 border-indigo-600">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 p-2 flex items-center justify-center flex-shrink-0">
                    <ClinicLogo className="w-full h-full" />
                  </div>
                  <div>
                    <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-tight">
                      {settings.clinicName || "Dental Clinic"}
                    </h1>
                    <p className="text-xs font-semibold text-indigo-700 mt-0.5">
                      {settings.doctorName || "Dental Specialist & Surgeon"}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {settings.address && `${settings.address} • `}
                      {settings.phone && `Tel: ${settings.phone}`}
                    </p>
                  </div>
                </div>

                <div className="text-right rtl:text-left flex-shrink-0">
                  <div className="inline-block px-3 py-1 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-800 text-[11px] font-black uppercase tracking-wider mb-1">
                    {t.officialReceipt}
                  </div>
                  <div className="text-xs font-mono font-bold text-slate-700">
                    #{receiptNumber}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {formattedDate}
                  </div>
                </div>
              </div>

              {/* Patient Info Strip */}
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

              {/* Teeth worked on note if present */}
              {patient.teeth && patient.teeth.length > 0 && (
                <div className="mt-2.5 px-3 py-1.5 rounded-lg bg-indigo-50/60 border border-indigo-100 text-xs flex items-center gap-2">
                  <span className="font-bold text-indigo-700">🦷 {t.workedTeeth}:</span>
                  <span className="font-mono font-bold text-slate-800">
                    {patient.teeth.map((t) => `#${t.toothNumber}`).join(", ")}
                  </span>
                </div>
              )}

              {/* Itemized Services & Treatment Table */}
              <div className="mt-5">
                <table className="w-full text-xs text-left rtl:text-right border-collapse">
                  <thead>
                    <tr className="border-b-2 border-slate-300 text-slate-500 uppercase text-[10px] font-bold">
                      <th className="py-2.5 pl-2 pr-3">{t.date}</th>
                      <th className="py-2.5 px-3">{t.diagnosis}</th>
                      <th className="py-2.5 px-3 text-right rtl:text-left">{t.totalDentalFee}</th>
                      <th className="py-2.5 px-3 text-right rtl:text-left">{t.paidLabel}</th>
                      <th className="py-2.5 pl-3 pr-2 text-right rtl:text-left">{t.owesLabel}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {historyEntries.length > 0 ? (
                      historyEntries.map((h, i) => (
                        <tr key={h.id || i} className="hover:bg-slate-50/50">
                          <td className="py-2.5 pl-2 pr-3 text-slate-500 font-mono text-[11px]">
                            {formatStaticDate(h.date || patient.date, language)}
                          </td>
                          <td className="py-2.5 px-3 font-medium text-slate-900">
                            <div>{h.title || t.patientCase}</div>
                            {h.notes && (
                              <div className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">
                                {h.notes}
                              </div>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-right rtl:text-left font-mono font-semibold">
                            {formatIQD((h.paid || 0) + (h.debt || 0))}
                          </td>
                          <td className="py-2.5 px-3 text-right rtl:text-left font-mono text-emerald-700 font-semibold">
                            {formatIQD(h.paid || 0)}
                          </td>
                          <td className="py-2.5 pl-3 pr-2 text-right rtl:text-left font-mono font-semibold text-rose-600">
                            {formatIQD(h.debt || 0)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td className="py-3 pl-2 pr-3 text-slate-500 font-mono text-[11px]">
                          {formattedDate}
                        </td>
                        <td className="py-3 px-3 font-medium text-slate-900">
                          {patient.notes || "Dental Examination & Treatment"}
                        </td>
                        <td className="py-3 px-3 text-right rtl:text-left font-mono font-semibold">
                          {formatIQD(totalFee)}
                        </td>
                        <td className="py-3 px-3 text-right rtl:text-left font-mono text-emerald-700 font-semibold">
                          {formatIQD(totalPaid)}
                        </td>
                        <td className="py-3 pl-3 pr-2 text-right rtl:text-left font-mono font-semibold text-rose-600">
                          {formatIQD(totalDebt)}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Financial Totals Summary Card */}
              <div className="mt-5 p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  {isPaidInFull ? (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>{t.fullyPaid}</span>
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300">
                      <AlertCircle className="w-4 h-4 text-rose-600" />
                      <span>{t.owesLabel}: {formatIQD(totalDebt)}</span>
                    </div>
                  )}
                </div>

                <div className="w-full sm:w-auto space-y-1 text-xs min-w-[200px]">
                  <div className="flex justify-between gap-4 text-slate-600">
                    <span>{t.totalDentalFee}:</span>
                    <span className="font-mono font-bold text-slate-900">{formatIQD(totalFee)}</span>
                  </div>
                  <div className="flex justify-between gap-4 text-emerald-700">
                    <span>{t.paidAmount}:</span>
                    <span className="font-mono font-bold">{formatIQD(totalPaid)}</span>
                  </div>
                  <div className="flex justify-between gap-4 pt-1 border-t border-slate-300 text-rose-700 font-black text-sm">
                    <span>{t.owesLabel}:</span>
                    <span className="font-mono">{formatIQD(totalDebt)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Footer & Signature */}
            <div className="mt-8 pt-4 border-t border-slate-200">
              <div className="flex items-end justify-between gap-6 text-xs text-slate-500">
                <div className="max-w-xs">
                  <p className="font-semibold text-slate-700">{t.thankYouClinic}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    For inquiries or appointment revisions, please call {settings.phone || "the clinic"}.
                  </p>
                </div>

                <div className="text-center min-w-[160px]">
                  <div className="h-12 border-b border-dashed border-slate-400 mb-1 flex items-end justify-center pb-1">
                    <span className="text-[10px] text-slate-300 italic font-serif">Stamp & Sign</span>
                  </div>
                  <span className="text-[11px] font-bold text-slate-700 block">
                    {t.doctorSignature}
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
