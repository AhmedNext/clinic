"use client";

import React, { useState, useMemo } from "react";
import {
  ClinicMaterial,
  MATERIAL_CATEGORIES,
} from "@/types/material";
import { formatIQD } from "@/types/patient";
import {
  Package,
  Plus,
  Search,
  AlertTriangle,
  TrendingUp,
  DollarSign,
  Boxes,
  Edit2,
  Trash2,
  Calendar,
  Truck,
  Check,
  X,
  Filter,
  ArrowUpDown,
  Sparkles,
} from "lucide-react";

interface MaterialsViewProps {
  materials: ClinicMaterial[];
  onAddMaterial: (mat: Omit<ClinicMaterial, "id" | "createdAt">) => Promise<void>;
  onUpdateMaterial: (mat: ClinicMaterial) => Promise<void>;
  onDeleteMaterial: (id: string) => Promise<void>;
}

export function MaterialsView({
  materials,
  onAddMaterial,
  onUpdateMaterial,
  onDeleteMaterial,
}: MaterialsViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [onlyLowStock, setOnlyLowStock] = useState(false);
  const [sortBy, setSortBy] = useState<"name" | "cost" | "stock" | "recent">("recent");

  // Modal State for Add / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ClinicMaterial | null>(null);

  // Form states
  const [formName, setFormName] = useState("");
  const [formCategory, setFormCategory] = useState<ClinicMaterial["category"]>("Restorative");
  const [formUnit, setFormUnit] = useState("Piece");
  const [formQuantity, setFormQuantity] = useState("5");
  const [formMinQuantity, setFormMinQuantity] = useState("2");
  const [formCostPrice, setFormCostPrice] = useState("25000");
  const [formPatientPrice, setFormPatientPrice] = useState("50000");
  const [formSupplier, setFormSupplier] = useState("");
  const [formPurchaseDate, setFormPurchaseDate] = useState(new Date().toISOString().split("T")[0]);
  const [formExpiryDate, setFormExpiryDate] = useState("");
  const [formNotes, setFormNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Open modal in Add mode
  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormName("");
    setFormCategory("Restorative");
    setFormUnit("Piece");
    setFormQuantity("5");
    setFormMinQuantity("2");
    setFormCostPrice("25000");
    setFormPatientPrice("50000");
    setFormSupplier("");
    setFormPurchaseDate(new Date().toISOString().split("T")[0]);
    setFormExpiryDate("");
    setFormNotes("");
    setIsModalOpen(true);
  };

  // Open modal in Edit mode
  const handleOpenEdit = (item: ClinicMaterial) => {
    setEditingItem(item);
    setFormName(item.name);
    setFormCategory(item.category);
    setFormUnit(item.unit || "Piece");
    setFormQuantity(String(item.quantity));
    setFormMinQuantity(String(item.minQuantity));
    setFormCostPrice(String(item.costPrice));
    setFormPatientPrice(String(item.patientPrice));
    setFormSupplier(item.supplier || "");
    setFormPurchaseDate(item.purchaseDate || "");
    setFormExpiryDate(item.expiryDate || "");
    setFormNotes(item.notes || "");
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    setIsSubmitting(true);
    try {
      const payload = {
        name: formName.trim(),
        category: formCategory,
        unit: formUnit.trim() || "pcs",
        quantity: Math.max(0, Number(formQuantity) || 0),
        minQuantity: Math.max(0, Number(formMinQuantity) || 1),
        costPrice: Math.max(0, Number(formCostPrice) || 0),
        patientPrice: Math.max(0, Number(formPatientPrice) || 0),
        supplier: formSupplier.trim() || undefined,
        purchaseDate: formPurchaseDate || undefined,
        expiryDate: formExpiryDate || undefined,
        notes: formNotes.trim() || undefined,
      };

      if (editingItem) {
        await onUpdateMaterial({
          ...editingItem,
          ...payload,
          updatedAt: Date.now(),
        });
      } else {
        await onAddMaterial(payload);
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error("Save material error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Quick quantity increment / decrement
  const handleAdjustQuantity = async (item: ClinicMaterial, delta: number) => {
    const newQty = Math.max(0, item.quantity + delta);
    await onUpdateMaterial({
      ...item,
      quantity: newQty,
      updatedAt: Date.now(),
    });
  };

  // KPI Calculations
  const stats = useMemo(() => {
    let totalStockValueCost = 0;       // Total spent value of current inventory
    let totalPotentialPatientValue = 0; // Total value if all procedures performed
    let lowStockCount = 0;
    let totalUnits = 0;

    const categorySpendMap: Record<string, number> = {};

    for (const m of materials) {
      const itemCostValue = (m.quantity || 0) * (m.costPrice || 0);
      const itemPatientValue = (m.quantity || 0) * (m.patientPrice || 0);

      totalStockValueCost += itemCostValue;
      totalPotentialPatientValue += itemPatientValue;
      totalUnits += m.quantity || 0;

      if ((m.quantity || 0) <= (m.minQuantity || 1)) {
        lowStockCount++;
      }

      categorySpendMap[m.category] = (categorySpendMap[m.category] || 0) + itemCostValue;
    }

    const categoryBreakdown = Object.entries(categorySpendMap)
      .map(([cat, total]) => ({
        category: cat,
        total,
        percent: totalStockValueCost > 0 ? Math.round((total / totalStockValueCost) * 100) : 0,
      }))
      .sort((a, b) => b.total - a.total);

    return {
      totalStockValueCost,
      totalPotentialPatientValue,
      totalUnits,
      lowStockCount,
      categoryBreakdown,
      productCount: materials.length,
    };
  }, [materials]);

  // Filter & Search
  const filteredMaterials = useMemo(() => {
    return materials
      .filter((item) => {
        if (selectedCategory !== "All" && item.category !== selectedCategory) {
          return false;
        }
        if (onlyLowStock && (item.quantity > item.minQuantity)) {
          return false;
        }
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = item.name.toLowerCase().includes(q);
          const matchCat = item.category.toLowerCase().includes(q);
          const matchSup = item.supplier?.toLowerCase().includes(q) || false;
          const matchNotes = item.notes?.toLowerCase().includes(q) || false;
          if (!matchName && !matchCat && !matchSup && !matchNotes) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === "name") return a.name.localeCompare(b.name);
        if (sortBy === "cost") return (b.quantity * b.costPrice) - (a.quantity * a.costPrice);
        if (sortBy === "stock") return a.quantity - b.quantity;
        return (b.createdAt || 0) - (a.createdAt || 0);
      });
  }, [materials, selectedCategory, onlyLowStock, searchQuery, sortBy]);

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-200">
      {/* ================= 1. SLEEK HEADER ================= */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b border-slate-200/60 dark:border-slate-800/60">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
              <Boxes className="w-4 h-4" />
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
              Materials & Clinic Expenses
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Track clinic supplies, purchase costs, and stock levels.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-bold shadow-sm shadow-indigo-600/20 active:scale-95 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Material</span>
        </button>
      </div>

      {/* ================= 2. DOCTOR KPI CARDS ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Card 1: Total Spent on Materials */}
        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800/70 shadow-xs relative overflow-hidden group">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              Total Spent on Materials
            </span>
            <div className="w-7 h-7 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <DollarSign className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-mono font-black text-slate-900 dark:text-slate-100 tracking-tight">
            {formatIQD(stats.totalStockValueCost)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1 font-medium">
            <span>Total cost for</span>
            <span className="font-bold text-slate-700 dark:text-slate-300">{stats.totalUnits} items in clinic</span>
          </p>
        </div>

        {/* Card 2: Registered Products */}
        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800/70 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              Products in Clinic
            </span>
            <div className="w-7 h-7 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center">
              <Package className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            {stats.productCount} <span className="text-xs font-normal text-slate-400">{stats.productCount === 1 ? "product" : "products"}</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1 font-medium">
            Dental supplies & materials
          </p>
        </div>

        {/* Card 3: Stock Alerts */}
        <div className={`p-4 rounded-3xl border shadow-xs transition-colors ${
          stats.lowStockCount > 0
            ? "bg-amber-50/40 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/40"
            : "bg-white dark:bg-slate-900 border-slate-200/70 dark:border-slate-800/70"
        }`}>
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              Low Stock Alerts
            </span>
            <div className={`w-7 h-7 rounded-xl flex items-center justify-center ${
              stats.lowStockCount > 0
                ? "bg-amber-100 dark:bg-amber-900/60 text-amber-600 dark:text-amber-400"
                : "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400"
            }`}>
              <AlertTriangle className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
            <span>{stats.lowStockCount}</span>
            {stats.lowStockCount > 0 ? (
              <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300">
                Needs Reorder
              </span>
            ) : (
              <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                All In Stock
              </span>
            )}
          </div>
          <button
            onClick={() => setOnlyLowStock(!onlyLowStock)}
            className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline mt-1 font-semibold cursor-pointer block"
          >
            {onlyLowStock ? "Show all supplies" : "Show low stock only →"}
          </button>
        </div>

        {/* Card 4: Treatment Billing Value */}
        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800/70 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              Treatment Billing Value
            </span>
            <div className="w-7 h-7 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-mono font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
            {formatIQD(stats.totalPotentialPatientValue)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1 font-medium">
            Expected revenue from treatments
          </p>
        </div>
      </div>

      {/* ================= 3. DOCTOR'S SPENDING REPORT ACCORDION / SUMMARY ================= */}
      {stats.categoryBreakdown.length > 0 && (
        <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800/70 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                <span>Spending by Specialty & Category</span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Where the clinic budget is currently invested
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
              Total: {formatIQD(stats.totalStockValueCost)}
            </span>
          </div>

          <div className="space-y-2.5">
            {stats.categoryBreakdown.map((item) => (
              <div key={item.category} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-700 dark:text-slate-300">{item.category}</span>
                  <div className="flex items-center gap-2 font-mono">
                    <span className="text-slate-500 dark:text-slate-400 text-[11px]">{item.percent}%</span>
                    <span className="text-slate-900 dark:text-slate-100 font-bold">{formatIQD(item.total)}</span>
                  </div>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-indigo-600 dark:bg-indigo-500 transition-all duration-500"
                    style={{ width: `${Math.max(4, item.percent)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= 4. FILTER, SEARCH & CONTROLS ================= */}
      <div className="flex flex-col md:flex-row gap-2.5 sm:items-center justify-between">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search material, supplier, brand..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-xs"
          />
        </div>

        {/* Filter and Sort Pills */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {/* Category Dropdown */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex-shrink-0">
            <Filter className="w-3.5 h-3.5 text-indigo-500" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-transparent text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer pr-1"
            >
              <option value="All">All Categories</option>
              {MATERIAL_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Selector */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex-shrink-0">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer pr-1"
            >
              <option value="recent">Newest First</option>
              <option value="name">Alphabetical</option>
              <option value="cost">Highest Value</option>
              <option value="stock">Lowest Stock First</option>
            </select>
          </div>
        </div>
      </div>

      {/* ================= 5. MATERIALS INVENTORY TABLE ================= */}
      {filteredMaterials.length === 0 ? (
        <div className="p-12 text-center rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/30">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-500 mx-auto flex items-center justify-center mb-3">
            <Boxes className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200">
            No materials found
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1 mb-4">
            {searchQuery || selectedCategory !== "All" || onlyLowStock
              ? "Try clearing your filters or changing search keywords."
              : "Start by recording your clinic's first material or dental supply item."}
          </p>
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add First Material</span>
          </button>
        </div>
      ) : (
        <div className="rounded-3xl border border-slate-200/70 dark:border-slate-800/70 bg-white dark:bg-slate-900 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-800/40 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="py-3 px-4">Material / Item</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3 text-center">Stock Level</th>
                  <th className="py-3 px-3 text-right">Cost Price (Spend)</th>
                  <th className="py-3 px-3 text-right">Patient Fee</th>
                  <th className="py-3 px-3 hidden lg:table-cell">Supplier & Expiry</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
                {filteredMaterials.map((item) => {
                  const isLow = item.quantity <= item.minQuantity;
                  const isOutOfStock = item.quantity === 0;

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors"
                    >
                      {/* Name & Notes */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 dark:text-slate-100">
                          {item.name}
                        </div>
                        <div className="text-[11px] text-slate-400 truncate max-w-xs">
                          {item.notes || item.unit}
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 whitespace-nowrap">
                          {item.category}
                        </span>
                      </td>

                      {/* Stock Adjuster */}
                      <td className="py-3 px-3">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleAdjustQuantity(item, -1)}
                            className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold flex items-center justify-center cursor-pointer transition-colors"
                            title="Decrement stock (-1)"
                          >
                            -
                          </button>

                          <span className={`min-w-[42px] text-center font-mono font-bold px-1.5 py-0.5 rounded-lg text-xs ${
                            isOutOfStock
                              ? "bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900"
                              : isLow
                              ? "bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900"
                              : "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                          }`}>
                            {item.quantity}
                          </span>

                          <button
                            type="button"
                            onClick={() => handleAdjustQuantity(item, 1)}
                            className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold flex items-center justify-center cursor-pointer transition-colors"
                            title="Increment stock (+1)"
                          >
                            +
                          </button>
                        </div>
                        {isLow && (
                          <div className="text-[10px] text-amber-600 dark:text-amber-400 text-center font-semibold mt-0.5">
                            {isOutOfStock ? "Out of stock" : "Low stock"}
                          </div>
                        )}
                      </td>

                      {/* Cost Price */}
                      <td className="py-3 px-3 text-right">
                        <div className="font-mono font-bold text-slate-900 dark:text-slate-100">
                          {formatIQD(item.costPrice)}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          per {item.unit || "unit"}
                        </div>
                      </td>

                      {/* Patient Price */}
                      <td className="py-3 px-3 text-right">
                        <div className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                          {formatIQD(item.patientPrice)}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          procedure fee
                        </div>
                      </td>

                      {/* Supplier & Expiry */}
                      <td className="py-3 px-3 hidden lg:table-cell text-slate-500 dark:text-slate-400">
                        <div className="flex items-center gap-1 text-[11px] truncate max-w-[160px]">
                          {item.supplier && (
                            <span className="flex items-center gap-1">
                              <Truck className="w-3 h-3 text-slate-400" />
                              <span className="truncate">{item.supplier}</span>
                            </span>
                          )}
                        </div>
                        {item.expiryDate && (
                          <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                            <Calendar className="w-3 h-3" />
                            <span>Exp: {item.expiryDate}</span>
                          </div>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(item)}
                            className="p-1.5 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors cursor-pointer"
                            title="Edit Material"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`Delete material "${item.name}" from inventory?`)) {
                                onDeleteMaterial(item.id);
                              }
                            }}
                            className="p-1.5 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                            title="Delete Material"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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
      )}

      {/* ================= 6. ADD / EDIT MATERIAL MODAL ================= */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 animate-in fade-in duration-150"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95">
            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-slate-100">
                  {editingItem ? "Edit Material / Supply" : "Add Clinic Material"}
                </h3>
                <p className="text-[11px] text-slate-400">
                  Set procurement cost and default patient treatment fee
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-5 space-y-3.5">
              {/* Material Name */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                  Material / Brand Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Filtek Z250 Composite (3M)"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3 py-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Category & Unit */}
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                    Specialty Category
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                  >
                    {MATERIAL_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                    Unit Description
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Syringe, Box, Piece"
                    value={formUnit}
                    onChange={(e) => setFormUnit(e.target.value)}
                    className="w-full px-3 py-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Quantities (Current & Min warning) */}
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                    Stock Quantity
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formQuantity}
                    onChange={(e) => setFormQuantity(e.target.value)}
                    className="w-full px-3 py-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 text-xs font-mono font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                    Low Stock Threshold
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formMinQuantity}
                    onChange={(e) => setFormMinQuantity(e.target.value)}
                    className="w-full px-3 py-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 text-xs font-mono font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Pricing (Cost Price Spend vs Patient Price) */}
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                    Clinic Cost / Spend (IQD)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={formCostPrice}
                    onChange={(e) => setFormCostPrice(e.target.value)}
                    className="w-full px-3 py-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 text-xs font-mono font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                    Patient Procedure Fee (IQD)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={formPatientPrice}
                    onChange={(e) => setFormPatientPrice(e.target.value)}
                    className="w-full px-3 py-2 rounded-2xl border border-emerald-200 dark:border-emerald-800/80 bg-emerald-50/40 dark:bg-emerald-950/20 text-xs font-mono font-bold text-emerald-700 dark:text-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Supplier & Expiry */}
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                    Supplier / Depot
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Al-Mansour Dental"
                    value={formSupplier}
                    onChange={(e) => setFormSupplier(e.target.value)}
                    className="w-full px-3 py-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                    Expiry Date
                  </label>
                  <input
                    type="date"
                    value={formExpiryDate}
                    onChange={(e) => setFormExpiryDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                  Clinical Notes / Shade
                </label>
                <input
                  type="text"
                  placeholder="e.g. Shade A2, 4g syringe, lot #204"
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-2xl text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-sm shadow-indigo-600/20 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? "Saving..." : editingItem ? "Update Material" : "Save Material"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
