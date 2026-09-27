"use client";

import React from "react";
import { Patient, calculateDebt, formatIQD, getWhatsAppUrl } from "@/types/patient";
import { PatientAvatar } from "./PatientAvatar";
import { Calendar, Trash2, FileText, Pencil, History, Phone } from "lucide-react";
import { formatStaticDate } from "@/utils/date";

interface PatientCardProps {
  patient: Patient;
  onDeletePatient: (id: string) => void;
  onEditPatient: (patient: Patient) => void;
  onViewHistory: (patient: Patient) => void;
  onOpenDentalChart: (patient: Patient) => void;
}

export function PatientCard({
  patient,
  onDeletePatient,
  onEditPatient,
  onViewHistory,
  onOpenDentalChart,
}: PatientCardProps) {
  const isMale = patient.gender === "male";
  const debt = calculateDebt(patient.totalAmount, patient.paidAmount, patient.debtAmount);
  const paid = patient.paidAmount ?? 0;

  return (
    <div className="group flex flex-col rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-lg hover:border-indigo-200 dark:hover:border-indigo-800/60 transition-all duration-200 overflow-hidden">

      {/* ── TOP COLOUR BAR ── */}
      <div className={`h-1 w-full ${isMale ? "bg-gradient-to-r from-sky-400 to-indigo-500" : "bg-gradient-to-r from-rose-400 to-pink-500"}`} />

      {/* ── MAIN BODY ── */}
      <div className="p-4 flex flex-col gap-3">

        {/* Row 1: Avatar + Info + Action icons */}
        <div className="flex items-start justify-between gap-3">

          {/* Avatar + name + badges */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex-shrink-0">
              <PatientAvatar gender={patient.gender} size="lg" />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm leading-tight truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                {patient.name}
              </h3>
              {/* Badges row */}
              <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
                  isMale
                    ? "bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800"
                    : "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800"
                }`}>
                  <span>{isMale ? "♂" : "♀"}</span>
                  <span className="capitalize">{patient.gender}</span>
                </span>

                {patient.age && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                    {patient.age}y
                  </span>
                )}

                <span className="text-[10px] text-slate-400 dark:text-slate-600 font-mono">
                  #{patient.id.slice(0, 6)}
                </span>
              </div>
            </div>
          </div>

          {/* Quick action icons */}
          <div className="flex items-center gap-0.5 flex-shrink-0">
            <button
              onClick={() => onViewHistory(patient)}
              title="History timeline"
              className="relative p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition-all cursor-pointer active:scale-90"
            >
              <History className="w-4 h-4" />
              {(patient.history?.length ?? 0) > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 text-[9px] font-bold flex items-center justify-center rounded-full bg-indigo-600 text-white">
                  {patient.history!.length}
                </span>
              )}
            </button>
            <button
              onClick={() => onEditPatient(patient)}
              title="Edit patient"
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer active:scale-90"
            >
              <Pencil className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDeletePatient(patient.id)}
              title="Delete patient"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-all cursor-pointer active:scale-90"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Row 2: Payment status strip */}
        <div className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs ${
          debt > 0
            ? "bg-rose-50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/40"
            : "bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40"
        }`}>
          <span className="text-slate-500 dark:text-slate-400">
            Paid:{" "}
            <strong className="text-slate-800 dark:text-slate-200 font-semibold">
              {formatIQD(paid)}
            </strong>
          </span>
          {debt > 0 ? (
            <span className="font-bold text-rose-600 dark:text-rose-400">
              Owes {formatIQD(debt)}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 dark:text-emerald-400">
              <span>✓</span>
              <span>Fully Paid</span>
            </span>
          )}
        </div>

        {/* Row 3: Contact buttons */}
        {patient.phone && (
          <div className="grid grid-cols-2 gap-2">
            <a
              href={`tel:${patient.phone}`}
              title={`Call ${patient.phone}`}
              className="flex items-center justify-center gap-1.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 hover:bg-sky-50 hover:border-sky-200 hover:text-sky-700 dark:hover:bg-sky-950/40 dark:hover:text-sky-300 active:scale-95 transition-all text-xs font-semibold"
            >
              <Phone className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="font-mono truncate">{patient.phone}</span>
            </a>
            <a
              href={getWhatsAppUrl(patient.phone, patient.name)}
              target="_blank"
              rel="noopener noreferrer"
              title={`WhatsApp ${patient.name}`}
              className="flex items-center justify-center gap-1.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white active:scale-95 transition-all text-xs font-bold shadow-sm cursor-pointer"
            >
              <span className="text-sm leading-none">💬</span>
              <span>WhatsApp</span>
            </a>
          </div>
        )}

        {/* Row 4: Dental chart button */}
        <button
          type="button"
          onClick={() => onOpenDentalChart(patient)}
          className="group/dent w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 border border-indigo-200/80 dark:border-indigo-800 text-indigo-800 dark:text-indigo-200 transition-all cursor-pointer active:scale-[0.98]"
        >
          <span className="inline-flex items-center gap-2">
            <span className="text-base group-hover/dent:scale-110 transition-transform inline-block">🦷</span>
            <span>3D Dental Chart</span>
          </span>
          <span className={`text-[11px] px-2 py-0.5 rounded-full font-bold border ${
            (patient.teeth?.length ?? 0) > 0
              ? "bg-indigo-600 text-white border-indigo-600"
              : "bg-white dark:bg-slate-900 text-indigo-500 border-indigo-200 dark:border-indigo-800"
          }`}>
            {patient.teeth?.length ?? 0} teeth
          </span>
        </button>

        {/* Row 5: Latest Treatment / History Snippet */}
        {patient.history && patient.history.length > 0 && (
          <button
            type="button"
            onClick={() => onViewHistory(patient)}
            className="w-full text-left p-2.5 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all cursor-pointer group/hist"
          >
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className="font-bold text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5 truncate">
                <History className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" />
                <span className="truncate">Latest: {patient.history[0].title}</span>
              </span>
              <span className="text-[10px] text-slate-400 group-hover/hist:text-indigo-500 font-semibold flex-shrink-0 ml-1">
                {patient.history.length} {patient.history.length === 1 ? "visit" : "visits"} →
              </span>
            </div>
            {patient.history[0].notes ? (
              <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-1">
                {patient.history[0].notes}
              </p>
            ) : (
              <p className="text-[10px] text-slate-400 font-mono">
                {formatStaticDate(patient.history[0].date)}
              </p>
            )}
          </button>
        )}
      </div>

      {/* ── FOOTER: Date + Notes + History link ── */}
      <div className="px-4 pb-4 pt-0 space-y-2">
        {/* Date + history link */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500">
            <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
            <span>Last visit: <span className="text-slate-600 dark:text-slate-300 font-medium">{formatStaticDate(patient.date)}</span></span>
          </div>
          <button
            onClick={() => onViewHistory(patient)}
            className="text-[11px] text-indigo-500 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-semibold hover:underline cursor-pointer transition-colors"
          >
            History →
          </button>
        </div>

        {/* Clinical notes */}
        {patient.notes ? (
          <div className="flex items-start gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
            <FileText className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-slate-400" />
            <p className="line-clamp-2 leading-relaxed">{patient.notes}</p>
          </div>
        ) : (
          <p className="text-[11px] italic text-slate-300 dark:text-slate-700">No notes</p>
        )}
      </div>
    </div>
  );
}
