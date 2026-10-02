"use client";

import React, { useState, useRef, useEffect } from "react";
import { Search, X, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SearchBoxProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  totalMatches?: number;
  suggestions?: string[];
  suggestionsTitle?: string;
  className?: string;
  onClear?: () => void;
}

export function SearchBox({
  value,
  onChange,
  placeholder,
  totalMatches,
  suggestions = [],
  suggestionsTitle = "Quick filters:",
  className,
  onClear,
}: SearchBoxProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [isMac, setIsMac] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const hasValue = value.trim().length > 0;

  // Detect Mac platform for accurate keyboard shortcut glyph
  useEffect(() => {
    if (typeof navigator !== "undefined") {
      setIsMac(/(Mac|iPhone|iPod|iPad)/i.test(navigator.userAgent || navigator.platform));
    }
  }, []);

  // Global shortcut: Press Cmd+K / Ctrl+K or '/' to focus search input
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      const activeTag = (document.activeElement as HTMLElement)?.tagName;
      const isInputActive = ["INPUT", "TEXTAREA", "SELECT"].includes(activeTag);

      // Trigger on Cmd+K or Ctrl+K anytime, or '/' when not typing in another input
      if (
        ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") ||
        (e.key === "/" && !isInputActive)
      ) {
        e.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, []);

  // Close suggestions on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsFocused(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Keyboard navigation within the input: Escape clears or blurs
  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      if (hasValue) {
        onChange("");
        onClear?.();
      } else {
        inputRef.current?.blur();
        setIsFocused(false);
      }
    }
  };

  const handleClear = () => {
    onChange("");
    onClear?.();
    inputRef.current?.focus();
  };

  return (
    <div ref={containerRef} className={cn("relative flex-1 group min-w-0", className)}>
      <div
        className={cn(
          "relative flex items-center w-full rounded-2xl border transition-all duration-200",
          "bg-white/90 dark:bg-slate-900/90 backdrop-blur-md shadow-2xs",
          isFocused
            ? "border-sky-500 ring-2 ring-sky-500/20 shadow-xs bg-white dark:bg-slate-900"
            : "border-slate-200/90 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
        )}
      >
        {/* Leading Search Icon */}
        <div className="absolute inset-y-0 start-0 ps-3.5 flex items-center pointer-events-none transition-colors">
          <Search
            className={cn(
              "w-4 h-4 transition-colors duration-200",
              isFocused || hasValue
                ? "text-sky-500 dark:text-sky-400"
                : "text-slate-400 dark:text-slate-500"
            )}
          />
        </div>

        {/* Search Input */}
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onKeyDown={handleInputKeyDown}
          placeholder={placeholder}
          aria-label={placeholder || "Search"}
          className={cn(
            "w-full py-2.5 ps-10 text-sm text-slate-900 dark:text-slate-100",
            "placeholder-slate-400 dark:placeholder-slate-500 bg-transparent focus:outline-hidden",
            hasValue ? "pe-28" : "pe-16"
          )}
        />

        {/* Trailing Controls: Match Counter Pill / Shortcut Hint / Clear Button */}
        <div className="absolute inset-y-0 end-0 pe-2.5 flex items-center gap-1.5 pointer-events-auto">
          {hasValue ? (
            <>
              {totalMatches !== undefined && (
                <span
                  className={cn(
                    "inline-flex items-center px-2 py-0.5 rounded-full text-[10.5px] font-bold tabular-nums border transition-all animate-in fade-in zoom-in-95 duration-150 select-none",
                    totalMatches > 0
                      ? "bg-sky-50 dark:bg-sky-950/80 text-sky-700 dark:text-sky-300 border-sky-200/70 dark:border-sky-800/60"
                      : "bg-rose-50 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border-rose-200/70 dark:border-rose-800/60"
                  )}
                >
                  {totalMatches} {totalMatches === 1 ? "match" : "matches"}
                </span>
              )}
              <button
                type="button"
                onClick={handleClear}
                title="Clear search (Esc)"
                aria-label="Clear search"
                className="p-1 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer active:scale-90"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => inputRef.current?.focus()}
              title="Click or press ⌘K to search"
              tabIndex={-1}
              className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono font-medium text-slate-400 dark:text-slate-500 bg-slate-100/90 dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 rounded-md select-none cursor-pointer hover:border-slate-300 dark:hover:border-slate-600 transition-colors"
            >
              {isMac ? "⌘K" : "Ctrl K"}
            </button>
          )}
        </div>
      </div>

      {/* Quick Suggestions Dropdown Tray when focused & query is empty */}
      {isFocused && !hasValue && suggestions.length > 0 && (
        <div className="absolute top-full start-0 end-0 mt-1.5 p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-30 animate-in fade-in slide-in-from-top-1 duration-150 ring-1 ring-black/5 dark:ring-white/5">
          <div className="flex items-center gap-1.5 px-2 py-1 text-[11px] font-semibold text-slate-400 dark:text-slate-500">
            <Sparkles className="w-3 h-3 text-sky-500" />
            <span>{suggestionsTitle}</span>
          </div>
          <div className="flex flex-wrap items-center gap-1.5 mt-1 px-1">
            {suggestions.map((item) => (
              <button
                key={item}
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  onChange(item);
                  setIsFocused(false);
                }}
                className="px-2.5 py-1 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-sky-50 hover:text-sky-600 dark:hover:bg-sky-950/60 dark:hover:text-sky-300 border border-slate-200/60 dark:border-slate-700/60 transition-all cursor-pointer active:scale-95"
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
