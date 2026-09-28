export type Language = "en" | "ar" | "ku";

export interface Translations {
  // Navigation & Header
  patients: string;
  appointments: string;
  materials: string;
  reports: string;
  tabPatients: string;
  tabAppointments: string;
  tabMaterials: string;
  tabReports: string;
  monthlyReports: string;
  addPatient: string;
  clinicPro: string;
  activeCloud: string;
  clinicSubtitle: string;
  signOut: string;
  signOutTooltip: string;
  autoBookAppointment: string;
  bookPatientCase: string;

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
  edit: string;
  delete: string;
  autoSaved: string;
  fdiOdontogram: string;
  workedTeeth: string;

  // Add / Edit Patient Modal & Forms
  recordPaidAndDebt: string;
  patientCase: string;
  namePlaceholder: string;
  agePlaceholder: string;
  phonePlaceholder: string;
  betterCalendar: string;
  circleClock: string;
  clockBtn: string;
  timePlaceholder: string;
  notesPlaceholder: string;
  medicalHistoryTitle: string;
  medicalHistoryOptional: string;
  medicalHistoryPlaceholder: string;
  openTeethChart: string;
  editTeethChart: string;
  hideTeethChart: string;
  teethChartSubtext: string;
  editPatient: string;
  totalTreatmentPrice: string;
  amountPaidToday: string;
  paidInFullBtn: string;
  unpaidBtn: string;
  remainingDebt: string;
  autoCalculated: string;
  manualDebtOverride: string;
  syncedFromDentalChart: string;
  noRemainingDebt: string;

  // Patient History & Treatments Modal
  patientHistoryAndTreatments: string;
  entry: string;
  entries: string;
  totalVisitsCount: string;
  supabaseLive: string;
  addEntry: string;
  newVisitRecord: string;
  savesToSupabase: string;
  visitDate: string;
  procedureTitle: string;
  procedurePlaceholder: string;
  paidIQD: string;
  debtIQD: string;
  clinicalNotesAndDetails: string;
  clinicalNotesPlaceholder: string;
  saveVisitRecord: string;
  saving: string;
  editVisitRecord: string;
  updateVisitRecord: string;
  deleteVisitConfirm: string;
  medicalAlert: string;
  storedInSupabase: string;

  // Dental Chart & Odontogram Modal
  chartAndSelect: string;
  erase: string;
  quadrants: string;
  selectAnatomicalGroup: string;
  selectAllTeeth: string;
  multiSelect: string;
  deselect: string;
  condition: string;
  material: string;
  procedurePricing: string;
  chooseMaterial: string;
  feeIQD: string;
  clinicalNoteForTooth: string;
  remove: string;
  done: string;
  totalDentalFee: string;
  syncToBill: string;
  syncedToBill: string;
  doneAndClose: string;
  storedInstantly: string;
  fitScreen: string;
  zoom150: string;
  tapToothToMark: string;
  chartedTreatmentsAndFees: string;

  // Materials & Expenses View
  materialsSubtitle: string;
  totalMaterialSpendCard: string;
  totalSpendSubtitle: string;
  totalPurchases: string;
  records: string;
  supplierReceiptsLogged: string;
  clinicNetWorthImpact: string;
  netWorthImpactDesc: string;
  searchMaterials: string;
  supplierMaterialCol: string;
  totalMoneySpentCol: string;
  addMaterialExpense: string;
  editMaterialExpense: string;
  addMaterialDesc: string;
  editMaterialDesc: string;
  purchaseDate: string;
  supplierMaterialName: string;
  supplierPlaceholder: string;
  totalMoneySpent: string;
  addPatientsOrExpensesToView: string;
  totalExpenses: string;
  netProfit: string;
  category: string;
  categoryMaterials: string;
  categoryRent: string;
  categoryUtilities: string;
  categoryLab: string;
  categoryOther: string;

  // Appointments View
  scheduleSubtitle: string;
  booked: string;
  scheduled: string;
  doneStatus: string;
  today: string;
  directBookToday: string;
  addAppointment: string;
  quickClinicTimes: string;
  clearTime: string;
  setTimeBtn: string;
  chooseTime: string;
  touchClockFace: string;
  chooseDate: string;
  resetToToday: string;
  clearDate: string;
  setDateBtn: string;

  // Localized placeholders, examples, and chips
  quickSelect: string;
  appointmentReasonPlaceholder: string;
  appointmentNotesPlaceholder: string;
  commonConsultation: string;
  commonCleaning: string;
  commonFilling: string;
  commonRootCanal: string;
  customMaterialPlaceholder: string;
  moneyPlaceholder: string;
  rentPlaceholder: string;

  // Monthly Rent Modal
  monthlyClinicRent: string;
  adjustRentSubtitle: string;
  selectMonthAndAmount: string;
  currentRent: string;
  clinicMonth: string;
  rentPaidIQD: string;
  quickPreset: string;
  saveRent: string;
  removeRent: string;
  recordedMonthsHistory: string;
  allTimeRentTotal: string;
  noRentRecorded: string;

  // Roles & Permissions
  roleDoctor: string;
  roleSecretary: string;
  roleDoctorBadge: string;
  roleSecretaryBadge: string;
  roleDoctorDesc: string;
  roleSecretaryDesc: string;
  switchRolePreview: string;
  receptionistTitle: string;
  doctorTitle: string;

  // Staff & Clinic Settings
  manageStaff: string;
  addSecretary: string;
  secretaryName: string;
  secretaryEmail: string;
  secretaryPassword: string;
  createSecretaryAccount: string;
  activeStaff: string;
  noStaffYet: string;
  secretaryCreatedSuccess: string;
  clinicSettings: string;
  clinicName: string;
  doctorName: string;
  clinicPhone: string;
  clinicAddress: string;
  settingsSaved: string;
  editClinicProfile: string;

  // Undo Delete
  undo: string;
  patientDeleted: string;
  patientRestored: string;

  // Set Password & Recovery
  setPasswordTitle: string;
  setPasswordSubtitle: string;
  newPassword: string;
  confirmPassword: string;
  savePassword: string;
  passwordsDoNotMatch: string;
  passwordUpdatedSuccess: string;

  // Printing & Prescriptions
  printReceipt: string;
  printPrescription: string;
  prescription: string;
  receipt: string;
  officialReceipt: string;
  medication: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
  addMedication: string;
  quickPresets: string;
  doctorSignature: string;
  diagnosis: string;
  thankYouClinic: string;
  printNow: string;
  allergiesAlert: string;

  // Database Import & Export
  importDatabase: string;
  importDatabaseDesc: string;
  exportDatabase: string;
  exportDatabaseDesc: string;
  downloadCsvTemplate: string;
  uploadCsvFile: string;
  dragDropCsv: string;
  browseFile: string;
  previewImportData: string;
  confirmImport: string;
  importingPatients: string;
  importSuccess: string;
  noFileSelected: string;
  patientsFoundInCsv: string;
}

export const translations: Record<Language, Translations> = {
  en: {
    // Navigation & Header
    patients: "Patients",
    appointments: "Appointments",
    materials: "Expenses",
    reports: "Financial Reports",
    tabPatients: "Patients",
    tabAppointments: "Appointments",
    tabMaterials: "Expenses",
    tabReports: "Reports",
    monthlyReports: "Monthly Financial Reports",
    addPatient: "Add Patient",
    clinicPro: "Clinic Pro",
    activeCloud: "Active Cloud",
    clinicSubtitle: "Clinic & Odontogram Suite",
    autoBookAppointment: "Auto-schedule in appointments calendar",
    bookPatientCase: "Add & Book Patient Case",
    signOut: "Sign out",
    signOutTooltip: "Log out from clinic system",

    // Stats
    totalPatients: "Patients",
    totalIncome: "Total Income",
    materialSpend: "Total Expenses",
    clinicRent: "Clinic Rent",
    netWorth: "Net Profit",
    unpaidDebts: "Unpaid Debts",
    male: "Male",
    female: "Female",
    paidByPatients: "Paid by patients",
    expensesLogged: "expenses logged",
    adjust: "Adjust",
    adjustMonthRent: "Adjust month rent",
    incomeMinusExpenses: "Total Income - Total Expenses",
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
    clinicPortalTitle: "Dental Clinic Portal",
    clinicPortalSubtitle: "Private Clinical Management & Odontogram Suite",
    doctorEmail: "Doctor Email",
    password: "Password",
    unlockDashboard: "Unlock Clinic Dashboard",
    offlineCacheAccess: "Enter Clinic Workspace (Offline Cache)",
    offlineCacheDesc: "Protected by Row-Level Security • Clinic Cloud System",
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
    edit: "Edit",
    delete: "Delete",
    autoSaved: "Auto-saved",
    fdiOdontogram: "FDI Odontogram",
    workedTeeth: "Worked",

    // Add / Edit Patient Modal
    recordPaidAndDebt: "Record paid amount & outstanding debt",
    patientCase: "Patient case",
    namePlaceholder: "e.g. John Doe, Sarah Jenkins",
    agePlaceholder: "e.g. 32",
    phonePlaceholder: "e.g. 0770 123 4567",
    betterCalendar: "Better Calendar 📅",
    circleClock: "Circle Clock 🕒",
    clockBtn: "Clock",
    timePlaceholder: "e.g. 10:30 AM",
    notesPlaceholder: "e.g. Routine checkup, ECG normal, prescribed amoxicillin...",
    medicalHistoryTitle: "Past Medical History / Allergies",
    medicalHistoryOptional: "(optional)",
    medicalHistoryPlaceholder: "e.g. Hypertension (Stage 1), Penicillin allergy, Type 2 diabetes...",
    openTeethChart: "+ Open Teeth Chart",
    editTeethChart: "Edit Teeth Chart",
    hideTeethChart: "Hide Teeth Chart",
    teethChartSubtext: "Mark treated teeth, fillings, root canals, or extractions for this case",
    editPatient: "Edit Patient Case",
    totalTreatmentPrice: "Total Treatment Fee",
    amountPaidToday: "Amount Paid Today",
    paidInFullBtn: "⚡ Paid in Full",
    unpaidBtn: "Unpaid (0)",
    remainingDebt: "Remaining Debt",
    autoCalculated: "Auto-calculated",
    manualDebtOverride: "Custom Debt Override",
    syncedFromDentalChart: "Synced from Dental Chart",
    noRemainingDebt: "Fully Settled (No Debt)",

    // Patient History & Treatments Modal
    patientHistoryAndTreatments: "Patient History & Treatments",
    entry: "entry",
    entries: "entries",
    totalVisitsCount: "Total Visits",
    supabaseLive: "Supabase Live",
    addEntry: "Add Entry",
    newVisitRecord: "New Visit / Treatment Record",
    savesToSupabase: "Saves to Supabase",
    visitDate: "Visit Date *",
    procedureTitle: "Title / Procedure *",
    procedurePlaceholder: "e.g. Root Canal, Filling, Scaling, Extraction",
    paidIQD: "Paid (IQD)",
    debtIQD: "Remaining Debt (IQD)",
    clinicalNotesAndDetails: "Clinical Notes & Treatment Details",
    clinicalNotesPlaceholder: "Describe procedure details, materials used, patient reactions, prescribed drugs...",
    saveVisitRecord: "Save Visit Record",
    saving: "Saving...",
    editVisitRecord: "Edit Visit Record",
    updateVisitRecord: "Update Visit Record",
    deleteVisitConfirm: "Delete this visit record?",
    medicalAlert: "Medical Alert",
    storedInSupabase: "Stored in Supabase Cloud Database",

    // Dental Chart & Odontogram Modal
    chartAndSelect: "Chart & Select",
    erase: "Erase",
    quadrants: "Quadrants",
    selectAnatomicalGroup: "Select Anatomical Group",
    selectAllTeeth: "Select All (32 Teeth)",
    multiSelect: "Multi-Select",
    deselect: "Deselect",
    condition: "Condition",
    material: "Material",
    procedurePricing: "Procedure Pricing",
    chooseMaterial: "Choose Material...",
    feeIQD: "Fee (IQD)",
    clinicalNoteForTooth: "Clinical note / diagnosis for Tooth",
    remove: "Remove",
    done: "Done",
    totalDentalFee: "Total Dental Fee:",
    syncToBill: "Sync to Patient Bill",
    syncedToBill: "✓ Synced to Bill!",
    doneAndClose: "Done & Close",
    storedInstantly: "Stored Instantly",
    fitScreen: "Fit Screen",
    zoom150: "Zoom 150%",
    tapToothToMark: "Tap any tooth crown to mark",
    chartedTreatmentsAndFees: "Charted Treatments & Fees",

    // Materials & Expenses View
    materialsSubtitle: "Track clinic purchases, bills, rents, and laboratory fees",
    totalMaterialSpendCard: "Total Expenses",
    totalSpendSubtitle: "All clinic expenses combined",
    totalPurchases: "Total Expenses",
    records: "records",
    supplierReceiptsLogged: "Expense receipts logged",
    clinicNetWorthImpact: "Clinic Net Profit Impact",
    netWorthImpactDesc: "Every expense is automatically deducted from patient income to calculate your live Net Profit on the Dashboard.",
    searchMaterials: "Search by description, payee, or date...",
    supplierMaterialCol: "Description / Payee",
    totalMoneySpentCol: "Amount (IQD)",
    addMaterialExpense: "Add Expense",
    editMaterialExpense: "Edit Expense",
    addMaterialDesc: "Add a clinic expense receipt or bill",
    editMaterialDesc: "Update expense details",
    purchaseDate: "1. Date *",
    supplierMaterialName: "2. Description / Payee *",
    supplierPlaceholder: "e.g. Composite, Clinic Rent, Electricity, Lab fees...",
    totalMoneySpent: "3. Amount (IQD) *",
    addPatientsOrExpensesToView: "Add patients or expenses to view monthly reports.",
    totalExpenses: "Total Expenses",
    netProfit: "Net Profit",
    category: "Category",
    categoryMaterials: "Dental Materials",
    categoryRent: "Clinic Rent",
    categoryUtilities: "Bills & Utilities",
    categoryLab: "Dental Lab",
    categoryOther: "Other",

    // Appointments View
    scheduleSubtitle: "Interactive Full Month Schedule • Click any day to book",
    booked: "Booked",
    scheduled: "Scheduled",
    doneStatus: "Done",
    today: "Today",
    directBookToday: "Direct Book Today",
    addAppointment: "Add Appointment",
    quickClinicTimes: "Quick Clinic Times",
    clearTime: "Clear Time",
    setTimeBtn: "Set Time",
    chooseTime: "Choose Time",
    touchClockFace: "Touch clock face to set hours & minutes",
    chooseDate: "Choose Date",
    resetToToday: "Reset to Today",
    clearDate: "Clear Date",
    setDateBtn: "Set Date",

    // Localized placeholders, examples, and chips
    quickSelect: "Quick select:",
    appointmentReasonPlaceholder: "e.g. Tooth #46 Root canal or Routine checkup",
    appointmentNotesPlaceholder: "e.g. Patient mentioned sensitivity, prepare local anaesthesia...",
    commonConsultation: "General Consultation",
    commonCleaning: "Routine Dental Cleaning",
    commonFilling: "Composite Filling",
    commonRootCanal: "Root Canal Therapy",
    customMaterialPlaceholder: "e.g. Composite, Zirconia...",
    moneyPlaceholder: "e.g. 95,000",
    rentPlaceholder: "e.g. 500,000",

    // Monthly Rent Modal
    monthlyClinicRent: "Monthly Clinic Rent",
    adjustRentSubtitle: "Adjust variable rent paid for each clinic month",
    selectMonthAndAmount: "Select Month & Amount",
    currentRent: "Current",
    clinicMonth: "Clinic Month",
    rentPaidIQD: "Rent Paid (IQD)",
    quickPreset: "Quick:",
    saveRent: "Save Rent",
    removeRent: "Remove Rent",
    recordedMonthsHistory: "Recorded Rent History",
    allTimeRentTotal: "All-Time Rent Total",
    noRentRecorded: "No monthly rent recorded yet",

    // Roles & Permissions
    roleDoctor: "Doctor",
    roleSecretary: "Receptionist",
    roleDoctorBadge: "Doctor / دکتۆر",
    roleSecretaryBadge: "Receptionist / سکرتێر",
    roleDoctorDesc: "Full administrative & financial access",
    roleSecretaryDesc: "Appointments & patient admissions",
    switchRolePreview: "Role Preview",
    receptionistTitle: "Reception Desk",
    doctorTitle: "Doctor / Clinic Admin",

    // Staff & Clinic Settings
    manageStaff: "Manage Staff",
    addSecretary: "Add Secretary",
    secretaryName: "Secretary Name",
    secretaryEmail: "Secretary Email",
    secretaryPassword: "Password",
    createSecretaryAccount: "Create Account in Supabase",
    activeStaff: "Active Receptionists",
    noStaffYet: "No secretaries added yet",
    secretaryCreatedSuccess: "Secretary account created successfully! They can now log in.",
    clinicSettings: "Clinic Settings",
    clinicName: "Clinic Name",
    doctorName: "Doctor Name",
    clinicPhone: "Clinic Phone",
    clinicAddress: "Clinic Address",
    settingsSaved: "Settings saved successfully",
    editClinicProfile: "Edit Clinic Profile",

    // Undo Delete
    undo: "Undo",
    patientDeleted: "Patient record deleted",
    patientRestored: "Patient record restored successfully",

    // Set Password & Recovery
    setPasswordTitle: "Create Your Password",
    setPasswordSubtitle: "Enter a secure password to access your clinic account.",
    newPassword: "New Password",
    confirmPassword: "Confirm Password",
    savePassword: "Save Password & Continue",
    passwordsDoNotMatch: "Passwords do not match.",
    passwordUpdatedSuccess: "Password saved successfully! You can now log in anytime.",

    // Printing & Prescriptions
    printReceipt: "Print Receipt",
    printPrescription: "Print Prescription",
    prescription: "Dental Prescription",
    receipt: "Patient Receipt",
    officialReceipt: "Official Patient Receipt",
    medication: "Medication / Drug",
    dosage: "Dosage",
    frequency: "Frequency",
    duration: "Duration",
    instructions: "Instructions",
    addMedication: "Add Medication",
    quickPresets: "Dental Presets",
    doctorSignature: "Doctor's Signature & Stamp",
    diagnosis: "Diagnosis / Treatment",
    thankYouClinic: "Thank you for trusting our clinic with your dental care.",
    printNow: "Print Document",
    allergiesAlert: "Allergies / Medical Alert",

    // Database Import & Export
    importDatabase: "Import Database (CSV)",
    importDatabaseDesc: "Upload your existing patients list from a CSV file into the clinic",
    exportDatabase: "Export Database (CSV)",
    exportDatabaseDesc: "Download a full backup of all patients in CSV format",
    downloadCsvTemplate: "Download Sample Template (.CSV)",
    uploadCsvFile: "Upload CSV File",
    dragDropCsv: "Drag & drop your CSV file here, or click to browse",
    browseFile: "Browse File",
    previewImportData: "Preview Patients to Import",
    confirmImport: "Import Patients into Clinic",
    importingPatients: "Importing patients into cloud...",
    importSuccess: "Database imported successfully!",
    noFileSelected: "Please select a CSV file first.",
    patientsFoundInCsv: "patients detected in file",
  },

  ar: {
    // Navigation & Header
    patients: "المرضى",
    appointments: "المواعيد",
    materials: "المصروفات",
    reports: "التقارير المالية",
    tabPatients: "المرضى",
    tabAppointments: "المواعيد",
    tabMaterials: "المصروفات",
    tabReports: "التقارير",
    monthlyReports: "التقارير المالية الشهرية",
    addPatient: "إضافة مريض",
    clinicPro: "عيادة احترافية",
    activeCloud: "متصل سحابياً",
    clinicSubtitle: "نظام إدارة العيادة ومخطط الأسنان",
    autoBookAppointment: "حجز موعد في جدول المواعيد تلقائياً",
    bookPatientCase: "إضافة وحجز ملف مريض",
    signOut: "تسجيل الخروج",
    signOutTooltip: "تسجيل الخروج من نظام العيادة",

    // Stats
    totalPatients: "المرضى",
    totalIncome: "إجمالي المقبوض",
    materialSpend: "إجمالي المصاريف",
    clinicRent: "إيجار العيادة",
    netWorth: "صافي الأرباح",
    unpaidDebts: "الديون المتبقية",
    male: "ذكر",
    female: "أنثى",
    paidByPatients: "مقبوض من المرضى",
    expensesLogged: "فواتير مسجلة",
    adjust: "تعديل",
    adjustMonthRent: "تعديل إيجار الشهر",
    incomeMinusExpenses: "إجمالي المقبوض − إجمالي المصاريف",
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
    clinicPortalTitle: "بوابة عيادة الأسنان",
    clinicPortalSubtitle: "النظام الإلكتروني الخاص بإدارة العيادة والأسنان",
    doctorEmail: "بريد الطبيب",
    password: "كلمة المرور",
    unlockDashboard: "دخول نظام العيادة",
    offlineCacheAccess: "الدخول ببيانات العيادة المحفوظة (بدون إنترنت)",
    offlineCacheDesc: "محمي بنظام أمان البيانات • نظام العيادة السحابي",
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
    edit: "تعديل",
    delete: "حذف",
    autoSaved: "حفظ تلقائي",
    fdiOdontogram: "مخطط FDI",
    workedTeeth: "معالجة",

    // Add / Edit Patient Modal
    recordPaidAndDebt: "تسجيل المبلغ المدفوع والديون المتبقية",
    patientCase: "حالة المريض",
    namePlaceholder: "مثال: محمد علي، سارة أحمد...",
    agePlaceholder: "مثال: 32",
    phonePlaceholder: "مثال: 0770 123 4567",
    betterCalendar: "تقويم متطور 📅",
    circleClock: "ساعة دائرية 🕒",
    clockBtn: "الساعة",
    timePlaceholder: "مثال: 10:30 صباحاً",
    notesPlaceholder: "مثال: فحص دوري، تخطيط قلب سليم، وصف أموكسيسيلين...",
    medicalHistoryTitle: "التاريخ المرضي السابق / الحساسية",
    medicalHistoryOptional: "(اختياري)",
    medicalHistoryPlaceholder: "مثال: ضغط الدم، حساسية البنسلين، داء السكري...",
    openTeethChart: "+ فتح مخطط الأسنان",
    editTeethChart: "تعديل مخطط الأسنان",
    hideTeethChart: "إخفاء مخطط الأسنان",
    teethChartSubtext: "تحديد الأسنان المعالجة، الحشوات، علاج الجذور، أو القلع لهذه الحالة",
    editPatient: "تعديل بيانات المريض",
    totalTreatmentPrice: "كلفة العلاج الإجمالية",
    amountPaidToday: "المبلغ المدفوع اليوم",
    paidInFullBtn: "⚡ دفع بالكامل",
    unpaidBtn: "لم يدفع (0)",
    remainingDebt: "المتبقي بذمته (الدين)",
    autoCalculated: "محسوب تلقائياً",
    manualDebtOverride: "تعديل يدوي للمتبقي",
    syncedFromDentalChart: "مربوط بمخطط الأسنان",
    noRemainingDebt: "تم التسديد بالكامل (لا ديون)",

    // Patient History & Treatments Modal
    patientHistoryAndTreatments: "السجل العلاجي والزيارات",
    entry: "زيارة",
    entries: "زيارات",
    totalVisitsCount: "إجمالي الزيارات",
    supabaseLive: "سحابي مباشر",
    addEntry: "+ إضافة زيارة",
    newVisitRecord: "تسجيل زيارة / علاج جديد",
    savesToSupabase: "حفظ مباشر في السحابة",
    visitDate: "تاريخ الزيارة *",
    procedureTitle: "عنوان الإجراء / العلاج *",
    procedurePlaceholder: "مثال: سحب عصب، حشوة، تنظيف وتلميع، قلع",
    paidIQD: "المدفوع (د.ع)",
    debtIQD: "الدين المتبقي (د.ع)",
    clinicalNotesAndDetails: "الملاحظات السريرية وتفاصيل العلاج",
    clinicalNotesPlaceholder: "اكتب تفاصيل الإجراء، المواد المستخدمة، رد فعل المريض، الأدوية الموصوفة...",
    saveVisitRecord: "حفظ سجل الزيارة",
    saving: "جاري الحفظ...",
    editVisitRecord: "تعديل سجل الزيارة",
    updateVisitRecord: "تحديث السجل",
    deleteVisitConfirm: "هل أنت متأكد من حذف هذه الزيارة؟",
    medicalAlert: "تنبيه طبي",
    storedInSupabase: "محفوظ في قاعدة بيانات العيادة السحابية",

    // Dental Chart & Odontogram Modal
    chartAndSelect: "تحديد ومعاينة",
    erase: "ممحاة",
    quadrants: "الأرباع",
    selectAnatomicalGroup: "اختر المجموعة التشريحية",
    selectAllTeeth: "تحديد الكل (32 سناً)",
    multiSelect: "تحديد متعدد",
    deselect: "إلغاء التحديد",
    condition: "الحالة / الإجراء",
    material: "المادة",
    procedurePricing: "تسعير الإجراء",
    chooseMaterial: "اختر المادة...",
    feeIQD: "السعر (د.ع)",
    clinicalNoteForTooth: "ملاحظة سريرية / تشخيص للسن",
    remove: "حذف",
    done: "تم",
    totalDentalFee: "إجمالي كلفة الأسنان:",
    syncToBill: "تحديث فاتورة المريض",
    syncedToBill: "✓ تم التحديث بنجاح!",
    doneAndClose: "تم وإغلاق",
    storedInstantly: "محفوظ فوراً",
    fitScreen: "ملء الشاشة",
    zoom150: "تكبير 150%",
    tapToothToMark: "اضغط على تاج السن للبدء",
    chartedTreatmentsAndFees: "العلاجات والأسعار المسجلة",

    // Materials & Expenses View
    materialsSubtitle: "متابعة مصاريف العيادة، الإيجار، الفواتير، ومختبر الأسنان",
    totalMaterialSpendCard: "إجمالي المصاريف",
    totalSpendSubtitle: "جميع مصاريف العيادة مجمعة",
    totalPurchases: "إجمالي المصاريف",
    records: "سجلات",
    supplierReceiptsLogged: "وصولات وفواتير مسجلة",
    clinicNetWorthImpact: "تأثير المصاريف على صافي الأرباح",
    netWorthImpactDesc: "تخصم جميع المصاريف تلقائياً من دخل المرضى لحساب صافي الأرباح المباشر في لوحة التحكم.",
    searchMaterials: "ابحث بالوصف أو الجهة أو التاريخ...",
    supplierMaterialCol: "الوصف / الجهة",
    totalMoneySpentCol: "المبلغ (د.ع)",
    addMaterialExpense: "إضافة مصروف",
    editMaterialExpense: "تعديل المصروف",
    addMaterialDesc: "إضافة فاتورة أو وصل مصروفات للعيادة",
    editMaterialDesc: "تعديل بيانات المصروف",
    purchaseDate: "1. التاريخ *",
    supplierMaterialName: "2. الوصف / الجهة المستلمة *",
    supplierPlaceholder: "مثال: مواد أسنان، إيجار، كهرباء، مختبر...",
    totalMoneySpent: "3. المبلغ المنفق (د.ع) *",
    addPatientsOrExpensesToView: "أضف مرضى أو مصاريف لعرض التقارير الشهرية.",
    totalExpenses: "إجمالي المصاريف",
    netProfit: "صافي الأرباح",
    category: "الفئة",
    categoryMaterials: "مواد الأسنان",
    categoryRent: "إيجار العيادة",
    categoryUtilities: "الفواتير والخدمات",
    categoryLab: "مختبر الأسنان",
    categoryOther: "أخرى",

    // Appointments View
    scheduleSubtitle: "جدول المواعيد الشهري التفاعلي • اضغط على أي يوم للحجز",
    booked: "محجوز",
    scheduled: "قيد الانتظار",
    doneStatus: "مكتمل",
    today: "اليوم",
    directBookToday: "حجز مباشر لليوم",
    addAppointment: "إضافة موعد",
    quickClinicTimes: "أوقات العيادة السريعة",
    clearTime: "مسح الوقت",
    setTimeBtn: "تأكيد الوقت",
    chooseTime: "تحديد الوقت",
    touchClockFace: "المس وجه الساعة لضبط الساعات والدقائق",
    chooseDate: "اختر التاريخ",
    resetToToday: "العودة إلى اليوم",
    clearDate: "مسح التاريخ",
    setDateBtn: "تأكيد التاريخ",

    // Localized placeholders, examples, and chips
    quickSelect: "اختيار سريع:",
    appointmentReasonPlaceholder: "مثال: علاج عصب للسن #46 أو فحص دوري",
    appointmentNotesPlaceholder: "مثال: المريض يعاني من حساسية، تحضير تخدير موضعي...",
    commonConsultation: "استشارة عامة",
    commonCleaning: "تنظيف وتلميع دوري",
    commonFilling: "حشوة كومبوزيت",
    commonRootCanal: "سحب وعلاج عصب",
    customMaterialPlaceholder: "مثال: كومبوزيت، زيركون...",
    moneyPlaceholder: "مثال: 95,000",
    rentPlaceholder: "مثال: 500,000",

    // Monthly Rent Modal
    monthlyClinicRent: "إيجار العيادة الشهري",
    adjustRentSubtitle: "تعديل بدل الإيجار الشهري المدفوع للعيادة",
    selectMonthAndAmount: "تحديد الشهر والمبلغ",
    currentRent: "الحالي",
    clinicMonth: "شهر العيادة",
    rentPaidIQD: "الإيجار المدفوع (د.ع)",
    quickPreset: "سريع:",
    saveRent: "حفظ الإيجار",
    removeRent: "حذف الإيجار",
    recordedMonthsHistory: "سجل الإيجارات المسجلة",
    allTimeRentTotal: "إجمالي الإيجارات الكلي",
    noRentRecorded: "لم يتم تسجيل أي إيجار شهري بعد",

    // Roles & Permissions
    roleDoctor: "دكتور",
    roleSecretary: "سكرتير",
    roleDoctorBadge: "دكتور / Doctor",
    roleSecretaryBadge: "سكرتير / Receptionist",
    roleDoctorDesc: "صلاحيات إدارية ومالية كاملة",
    roleSecretaryDesc: "إدارة المواعيد واستقبال المرضى",
    switchRolePreview: "معاينة الدور",
    receptionistTitle: "مكتب الاستقبال",
    doctorTitle: "طبيب العيادة / مسؤول",

    // Staff & Clinic Settings
    manageStaff: "إدارة الكادر",
    addSecretary: "إضافة سكرتير",
    secretaryName: "اسم السكرتير",
    secretaryEmail: "بريد السكرتير",
    secretaryPassword: "كلمة المرور",
    createSecretaryAccount: "إنشاء الحساب في سوبابيس",
    activeStaff: "موظفو الاستقبال النشطون",
    noStaffYet: "لم يتم إضافة سكرتير بعد",
    secretaryCreatedSuccess: "تم إنشاء حساب السكرتير بنجاح! يمكنه الآن تسجيل الدخول.",
    clinicSettings: "إعدادات العيادة",
    clinicName: "اسم العيادة",
    doctorName: "اسم الطبيب",
    clinicPhone: "هاتف العيادة",
    clinicAddress: "عنوان العيادة",
    settingsSaved: "تم حفظ الإعدادات بنجاح",
    editClinicProfile: "تعديل بيانات العيادة",

    // Undo Delete
    undo: "تراجع",
    patientDeleted: "تم حذف ملف المريض",
    patientRestored: "تمت استعادة المريض بنجاح",

    // Set Password & Recovery
    setPasswordTitle: "تعيين كلمة المرور",
    setPasswordSubtitle: "أدخل كلمة مرور قوية لتسجيل الدخول إلى حساب العيادة.",
    newPassword: "كلمة المرور الجديدة",
    confirmPassword: "تأكيد كلمة المرور",
    savePassword: "حفظ كلمة المرور والمتابعة",
    passwordsDoNotMatch: "كلمتا المرور غير متطابقتين.",
    passwordUpdatedSuccess: "تم حفظ كلمة المرور بنجاح! يمكنك الآن تسجيل الدخول في أي وقت.",

    // Printing & Prescriptions
    printReceipt: "طباعة الإيصال",
    printPrescription: "طباعة الوصفة الطبية",
    prescription: "وصفة طبية للأسنان",
    receipt: "إيصال المريض",
    officialReceipt: "إيصال قبض رسمي",
    medication: "الدواء والشكل",
    dosage: "الجرعة",
    frequency: "التكرار / الاستخدام",
    duration: "المدة",
    instructions: "التعليمات",
    addMedication: "إضافة دواء",
    quickPresets: "وصفات أسنان جاهزة",
    doctorSignature: "توقيع وختم الطبيب",
    diagnosis: "التشخيص / الإجراء",
    thankYouClinic: "شكراً لثقتكم بعيادتنا لرعاية أسنانكم.",
    printNow: "طباعة المستند",
    allergiesAlert: "تنبيه الحساسية / السيرة المرضية",

    // Database Import & Export
    importDatabase: "استيراد قاعدة البيانات (CSV)",
    importDatabaseDesc: "رفع واستيراد قائمة مرضاك الحالية من ملف CSV إلى النظام مباشرة",
    exportDatabase: "تصدير قاعدة البيانات (CSV)",
    exportDatabaseDesc: "تحميل نسخة احتياطية كاملة لجميع المرضى بصيغة CSV",
    downloadCsvTemplate: "تحميل نموذج CSV التجريبي",
    uploadCsvFile: "رفع ملف CSV",
    dragDropCsv: "اسحب وأفلت ملف CSV هنا، أو انقر للاختيار",
    browseFile: "اختيار ملف",
    previewImportData: "معاينة المرضى قبل الاستيراد",
    confirmImport: "استيراد المرضى إلى العيادة",
    importingPatients: "جاري حفظ واستيراد المرضى إلى السحابة...",
    importSuccess: "تم استيراد قاعدة البيانات بنجاح!",
    noFileSelected: "يرجى اختيار ملف CSV أولاً.",
    patientsFoundInCsv: "مريض تم العثور عليهم في الملف",
  },

  ku: {
    // Navigation & Header
    patients: "نەخۆشەکان",
    appointments: "مەوعیدەکان",
    materials: "خەرجییەکان",
    reports: "ڕاپۆرتە داراییەکان",
    tabPatients: "نەخۆشەکان",
    tabAppointments: "مەوعیدەکان",
    tabMaterials: "خەرجییەکان",
    tabReports: "ڕاپۆرتەکان",
    monthlyReports: "ڕاپۆرتە داراییە مانگانەکان",
    addPatient: "نەخۆشی نوێ",
    clinicPro: "نۆرینگەی تایبەت",
    activeCloud: "کلاودی چالاک",
    clinicSubtitle: "سیستەمی نۆرینگە و خشتەی ددان",
    autoBookAppointment: "تۆمارکردنی نۆرە لە خشتەی نۆرەکان بە خۆکار",
    bookPatientCase: "زیادکردن و حجزکردنی نەخۆش",
    signOut: "دەرچوون",
    signOutTooltip: "دەرچوون لە سیستەمی نۆرینگە",

    // Stats
    totalPatients: "نەخۆشەکان",
    totalIncome: "کۆی داهات",
    materialSpend: "کۆی خەرجییەکان",
    clinicRent: "کرێی نۆرینگە",
    netWorth: "قازانجی سافی",
    unpaidDebts: "قەرزی ماوە",
    male: "نێر",
    female: "مێ",
    paidByPatients: "دراوە لەلایەن نەخۆشەوە",
    expensesLogged: "خەرجی تۆمارکراو",
    adjust: "دەستکاری",
    adjustMonthRent: "دەستکاری کرێی مانگ",
    incomeMinusExpenses: "کۆی داهات − کۆی خەرجییەکان",
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
    clinicPortalTitle: "سیستەمی نۆرینگەی ددان",
    clinicPortalSubtitle: "سیستەمی پێشکەوتووی بەڕێوەبردنی نۆرینگە و چارەسەری ددان",
    doctorEmail: "ئیمەیڵی دکتۆر",
    password: "وشەی نهێنی",
    unlockDashboard: "چوونەژوورەوە بۆ نۆرینگە",
    offlineCacheAccess: "چوونەژوورەوە بە کاشی نۆرینگە (بێ ئینتەرنێت)",
    offlineCacheDesc: "پارێزراوە بە سیستەمی پاراستن • سیستەمی سحابی نۆرینگە",
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
    edit: "دەستکاری",
    delete: "سڕینەوە",
    autoSaved: "خۆکار پاشەکەوتکراو",
    fdiOdontogram: "خشتەی FDI",
    workedTeeth: "چارەسەرکراو",

    // Add / Edit Patient Modal
    recordPaidAndDebt: "تۆمارکردنی بڕی دراو و قەرزی ماوە",
    patientCase: "دۆخی نەخۆش",
    namePlaceholder: "نموونە: دڵشاد ئەحمەد، سارا...",
    agePlaceholder: "نموونە: 32",
    phonePlaceholder: "نموونە: 0770 123 4567",
    betterCalendar: "ساڵنامەی خێرا 📅",
    circleClock: "کاتژمێری بازنەیی 🕒",
    clockBtn: "کاتژمێر",
    timePlaceholder: "نموونە: 10:30 پێش نیوەڕۆ",
    notesPlaceholder: "نموونە: پشکنینی گشتی، دڵنیابوون لە تەندروستی، دەرمانی پێویست...",
    medicalHistoryTitle: "مێژووی نەخۆشی پێشوو / هەستیاری",
    medicalHistoryOptional: "(ئارەزوومەندانە)",
    medicalHistoryPlaceholder: "نموونە: پەستانی خوێن، هەستیاری بە پێنسلین، شەکرە...",
    openTeethChart: "+ کردنەوەی خشتەی ددان",
    editTeethChart: "دەستکاری خشتەی ددان",
    hideTeethChart: "شاردنەوەی خشتەی ددان",
    teethChartSubtext: "دیاریکردنی ددانە چارەسەرکراوەکان، پڕکردنەوە، دەماربڕین، یان کێشان",
    editPatient: "دەستکاری زانیاری نەخۆش",
    totalTreatmentPrice: "کۆی گشتی تێچووی چارەسەر",
    amountPaidToday: "بڕی دراو ئەمڕۆ",
    paidInFullBtn: "⚡ هەمووی دراوە",
    unpaidBtn: "نەدراوە (0)",
    remainingDebt: "قەرزی ماوە",
    autoCalculated: "خۆکارانە دەرهێنراوە",
    manualDebtOverride: "دەستکاریکردنی دەستی بۆ ماوە",
    syncedFromDentalChart: "بەستراوەتەوە بە نەخشەی ددان",
    noRemainingDebt: "بەتەواوی دراوە (هیچ قەرزێک نییە)",

    // Patient History & Treatments Modal
    patientHistoryAndTreatments: "مێژووی نەخۆش و چارەسەرەکان",
    entry: "سەردان",
    entries: "سەردان",
    totalVisitsCount: "کۆی سەردانەکان",
    supabaseLive: "ڕاستەوخۆ لە کلاود",
    addEntry: "+ زیادکردنی سەردان",
    newVisitRecord: "تۆمارکردنی سەردان / چارەسەری نوێ",
    savesToSupabase: "پاشەکەوتکردن لە کلاود",
    visitDate: "بەرواری سەردان *",
    procedureTitle: "ناونیشان / جۆری چارەسەر *",
    procedurePlaceholder: "نموونە: دەماربڕین، پڕکردنەوە، تەنزیف، کێشان",
    paidIQD: "دراو (د.ع)",
    debtIQD: "قەرزی ماوە (د.ع)",
    clinicalNotesAndDetails: "تێبینی پزیشکی و وردەکاری چارەسەر",
    clinicalNotesPlaceholder: "وردەکاری کارەکە، مەوادی بەکارهاتوو، دەرمانی نووسراو...",
    saveVisitRecord: "پاشەکەوتکردنی سەردان",
    saving: "پاشەکەوت دەکرێت...",
    editVisitRecord: "دەستکاری سەردان",
    updateVisitRecord: "نوێکردنەوەی سەردان",
    deleteVisitConfirm: "ئایا دڵنیایت لە سڕینەوەی ئەم سەردانە؟",
    medicalAlert: "ئاگاداری پزیشکی",
    storedInSupabase: "پارێزراوە لە بنکەی داتای هەوری نۆرینگە",

    // Dental Chart & Odontogram Modal
    chartAndSelect: "دیاریکردن و هێڵکاری",
    erase: "سڕینەوە",
    quadrants: "بەشەکان",
    selectAnatomicalGroup: "دیاریکردنی گرووپ",
    selectAllTeeth: "دیاریکردنی هەمووی (32 ددان)",
    multiSelect: "دەستنیشانکردنی فرەیی",
    deselect: "لابردنی دەستنیشانکردن",
    condition: "دۆخ / چارەسەر",
    material: "مەواد",
    procedurePricing: "نرخی چارەسەر",
    chooseMaterial: "مەواد هەڵبژێرە...",
    feeIQD: "نرخ (د.ع)",
    clinicalNoteForTooth: "تێبینی پزیشکی بۆ ددانی",
    remove: "سڕینەوە",
    done: "تەواو",
    totalDentalFee: "کۆی گشتی نرخی ددان:",
    syncToBill: "نوێکردنەوەی حسابی نەخۆش",
    syncedToBill: "✓ حسابەکە نوێکرایەوە!",
    doneAndClose: "تەواو و داخستن",
    storedInstantly: "خۆکار پاشەکەوتکرا",
    fitScreen: "ڕێکخستنی شاشە",
    zoom150: "گەورەکردن 150%",
    tapToothToMark: "دەست لە تاجی ددان بدە بۆ دیاریکردن",
    chartedTreatmentsAndFees: "چارەسەر و نرخە تۆمارکراوەکان",

    // Materials & Expenses View
    materialsSubtitle: "تۆمارکردنی کڕینی کەرەستە، کرێ، کارەبا و خەرجییەکانی تاقیگە",
    totalMaterialSpendCard: "کۆی خەرجییەکان",
    totalSpendSubtitle: "سەرجەم خەرجییەکانی نۆرینگە پێکەوە",
    totalPurchases: "کۆی خەرجییەکان",
    records: "تۆمار",
    supplierReceiptsLogged: "وەسڵ و پسوولەی تۆمارکراو",
    clinicNetWorthImpact: "کاریگەری لەسەر قازانجی نۆرینگە",
    netWorthImpactDesc: "هەموو خەرجییەک بە شێوەیەکی خۆکار لە داهاتی نەخۆش دەردەکرێت بۆ هەژمارکردنی قازانجی ڕاستەقینە.",
    searchMaterials: "گەڕان بەپێی وەسف، لایەن یان بەروار...",
    supplierMaterialCol: "ڕوونکردنەوە / لایەنی وەرگر",
    totalMoneySpentCol: "بڕی پارە (د.ع)",
    addMaterialExpense: "زیادکردنی خەرجی",
    editMaterialExpense: "دەستکاری خەرجی",
    addMaterialDesc: "تۆمارکردنی پسوولە یان خەرجییەکی نۆرینگە",
    editMaterialDesc: "نوێکردنەوەی زانیاری خەرجی",
    purchaseDate: "1. بەروار *",
    supplierMaterialName: "2. ڕوونکردنەوە / لایەن *",
    supplierPlaceholder: "نموونە: کەرەستەی ددان، کرێی کلینیک، کارەبا، مەعمەل...",
    totalMoneySpent: "3. بڕی پارەی دراو (د.ع) *",
    addPatientsOrExpensesToView: "نەخۆش یان خەرجی زیاد بکە بۆ بینینی ڕاپۆرتی مانگانە.",
    totalExpenses: "کۆی خەرجییەکان",
    netProfit: "قازانجی سافی",
    category: "جۆر / پۆل",
    categoryMaterials: "کەرەستە",
    categoryRent: "کرێی کلینیک",
    categoryUtilities: "کارەبا و خزمەتگوزاری",
    categoryLab: "تاقیگە / مەعمەل",
    categoryOther: "هیتر",

    // Appointments View
    scheduleSubtitle: "خشتەی مانگانەی مەوعیدەکان • کلیک لە هەر ڕۆژێک بکە بۆ دانانی کات",
    booked: "گیراوە",
    scheduled: "دانراو",
    doneStatus: "تەواوبوو",
    today: "ئەمڕۆ",
    directBookToday: "دانانی مەوعید بۆ ئەمڕۆ",
    addAppointment: "مەوعیدی نوێ",
    quickClinicTimes: "کاتە ئاساییەکانی نۆرینگە",
    clearTime: "سڕینەوەی کات",
    setTimeBtn: "تەئکیدکردنەوەی کات",
    chooseTime: "دیاریکردنی کات",
    touchClockFace: "دەست لە ڕووی کاتژمێرەکە بدە بۆ دەستنیشانکردنی کات",
    chooseDate: "دیاریکردنی بەروار",
    resetToToday: "گەڕانەوە بۆ ئەمڕۆ",
    clearDate: "سڕینەوەی بەروار",
    setDateBtn: "تەئکیدکردنەوەی بەروار",

    // Localized placeholders, examples, and chips
    quickSelect: "هەڵبژاردنی خێرا:",
    appointmentReasonPlaceholder: "نموونە: ددانی #46 دەماربڕین یان پشکنینی گشتی",
    appointmentNotesPlaceholder: "نموونە: نەخۆش باسی هەستیاری کرد، بەنجی مەوزوعی ئامادە بکە...",
    commonConsultation: "ڕاوێژی گشتی",
    commonCleaning: "پاککردنەوە و پۆلیشی خولی",
    commonFilling: "پڕکردنەوەی کۆمپۆزیت",
    commonRootCanal: "عەسەب و دەماربڕین",
    customMaterialPlaceholder: "نموونە: کۆمپۆزیت، زێرکۆن...",
    moneyPlaceholder: "نموونە: 95,000",
    rentPlaceholder: "نموونە: 500,000",

    // Monthly Rent Modal
    monthlyClinicRent: "کرێی مانگانەی نۆرینگە",
    adjustRentSubtitle: "دەستکاریکردنی بڕی کرێی دراو بۆ هەر مانگێکی نۆرینگە",
    selectMonthAndAmount: "دیاریکردنی مانگ و بڕی پارە",
    currentRent: "ئێستا",
    clinicMonth: "مانگی نۆرینگە",
    rentPaidIQD: "کرێی دراو (د.ع)",
    quickPreset: "خێرا:",
    saveRent: "پاشەکەوتکردنی کرێ",
    removeRent: "سڕینەوەی کرێ",
    recordedMonthsHistory: "مێژووی کرێیە تۆمارکراوەکان",
    allTimeRentTotal: "کۆی گشتی هەموو کرێیەکان",
    noRentRecorded: "تا ئێستا هیچ کرێیەکی مانگانە تۆمار نەکراوە",

    // Roles & Permissions
    roleDoctor: "دکتۆر",
    roleSecretary: "سکرتێر",
    roleDoctorBadge: "دکتۆر / Doctor",
    roleSecretaryBadge: "سکرتێر / Receptionist",
    roleDoctorDesc: "دەسەڵاتی تەواوی ئیداری و دارایی",
    roleSecretaryDesc: "بەڕێوەبردنی نۆرە و پێشوازی نەخۆشەکان",
    switchRolePreview: "بینینی ڕۆڵ",
    receptionistTitle: "مێزی پێشوازی",
    doctorTitle: "دکتۆری نۆرینگە / بەڕێوەبەر",

    // Staff & Clinic Settings
    manageStaff: "بەڕێوەبردنی کارمەندان",
    addSecretary: "زیادکردنی سکرتێر",
    secretaryName: "ناوی سکرتێر",
    secretaryEmail: "ئیمەیڵی سکرتێر",
    secretaryPassword: "وشەی نهێنی",
    createSecretaryAccount: "دروستکردنی هەژمار لە سوبابەیس",
    activeStaff: "کارمەندانی پێشوازی چالاک",
    noStaffYet: "تا ئێستا هیچ سکرتێرێک زیاد نەکراوە",
    secretaryCreatedSuccess: "هەژماری سکرتێر بە سەرکەوتوویی دروستکرا! ئێستا دەتوانێت بچێتە ژوورەوە.",
    clinicSettings: "ڕێکخستنەکانی نۆرینگە",
    clinicName: "ناوی نۆرینگە",
    doctorName: "ناوی دکتۆر",
    clinicPhone: "تەلەفۆنی نۆرینگە",
    clinicAddress: "ناونیشانی نۆرینگە",
    settingsSaved: "ڕێکخستنەکان بە سەرکەوتوویی پاشەکەوت کران",
    editClinicProfile: "دەستکاریکردنی زانیاری نۆرینگە",

    // Undo Delete
    undo: "گەڕاندنەوە",
    patientDeleted: "نەخۆش سڕایەوە",
    patientRestored: "نەخۆشەکە بە سەرکەوتوویی گەڕێندرایەوە",

    // Set Password & Recovery
    setPasswordTitle: "دروستکردنی وشەی نهێنی",
    setPasswordSubtitle: "وشەیەکی نهێنی پارێزراو دابنێ بۆ چوونەژوورەوە لە هەژمارەکەت.",
    newPassword: "وشەی نهێنی نوێ",
    confirmPassword: "دووپاتکردنەوەی وشەی نهێنی",
    savePassword: "پاشەکەوتکردنی وشەی نهێنی و بەردەوامبوون",
    passwordsDoNotMatch: "وشە نهێنییەکان هاوشێوە نین.",
    passwordUpdatedSuccess: "وشەی نهێنی بە سەرکەوتوویی پاشەکەوتکرا! ئێستا دەتوانیت لە هەر کاتێکدا بێیتە ژوورەوە.",

    // Printing & Prescriptions
    printReceipt: "چاپکردنی پسوولە",
    printPrescription: "چاپکردنی ڕەچەتە",
    prescription: "ڕەچەتەی پزیشکی ددان",
    receipt: "پسوولەی نەخۆش",
    officialReceipt: "پسوولەی فەرمی نەخۆش",
    medication: "دەرمان و جۆرەکەی",
    dosage: "بڕی دەرمان",
    frequency: "چۆنیەتی بەکارهێنان",
    duration: "ماوە",
    instructions: "ڕێنماییەکان",
    addMedication: "زیادکردنی دەرمان",
    quickPresets: "دەرمانی ئامادەکراوی ددان",
    doctorSignature: "واژۆ و مۆری پزیشک",
    diagnosis: "دەستنیشانکردن / چارەسەر",
    thankYouClinic: "سوپاس بۆ متمانەکردنتان بە نۆرینگەکەمان بۆ چارەسەری دەم و ددانتان.",
    printNow: "چاپکردنی بەڵگەنامە",
    allergiesAlert: "هەستیاری / هۆشداری پزیشکی",

    // Database Import & Export
    importDatabase: "هاوردەکردنی بنکەی داتا (CSV)",
    importDatabaseDesc: "بەرزکردنەوەی لیستی نەخۆشەکان لە فایلی CSV بۆ ناو سیستەم",
    exportDatabase: "هەناردەکردنی بنکەی داتا (CSV)",
    exportDatabaseDesc: "داگرتنی کۆپییەکی یەدەگی هەموو نەخۆشەکان بە فۆرماتی CSV",
    downloadCsvTemplate: "داگرتنی فایلی نموونەیی CSV",
    uploadCsvFile: "بەرزکردنەوەی فایلی CSV",
    dragDropCsv: "فایلی CSV ڕابکێشە ئێرە، یان کلیک بکە بۆ دیاریکردن",
    browseFile: "دیاریکردنی فایل",
    previewImportData: "پێشبینینی نەخۆشەکان پێش هاوردەکردن",
    confirmImport: "هاوردەکردنی نەخۆشەکان بۆ نۆرینگە",
    importingPatients: "پاشەکەوتکردنی نەخۆشەکان لە کلاود...",
    importSuccess: "بنکەی داتا بە سەرکەوتوویی هاوردە کرا!",
    noFileSelected: "تکایە سەرەتا فایلێکی CSV هەڵبژێرە.",
    patientsFoundInCsv: "نەخۆش دۆزرایەوە لە فایلەکەدا",
  },
};

export const PROCEDURE_TRANSLATIONS: Record<string, Record<Language, string>> = {
  treated: { en: "Worked On / Treated", ar: "معالج / مكتمل", ku: "چارەسەرکراو" },
  filling: { en: "Filling (Composite)", ar: "حشوة (كومبوزيت)", ku: "پڕکردنەوە (کۆمپۆزیت)" },
  root_canal: { en: "Root Canal (Endo)", ar: "سحب عصب (جذور)", ku: "دەماربڕین (عەسەب)" },
  crown: { en: "Crown / Bridge", ar: "تلبيس / جسر", ku: "رووپۆش / کەوانە (تاج)" },
  extraction: { en: "Extracted / Missing", ar: "قلع / مفقود", ku: "کێشان / نەماو" },
  decay: { en: "Decay / Needs Work", ar: "تسوس / يحتاج علاج", ku: "کلۆربوون / پێویستی بە کارە" },
  denture: { en: "Denture", ar: "طقم أسنان كامل", ku: "ددانی دەستکرد (تەقمی تەواو)" },
  partial_denture: { en: "Partial Denture", ar: "طقم أسنان جزئي", ku: "تەقمی نیمچەیی" },
  orthodontic: { en: "Orthodontic treatment", ar: "تقويم أسنان", ku: "تەقویمی ددان" },
  scaling_polishing: { en: "Scaling and polishing", ar: "تنظيف وتلميع الأسنان", ku: "تەنزیف و پۆلیشکردنی ددان" },
  whitening: { en: "Whitening", ar: "تبييض الأسنان", ku: "سپی کردنەوەی ددان" },
  implant: { en: "Implant", ar: "زراعة أسنان", ku: "چاندنی ددان (زەرع)" },
  examination: { en: "Examination", ar: "فحص ومعاينة", ku: "پشکنین و معاینەکردن" },
};

export const QUADRANT_TRANSLATIONS: Record<string, Record<Language, string>> = {
  "Upper Right (Q1)": { en: "Upper Right (Q1)", ar: "الربع العلوي الأيمن (1)", ku: "سەرەوەی ڕاست (1)" },
  "Upper Left (Q2)": { en: "Upper Left (Q2)", ar: "الربع العلوي الأيسر (2)", ku: "سەرەوەی چەپ (2)" },
  "Lower Left (Q3)": { en: "Lower Left (Q3)", ar: "الربع السفلي الأيسر (3)", ku: "خوارەوەی چەپ (3)" },
  "Lower Right (Q4)": { en: "Lower Right (Q4)", ar: "الربع السفلي الأيمن (4)", ku: "خوارەوەی ڕاست (4)" },
  "Maxilla (Upper Jaw)": { en: "Maxilla (Upper Jaw)", ar: "الفك العلوي", ku: "شەویلاگی سەرەوە" },
  "Mandible (Lower Jaw)": { en: "Mandible (Lower Jaw)", ar: "الفك السفلي", ku: "شەویلاگی خوارەوە" },
  "Molars": { en: "Molars", ar: "الأضراس (طواحن)", ku: "کاکیلەکان" },
  "Premolars": { en: "Premolars", ar: "الضواحك", ku: "پێش کاکیلەکان" },
  "Canines": { en: "Canines", ar: "الأنياب", ku: "کەڵبەکان" },
  "Incisors": { en: "Incisors", ar: "القواطع (الأسنان الأمامية)", ku: "بڕەرەکان (پێشەوە)" },
};
