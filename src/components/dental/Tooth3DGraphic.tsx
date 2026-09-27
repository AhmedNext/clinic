import React from "react";
import { ToothCategory, ToothJaw, ToothTreatment, TREATMENT_METADATA } from "@/types/dental";

interface Tooth3DGraphicProps {
  category: ToothCategory;
  jaw: ToothJaw;
  toothNumber: number;
  status?: ToothTreatment;
  isSelected?: boolean;
  className?: string;
}

export function Tooth3DGraphic({
  category,
  jaw,
  toothNumber,
  status,
  isSelected = false,
  className = "",
}: Tooth3DGraphicProps) {
  const isUpper = jaw === "upper";
  const treatment = status ? TREATMENT_METADATA[status] : null;

  const gId = `g${toothNumber}`;
  const crownGrad = `cg-${gId}`;
  const rootGrad = `rg-${gId}`;
  const shineGrad = `sg-${gId}`;
  const shadowFilter = `sf-${gId}`;

  // Colour overrides when treatment is applied
  const crownFill = status === "extraction"
    ? "#fca5a5"
    : status === "crown"
    ? "#bfdbfe"
    : status === "filling"
    ? "#fde68a"
    : status === "root_canal"
    ? "#ddd6fe"
    : status === "decay"
    ? "#fed7aa"
    : `url(#${crownGrad})`;

  const crownStroke = status === "extraction"
    ? "#ef4444"
    : status === "crown"
    ? "#3b82f6"
    : status === "filling"
    ? "#f59e0b"
    : status === "root_canal"
    ? "#8b5cf6"
    : status === "decay"
    ? "#ea580c"
    : status === "treated"
    ? "#10b981"
    : "#c8d3df";

  const strokeW = status ? "1.2" : "0.7";

  return (
    <div
      className={`relative inline-flex items-end justify-center transition-all duration-200 ${
        isSelected ? "scale-115 drop-shadow-[0_6px_14px_rgba(99,102,241,0.45)]" : "hover:scale-105"
      } ${className}`}
    >
      <svg
        viewBox="0 0 48 86"
        className="w-full h-full overflow-visible"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Enamel pearl gradient */}
          <linearGradient id={crownGrad} x1="15%" y1="0%" x2="85%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="35%" stopColor="#f8fafc" />
            <stop offset="70%" stopColor="#edf2f7" />
            <stop offset="100%" stopColor="#dce4ef" />
          </linearGradient>

          {/* Natural Dentin Root gradient (matching the warm authentic FDI anatomical chart) */}
          <linearGradient id={rootGrad} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fdf8ed" />
            <stop offset="35%" stopColor="#f7e9c8" />
            <stop offset="75%" stopColor="#eed6a2" />
            <stop offset="100%" stopColor="#debe85" />
          </linearGradient>

          {/* Enamel specular shine */}
          <radialGradient id={shineGrad} cx="30%" cy="25%" r="50%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
            <stop offset="55%" stopColor="#ffffff" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>

          {/* Soft shadow */}
          <filter id={shadowFilter} x="-25%" y="-25%" width="150%" height="150%">
            <feDropShadow dx="0" dy="1.5" stdDeviation="2" floodColor="#0f172a" floodOpacity="0.14" />
          </filter>
        </defs>

        {isUpper ? (
          /* ═══ UPPER JAW — roots point up, crown points down ═══ */
          <g filter={`url(#${shadowFilter})`}>

            {/* ── Upper Molar (18,17,16,15 / 25,26,27,28) ── */}
            {category === "molar" && (
              <>
                {/* Palatal root (centre-back) */}
                <path
                  d="M21 44 C20 36 19 24 18 13 C17 8 19 5 21 7 C22 9 23 9 24 7 C26 5 28 8 27 13 C26 24 25 36 24 44 Z"
                  fill={`url(#${rootGrad})`} stroke="#cbb389" strokeWidth="0.6"
                />
                {/* Mesiobuccal root (left) */}
                <path
                  d="M16 44 C14 36 11 25 10 14 C9 8 11 6 13 8 C15 10 16 18 17 38 Z"
                  fill={`url(#${rootGrad})`} stroke="#cbb389" strokeWidth="0.6"
                />
                {/* Distobuccal root (right) */}
                <path
                  d="M29 44 C31 36 34 26 35 15 C36 9 34 7 32 9 C30 11 29 20 28 38 Z"
                  fill={`url(#${rootGrad})`} stroke="#cbb389" strokeWidth="0.6"
                />
                {/* Crown — wide, flat-bottomed, multi-cusp */}
                <path
                  d="M7 42 C6 46 6 58 8 66 C10 73 13 78 16 80 C18 82 30 82 32 80 C35 78 38 73 40 66 C42 58 42 46 41 42 C37 44 31 43 24 43 C17 43 11 44 7 42 Z"
                  fill={crownFill} stroke={crownStroke} strokeWidth={strokeW}
                />
                {/* Occlusal groove */}
                <path
                  d="M16 74 Q24 78 32 74 M24 68 V 78"
                  stroke="#94a3b8" strokeWidth="0.9" strokeLinecap="round" opacity="0.45"
                />
                {/* Buccal groove */}
                <path
                  d="M24 42 V 56" stroke="#94a3b8" strokeWidth="0.6" strokeLinecap="round" opacity="0.3"
                />
                {/* Shine */}
                <ellipse cx="15" cy="57" rx="6" ry="12" fill={`url(#${shineGrad})`} />
              </>
            )}

            {/* ── Upper Premolar ── */}
            {category === "premolar" && (
              <>
                {/* Buccal root */}
                <path
                  d="M19 44 C18 34 16 20 15 10 C14 5 16 3 18 6 C19 8 20 16 21 42 Z"
                  fill={`url(#${rootGrad})`} stroke="#cbb389" strokeWidth="0.6"
                />
                {/* Palatal root */}
                <path
                  d="M26 44 C27 34 29 20 30 10 C31 5 29 3 27 6 C26 8 25 16 24 42 Z"
                  fill={`url(#${rootGrad})`} stroke="#cbb389" strokeWidth="0.6"
                />
                {/* Crown — slightly narrower, two cusps */}
                <path
                  d="M11 42 C10 46 10 59 13 68 C15 74 18 78 22 79 C26 78 29 74 31 68 C34 59 34 46 33 42 C29 43 25 43 22 43 C19 43 15 43 11 42 Z"
                  fill={crownFill} stroke={crownStroke} strokeWidth={strokeW}
                />
                {/* Two cusps groove */}
                <path
                  d="M22 44 V 56 M15 68 Q22 72 29 68"
                  stroke="#94a3b8" strokeWidth="0.7" strokeLinecap="round" opacity="0.4"
                />
                <ellipse cx="16" cy="56" rx="5" ry="10" fill={`url(#${shineGrad})`} />
              </>
            )}

            {/* ── Upper Canine ── */}
            {category === "canine" && (
              <>
                {/* Long single tapering root */}
                <path
                  d="M20 44 C19 30 18 16 19 6 C20 2 22 1 24 1 C26 1 28 2 29 6 C30 16 29 30 28 44 Z"
                  fill={`url(#${rootGrad})`} stroke="#cbb389" strokeWidth="0.6"
                />
                {/* Crown — pointed cusp top, convex labial face */}
                <path
                  d="M12 42 C11 48 12 60 14 70 C16 76 19 81 24 82 C29 81 32 76 34 70 C36 60 37 48 36 42 C33 43 28 43 24 43 C20 43 15 43 12 42 Z"
                  fill={crownFill} stroke={crownStroke} strokeWidth={strokeW}
                />
                {/* Labial ridge line */}
                <path d="M24 44 V 78" stroke="#94a3b8" strokeWidth="0.6" strokeLinecap="round" opacity="0.35" />
                <ellipse cx="17" cy="56" rx="4" ry="11" fill={`url(#${shineGrad})`} />
              </>
            )}

            {/* ── Upper Incisor ── */}
            {category === "incisor" && (
              <>
                {/* Straight root */}
                <path
                  d="M20 44 C19 30 19 16 20 7 C21 3 23 1 24 1 C25 1 27 3 28 7 C29 16 29 30 28 44 Z"
                  fill={`url(#${rootGrad})`} stroke="#cbb389" strokeWidth="0.6"
                />
                {/* Chisel-shaped crown */}
                <path
                  d="M12 42 C11 47 12 61 13 70 C14 76 17 81 24 82 C31 81 34 76 35 70 C36 61 37 47 36 42 C32 43 28 43 24 43 C20 43 16 43 12 42 Z"
                  fill={crownFill} stroke={crownStroke} strokeWidth={strokeW}
                />
                {/* Incisal mamelons */}
                <path d="M14 79 Q24 83 34 79" stroke="#94a3b8" strokeWidth="0.8" strokeLinecap="round" opacity="0.4" />
                <path d="M20 42 V 55 M28 42 V 55" stroke="#94a3b8" strokeWidth="0.5" strokeLinecap="round" opacity="0.2" />
                <ellipse cx="17" cy="56" rx="5" ry="11" fill={`url(#${shineGrad})`} />
              </>
            )}
          </g>
        ) : (
          /* ═══ LOWER JAW — crown points up, roots point down ═══ */
          <g filter={`url(#${shadowFilter})`}>

            {/* ── Lower Molar ── */}
            {category === "molar" && (
              <>
                {/* Crown up — wide, flat top */}
                <path
                  d="M7 44 C6 40 6 28 8 20 C10 13 13 8 16 6 C18 4 30 4 32 6 C35 8 38 13 40 20 C42 28 42 40 41 44 C37 42 31 43 24 43 C17 43 11 42 7 44 Z"
                  fill={crownFill} stroke={crownStroke} strokeWidth={strokeW}
                />
                {/* Occlusal groove */}
                <path
                  d="M16 12 Q24 8 32 12 M24 8 V 18"
                  stroke="#94a3b8" strokeWidth="0.9" strokeLinecap="round" opacity="0.45"
                />
                {/* Buccal groove */}
                <path d="M24 44 V 30" stroke="#94a3b8" strokeWidth="0.6" strokeLinecap="round" opacity="0.3" />
                {/* Mesial root */}
                <path
                  d="M16 44 C14 52 11 63 10 72 C9 78 11 80 13 78 C15 76 16 66 18 46 Z"
                  fill={`url(#${rootGrad})`} stroke="#cbb389" strokeWidth="0.6"
                />
                {/* Distal root */}
                <path
                  d="M29 44 C31 52 34 63 35 72 C36 78 34 80 32 78 C30 76 29 66 27 46 Z"
                  fill={`url(#${rootGrad})`} stroke="#cbb389" strokeWidth="0.6"
                />
                <ellipse cx="15" cy="26" rx="6" ry="11" fill={`url(#${shineGrad})`} />
              </>
            )}

            {/* ── Lower Premolar ── */}
            {category === "premolar" && (
              <>
                <path
                  d="M11 44 C10 40 10 27 13 18 C15 11 18 7 22 6 C26 7 29 11 31 18 C34 27 34 40 33 44 C29 42 25 43 22 43 C19 43 15 42 11 44 Z"
                  fill={crownFill} stroke={crownStroke} strokeWidth={strokeW}
                />
                <path
                  d="M15 13 Q22 9 29 13"
                  stroke="#94a3b8" strokeWidth="0.7" strokeLinecap="round" opacity="0.4"
                />
                <path
                  d="M18 44 C18 56 20 66 22 76 C24 66 26 56 26 44 Z"
                  fill={`url(#${rootGrad})`} stroke="#cbb389" strokeWidth="0.6"
                />
                <ellipse cx="16" cy="27" rx="5" ry="10" fill={`url(#${shineGrad})`} />
              </>
            )}

            {/* ── Lower Canine ── */}
            {category === "canine" && (
              <>
                <path
                  d="M12 44 C11 40 12 26 14 16 C16 8 19 4 24 3 C29 4 32 8 34 16 C36 26 37 40 36 44 C33 43 28 43 24 43 C20 43 15 43 12 44 Z"
                  fill={crownFill} stroke={crownStroke} strokeWidth={strokeW}
                />
                <path d="M24 44 V 10" stroke="#94a3b8" strokeWidth="0.6" strokeLinecap="round" opacity="0.35" />
                <path
                  d="M20 44 C19 56 20 66 22 78 C24 66 25 56 25 44 Z"
                  fill={`url(#${rootGrad})`} stroke="#cbb389" strokeWidth="0.6"
                />
                <ellipse cx="17" cy="26" rx="4" ry="11" fill={`url(#${shineGrad})`} />
              </>
            )}

            {/* ── Lower Incisor ── */}
            {category === "incisor" && (
              <>
                <path
                  d="M13 44 C12 40 13 27 14 18 C15 10 18 6 24 5 C30 6 33 10 34 18 C35 27 36 40 35 44 C31 42 28 43 24 43 C20 43 17 42 13 44 Z"
                  fill={crownFill} stroke={crownStroke} strokeWidth={strokeW}
                />
                {/* Incisal edge */}
                <path d="M15 7 Q24 4 33 7" stroke="#94a3b8" strokeWidth="0.8" strokeLinecap="round" opacity="0.4" />
                <path d="M20 44 V 32 M28 44 V 32" stroke="#94a3b8" strokeWidth="0.5" strokeLinecap="round" opacity="0.2" />
                <path
                  d="M19 44 C18 56 20 67 22 78 C24 67 26 56 26 44 Z"
                  fill={`url(#${rootGrad})`} stroke="#cbb389" strokeWidth="0.6"
                />
                <ellipse cx="17" cy="27" rx="5" ry="10" fill={`url(#${shineGrad})`} />
              </>
            )}
          </g>
        )}

        {/* ── TREATMENT OVERLAYS ── */}
        {treatment && (
          <g>
            {status === "extraction" && (
              /* Bold red X */
              <g stroke="#dc2626" strokeWidth="3" strokeLinecap="round" opacity="0.85">
                <line x1="10" y1="15" x2="38" y2="70" />
                <line x1="38" y1="15" x2="10" y2="70" />
              </g>
            )}
            {status === "crown" && (
              /* Blue translucent cap over crown */
              <rect
                x={isUpper ? "9" : "9"}
                y={isUpper ? "43" : "6"}
                width="30" height="36" rx="8"
                fill="#3b82f6" fillOpacity="0.22"
                stroke="#2563eb" strokeWidth="1.5" strokeDasharray="3 2"
              />
            )}
            {status === "filling" && (
              /* Amber filling dot */
              <circle
                cx="24" cy={isUpper ? "66" : "20"} r="6"
                fill="#f59e0b" stroke="#d97706" strokeWidth="1.5"
              />
            )}
            {status === "root_canal" && (
              /* Purple dashed pulp line through root */
              <>
                <path
                  d={isUpper ? "M24 8 V 60" : "M24 78 V 26"}
                  stroke="#8b5cf6" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="3 3"
                />
                <circle
                  cx="24" cy={isUpper ? "60" : "26"} r="3.5"
                  fill="#8b5cf6" opacity="0.6"
                />
              </>
            )}
            {status === "decay" && (
              /* Orange-brown caries spots */
              <>
                <circle cx="20" cy={isUpper ? "60" : "24"} r="3.5" fill="#ea580c" stroke="#c2410c" strokeWidth="0.8" opacity="0.85" />
                <circle cx="28" cy={isUpper ? "68" : "32"} r="2.5" fill="#b45309" opacity="0.65" />
              </>
            )}
            {status === "treated" && (
              /* Green check circle */
              <circle
                cx="24" cy={isUpper ? "64" : "22"} r="5.5"
                fill="#10b981" stroke="#059669" strokeWidth="1.5"
              />
            )}
          </g>
        )}
      </svg>

      {/* Colour dot badge */}
      {treatment && (
        <span
          className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full ring-2 ring-white dark:ring-slate-900 shadow-sm"
          style={{ backgroundColor: treatment.color }}
          title={treatment.label}
        />
      )}
    </div>
  );
}
