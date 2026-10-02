"use client";

import React, { useState, useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Plus,
  Clock,
  Phone,
  CheckCircle2,
  Trash2,
  Check,
  CalendarClock,
  MessageCircle,
} from "lucide-react";
import { Appointment, AppointmentStatus } from "@/types/appointment";
import { Patient, getWhatsAppUrl, getAppointmentReminderWhatsAppUrl } from "@/types/patient";
import { DayAppointmentsModal } from "./DayAppointmentsModal";
import { BookAppointmentModal } from "./BookAppointmentModal";
import { useLanguage } from "@/context/LanguageContext";
import { useClinicSettings } from "@/context/ClinicSettingsContext";
import { getMonthName, WEEKDAY_NAMES, formatStaticDate } from "@/utils/date";

interface AppointmentsViewProps {
  appointments: Appointment[];
  patients: Patient[];
  onAddAppointment: (data: Omit<Appointment, "id" | "createdAt">) => void;
  onToggleStatus: (id: string, newStatus: AppointmentStatus) => void;
  onDeleteAppointment: (id: string) => void;
  onOpenAddPatient?: (dateString: string) => void;
  onStartVisit?: (appointment: Appointment) => void;
}

export function AppointmentsView({
  appointments,
  patients,
  onAddAppointment,
  onToggleStatus,
  onDeleteAppointment,
  onOpenAddPatient,
  onStartVisit,
}: AppointmentsViewProps) {
  const { language, t } = useLanguage();
  const { settings } = useClinicSettings();

  // View mode: Month overview or detailed Day schedule
  const [viewMode, setViewMode] = useState<"month" | "day">("month");

  // Helper to format YYYY-MM-DD
  const toYMD = (year: number, monthIndex: number, day: number) => {
    const mStr = String(monthIndex + 1).padStart(2, "0");
    const dStr = String(day).padStart(2, "0");
    return `${year}-${mStr}-${dStr}`;
  };

  const today = new Date();
  const todayYMD = toYMD(today.getFullYear(), today.getMonth(), today.getDate());

  // Month state (for Month view)
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth()); // 0-indexed

  // Day state (for Day view)
  const [currentDayString, setCurrentDayString] = useState<string>(todayYMD);

  // Active modal date for booking/managing appointments
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [bookModalDate, setBookModalDate] = useState<string | null>(null);

  const weekDayNames = WEEKDAY_NAMES[language] || WEEKDAY_NAMES.en;

  // Month navigation handlers
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const handleGoTodayMonth = () => {
    const now = new Date();
    setCurrentYear(now.getFullYear());
    setCurrentMonth(now.getMonth());
  };

  // Day navigation handlers
  const handlePrevDay = () => {
    const d = new Date(`${currentDayString}T00:00:00`);
    d.setDate(d.getDate() - 1);
    setCurrentDayString(toYMD(d.getFullYear(), d.getMonth(), d.getDate()));
  };

  const handleNextDay = () => {
    const d = new Date(`${currentDayString}T00:00:00`);
    d.setDate(d.getDate() + 1);
    setCurrentDayString(toYMD(d.getFullYear(), d.getMonth(), d.getDate()));
  };

  const handleGoTodayDay = () => {
    setCurrentDayString(todayYMD);
  };

  // Build grid of days for the full month
  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

    const days: {
      dateString: string;
      dayNumber: number;
      isCurrentMonth: boolean;
      isToday: boolean;
    }[] = [];

    // 1. Previous month trailing days
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      const dayNum = daysInPrevMonth - i;
      const prevMonthIdx = currentMonth === 0 ? 11 : currentMonth - 1;
      const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
      const dateStr = toYMD(prevYear, prevMonthIdx, dayNum);

      days.push({
        dateString: dateStr,
        dayNumber: dayNum,
        isCurrentMonth: false,
        isToday: dateStr === todayYMD,
      });
    }

    // 2. Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = toYMD(currentYear, currentMonth, day);
      days.push({
        dateString: dateStr,
        dayNumber: day,
        isCurrentMonth: true,
        isToday: dateStr === todayYMD,
      });
    }

    // 3. Next month leading days (to complete 35 or 42 grid cells)
    const totalSlots = days.length <= 35 ? 35 : 42;
    const remainingSlots = totalSlots - days.length;
    for (let day = 1; day <= remainingSlots; day++) {
      const nextMonthIdx = currentMonth === 11 ? 0 : currentMonth + 1;
      const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;
      const dateStr = toYMD(nextYear, nextMonthIdx, day);

      days.push({
        dateString: dateStr,
        dayNumber: day,
        isCurrentMonth: false,
        isToday: dateStr === todayYMD,
      });
    }

    return days;
  }, [currentYear, currentMonth, todayYMD]);

  // Index appointments by dateString
  const appointmentsByDate = useMemo(() => {
    const map = new Map<string, Appointment[]>();
    appointments.forEach((apt) => {
      const list = map.get(apt.date) || [];
      list.push(apt);
      map.set(apt.date, list);
    });
    return map;
  }, [appointments]);

  // Filtered month statistics
  const currentMonthPrefix = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}`;
  const currentMonthAppointments = useMemo(() => {
    return appointments.filter((a) => a.date.startsWith(currentMonthPrefix));
  }, [appointments, currentMonthPrefix]);

  const scheduledMonthCount = currentMonthAppointments.filter((a) => a.status === "scheduled").length;
  const completedMonthCount = currentMonthAppointments.filter((a) => a.status === "completed").length;

  // Selected day appointments list for Day view
  const dayAppointments = useMemo(() => {
    const list = appointmentsByDate.get(currentDayString) || [];
    return [...list].sort((a, b) => (a.time || "").localeCompare(b.time || ""));
  }, [appointmentsByDate, currentDayString]);

  const scheduledDayCount = dayAppointments.filter((a) => a.status === "scheduled").length;
  const completedDayCount = dayAppointments.filter((a) => a.status === "completed").length;

  const currentDayDate = new Date(`${currentDayString}T00:00:00`);
  const isCurrentDayFriday = currentDayDate.getDay() === 5;

  const selectedDateAppointments = selectedDate
    ? appointmentsByDate.get(selectedDate) || []
    : [];

  return (
    <div className="w-full flex flex-col space-y-5 animate-in fade-in duration-200">
      {/* ── Main Schedule Top Bar ── */}
      <div className="p-4 sm:p-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left: View Mode Title & Subtitle */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 border border-sky-100 dark:border-sky-900/40 flex items-center justify-center flex-shrink-0">
            {viewMode === "month" ? (
              <CalendarIcon className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.2]" />
            ) : (
              <CalendarClock className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.2]" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
                {viewMode === "month"
                  ? `${getMonthName(currentMonth, language)} ${currentYear}`
                  : formatStaticDate(currentDayString, language)}
              </h2>
              {viewMode === "day" && isCurrentDayFriday && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                  Weekend
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {viewMode === "month" ? t.scheduleSubtitle : `${dayAppointments.length} ${t.booked} • ${formatStaticDate(currentDayString, language)}`}
            </p>
          </div>
        </div>

        {/* Right: Controls & Actions */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* [ Month | Day ] Segmented View Toggle */}
          <div className="inline-flex rounded-xl border border-slate-200 dark:border-slate-800 p-0.5 bg-slate-100 dark:bg-slate-800/80 shadow-2xs">
            <button
              type="button"
              onClick={() => setViewMode("month")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === "month"
                  ? "bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
              }`}
            >
              {t.monthView}
            </button>
            <button
              type="button"
              onClick={() => setViewMode("day")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === "day"
                  ? "bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
              }`}
            >
              {t.dayView}
            </button>
          </div>

          {/* Quick Metrics Badges (Desktop) */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 text-xs">
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              {viewMode === "month" ? currentMonthAppointments.length : dayAppointments.length} {t.booked}
            </span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span className="text-sky-600 dark:text-sky-400 font-medium">
              {viewMode === "month" ? scheduledMonthCount : scheduledDayCount} {t.scheduled}
            </span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-medium">
              {viewMode === "month" ? completedMonthCount : completedDayCount} {t.doneStatus}
            </span>
          </div>

          {/* Date Navigation Buttons */}
          <div className="inline-flex rounded-xl border border-slate-200 dark:border-slate-800 p-0.5 bg-slate-50 dark:bg-slate-950">
            <button
              onClick={viewMode === "month" ? handlePrevMonth : handlePrevDay}
              aria-label="Previous"
              className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4 rtl:rotate-180" />
            </button>
            <button
              onClick={viewMode === "month" ? handleGoTodayMonth : handleGoTodayDay}
              className="px-3 py-1 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              {t.today}
            </button>
            <button
              onClick={viewMode === "month" ? handleNextMonth : handleNextDay}
              aria-label="Next"
              className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4 rtl:rotate-180" />
            </button>
          </div>

          {/* + New Appointment Button */}
          <button
            type="button"
            onClick={() => {
              const targetDate = viewMode === "day" ? currentDayString : todayYMD;
              setBookModalDate(targetDate);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-700 dark:bg-sky-500 dark:hover:bg-sky-600 text-white shadow-sm shadow-sky-600/20 active:scale-[0.98] transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>{t.newAppointment}</span>
          </button>
        </div>
      </div>

      {/* ── VIEW 1: MONTH OVERVIEW (CALENDAR BOARD) ── */}
      {viewMode === "month" ? (
        <div className="w-full overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          {/* Days of week header (Friday highlighted with subtle muted tint) */}
          <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-800/80 bg-slate-50/80 dark:bg-slate-950/60 text-center">
            {weekDayNames.map((day, idx) => {
              const isFriday = idx === 5;
              return (
                <div
                  key={day}
                  className={`py-3 text-[11px] sm:text-xs font-bold uppercase tracking-wider ${
                    isFriday
                      ? "bg-slate-100/60 dark:bg-slate-900/40 text-rose-600 dark:text-rose-400 font-extrabold"
                      : "text-slate-500 dark:text-slate-400"
                  }`}
                >
                  <span>{day}</span>
                  {isFriday && (
                    <span className="hidden sm:inline-block text-[9px] font-normal opacity-70 ml-1">
                      (Weekend)
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Calendar days grid (Friday cells highlighted with subtle muted tint) */}
          <div className="grid grid-cols-7 divide-x divide-y divide-slate-100 dark:divide-slate-800/60 bg-slate-100/30 dark:bg-slate-950/20">
            {calendarDays.map((cell) => {
              const dayAppointments = appointmentsByDate.get(cell.dateString) || [];
              const hasAppointments = dayAppointments.length > 0;
              const cellDate = new Date(`${cell.dateString}T00:00:00`);
              const isFriday = cellDate.getDay() === 5;

              return (
                <div
                  key={cell.dateString}
                  onClick={() => {
                    setCurrentDayString(cell.dateString);
                    setSelectedDate(cell.dateString);
                  }}
                  className={`
                    min-h-[60px] sm:min-h-[120px] p-1.5 sm:p-2.5 transition-all duration-150 cursor-pointer flex flex-col justify-between group active:scale-[0.99]
                    ${
                      isFriday
                        ? "bg-slate-100/60 dark:bg-slate-900/40"
                        : cell.isCurrentMonth
                        ? "bg-white dark:bg-slate-900 hover:bg-sky-50/40 dark:hover:bg-sky-950/20"
                        : "bg-slate-50/60 dark:bg-slate-950/40 opacity-40 hover:opacity-80"
                    }
                    ${cell.isToday ? "ring-2 ring-sky-500 ring-inset" : ""}
                  `}
                >
                  {/* Day Number Header */}
                  <div className="flex items-center justify-between">
                    <span
                      className={`
                        w-6 h-6 sm:w-7 sm:h-7 rounded-lg sm:rounded-xl flex items-center justify-center text-xs font-bold font-mono transition-transform group-hover:scale-105
                        ${
                          cell.isToday
                            ? "bg-sky-600 text-white shadow-xs font-extrabold"
                            : isFriday
                            ? "text-rose-600 dark:text-rose-400 font-extrabold"
                            : cell.isCurrentMonth
                            ? "text-slate-800 dark:text-slate-200"
                            : "text-slate-400 dark:text-slate-600"
                        }
                      `}
                    >
                      {cell.dayNumber}
                    </span>

                    {hasAppointments && (
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-sky-50 dark:bg-sky-950/80 text-sky-600 dark:text-sky-400 border border-sky-200 dark:border-sky-800">
                        {dayAppointments.length}
                      </span>
                    )}
                  </div>

                  {/* Mobile indicators (< sm): colored dots */}
                  <div className="sm:hidden flex items-center justify-center gap-1 mt-1">
                    {dayAppointments.slice(0, 3).map((apt) => (
                      <span
                        key={apt.id}
                        className={`w-1.5 h-1.5 rounded-full ${
                          apt.status === "completed" ? "bg-emerald-500" : "bg-sky-500"
                        }`}
                      />
                    ))}
                    {dayAppointments.length > 3 && (
                      <span className="text-[8px] font-bold text-slate-400">+</span>
                    )}
                  </div>

                  {/* Desktop Previews (>= sm) */}
                  <div className="hidden sm:flex mt-1 space-y-1 overflow-hidden flex-1 flex-col justify-start">
                    {dayAppointments.slice(0, 2).map((apt) => {
                      const isDone = apt.status === "completed";
                      return (
                        <div
                          key={apt.id}
                          className={`text-[10px] sm:text-[11px] px-1.5 py-1 rounded-lg border font-medium truncate flex items-center justify-between gap-1 shadow-2xs ${
                            isDone
                              ? "bg-emerald-50/80 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-800/60 line-through"
                              : "bg-sky-50/90 dark:bg-sky-950/60 text-sky-900 dark:text-sky-200 border-sky-200/80 dark:border-sky-800/60"
                          }`}
                          title={`${apt.patientName} (${apt.time}) - ${apt.phone}`}
                        >
                          <span className="truncate font-semibold">{apt.patientName}</span>
                          <span className="text-[9px] opacity-75 font-mono flex-shrink-0">
                            {apt.time.split(" ")[0]}
                          </span>
                        </div>
                      );
                    })}

                    {dayAppointments.length > 2 && (
                      <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 pl-1">
                        +{dayAppointments.length - 2} more
                      </span>
                    )}
                  </div>

                  {/* Subtle Hover Action prompt */}
                  <div className="hidden sm:flex opacity-0 group-hover:opacity-100 transition-opacity pt-1 text-[10px] font-semibold text-sky-600 dark:text-sky-400 items-center justify-end">
                    <span>+ {t.booked}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* ── VIEW 2: DETAILED DAILY SCHEDULE BREAKDOWN ── */
        <div className="space-y-4">
          {/* Day Status Summary Strip */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  {formatStaticDate(currentDayString, language)}
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {dayAppointments.length} appointments scheduled for today
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setBookModalDate(currentDayString)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-700 text-white shadow-sm shadow-sky-600/20 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{t.addAppointment}</span>
              </button>
            </div>
          </div>

          {/* Daily Schedule List */}
          {dayAppointments.length === 0 ? (
            <div className="p-12 text-center rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/30">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 mx-auto flex items-center justify-center mb-3">
                <CalendarClock className="w-6 h-6" />
              </div>
              <h3 className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-200">
                No appointments for this day
              </h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 mb-4">
                Schedule a consultation, procedure, or follow-up visit for this patient.
              </p>
              <button
                type="button"
                onClick={() => setBookModalDate(currentDayString)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold cursor-pointer transition-all shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>{t.newAppointment}</span>
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">
              {dayAppointments.map((apt) => {
                const isDone = apt.status === "completed";
                const whatsAppUrl = apt.phone
                  ? getWhatsAppUrl({
                      phone: apt.phone,
                      patientName: apt.patientName,
                      clinicName: settings.clinicName,
                      date: apt.date,
                      time: apt.time,
                      language,
                    })
                  : "";

                return (
                  <div
                    key={apt.id}
                    className={`p-3.5 sm:p-4 rounded-2xl border transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm ${
                      isDone
                        ? "bg-slate-50/70 dark:bg-slate-900/40 border-slate-200/70 dark:border-slate-800/60 opacity-80"
                        : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-sky-300 dark:hover:border-sky-700/50"
                    }`}
                  >
                    {/* Left: Time + Patient Info */}
                    <div className="flex items-start sm:items-center gap-3 min-w-0">
                      {/* Time capsule */}
                      <div className="flex-shrink-0 px-2.5 py-1.5 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-100 dark:border-sky-900/50 flex items-center gap-1.5 font-mono font-bold text-xs">
                        <Clock className="w-3.5 h-3.5 text-sky-500" />
                        <span>{apt.time || "No time"}</span>
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                            {apt.patientName}
                          </h4>
                          {apt.treatment && (
                            <span className="hidden xs:inline-block px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                              {apt.treatment}
                            </span>
                          )}
                        </div>
                        {apt.notes && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                            {apt.notes}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Right: Status Switcher, Start Visit & Contact Actions */}
                    <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap justify-between sm:justify-end">
                      {/* Start Visit / Open Chart (When Patient Arrives) */}
                      {onStartVisit && !isDone && (
                        <button
                          type="button"
                          onClick={() => onStartVisit(apt)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs hover:shadow-emerald-600/20 active:scale-95 transition-all cursor-pointer min-h-[38px]"
                          title="Open patient profile & start visit"
                        >
                          <span>🦷</span>
                          <span>
                            {language === "ar"
                              ? "بدء الزيارة / فتح المخطط"
                              : language === "ku"
                              ? "دەستپێکردنی سەردان"
                              : "Start Visit / Open Chart"}
                          </span>
                        </button>
                      )}

                      {/* Status Toggle Button */}
                      <button
                        type="button"
                        onClick={() =>
                          onToggleStatus(
                            apt.id,
                            isDone ? "scheduled" : "completed"
                          )
                        }
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer min-h-[38px] ${
                          isDone
                            ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100"
                            : "bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800 hover:bg-sky-100"
                        }`}
                      >
                        {isDone ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                            <span>{t.doneStatus}</span>
                          </>
                        ) : (
                          <>
                            <Clock className="w-3.5 h-3.5 text-sky-500" />
                            <span>{t.scheduled}</span>
                          </>
                        )}
                      </button>

                      {/* Phone Call Button */}
                      {apt.phone && (
                        <a
                          href={`tel:${apt.phone}`}
                          title={`Call ${apt.phone}`}
                          className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700 transition-colors"
                        >
                          <Phone className="w-3.5 h-3.5" />
                        </a>
                      )}

                      {/* WhatsApp 1-Click Reminder Button */}
                      {apt.phone && (
                        <a
                          href={getAppointmentReminderWhatsAppUrl({
                            phone: apt.phone,
                            patientName: apt.patientName,
                            clinicName: settings.clinicName,
                            doctorName: settings.doctorName,
                            date: apt.date,
                            time: apt.time,
                            language,
                          })}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Open 1-Click WhatsApp reminder"
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold bg-[#25D366] hover:bg-[#1ebe5d] text-white shadow-2xs hover:shadow-sm transition-all cursor-pointer min-h-[38px]"
                        >
                          <MessageCircle className="w-3.5 h-3.5 fill-current" />
                          <span className="hidden sm:inline text-[11px]">
                            {language === "ar" ? "تذكير واتساب" : t.whatsApp}
                          </span>
                        </a>
                      )}

                      {/* Delete Appointment */}
                      <button
                        type="button"
                        onClick={() => onDeleteAppointment(apt.id)}
                        title="Delete appointment"
                        className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Day Appointments Modal */}
      {selectedDate && (
        <DayAppointmentsModal
          isOpen={Boolean(selectedDate)}
          dateString={selectedDate}
          appointments={selectedDateAppointments}
          existingPatients={patients}
          onClose={() => setSelectedDate(null)}
          onAddAppointment={onAddAppointment}
          onToggleStatus={onToggleStatus}
          onDeleteAppointment={onDeleteAppointment}
          onOpenAddPatient={onOpenAddPatient}
          onStartVisit={onStartVisit}
        />
      )}

      {/* Fast 10-Second Book Appointment Modal */}
      {bookModalDate && (
        <BookAppointmentModal
          isOpen={Boolean(bookModalDate)}
          initialDate={bookModalDate}
          existingPatients={patients}
          onClose={() => setBookModalDate(null)}
          onBookAppointment={(data) => {
            onAddAppointment(data);
            setBookModalDate(null);
          }}
        />
      )}
    </div>
  );
}
