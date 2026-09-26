import React from "react";
import { Gender } from "@/types/patient";

interface PatientAvatarProps {
  gender: Gender;
  size?: "sm" | "md" | "lg";
  showBadge?: boolean;
  className?: string;
}

export function PatientAvatar({
  gender,
  size = "md",
  showBadge = true,
  className = "",
}: PatientAvatarProps) {
  const isMale = gender === "male";

  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-14 h-14",
  };

  const iconSizes = {
    sm: "w-5 h-5",
    md: "w-6 h-6",
    lg: "w-9 h-9",
  };

  const badgeSizes = {
    sm: "w-3.5 h-3.5 text-[9px] -bottom-0.5 -right-0.5",
    md: "w-4 h-4 text-[10px] -bottom-0.5 -right-0.5",
    lg: "w-5 h-5 text-xs -bottom-1 -right-1",
  };

  return (
    <div className={`relative inline-flex flex-shrink-0 items-center justify-center ${className}`}>
      {/* Avatar Container */}
      <div
        className={`
          ${sizeClasses[size]}
          rounded-full flex items-center justify-center transition-transform duration-200 ease-out
          border shadow-xs
          ${
            isMale
              ? "bg-sky-50 dark:bg-sky-950/50 border-sky-200 dark:border-sky-800/80 text-sky-600 dark:text-sky-300"
              : "bg-rose-50 dark:bg-rose-950/50 border-rose-200 dark:border-rose-800/80 text-rose-600 dark:text-rose-300"
          }
        `}
        title={`Patient gender: ${isMale ? "Male" : "Female"}`}
      >
        {isMale ? (
          /* Distinct Male SVG Avatar */
          <svg
            className={`${iconSizes[size]} transition-transform duration-200`}
            viewBox="0 0 36 36"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-label="Male Avatar"
          >
            {/* Head and styled short hair */}
            <circle cx="18" cy="13" r="6" fill="currentColor" fillOpacity="0.85" />
            <path
              d="M12 12C12 8.68629 14.6863 6 18 6C21.3137 6 24 8.68629 24 12V13C24 13 22 10.5 18 10.5C14 10.5 12 13 12 13V12Z"
              fill="currentColor"
            />
            {/* Shoulders and collar */}
            <path
              d="M8.5 30C8.5 24.7533 12.7533 20.5 18 20.5C23.2467 20.5 27.5 24.7533 27.5 30C27.5 30.5523 27.0523 31 26.5 31H9.5C8.94772 31 8.5 30.5523 8.5 30Z"
              fill="currentColor"
              fillOpacity="0.75"
            />
            {/* V-neck / shirt detail */}
            <path
              d="M15 21L18 25L21 21"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ) : (
          /* Distinct Female SVG Avatar */
          <svg
            className={`${iconSizes[size]} transition-transform duration-200`}
            viewBox="0 0 36 36"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-label="Female Avatar"
          >
            {/* Head */}
            <circle cx="18" cy="13" r="5.7" fill="currentColor" fillOpacity="0.85" />
            {/* Flowing styled hair sides */}
            <path
              d="M12.2 12.5C11.5 15 11 18.5 13 21C13.5 18 14.5 15.5 15 14C13.5 13.5 12.5 13 12.2 12.5Z"
              fill="currentColor"
            />
            <path
              d="M23.8 12.5C24.5 15 25 18.5 23 21C22.5 18 21.5 15.5 21 14C22.5 13.5 23.5 13 23.8 12.5Z"
              fill="currentColor"
            />
            <path
              d="M11.5 13C11.5 9 14.5 6.5 18 6.5C21.5 6.5 24.5 9 24.5 13C23 8.5 20.5 8 18 8C15.5 8 13 8.5 11.5 13Z"
              fill="currentColor"
            />
            {/* Shoulders and neckline */}
            <path
              d="M8.5 30C8.5 25 12.7 20.8 18 20.8C23.3 20.8 27.5 25 27.5 30C27.5 30.5523 27.0523 31 26.5 31H9.5C8.94772 31 8.5 30.5523 8.5 30Z"
              fill="currentColor"
              fillOpacity="0.75"
            />
            {/* Round neckline detail */}
            <path
              d="M15 21.5C15 23.2 16.3 24.5 18 24.5C19.7 24.5 21 23.2 21 21.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        )}
      </div>

      {/* Distinct Gender Badge Indicator */}
      {showBadge && (
        <span
          className={`
            absolute ${badgeSizes[size]} rounded-full flex items-center justify-center font-bold ring-2 ring-white dark:ring-slate-900 shadow-xs
            ${
              isMale
                ? "bg-sky-600 text-white dark:bg-sky-500"
                : "bg-rose-500 text-white dark:bg-rose-500"
            }
          `}
          title={isMale ? "Male (♂)" : "Female (♀)"}
        >
          {isMale ? "♂" : "♀"}
        </span>
      )}
    </div>
  );
}
