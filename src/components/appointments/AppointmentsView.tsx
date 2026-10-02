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
  CalendarClock,
  MessageCircle,
  X,
  MoreHorizontal,
  Stethoscope,
} from "lucide-react";
import { Appointment, AppointmentStatus } from "@/types/appointment";
import { Patient, getAppointmentReminderWhatsAppUrl } from "@/types/patient";
import { BookAppointmentModal } from "./BookAppointmentModal";
import { useLanguage } from "@/context/LanguageContext";
import { useClinicSettings } from "@/context/ClinicSettingsContext";
import { getMonthName, WEEKDAY_NAMES, formatStaticDate } from "@/utils/date";

// ─── Status filter type (UI-only, not a DB status) ───
type StatusFilter = "all" | "scheduled" | "completed" | "cancelled";

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

  // ─── Date helpers ───
  const toYMD = (year: number, monthIndex: number, day: number) => {
    const mStr = String(monthIndex + 1).padStart(2, "0");
    const dStr = String(day).padStart(2, "0");
    return `${year}-${mStr}-${dStr}`;
  };

  const today = new Date();
  const todayYMD = toYMD(today.getFullYear(), today.getMonth(), today.getDate());
  const tomorrowDate = new Date(today);
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  const tomorrowYMD = toYMD(tomorrowDate.getFullYear(), tomorrowDate.getMonth(), tomorrowDate.getDate());

  // ─── State ───
  const [currentDayString, setCurrentDayString] = useState<string>(todayYMD);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [bookModalDate, setBookModalDate] = useState<string | null>(null);
  const [showDatePickerPopover, setShowDatePickerPopover] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  // ─── Day navigation ───
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

  // ─── Compute this week range (Sun–Sat) ───
  const getWeekRange = () => {
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 = Sun
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - dayOfWeek);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    return {
      start: toYMD(startOfWeek.getFullYear(), startOfWeek.getMonth(), startOfWeek.getDate()),
      end: toYMD(endOfWeek.getFullYear(), endOfWeek.getMonth(), endOfWeek.getDate()),
    };
  };

  // ─── Index appointments by date ───
  const appointmentsByDate = useMemo(() => {
    const map = new Map<string, Appointment[]>();
    appointments.forEach((apt) => {
      const list = map.get(apt.date) || [];
      list.push(apt);
      map.set(apt.date, list);
    });
    return map;
  }, [appointments]);

  // ─── Day appointments for selected day ───
  const dayAppointments = useMemo(() => {
    const list = appointmentsByDate.get(currentDayString) || [];
    return [...list].sort((a, b) => (a.time || "").localeCompare(b.time || ""));
  }, [appointmentsByDate, currentDayString]);

  // ─── Filtered appointments by status ───
  const filteredAppointments = useMemo(() => {
    if (statusFilter === "all") return dayAppointments;
    return dayAppointments.filter((a) => a.status === statusFilter);
  }, [dayAppointments, statusFilter]);

  // ─── Stats ───
  const scheduledCount = dayAppointments.filter((a) => a.status === "scheduled").length;
  const completedCount = dayAppointments.filter((a) => a.status === "completed").length;
  const cancelledCount = dayAppointments.filter((a) => a.status === "cancelled").length;

  // ─── Date display helpers ───
  const currentDayDate = new Date(`${currentDayString}T00:00:00`);
  const isCurrentDayFriday = currentDayDate.getDay() === 5;
  const isToday = currentDayString === todayYMD;
  const isTomorrow = currentDayString === tomorrowYMD;

  const weekDayNames = WEEKDAY_NAMES[language] || WEEKDAY_NAMES.en;
  const currentDayWeekday = weekDayNames[currentDayDate.getDay()];

  // Localized labels
  const labels = {
    title: language === "ar" ? "المواعيد والجدول" : language === "ku" ? "مەوعیدەکان و خشتە" : "Appointments & Schedule",
    bookAppointment: language === "ar" ? "حجز موعد" : language === "ku" ? "نۆرە دابنێ" : "Book Appointment",
    today: language === "ar" ? "اليوم" : language === "ku" ? "ئەمڕۆ" : "Today",
    tomorrow: language === "ar" ? "غداً" : language === "ku" ? "سبەی" : "Tomorrow",
    thisWeek: language === "ar" ? "هذا الأسبوع" : language === "ku" ? "ئەم هەفتە" : "This Week",
    all: language === "ar" ? "الكل" : language === "ku" ? "هەمووی" : "All",
    scheduled: language === "ar" ? "مجدول" : language === "ku" ? "دانراو" : "Scheduled",
    completed: language === "ar" ? "مكتمل" : language === "ku" ? "تەواوبوو" : "Completed",
    cancelled: language === "ar" ? "ملغي" : language === "ku" ? "هەڵوەشاوە" : "Cancelled",
    noAppointments: language === "ar" ? "لا توجد مواعيد لهذا اليوم" : language === "ku" ? "هیچ مەوعیدێک نییە بۆ ئەم ڕۆژە" : "No appointments booked for this day",
    noAppointmentsDesc: language === "ar" ? "اضغط على الزر أدناه لحجز موعد جديد" : language === "ku" ? "دوگمەی خوارەوە دابگرە بۆ دانانی مەوعیدی نوێ" : "Tap the button below to schedule a consultation or procedure",
    addAppointment: language === "ar" ? "إضافة موعد" : language === "ku" ? "مەوعیدی نوێ" : "Add Appointment",
    startVisit: language === "ar" ? "بدء الزيارة" : language === "ku" ? "دەستپێکردنی سەردان" : "Start Visit",
    whatsappReminder: language === "ar" ? "تذكير" : language === "ku" ? "بیرخستنەوە" : "Remind",
    reschedule: language === "ar" ? "إعادة جدولة" : language === "ku" ? "نوێکردنەوەی کات" : "Reschedule",
    cancel: language === "ar" ? "إلغاء الموعد" : language === "ku" ? "هەڵوەشاندنەوە" : "Cancel Appointment",
    deleteAppt: language === "ar" ? "حذف" : language === "ku" ? "سڕینەوە" : "Delete",
    markScheduled: language === "ar" ? "إرجاع لمجدول" : language === "ku" ? "بگۆڕە بۆ دانراو" : "Mark as Scheduled",
    markCompleted: language === "ar" ? "اكتمل" : language === "ku" ? "تەواو بوو" : "Mark as Completed",
    duration: language === "ar" ? "دقيقة" : language === "ku" ? "خولەک" : "min",
  };

  // ─── Status badge styles ───
  const statusBadgeStyles: Record<AppointmentStatus, string> = {
    scheduled: "bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 ring-1 ring-sky-200 dark:ring-sky-800",
    completed: "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 ring-1 ring-emerald-200 dark:ring-emerald-800",
    cancelled: "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 ring-1 ring-slate-200 dark:ring-slate-700 line-through",
  };

  const statusLabels: Record<AppointmentStatus, string> = {
    scheduled: labels.scheduled,
    completed: labels.completed,
    cancelled: labels.cancelled,
  };

  // Patient initials
  const getInitials = (name: string) =>
    name
      .trim()
      .split(" ")
      .slice(0, 2)
      .map((w) => w[0])
      .join("")
      .toUpperCase() || "P";

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col space-y-4 sm:space-y-5 animate-in fade-in duration-200 pb-32 md:pb-4">
      {/* ════════════════════════ HEADER & NAVIGATION BAR ════════════════════════ */}
      <div className="p-4 sm:p-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
        {/* ── Row 1: Title + Book Appointment Button ── */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 border border-sky-100 dark:border-sky-900/40 flex items-center justify-center flex-shrink-0">
              <CalendarClock className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
                  {labels.title}
                </h2>
                {dayAppointments.length > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-sky-100 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800 tabular-nums">
                    {dayAppointments.length}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {isToday && `${labels.today} • `}{formatStaticDate(currentDayString, language)}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setBookModalDate(currentDayString)}
            className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2.5 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-700 dark:bg-sky-500 dark:hover:bg-sky-600 text-white shadow-sm shadow-sky-600/20 active:scale-[0.98] transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>{labels.bookAppointment}</span>
          </button>
        </div>

        {/* ── Row 2: Quick Date Pills + Date Navigator ── */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Quick pills */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setCurrentDayString(todayYMD)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                isToday
                  ? "bg-sky-600 text-white border-sky-600 shadow-sm"
                  : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-sky-50 dark:hover:bg-sky-950/40 hover:border-sky-300"
              }`}
            >
              {labels.today}
            </button>
            <button
              type="button"
              onClick={() => setCurrentDayString(tomorrowYMD)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                isTomorrow
                  ? "bg-sky-600 text-white border-sky-600 shadow-sm"
                  : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-sky-50 dark:hover:bg-sky-950/40 hover:border-sky-300"
              }`}
            >
              {labels.tomorrow}
            </button>
          </div>

          {/* Separator dot */}
          <span className="text-slate-300 dark:text-slate-700 select-none hidden sm:inline">•</span>

          {/* Date Navigator: < Day • Month DD, YYYY > */}
          <div className="inline-flex items-center rounded-xl border border-slate-200 dark:border-slate-800 p-0.5 bg-slate-50 dark:bg-slate-950">
            <button
              onClick={handlePrevDay}
              aria-label="Previous day"
              className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4 rtl:rotate-180" />
            </button>
            <button
              type="button"
              onClick={() => setShowDatePickerPopover(!showDatePickerPopover)}
              className="px-3 py-1 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <CalendarIcon className="w-3.5 h-3.5 text-sky-500" />
              <span>{currentDayWeekday} • {formatStaticDate(currentDayString, language)}</span>
            </button>
            <button
              onClick={handleNextDay}
              aria-label="Next day"
              className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4 rtl:rotate-180" />
            </button>
          </div>
        </div>

        {/* ── Calendar Popover (Centered Modal with inline mini-calendar) ── */}
        {showDatePickerPopover && (() => {
          const viewDate = new Date(`${currentDayString}T00:00:00`);
          const calViewYear = viewDate.getFullYear();
          const calViewMonth = viewDate.getMonth();
          const firstDay = new Date(calViewYear, calViewMonth, 1).getDay();
          const daysInMonth = new Date(calViewYear, calViewMonth + 1, 0).getDate();
          const calDays: number[] = [];
          for (let i = 0; i < firstDay; i++) calDays.push(0);
          for (let d = 1; d <= daysInMonth; d++) calDays.push(d);

          return (
            <div
              className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-4 animate-in fade-in"
              onClick={() => setShowDatePickerPopover(false)}
            >
              <div
                className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-4 border border-slate-100 dark:border-slate-800 w-72 scale-100 animate-in zoom-in-95"
                onClick={(e) => e.stopPropagation()}
                dir="ltr"
              >
                {/* Month/Year header with nav */}
                <div className="flex items-center justify-between mb-3">
                  <button
                    type="button"
                    onClick={() => {
                      const prev = new Date(calViewYear, calViewMonth - 1, 1);
                      setCurrentDayString(toYMD(prev.getFullYear(), prev.getMonth(), Math.min(parseInt(currentDayString.split("-")[2]), new Date(prev.getFullYear(), prev.getMonth() + 1, 0).getDate())));
                    }}
                    className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    {getMonthName(calViewMonth, language)} {calViewYear}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const next = new Date(calViewYear, calViewMonth + 1, 1);
                      setCurrentDayString(toYMD(next.getFullYear(), next.getMonth(), Math.min(parseInt(currentDayString.split("-")[2]), new Date(next.getFullYear(), next.getMonth() + 1, 0).getDate())));
                    }}
                    className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
                {/* Weekday header */}
                <div className="grid grid-cols-7 gap-0.5 mb-1">
                  {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((wd) => (
                    <div key={wd} className="text-center text-[10px] font-bold text-slate-400 py-1">
                      {wd}
                    </div>
                  ))}
                </div>
                {/* Day cells */}
                <div className="grid grid-cols-7 gap-0.5">
                  {calDays.map((day, i) => {
                    if (day === 0) return <div key={`empty-${i}`} />;
                    const dayStr = toYMD(calViewYear, calViewMonth, day);
                    const isSelected = dayStr === currentDayString;
                    const isTodayCell = dayStr === todayYMD;
                    const hasApts = (appointmentsByDate.get(dayStr) || []).length > 0;
                    return (
                      <button
                        key={dayStr}
                        type="button"
                        onClick={() => {
                          setCurrentDayString(dayStr);
                          setShowDatePickerPopover(false);
                        }}
                        className={`relative w-9 h-9 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                          isSelected
                            ? "bg-sky-600 text-white shadow-sm font-bold"
                            : isTodayCell
                            ? "bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 font-bold ring-1 ring-sky-300 dark:ring-sky-700"
                            : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                        }`}
                      >
                        {day}
                        {hasApts && !isSelected && (
                          <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-sky-500" />
                        )}
                      </button>
                    );
                  })}
                </div>
                <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentDayString(todayYMD);
                      setShowDatePickerPopover(false);
                    }}
                    className="text-xs font-semibold text-sky-600 hover:text-sky-700 px-3 py-1.5 cursor-pointer"
                  >
                    {labels.today}
                  </button>
                  <button
                    onClick={() => setShowDatePickerPopover(false)}
                    className="text-xs font-medium text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 px-3 py-1.5 cursor-pointer"
                  >
                    {language === "ar" ? "إغلاق" : language === "ku" ? "داخستن" : "Close"}
                  </button>
                </div>
              </div>
            </div>
          );
        })()}

        {/* ── Row 3: Status Filter Tabs ── */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar -mx-1 px-1">
          {([
            { key: "all" as StatusFilter, label: labels.all, count: dayAppointments.length, color: "sky" },
            { key: "scheduled" as StatusFilter, label: labels.scheduled, count: scheduledCount, color: "sky" },
            { key: "completed" as StatusFilter, label: labels.completed, count: completedCount, color: "emerald" },
            { key: "cancelled" as StatusFilter, label: labels.cancelled, count: cancelledCount, color: "slate" },
          ]).map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setStatusFilter(tab.key)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap border shrink-0 ${
                statusFilter === tab.key
                  ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 border-slate-900 dark:border-slate-100 shadow-sm"
                  : "bg-white dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
            >
              <span>{tab.label}</span>
              {tab.count > 0 && (
                <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold tabular-nums ${
                  statusFilter === tab.key
                    ? "bg-white/20 dark:bg-slate-900/30 text-white dark:text-slate-900"
                    : "bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400"
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ════════════════════════ DAILY AGENDA LIST (CORE VIEW) ════════════════════════ */}
      {filteredAppointments.length === 0 ? (
        /* ── Empty State ── */
        <div className="p-10 sm:p-14 text-center rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/30">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 mx-auto flex items-center justify-center mb-4">
            <CalendarClock className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
            {labels.noAppointments}
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1.5 mb-5 leading-relaxed">
            {labels.noAppointmentsDesc}
          </p>
          <button
            type="button"
            onClick={() => setBookModalDate(currentDayString)}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold cursor-pointer transition-all shadow-xs active:scale-[0.98]"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>{labels.addAppointment}</span>
          </button>
        </div>
      ) : (
        /* ── Appointment Cards Timeline ── */
        <div className="space-y-3">
          {filteredAppointments.map((apt) => {
            const isDone = apt.status === "completed";
            const isCancelled = apt.status === "cancelled";
            const isScheduled = apt.status === "scheduled";
            const initials = getInitials(apt.patientName);
            const isMenuOpen = openMenuId === apt.id;

            const whatsAppUrl = apt.phone
              ? getAppointmentReminderWhatsAppUrl({
                  phone: apt.phone,
                  patientName: apt.patientName,
                  clinicName: settings.clinicName,
                  doctorName: settings.doctorName,
                  date: apt.date,
                  time: apt.time,
                  language,
                })
              : "";

            return (
              <div
                key={apt.id}
                className={`relative group p-4 sm:p-5 rounded-xl border transition-all duration-200 ${
                  isDone
                    ? "bg-slate-50/70 dark:bg-slate-900/40 border-slate-200/70 dark:border-slate-800/60 opacity-75 shadow-none"
                    : isCancelled
                    ? "bg-slate-50/50 dark:bg-slate-950/30 border-slate-200/50 dark:border-slate-800/40 opacity-60 shadow-none"
                    : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md"
                }`}
              >
                <div className="flex flex-col sm:flex-row gap-3.5 sm:gap-4">
                  {/* ── LEFT: Time Block ── */}
                  <div className="flex sm:flex-col items-center sm:items-start gap-2 sm:gap-1 sm:w-[90px] flex-shrink-0">
                    <div className={`px-3 py-2 rounded-xl text-center font-mono text-sm ${
                      isDone
                        ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-semibold ring-1 ring-emerald-200 dark:ring-emerald-800/60"
                        : isCancelled
                        ? "bg-slate-100 dark:bg-slate-800 text-slate-400 font-medium ring-1 ring-slate-200 dark:ring-slate-700 line-through"
                        : "bg-slate-50 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 font-semibold ring-1 ring-slate-200 dark:ring-slate-700"
                    }`}>
                      {apt.time || "—"}
                    </div>
                    <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500">
                      30 {labels.duration}
                    </span>
                  </div>

                  {/* ── CENTER: Patient & Clinical ── */}
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-center gap-2.5">
                      {/* Avatar */}
                      <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                          {initials}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <h4 className={`text-base font-semibold capitalize truncate ${
                          isCancelled
                            ? "text-slate-400 dark:text-slate-500 line-through"
                            : "text-slate-900 dark:text-slate-100"
                        }`}>
                          {apt.patientName}
                        </h4>
                        {apt.phone && (
                          <a
                            href={`tel:${apt.phone}`}
                            className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 transition-colors group/phone"
                          >
                            <Phone className="w-3 h-3 text-slate-400 group-hover/phone:text-sky-500" />
                            <span className="font-mono">{apt.phone}</span>
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Clinical Tag / Treatment */}
                    {apt.treatment && (
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700">
                          <Stethoscope className="w-3 h-3 text-slate-400" />
                          {apt.treatment}
                        </span>
                      </div>
                    )}

                    {/* Notes */}
                    {apt.notes && !isCancelled && (
                      <p className="text-xs text-slate-400 dark:text-slate-500 truncate leading-relaxed">
                        {apt.notes}
                      </p>
                    )}
                  </div>

                  {/* ── RIGHT: Status & Actions ── */}
                  <div className="flex items-start sm:items-center gap-2 flex-wrap sm:flex-nowrap justify-between sm:justify-end sm:w-auto">
                    {/* Status Badge */}
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-bold whitespace-nowrap ${statusBadgeStyles[apt.status]}`}>
                      {apt.status === "completed" && <CheckCircle2 className="w-3 h-3" />}
                      {apt.status === "scheduled" && <Clock className="w-3 h-3" />}
                      {statusLabels[apt.status]}
                    </span>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-1.5">
                      {/* Start Visit (only for scheduled) */}
                      {onStartVisit && isScheduled && (
                        <button
                          type="button"
                          onClick={() => onStartVisit(apt)}
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-sky-600 hover:bg-sky-700 text-white shadow-sm active:scale-95 transition-all cursor-pointer min-h-[36px]"
                          title={labels.startVisit}
                        >
                          <span>🩺</span>
                          <span className="hidden sm:inline">{labels.startVisit}</span>
                        </button>
                      )}

                      {/* WhatsApp Reminder (only for scheduled) */}
                      {apt.phone && isScheduled && (
                        <a
                          href={whatsAppUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          title={labels.whatsappReminder}
                          className="inline-flex items-center gap-1 px-2.5 py-2 rounded-xl text-xs font-medium bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-950/60 active:scale-95 transition-all cursor-pointer min-h-[36px]"
                        >
                          <MessageCircle className="w-3.5 h-3.5 fill-current" />
                          <span className="hidden sm:inline text-[11px]">{labels.whatsappReminder}</span>
                        </a>
                      )}

                      {/* ••• More Menu */}
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setOpenMenuId(isMenuOpen ? null : apt.id)}
                          className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                          aria-label="More actions"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </button>

                        {/* Dropdown */}
                        {isMenuOpen && (
                          <>
                            <div className="fixed inset-0 z-40" onClick={() => setOpenMenuId(null)} />
                            <div className="absolute end-0 top-full mt-1 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-50 p-1.5 space-y-0.5 animate-in fade-in zoom-in-95">
                              {/* Toggle Status */}
                              {isScheduled && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    onToggleStatus(apt.id, "completed");
                                    setOpenMenuId(null);
                                  }}
                                  className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 transition-colors min-h-[40px] cursor-pointer"
                                >
                                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                  <span>{labels.markCompleted}</span>
                                </button>
                              )}
                              {isDone && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    onToggleStatus(apt.id, "scheduled");
                                    setOpenMenuId(null);
                                  }}
                                  className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-sky-700 dark:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-950/50 transition-colors min-h-[40px] cursor-pointer"
                                >
                                  <Clock className="w-4 h-4 text-sky-500" />
                                  <span>{labels.markScheduled}</span>
                                </button>
                              )}

                              {/* Cancel / Uncancel */}
                              {!isCancelled && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    onToggleStatus(apt.id, "cancelled");
                                    setOpenMenuId(null);
                                  }}
                                  className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/50 transition-colors min-h-[40px] cursor-pointer"
                                >
                                  <X className="w-4 h-4 text-amber-500" />
                                  <span>{labels.cancel}</span>
                                </button>
                              )}
                              {isCancelled && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    onToggleStatus(apt.id, "scheduled");
                                    setOpenMenuId(null);
                                  }}
                                  className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-sky-700 dark:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-950/50 transition-colors min-h-[40px] cursor-pointer"
                                >
                                  <CalendarIcon className="w-4 h-4 text-sky-500" />
                                  <span>{labels.reschedule}</span>
                                </button>
                              )}

                              {/* Separator */}
                              <div className="my-1 border-t border-slate-100 dark:border-slate-800" />

                              {/* Delete */}
                              <button
                                type="button"
                                onClick={() => {
                                  onDeleteAppointment(apt.id);
                                  setOpenMenuId(null);
                                }}
                                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors min-h-[40px] cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4 text-rose-500" />
                                <span>{labels.deleteAppt}</span>
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ════════════════════════ BOOK APPOINTMENT MODAL ════════════════════════ */}
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
