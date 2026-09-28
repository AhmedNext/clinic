"use client";

import React, { useState, useRef } from "react";
import {
  X,
  Database,
  UploadCloud,
  FileSpreadsheet,
  Download,
  CheckCircle2,
  AlertCircle,
  Users,
  ArrowRight,
  FileText,
  Loader2,
  Trash2,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useClinicSettings } from "@/context/ClinicSettingsContext";
import { Patient, formatIQD } from "@/types/patient";
import {
  downloadSamplePatientCsv,
  exportPatientsToCsv,
  parsePatientsCsv,
  ParsedCsvResult,
} from "@/utils/csvImportExport";

interface ImportDatabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingPatients: Patient[];
  onImportPatients: (newPatients: Patient[]) => Promise<void>;
}

export function ImportDatabaseModal({
  isOpen,
  onClose,
  existingPatients,
  onImportPatients,
}: ImportDatabaseModalProps) {
  const { t } = useLanguage();
  const { settings } = useClinicSettings();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parseResult, setParseResult] = useState<ParsedCsvResult | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState<{ current: number; total: number } | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  if (!isOpen) return null;

  const handleReset = () => {
    setSelectedFile(null);
    setParseResult(null);
    setIsParsing(false);
    setIsImporting(false);
    setImportProgress(null);
    setIsSuccess(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleClose = () => {
    if (isImporting) return;
    handleReset();
    onClose();
  };

  const processFile = async (file: File) => {
    if (!file.name.toLowerCase().endsWith(".csv") && !file.type.includes("csv") && !file.type.includes("text")) {
      alert("Please upload a .csv file");
      return;
    }

    setSelectedFile(file);
    setIsParsing(true);

    try {
      const text = await file.text();
      const result = parsePatientsCsv(text);
      setParseResult(result);
    } catch (err) {
      console.error("CSV parse error:", err);
      alert("Failed to parse CSV file. Please make sure it is a valid CSV format.");
    } finally {
      setIsParsing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleExecuteImport = async () => {
    if (!parseResult || parseResult.patients.length === 0) return;

    setIsImporting(true);
    setImportProgress({ current: 0, total: parseResult.patients.length });

    try {
      await onImportPatients(parseResult.patients);
      setIsSuccess(true);
      setTimeout(() => {
        handleClose();
      }, 1500);
    } catch (err) {
      console.error("Import execution failed:", err);
      alert("Failed to import patients. Please try again.");
      setIsImporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-indigo-500 to-violet-500 text-white shadow-md shadow-indigo-500/25">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-100 leading-tight">
                {t.importDatabase}
              </h3>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                {t.importDatabaseDesc}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={isImporting}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5">
          {/* Top Actions: Template Download & Backup Export */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Download Template */}
            <button
              type="button"
              onClick={downloadSamplePatientCsv}
              className="flex items-center gap-3 p-3.5 rounded-2xl border border-indigo-200/80 dark:border-indigo-800/60 bg-indigo-50/60 dark:bg-indigo-950/40 hover:bg-indigo-100/70 dark:hover:bg-indigo-900/40 text-left rtl:text-right transition-all group cursor-pointer"
            >
              <div className="p-2 rounded-xl bg-indigo-600 text-white group-hover:scale-105 transition-transform flex-shrink-0">
                <Download className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-indigo-900 dark:text-indigo-200 leading-snug">
                  {t.downloadCsvTemplate}
                </p>
                <p className="text-[11px] text-indigo-600/80 dark:text-indigo-400/80 truncate">
                  Name, Phone, Age, Gender, Fees...
                </p>
              </div>
            </button>

            {/* Export Backup CSV */}
            <button
              type="button"
              onClick={() => exportPatientsToCsv(existingPatients, settings.clinicName)}
              className="flex items-center gap-3 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-800/80 text-left rtl:text-right transition-all group cursor-pointer"
            >
              <div className="p-2 rounded-xl bg-slate-700 dark:bg-slate-700 text-white group-hover:scale-105 transition-transform flex-shrink-0">
                <FileSpreadsheet className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-snug">
                  {t.exportDatabase}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                  {existingPatients.length} {t.totalPatients.toLowerCase()} backup
                </p>
              </div>
            </button>
          </div>

          {/* Upload Drop Zone (when no file is selected yet) */}
          {!selectedFile ? (
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`relative flex flex-col items-center justify-center p-8 sm:p-10 border-2 border-dashed rounded-3xl transition-all cursor-pointer ${
                dragActive
                  ? "border-indigo-500 bg-indigo-50/40 dark:bg-indigo-950/30 scale-[0.99]"
                  : "border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 hover:bg-slate-100/50 dark:hover:bg-slate-800/30 hover:border-indigo-400"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,text/csv"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-3">
                <UploadCloud className="w-7 h-7" />
              </div>
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-1">
                {t.dragDropCsv}
              </h4>
              <p className="text-xs text-slate-400 dark:text-slate-500 mb-4 text-center max-w-sm">
                Supports CSV files exported from Excel, Google Sheets, or other clinic management systems.
              </p>
              <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 text-white shadow-md shadow-indigo-600/25">
                <FileSpreadsheet className="w-4 h-4" />
                <span>{t.browseFile} (.CSV)</span>
              </span>
            </div>
          ) : (
            /* File Preview & Verification Details */
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex-shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                      {selectedFile.name}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      {(selectedFile.size / 1024).toFixed(1)} KB •{" "}
                      {parseResult ? (
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                          {parseResult.validRows} {t.patientsFoundInCsv}
                        </span>
                      ) : (
                        "Parsing..."
                      )}
                    </p>
                  </div>
                </div>

                {!isImporting && (
                  <button
                    type="button"
                    onClick={handleReset}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                    title="Remove file"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Warning if any rows had issues */}
              {parseResult && parseResult.errors.length > 0 && (
                <div className="p-3 rounded-2xl border border-amber-200/80 dark:border-amber-800/80 bg-amber-50/70 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">{parseResult.errors.length} rows skipped:</span>
                    <ul className="list-disc list-inside mt-0.5 space-y-0.5 text-[11px] opacity-90 max-h-20 overflow-y-auto">
                      {parseResult.errors.slice(0, 3).map((err, i) => (
                        <li key={i}>{err}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Sample Preview Table */}
              {parseResult && parseResult.patients.length > 0 && (
                <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
                  <div className="px-4 py-2.5 bg-slate-100/80 dark:bg-slate-800/60 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      {t.previewImportData} (First {Math.min(5, parseResult.patients.length)} cases)
                    </span>
                    <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                      Total: {parseResult.validRows} patients
                    </span>
                  </div>
                  <div className="overflow-x-auto max-h-48">
                    <table className="w-full text-left rtl:text-right text-xs">
                      <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                        <tr>
                          <th className="px-3 py-2 font-semibold">Name</th>
                          <th className="px-3 py-2 font-semibold">Phone</th>
                          <th className="px-3 py-2 font-semibold">Date</th>
                          <th className="px-3 py-2 font-semibold">Total Fee</th>
                          <th className="px-3 py-2 font-semibold">Paid</th>
                          <th className="px-3 py-2 font-semibold">Debt</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {parseResult.patients.slice(0, 5).map((p, i) => (
                          <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                            <td className="px-3 py-2 font-bold text-slate-900 dark:text-slate-100 whitespace-nowrap">
                              {p.name}
                            </td>
                            <td className="px-3 py-2 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                              {p.phone || "—"}
                            </td>
                            <td className="px-3 py-2 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                              {p.date}
                            </td>
                            <td className="px-3 py-2 font-semibold text-slate-900 dark:text-slate-100 whitespace-nowrap">
                              {formatIQD(p.totalAmount || 0)}
                            </td>
                            <td className="px-3 py-2 text-emerald-600 dark:text-emerald-400 font-bold whitespace-nowrap">
                              {formatIQD(p.paidAmount || 0)}
                            </td>
                            <td className="px-3 py-2 font-bold text-rose-600 dark:text-rose-400 whitespace-nowrap">
                              {(p.debtAmount || 0) > 0 ? formatIQD(p.debtAmount || 0) : "—"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 flex-shrink-0">
          <button
            type="button"
            onClick={handleClose}
            disabled={isImporting}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors cursor-pointer disabled:opacity-50"
          >
            {t.cancel}
          </button>

          {selectedFile && parseResult && parseResult.validRows > 0 && (
            <button
              type="button"
              disabled={isImporting || isSuccess}
              onClick={handleExecuteImport}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white shadow-lg transition-all cursor-pointer ${
                isSuccess
                  ? "bg-emerald-600 shadow-emerald-600/30"
                  : "bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-indigo-600/30 active:scale-95"
              }`}
            >
              {isImporting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{t.importingPatients}</span>
                </>
              ) : isSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{t.importSuccess}</span>
                </>
              ) : (
                <>
                  <Database className="w-4 h-4" />
                  <span>
                    {t.confirmImport} ({parseResult.validRows})
                  </span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
