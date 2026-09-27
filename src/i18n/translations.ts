export type Language = "en" | "ar" | "ku";

export interface Translations {
  // Navigation & Header
  patients: string;
  appointments: string;
  materials: string;
  reports: string;
  addPatient: string;
  clinicPro: string;
  activeCloud: string;
  clinicSubtitle: string;
  signOut: string;
  signOutTooltip: string;

  // Stats
  totalPatients: string;
  totalIncome: string;
  materialSpend: string;
  clinicRent: string;
  netWorth: string;
  unpaidDebts: string;
  male: string;
  female: string;
  paidByPatients: string;
  expensesLogged: string;
  adjust: string;
  adjustMonthRent: string;
  incomeMinusExpenses: string;
  allSettled: string;
  patientOwes: string;
  patientsOwe: string;

  // Filter Toolbar
  searchPlaceholder: string;
  all: string;
  allFees: string;
  paid: string;
  debts: string;
  allMonths: string;
  newest: string;
  oldest: string;
  tableView: string;
  gridView: string;

  // Patient Card & Row
  visit: string;
  visits: string;
  date: string;
  time: string;
  setTime: string;
  paidLabel: string;
  owesLabel: string;
  fullyPaid: string;
  call: string;
  whatsApp: string;
  dentalChartBtn: string;
  teethCount: string;
  latest: string;
  noTreatmentHistory: string;
  markDebtPaid: string;

  // Login Screen
  clinicPortalTitle: string;
  clinicPortalSubtitle: string;
  doctorEmail: string;
  password: string;
  unlockDashboard: string;
  offlineCacheAccess: string;
  offlineCacheDesc: string;
  verifyingSession: string;

  // Modals & General
  save: string;
  cancel: string;
  close: string;
  clear: string;
  name: string;
  phone: string;
  age: string;
  gender: string;
  totalPrice: string;
  paidAmount: string;
  notes: string;
  actions: string;
  autoSaved: string;
  fdiOdontogram: string;
  workedTeeth: string;
}

export const translations: Record<Language, Translations> = {
  en: {
    // Navigation & Header
    patients: "Patients",
    appointments: "Appointments",
    materials: "Materials",
    reports: "Reports",
    addPatient: "Add Patient",
    clinicPro: "Clinic Pro",
    activeCloud: "Active Cloud",
    clinicSubtitle: "Dr. Qayssar Saleh • Clinic & Odontogram",
    signOut: "Sign out",
    signOutTooltip: "Log out from clinic system",

    // Stats
    totalPatients: "Patients",
    totalIncome: "Total Income",
    materialSpend: "Material Spend",
    clinicRent: "Clinic Rent",
    netWorth: "Net Worth",
    unpaidDebts: "Unpaid Debts",
    male: "Male",
    female: "Female",
    paidByPatients: "Paid by patients",
    expensesLogged: "expenses logged",
    adjust: "Adjust",
    adjustMonthRent: "Adjust month rent",
    incomeMinusExpenses: "Income - Expenses - Rent",
    allSettled: "All settled ✓",
    patientOwes: "patient owes",
    patientsOwe: "patients owe",

    // Filter Toolbar
    searchPlaceholder: "Search patient name, procedure, tooth, phone...",
    all: "All",
    allFees: "All Fees",
    paid: "Paid",
    debts: "Debts",
    allMonths: "All Months",
    newest: "Newest",
    oldest: "Oldest",
    tableView: "Table view",
    gridView: "Card grid view",

    // Patient Card & Row
    visit: "visit",
    visits: "visits",
    date: "Date",
    time: "Time (Clock)",
    setTime: "Set Time 🕒",
    paidLabel: "Paid",
    owesLabel: "Owes",
    fullyPaid: "Fully Paid",
    call: "Call",
    whatsApp: "WhatsApp",
    dentalChartBtn: "3D Dental Chart",
    teethCount: "teeth",
    latest: "Latest",
    noTreatmentHistory: "No prior clinical history recorded",
    markDebtPaid: "Paid ✓",

    // Login Screen
    clinicPortalTitle: "Dr. Qayssar Dental",
    clinicPortalSubtitle: "Private Clinical Management & Odontogram Suite",
    doctorEmail: "Doctor Email",
    password: "Password",
    unlockDashboard: "Unlock Clinic Dashboard",
    offlineCacheAccess: "Enter Clinic Workspace (Offline Cache)",
    offlineCacheDesc: "Protected by Row-Level Security • Dr. Qayssar Saleh Clinic",
    verifyingSession: "Verifying clinic session...",

    // Modals & General
    save: "Save",
    cancel: "Cancel",
    close: "Close",
    clear: "Clear",
    name: "Patient Name",
    phone: "Phone Number",
    age: "Age",
    gender: "Gender Identification",
    totalPrice: "Total Treatment Fee",
    paidAmount: "Paid Amount",
    notes: "Clinical Notes & Diagnosis",
    actions: "Actions",
    autoSaved: "Auto-saved",
    fdiOdontogram: "FDI Odontogram",
    workedTeeth: "Worked",
  },

  ar: {
    // Navigation & Header
    patients: "المرضى",
    appointments: "المواعيد",
    materials: "المواد والمصاريف",
    reports: "التقارير المالية",
    addPatient: "إضافة مريض",
    clinicPro: "عيادة احترافية",
    activeCloud: "متصل سحابياً",
    clinicSubtitle: "د. قيصر صالح • إدارة العيادة ومخطط الأسنان",
    signOut: "تسجيل الخروج",
    signOutTooltip: "تسجيل الخروج من نظام العيادة",

    // Stats
    totalPatients: "المرضى",
    totalIncome: "إجمالي المقبوض",
    materialSpend: "مصاريف المواد",
    clinicRent: "إيجار العيادة",
    netWorth: "صافي الأرباح",
    unpaidDebts: "الديون المتبقية",
    male: "ذكر",
    female: "أنثى",
    paidByPatients: "مقبوض من المرضى",
    expensesLogged: "فواتير مسجلة",
    adjust: "تعديل",
    adjustMonthRent: "تعديل إيجار الشهر",
    incomeMinusExpenses: "المقبوض − المصاريف − الإيجار",
    allSettled: "مسدد بالكامل ✓",
    patientOwes: "مريض عليه دين",
    patientsOwe: "مرضى عليهم ديون",

    // Filter Toolbar
    searchPlaceholder: "ابحث عن اسم المريض، الإجراء، السن، الهاتف...",
    all: "الكل",
    allFees: "كل المبالغ",
    paid: "مسدد",
    debts: "ديون",
    allMonths: "كل الأشهر",
    newest: "الأحدث",
    oldest: "الأقدم",
    tableView: "عرض جدول",
    gridView: "عرض كروت",

    // Patient Card & Row
    visit: "زيارة",
    visits: "زيارات",
    date: "التاريخ",
    time: "الوقت (الساعة)",
    setTime: "تحديد الوقت 🕒",
    paidLabel: "المدفوع",
    owesLabel: "متبقي",
    fullyPaid: "تم الدفع بالكامل",
    call: "اتصال",
    whatsApp: "واتساب",
    dentalChartBtn: "مخطط الأسنان 3D",
    teethCount: "أسنان",
    latest: "الأحدث",
    noTreatmentHistory: "لا توجد زيارات علاجية مسجلة",
    markDebtPaid: "تسديد ✓",

    // Login Screen
    clinicPortalTitle: "عيادة د. قيصر للأسنان",
    clinicPortalSubtitle: "النظام الإلكتروني الخاص بإدارة العيادة والأسنان",
    doctorEmail: "بريد الطبيب",
    password: "كلمة المرور",
    unlockDashboard: "دخول نظام العيادة",
    offlineCacheAccess: "الدخول ببيانات العيادة المحفوظة (بدون إنترنت)",
    offlineCacheDesc: "محمي بنظام أمان البيانات • عيادة د. قيصر صالح",
    verifyingSession: "جاري التحقق من جلسة العيادة...",

    // Modals & General
    save: "حفظ",
    cancel: "إلغاء",
    close: "إغلاق",
    clear: "مسح",
    name: "اسم المريض",
    phone: "رقم الهاتف",
    age: "العمر",
    gender: "الجنس",
    totalPrice: "كلفة العلاج الكلية",
    paidAmount: "المبلغ المدفوع",
    notes: "الملاحظات والتشخيص",
    actions: "الإجراءات",
    autoSaved: "حفظ تلقائي",
    fdiOdontogram: "مخطط FDI",
    workedTeeth: "معالجة",
  },

  ku: {
    // Navigation & Header
    patients: "نەخۆشەکان",
    appointments: "مەوعیدەکان",
    materials: "مەواد و خەرجی",
    reports: "ڕاپۆرتەکان",
    addPatient: "نەخۆشی نوێ",
    clinicPro: "نۆرینگەی تایبەت",
    activeCloud: "کلاودی چالاک",
    clinicSubtitle: "د. قەیسەر ساڵح • نۆرینگەی ددان و چارەسەر",
    signOut: "دەرچوون",
    signOutTooltip: "دەرچوون لە سیستەمی نۆرینگە",

    // Stats
    totalPatients: "نەخۆشەکان",
    totalIncome: "کۆی داهات",
    materialSpend: "خەرجی مەواد",
    clinicRent: "کرێی نۆرینگە",
    netWorth: "قازانجی سافی",
    unpaidDebts: "قەرزی ماوە",
    male: "نێر",
    female: "مێ",
    paidByPatients: "دراوە لەلایەن نەخۆشەوە",
    expensesLogged: "خەرجی تۆمارکراو",
    adjust: "دەستکاری",
    adjustMonthRent: "دەستکاری کرێی مانگ",
    incomeMinusExpenses: "داهات − خەرجی − کرێ",
    allSettled: "هەمووی دراوە ✓",
    patientOwes: "نەخۆش قەرزی ماوە",
    patientsOwe: "نەخۆش قەرزیان ماوە",

    // Filter Toolbar
    searchPlaceholder: "گەڕان بەپێی ناوی نەخۆش، چارەسەر، ددان، مۆبایل...",
    all: "هەمووی",
    allFees: "هەموو بڕەکان",
    paid: "دراوە",
    debts: "قەرزەکان",
    allMonths: "هەموو مانگەکان",
    newest: "نوێترین",
    oldest: "کۆنترین",
    tableView: "شێوازی خشتە",
    gridView: "شێوازی کارت",

    // Patient Card & Row
    visit: "سەردان",
    visits: "سەردان",
    date: "بەروار",
    time: "کاتژمێر",
    setTime: "دیاریکردنی کات 🕒",
    paidLabel: "دراوە",
    owesLabel: "ماوە",
    fullyPaid: "تەواوی پارەکە دراوە",
    call: "پەیوەندی",
    whatsApp: "واتسئاپ",
    dentalChartBtn: "خشتەی ددان 3D",
    teethCount: "ددان",
    latest: "نوێترین",
    noTreatmentHistory: "هیچ چارەسەرێکی پێشوو تۆمار نەکراوە",
    markDebtPaid: "دانەوە ✓",

    // Login Screen
    clinicPortalTitle: "نۆرینگەی ددانی د. قەیسەر",
    clinicPortalSubtitle: "سیستەمی پێشکەوتووی بەڕێوەبردنی نۆرینگە و چارەسەری ددان",
    doctorEmail: "ئیمەیڵی دکتۆر",
    password: "وشەی نهێنی",
    unlockDashboard: "چوونەژوورەوە بۆ نۆرینگە",
    offlineCacheAccess: "چوونەژوورەوە بە کاشی نۆرینگە (بێ ئینتەرنێت)",
    offlineCacheDesc: "پارێزراوە بە سیستەمی پاراستن • نۆرینگەی د. قەیسەر ساڵح",
    verifyingSession: "پشکنینی هەژماری نۆرینگە...",

    // Modals & General
    save: "پاشەکەوتکردن",
    cancel: "پاشگەزبوونەوە",
    close: "داخستن",
    clear: "سڕینەوە",
    name: "ناوی نەخۆش",
    phone: "ژمارەی مۆبایل",
    age: "تەمەن",
    gender: "ڕەگەز",
    totalPrice: "کۆی نرخی چارەسەر",
    paidAmount: "بڕی دراو",
    notes: "تێبینی و دەستنیشانکردنی پزیشکی",
    actions: "کردارەکان",
    autoSaved: "خۆکار پاشەکەوتکراو",
    fdiOdontogram: "خشتەی FDI",
    workedTeeth: "چارەسەرکراو",
  },
};
