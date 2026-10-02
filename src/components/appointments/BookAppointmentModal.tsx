"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  X,
  Calendar,
  Clock,
  User,
  Phone,
  Sparkles,
  Check,
  AlertCircle,
  CalendarCheck,
} from "lucide-react";
import { Appointment } from "@/types/appointment";
import { Patient } from "@/types/patient";
import { useLanguage } from "@/context/LanguageContext";
import { DatePickerPopover } from "@/components/ui/DatePickerPopover";
import { TimeKeeperPicker } from "@/components/ui/TimeKeeperPicker";

interface BookAppointmentModalProps {
  isOpen: boolean;
  initialDate?: string; // YYYY-MM-DD
  existingPatients: Patient[];
  onClose: () => void;
  onBookAppointment: (data: Omit<Appointment, "id" | "createdAt">) => void;
}

const COMMON_REASONS = [
  { id: "checkup", en: "Checkup", ar: "فحص دوري", ku: "پشکنین" },
  { id: "pain", en: "Pain / Emergency", ar: "ألم وطوارئ", ku: "ئازار و فریاگوزاری" },
  { id: "filling", en: "Filling", ar: "حشوة دائمية", ku: "پڕکردنەوە" },
  { id: "extraction", en: "Extraction", ar: "قلع سن", ku: "کێشانی ددان" },
  { id: "ortho", en: "Ortho", ar: "تقويم أسنان", ku: "تەلی ددان" },
  { id: "rootcanal", en: "Root Canal", ar: "علاج عصب", ku: "دەماربڕین" },
  { id: "cleaning", en: "Cleaning", ar: "تنظيف وتلميع", ku: "پاککردنەوە" },
];

const TIME_CHIPS = [
  "09:00 AM",
  "10:00 AM",
  "11:30 AM",
  "04:00 PM",
  "05:00 PM",
  "06:30 PM",
  "08:00 PM",
];

export function BookAppointmentModal({
  isOpen,
  initialDate,
  existingPatients,
  onClose,
  onBookAppointment,
}: BookAppointmentModalProps) {
  const { language, t } = useLanguage();

  const getTodayString = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const getTomorrowString = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const todayStr = getTodayString();
  const tomorrowStr = getTomorrowString();

  // Form states
  const [patientName, setPatientName] = useState("");
  const [phone, setPhone] = useState("");
  const [date, setDate] = useState(initialDate || todayStr);
  const [time, setTime] = useState("04:00 PM");
  const [treatment, setTreatment] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Autocomplete dropdown
  const [isAutocompleteOpen, setIsAutocompleteOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Synchronize when opened
  useEffect(() => {
    if (isOpen) {
      setPatientName("");
      setPhone("");
      setDate(initialDate || getTodayString());
      setTime("04:00 PM");
      setTreatment("");
      setNotes("");
      setError(null);
      setIsAutocompleteOpen(false);
    }
  }, [isOpen, initialDate]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Click outside autocomplete dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setIsAutocompleteOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter existing patients for autocomplete
  const suggestions = useMemo(() => {
    const q = patientName.trim().toLowerCase();
    if (!q || q.length < 1) return [];
    const cleanDigits = q.replace(/\D/g, "");
    return existingPatients
      .filter((p) => {
        const matchesName = p.name.toLowerCase().includes(q);
        const matchesPhone = cleanDigits.length >= 2 && p.phone && p.phone.replace(/\D/g, "").includes(cleanDigits);
        return matchesName || matchesPhone;
      })
      .slice(0, 5);
  }, [patientName, existingPatients]);

  if (!isOpen) return null;

  const handleSelectPatient = (patient: Patient) => {
    setPatientName(patient.name);
    if (patient.phone) {
      setPhone(patient.phone);
    }
    setIsAutocompleteOpen(false);
    setError(null);
  };

  const handleToggleReason = (label: string) => {
    if (treatment === label) {
      setTreatment("");
    } else {
      setTreatment(label);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName.trim()) {
      setError(
        language === "ar"
          ? "يرجى كتابة اسم المراجع"
          : language === "ku"
          ? "تکایە ناوی نەخۆش بنووسە"
          : "Please enter patient name"
      );
      return;
    }

    if (!phone.trim()) {
      setError(
        language === "ar"
          ? "يرجى إدخال رقم الهاتف للتذكير عبر الواتساب"
          : language === "ku"
          ? "تکایە ژمارەی مۆبایل بنووسە بۆ بیرخستنەوە"
          : "Please enter a phone number"
      );
      return;
    }

    onBookAppointment({
      patientName: patientName.trim(),
      phone: phone.trim(),
      date,
      time: time || "04:00 PM",
      treatment: treatment.trim() || undefined,
      notes: notes.trim() || undefined,
      status: "scheduled",
    });

    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="book-appointment-title"
    >
      <div
        className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 sm:px-6 py-4 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-900/70 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-50 dark:bg-sky-950 flex items-center justify-center text-sky-600 dark:text-sky-400 border border-sky-100 dark:border-sky-800 shadow-2xs">
              <CalendarCheck className="w-5 h-5" />
            </div>
            <div>
              <h2
                id="book-appointment-title"
                className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-100 flex items-center gap-1.5"
              >
                <span>
                  {language === "ar"
                    ? "حجز موعد سريع"
                    : language === "ku"
                    ? "حجزی نۆرەی خێرا"
                    : "Book Fast Appointment"}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-800">
                  ⚡ 10s
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {language === "ar"
                  ? "تسجيل موعد مراجع عبر الهاتف أو العيادة"
                  : language === "ku"
                  ? "تۆمارکردنی نۆرەی نەخۆش لە ڕێگەی پەیوەندی یان کلینیک"
                  : "Quick phone call booking (no billing/chart required)"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 overflow-y-auto">
          {error && (
            <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/80 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{error}</span>
            </div>
          )}

          {/* 1. Patient Name with Autocomplete */}
          <div className="relative">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              <span>
                {language === "ar"
                  ? "اسم المراجع"
                  : language === "ku"
                  ? "ناوی نەخۆش"
                  : "Patient Name"}
              </span>
              <span className="text-rose-500 ms-1">*</span>
              <span className="text-[11px] font-normal text-slate-400 ms-2">
                (
                {language === "ar"
                  ? "اكتب للبحث عن مراجع مسجل أو أضف اسماً جديداً"
                  : language === "ku"
                  ? "بگەڕێ یان ناوی نوێ بنووسە"
                  : "Type to autocomplete existing or new"}
                )
              </span>
            </label>
            <div className="relative">
              <User className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                ref={inputRef}
                type="text"
                required
                autoFocus
                placeholder={
                  language === "ar"
                    ? "مثال: علي محمد حسن..."
                    : language === "ku"
                    ? "بۆ نموونە: عەلی محەمەد..."
                    : "e.g. Ali Mohammed..."
                }
                value={patientName}
                onChange={(e) => {
                  setPatientName(e.target.value);
                  setIsAutocompleteOpen(true);
                  if (error) setError(null);
                }}
                onFocus={() => {
                  if (suggestions.length > 0) setIsAutocompleteOpen(true);
                }}
                className="w-full ps-9.5 pe-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950 text-xs sm:text-sm font-medium text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
              />
            </div>

            {/* Suggestions Dropdown */}
            {isAutocompleteOpen && suggestions.length > 0 && (
              <div
                ref={dropdownRef}
                className="absolute z-20 start-0 end-0 mt-1.5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden divide-y divide-slate-100 dark:divide-slate-800 animate-in fade-in slide-in-from-top-1"
              >
                <div className="px-3 py-1.5 bg-slate-50 dark:bg-slate-950/60 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                  <span>
                    {language === "ar"
                      ? "مراجعون مسجلون سابقاً"
                      : language === "ku"
                      ? "نەخۆشە تۆمارکراوەکان"
                      : "Existing Registered Patients"}
                  </span>
                  <span className="text-sky-600 dark:text-sky-400">
                    {suggestions.length} {language === "ar" ? "مطابق" : "matches"}
                  </span>
                </div>
                {suggestions.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleSelectPatient(p)}
                    className="w-full px-3.5 py-2.5 text-start hover:bg-sky-50/70 dark:hover:bg-sky-950/30 flex items-center justify-between gap-2 transition-colors cursor-pointer group"
                  >
                    <div className="min-w-0">
                      <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-sky-600 dark:group-hover:text-sky-400 truncate">
                        {p.name}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono mt-0.5">
                        {p.phone && <span>📞 {p.phone}</span>}
                        {p.age && <span>• {p.age} y/o</span>}
                      </div>
                    </div>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-lg bg-sky-50 dark:bg-sky-950 text-sky-600 dark:text-sky-400 border border-sky-100 dark:border-sky-900 shrink-0">
                      {language === "ar" ? "اختيار" : "Select"}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 2. Phone Number */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              <span>
                {language === "ar"
                  ? "رقم الهاتف"
                  : language === "ku"
                  ? "ژمارەی مۆبایل"
                  : "Mobile Phone"}
              </span>
              <span className="text-rose-500 ms-1">*</span>
              <span className="text-[11px] font-normal text-emerald-600 dark:text-emerald-400 ms-2">
                (
                {language === "ar"
                  ? "للتذكير السريع عبر الواتساب"
                  : language === "ku"
                  ? "بۆ بیرخستنەوەی واتساپ"
                  : "For 1-click WhatsApp reminder"}
                )
              </span>
            </label>
            <div className="relative">
              <Phone className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="tel"
                required
                placeholder="0770 123 4567"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  if (error) setError(null);
                }}
                className="w-full ps-9.5 pe-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950 text-xs sm:text-sm font-mono text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
              />
            </div>
          </div>

          {/* 3. Date & Time Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
            {/* Date */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                {language === "ar" ? "تاريخ الموعد" : language === "ku" ? "بەرواری نۆرە" : "Date"}
              </label>
              <div className="space-y-2">
                {/* Quick Date Chips: Today & Tomorrow */}
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setDate(todayStr)}
                    className={`flex-1 py-1 px-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      date === todayStr
                        ? "bg-sky-50 dark:bg-sky-950/80 text-sky-700 dark:text-sky-300 border-sky-300 dark:border-sky-800 shadow-2xs"
                        : "bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-100"
                    }`}
                  >
                    {language === "ar" ? "اليوم" : language === "ku" ? "ئەمڕۆ" : "Today"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setDate(tomorrowStr)}
                    className={`flex-1 py-1 px-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      date === tomorrowStr
                        ? "bg-sky-50 dark:bg-sky-950/80 text-sky-700 dark:text-sky-300 border-sky-300 dark:border-sky-800 shadow-2xs"
                        : "bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-100"
                    }`}
                  >
                    {language === "ar" ? "غداً" : language === "ku" ? "سبەی" : "Tomorrow"}
                  </button>
                </div>

                {/* Calendar Popover */}
                <DatePickerPopover
                  value={date}
                  onChange={(d) => setDate(d)}
                  className="w-full"
                />
              </div>
            </div>

            {/* Time */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                {language === "ar" ? "الوقت" : language === "ku" ? "کاتژمێر" : "Time"}
              </label>
              <div className="space-y-2">
                {/* Analog Clock Trigger */}
                <TimeKeeperPicker
                  value={time}
                  onChange={(t) => setTime(t)}
                  className="w-full"
                />

                {/* Quick Time Presets */}
                <div className="flex flex-wrap gap-1" dir="ltr">
                  {TIME_CHIPS.map((chip) => (
                    <button
                      key={chip}
                      type="button"
                      dir="ltr"
                      onClick={() => setTime(chip)}
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer border tabular-nums ${
                        time === chip
                          ? "bg-sky-600 text-white border-sky-600 shadow-2xs"
                          : "bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-sky-300"
                      }`}
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 4. Reason / Procedure (Optional) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              <span>
                {language === "ar"
                  ? "سبب الزيارة / الإجراء (اختياري)"
                  : language === "ku"
                  ? "هۆکاری سەردان / چارەسەر (ئارەزوومەندانە)"
                  : "Reason / Procedure (Optional)"}
              </span>
            </label>

            {/* Quick tags */}
            <div className="flex flex-wrap gap-1.5 mb-2">
              {COMMON_REASONS.map((reason) => {
                const label =
                  language === "ar"
                    ? reason.ar
                    : language === "ku"
                    ? reason.ku
                    : reason.en;
                const isSelected = treatment === label;

                return (
                  <button
                    key={reason.id}
                    type="button"
                    onClick={() => handleToggleReason(label)}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                      isSelected
                        ? "bg-sky-500 text-white border-sky-500 shadow-2xs scale-[1.02]"
                        : "bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    <span>{label}</span>
                  </button>
                );
              })}
            </div>

            {/* Optional Custom Note */}
            <input
              type="text"
              placeholder={
                language === "ar"
                  ? "ملاحظات إضافية، شكوى المراجع أو رقم السن..."
                  : language === "ku"
                  ? "تێبینی زیاتر، کێشەی نەخۆش یان ژمارەی ددان..."
                  : "Additional notes or patient complaints..."
              }
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-2xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              {language === "ar" ? "إلغاء" : language === "ku" ? "پاشگەزبوونەوە" : "Cancel"}
            </button>

            <button
              type="submit"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl text-xs font-bold bg-sky-600 hover:bg-sky-700 text-white shadow-md shadow-sky-600/20 active:scale-95 transition-all cursor-pointer"
            >
              <CalendarCheck className="w-4 h-4 stroke-[2.5]" />
              <span>
                {language === "ar"
                  ? "تأكيد الحجز"
                  : language === "ku"
                  ? "پشتڕاستکردنەوەی نۆرە"
                  : "Confirm Booking"}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
