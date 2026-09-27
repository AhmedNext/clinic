"use client";

import React from "react";
import { Patient, calculateDebt, formatIQD, getWhatsAppUrl } from "@/types/patient";
import { PatientAvatar } from "./PatientAvatar";
import { Calendar, Clock, Trash2, FileText, Pencil, History, Phone, Check } from "lucide-react";
import { formatStaticDate } from "@/utils/date";
import { useLanguage } from "@/context/LanguageContext";

interface PatientTableProps {
  patients: Patient[];
  onDeletePatient: (id: string) => void;
  onEditPatient: (patient: Patient) => void;
  onViewHistory: (patient: Patient) => void;
  onOpenDentalChart: (patient: Patient) => void;
  onSettleDebt?: (patient: Patient) => void;
}

export const PatientTable = React.memo(function PatientTable({
  patients,
  onDeletePatient,
  onEditPatient,
  onViewHistory,
  onOpenDentalChart,
  onSettleDebt,
}: PatientTableProps) {
  const { t } = useLanguage();
  const formatDate = (dateString: string) => formatStaticDate(dateString);

  return (
    <div className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] text-left rtl:text-right text-sm border-collapse">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <th scope="col" className="py-3 pl-5 pr-3 rtl:pl-3 rtl:pr-5 w-[220px]">{t.name}</th>
              <th scope="col" className="py-3 px-3 w-[110px]">{t.gender}</th>
              <th scope="col" className="py-3 px-3 w-[70px]">{t.age}</th>
              <th scope="col" className="py-3 px-3 w-[240px]">{t.phone}</th>
              <th scope="col" className="py-3 px-3 w-[130px]">{t.date}</th>
              <th scope="col" className="py-3 px-3 w-[120px]">{t.dentalChartBtn}</th>
              <th scope="col" className="py-3 px-3 w-[160px]">{t.paidLabel}</th>
              <th scope="col" className="py-3 px-3">{t.notes}</th>
              <th scope="col" className="py-3 pl-3 pr-5 rtl:pl-5 rtl:pr-3 w-[110px] text-right rtl:text-left">{t.actions}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {patients.map((patient) => {
              const isMale = patient.gender === "male";
              const debt = calculateDebt(
                patient.totalAmount,
                patient.paidAmount,
                patient.debtAmount
              );
              const paid = patient.paidAmount ?? 0;

              return (
                <tr
                  key={patient.id}
                  className="group hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                >
                  {/* Name + Avatar */}
                  <td className="py-3.5 pl-5 pr-3">
                    <div className="flex items-center gap-3">
                      <PatientAvatar gender={patient.gender} size="md" />
                      <div className="min-w-0">
                        <div className="font-semibold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
                          {patient.name}
                        </div>
                        <span className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">
                          ID: {patient.id.slice(0, 8)}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Gender */}
                  <td className="py-3.5 px-3">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border whitespace-nowrap ${
                        isMale
                          ? "bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800"
                          : "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800"
                      }`}
                    >
                      <span className="font-bold">{isMale ? "♂" : "♀"}</span>
                      <span className="capitalize">{isMale ? t.male : t.female}</span>
                    </span>
                  </td>

                  {/* Age */}
                  <td className="py-3.5 px-3">
                    {patient.age ? (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 whitespace-nowrap">
                        {patient.age}y
                      </span>
                    ) : (
                      <span className="text-slate-300 dark:text-slate-600 text-xs">—</span>
                    )}
                  </td>

                  {/* Contact: WhatsApp + Phone */}
                  <td className="py-3.5 px-3">
                    {patient.phone ? (
                      <div className="flex items-center gap-2 flex-wrap">
                        <a
                          href={getWhatsAppUrl(patient.phone, patient.name)}
                          target="_blank"
                          rel="noopener noreferrer"
                          title={`${t.whatsApp} ${patient.name}`}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300/80 dark:border-emerald-800 shadow-2xs transition-all cursor-pointer whitespace-nowrap"
                        >
                          <span className="text-sm">💬</span>
                          <span>{t.whatsApp}</span>
                        </a>
                        <a
                          href={`tel:${patient.phone}`}
                          title={`${t.call} ${patient.phone}`}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-sky-600 dark:hover:text-sky-400 bg-slate-100 hover:bg-sky-50 dark:bg-slate-800 dark:hover:bg-sky-950/50 border border-slate-200 dark:border-slate-700 transition-colors whitespace-nowrap"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span className="font-mono text-[11px]">{patient.phone}</span>
                        </a>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400/70 italic">No phone</span>
                    )}
                  </td>

                  {/* Date & Visits */}
                  <td className="py-3.5 px-3 text-slate-600 dark:text-slate-300">
                    <div className="inline-flex items-center gap-1.5 text-xs whitespace-nowrap">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 flex-shrink-0" />
                      <span>{formatDate(patient.date)}</span>
                    </div>
                    {patient.time && (
                      <div className="mt-0.5 inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-100 dark:border-indigo-900/40">
                        <Clock className="w-2.5 h-2.5" />
                        <span>{patient.time}</span>
                      </div>
                    )}
                    {patient.history && patient.history.length > 0 && (
                      <div className="mt-1">
                        <button
                          type="button"
                          onClick={() => onViewHistory(patient)}
                          className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 transition-colors cursor-pointer"
                        >
                          <History className="w-2.5 h-2.5" />
                          <span>{patient.history.length} {patient.history.length === 1 ? t.visit : t.visits}</span>
                        </button>
                      </div>
                    )}
                  </td>

                  {/* 3D Dental Chart */}
                  <td className="py-3.5 px-3">
                    <button
                      type="button"
                      onClick={() => onOpenDentalChart(patient)}
                      title={t.dentalChartBtn}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/70 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 shadow-2xs whitespace-nowrap"
                    >
                      <span className="text-sm">🦷</span>
                      <span>
                        {patient.teeth && patient.teeth.length > 0
                          ? `${patient.teeth.length} ${t.teethCount}`
                          : t.dentalChartBtn}
                      </span>
                    </button>
                  </td>

                  {/* Payment & Debt */}
                  <td className="py-3.5 px-3 text-xs">
                    {debt > 0 ? (
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-semibold text-[11px] bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/60 whitespace-nowrap">
                            {t.owesLabel}: {formatIQD(debt)}
                          </span>
                          <button
                            type="button"
                            onClick={() => onSettleDebt?.(patient)}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-2xs transition-all cursor-pointer"
                            title="Mark debt as paid"
                          >
                            <Check className="w-2.5 h-2.5" />
                            <span>{t.markDebtPaid}</span>
                          </button>
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 pl-1 rtl:pl-0 rtl:pr-1 font-medium whitespace-nowrap">
                          {t.paidLabel}: {formatIQD(paid)}
                        </div>
                      </div>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-semibold text-[11px] bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 whitespace-nowrap">
                        ✓ {t.fullyPaid} ({formatIQD(paid)})
                      </span>
                    )}
                  </td>

                  {/* Notes */}
                  <td className="py-3.5 px-3 text-slate-500 dark:text-slate-400 text-xs max-w-[200px]">
                    {patient.notes ? (
                      <div className="flex items-start gap-1.5" title={patient.notes}>
                        <FileText className="w-3.5 h-3.5 flex-shrink-0 text-slate-400 mt-px" />
                        <span className="line-clamp-2 leading-relaxed">{patient.notes}</span>
                      </div>
                    ) : (
                      <span className="text-slate-400/60 dark:text-slate-600 italic">No notes</span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 pl-3 pr-5 text-right">
                    <div className="flex items-center justify-end gap-0.5">
                      <button
                        onClick={() => onOpenDentalChart(patient)}
                        title="Open 3D Dental Chart"
                        aria-label={`Open 3D Dental Chart for ${patient.name}`}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 rounded-lg transition-colors cursor-pointer"
                      >
                        <span className="text-sm leading-none block">🦷</span>
                      </button>
                      <button
                        onClick={() => onViewHistory(patient)}
                        title="View history"
                        aria-label={`View history for ${patient.name}`}
                        className="inline-flex items-center gap-0.5 px-1.5 py-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 rounded-lg transition-colors cursor-pointer text-xs"
                      >
                        <History className="w-4 h-4" />
                        <span className="text-[10px] font-semibold">
                          {patient.history?.length || 0}
                        </span>
                      </button>
                      <button
                        onClick={() => onEditPatient(patient)}
                        title="Edit patient"
                        aria-label={`Edit patient ${patient.name}`}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 rounded-lg transition-colors cursor-pointer"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDeletePatient(patient.id)}
                        title="Delete patient"
                        aria-label={`Delete patient ${patient.name}`}
                        className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
});
