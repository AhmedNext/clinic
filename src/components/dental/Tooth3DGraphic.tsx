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

  const gId = `t${toothNumber}`;
  const crownGrad = `cg-${gId}`;
  const rootGrad = `rg-${gId}`;
  const shineGrad = `sg-${gId}`;

  // Treatment color overrides
  const crownFill =
    status === "extraction"
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

  const crownStroke =
    status === "extraction"
      ? "#ef4444"
      : status === "crown"
      ? "#2563eb"
      : status === "filling"
      ? "#d97706"
      : status === "root_canal"
      ? "#7c3aed"
      : status === "decay"
      ? "#c2410c"
      : status === "treated"
      ? "#059669"
      : "#334155";

  const strokeW = status ? "1.2" : "0.9";
  const rootStroke = "#8c6834";

  return (
    <div
      className={`relative inline-flex items-center justify-center transition-all duration-200 ${
        isSelected
          ? "scale-110 drop-shadow-[0_4px_12px_rgba(99,102,241,0.5)]"
          : "hover:scale-105"
      } ${className}`}
    >
      <svg
        viewBox="0 0 48 88"
        className="w-full h-full overflow-visible"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Authentic Enamel White Gradient with subtle 3D lighting */}
          <linearGradient id={crownGrad} x1="20%" y1="0%" x2="80%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="60%" stopColor="#fbfcfe" />
            <stop offset="85%" stopColor="#f1f5f9" />
            <stop offset="100%" stopColor="#e2e8f0" />
          </linearGradient>

          {/* Authentic Warm Dentin Root Gradient matching anatomical FDI chart */}
          <linearGradient id={rootGrad} x1="30%" y1="0%" x2="70%" y2="100%">
            <stop offset="0%" stopColor="#fff8e7" />
            <stop offset="40%" stopColor="#fae7be" />
            <stop offset="80%" stopColor="#f2d599" />
            <stop offset="100%" stopColor="#e2be7c" />
          </linearGradient>

          {/* Specular enamel shine */}
          <radialGradient id={shineGrad} cx="30%" cy="25%" r="50%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.85" />
            <stop offset="60%" stopColor="#ffffff" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>
        </defs>

        {isUpper ? (
          /* ===================================================================
             UPPER JAW: ROOTS POINT UP, CROWNS POINT DOWN (MATCHING DIAGRAM)
             =================================================================== */
          <g>
            {/* ─── 1. UPPER MOLAR (18, 17, 16 / 26, 27, 28) ─── */}
            {category === "molar" && (
              <>
                {/* Palatal Root (center back root) */}
                <path
                  d="M21 44 C20 32 21 16 23 4 C24 2 26 2 27 4 C29 16 29 32 28 44 Z"
                  fill={`url(#${rootGrad})`}
                  stroke={rootStroke}
                  strokeWidth="0.8"
                />
                {/* Mesial Root (left curved root) */}
                <path
                  d="M17 44 C15 34 11 20 8 7 C7 4 10 3 12 5 C15 11 19 26 21 44 Z"
                  fill={`url(#${rootGrad})`}
                  stroke={rootStroke}
                  strokeWidth="0.8"
                />
                {/* Distal Root (right curved root) */}
                <path
                  d="M28 44 C30 26 34 11 37 5 C39 3 42 4 41 7 C38 20 34 34 32 44 Z"
                  fill={`url(#${rootGrad})`}
                  stroke={rootStroke}
                  strokeWidth="0.8"
                />

                {/* Wide Anatomical Crown with multi-cusp lobes */}
                <path
                  d="M7 43 
                     C5 48 5 62 7 71 
                     C9 77 12 82 17 83 
                     C20 83.5 22 81 24 81 
                     C26 81 28 83.5 31 83 
                     C36 82 39 77 41 71 
                     C43 62 43 48 41 43 
                     C37 45 32 44 24 44 
                     C16 44 11 45 7 43 Z"
                  fill={crownFill}
                  stroke={crownStroke}
                  strokeWidth={strokeW}
                />

                {/* Cervical line (gumline boundary arc) */}
                <path
                  d="M7 43 C15 46 33 46 41 43"
                  stroke={rootStroke}
                  strokeWidth="0.8"
                  opacity="0.75"
                />

                {/* Occlusal fissure lines */}
                <path
                  d="M18 78 Q24 75 30 78 M24 74 V81"
                  stroke="#64748b"
                  strokeWidth="0.8"
                  strokeLinecap="round"
                  opacity="0.45"
                />
                <ellipse cx="14" cy="58" rx="5" ry="11" fill={`url(#${shineGrad})`} />
              </>
            )}

            {/* ─── 2. UPPER PREMOLAR (15, 14 / 24, 25) ─── */}
            {category === "premolar" && (
              <>
                {/* Left Root Tip */}
                <path
                  d="M17 44 C16 32 14 18 13 8 C13 5 15 4 17 6 C19 12 21 28 22 44 Z"
                  fill={`url(#${rootGrad})`}
                  stroke={rootStroke}
                  strokeWidth="0.8"
                />
                {/* Right Root Tip */}
                <path
                  d="M26 44 C27 28 29 12 31 6 C33 4 35 5 35 8 C34 18 32 32 31 44 Z"
                  fill={`url(#${rootGrad})`}
                  stroke={rootStroke}
                  strokeWidth="0.8"
                />

                {/* Bicuspid Crown */}
                <path
                  d="M11 43 
                     C9 48 9 60 11 69 
                     C13 76 16 80 20 81.5 
                     C22 82 23 80.5 24 80.5 
                     C25 80.5 26 82 28 81.5 
                     C32 80 35 76 37 69 
                     C39 60 39 48 37 43 
                     C33 45 28 44 24 44 
                     C20 44 15 45 11 43 Z"
                  fill={crownFill}
                  stroke={crownStroke}
                  strokeWidth={strokeW}
                />

                {/* Cervical line */}
                <path
                  d="M11 43 C17 45.5 31 45.5 37 43"
                  stroke={rootStroke}
                  strokeWidth="0.8"
                  opacity="0.75"
                />

                {/* Bicuspid groove */}
                <path
                  d="M20 77 Q24 75 28 77 M24 72 V79"
                  stroke="#64748b"
                  strokeWidth="0.7"
                  strokeLinecap="round"
                  opacity="0.4"
                />
                <ellipse cx="16" cy="58" rx="4" ry="10" fill={`url(#${shineGrad})`} />
              </>
            )}

            {/* ─── 3. UPPER CANINE (13 / 23) ─── */}
            {category === "canine" && (
              <>
                {/* Very Tall Single Stout Root (reaches highest point at apex) */}
                <path
                  d="M19 44 C18 28 17 14 19 3 C20 1 22 1 24 1 C26 1 28 1 29 3 C31 14 30 28 29 44 Z"
                  fill={`url(#${rootGrad})`}
                  stroke={rootStroke}
                  strokeWidth="0.9"
                />

                {/* Pointed Canine Diamond Cusp Crown */}
                <path
                  d="M12 43 
                     C10 49 11 62 13 71 
                     C15 76 18 80 24 85 
                     C30 80 33 76 35 71 
                     C37 62 38 49 36 43 
                     C32 45 28 44 24 44 
                     C20 44 16 45 12 43 Z"
                  fill={crownFill}
                  stroke={crownStroke}
                  strokeWidth={strokeW}
                />

                {/* Cervical line */}
                <path
                  d="M12 43 C17 45.5 31 45.5 36 43"
                  stroke={rootStroke}
                  strokeWidth="0.8"
                  opacity="0.75"
                />

                {/* Labial ridge line */}
                <path
                  d="M24 46 V80"
                  stroke="#64748b"
                  strokeWidth="0.6"
                  strokeLinecap="round"
                  opacity="0.35"
                />
                <ellipse cx="17" cy="58" rx="4" ry="11" fill={`url(#${shineGrad})`} />
              </>
            )}

            {/* ─── 4. UPPER INCISOR (11, 12 / 21, 22) ─── */}
            {category === "incisor" && (
              <>
                {/* Conical straight root */}
                <path
                  d="M19 44 C18 30 19 16 20 6 C21 3 23 2 24 2 C25 2 27 3 28 6 C29 16 30 30 29 44 Z"
                  fill={`url(#${rootGrad})`}
                  stroke={rootStroke}
                  strokeWidth="0.85"
                />

                {/* Broad Spade/Chisel Crown with flat horizontal incisal edge */}
                <path
                  d="M11 43 
                     C10 49 10 63 11 72 
                     C11.5 78 13 83 15 83 
                     L33 83 
                     C35 83 36.5 78 37 72 
                     C38 63 38 49 37 43 
                     C33 45 28 44 24 44 
                     C20 44 15 45 11 43 Z"
                  fill={crownFill}
                  stroke={crownStroke}
                  strokeWidth={strokeW}
                />

                {/* Cervical line */}
                <path
                  d="M11 43 C17 45.5 31 45.5 37 43"
                  stroke={rootStroke}
                  strokeWidth="0.8"
                  opacity="0.75"
                />

                {/* Developmental lobes */}
                <path
                  d="M18 48 V65 M30 48 V65"
                  stroke="#64748b"
                  strokeWidth="0.5"
                  strokeLinecap="round"
                  opacity="0.25"
                />
                <ellipse cx="17" cy="58" rx="5" ry="11" fill={`url(#${shineGrad})`} />
              </>
            )}
          </g>
        ) : (
          /* ===================================================================
             LOWER JAW: CROWNS POINT UP, ROOTS POINT DOWN (MATCHING DIAGRAM)
             =================================================================== */
          <g>
            {/* ─── 1. LOWER MOLAR (48, 47, 46 / 36, 37, 38) ─── */}
            {category === "molar" && (
              <>
                {/* Mesial Root (left root pointing down) */}
                <path
                  d="M16 45 C15 54 12 68 10 79 C9 83 12 85 14 83 C17 78 19 64 21 45 Z"
                  fill={`url(#${rootGrad})`}
                  stroke={rootStroke}
                  strokeWidth="0.8"
                />
                {/* Distal Root (right root pointing down) */}
                <path
                  d="M27 45 C29 64 31 78 34 83 C36 85 39 83 38 79 C36 68 33 54 32 45 Z"
                  fill={`url(#${rootGrad})`}
                  stroke={rootStroke}
                  strokeWidth="0.8"
                />

                {/* Wide Anatomical Crown pointing UP */}
                <path
                  d="M7 45 
                     C5 40 5 26 7 17 
                     C9 11 12 6 17 5 
                     C20 4.5 22 7 24 7 
                     C26 7 28 4.5 31 5 
                     C36 6 39 11 41 17 
                     C43 26 43 40 41 45 
                     C37 43 32 44 24 44 
                     C16 44 11 43 7 45 Z"
                  fill={crownFill}
                  stroke={crownStroke}
                  strokeWidth={strokeW}
                />

                {/* Cervical line */}
                <path
                  d="M7 45 C15 42.5 33 42.5 41 45"
                  stroke={rootStroke}
                  strokeWidth="0.8"
                  opacity="0.75"
                />

                {/* Occlusal fissure lines */}
                <path
                  d="M18 10 Q24 13 30 10 M24 7 V14"
                  stroke="#64748b"
                  strokeWidth="0.8"
                  strokeLinecap="round"
                  opacity="0.45"
                />
                <ellipse cx="14" cy="28" rx="5" ry="11" fill={`url(#${shineGrad})`} />
              </>
            )}

            {/* ─── 2. LOWER PREMOLAR (45, 44 / 34, 35) ─── */}
            {category === "premolar" && (
              <>
                {/* Single Tapering Root pointing down */}
                <path
                  d="M19 45 C18 56 19 68 20 78 C21 82 23 83 24 83 C25 83 27 82 28 78 C29 68 30 56 29 45 Z"
                  fill={`url(#${rootGrad})`}
                  stroke={rootStroke}
                  strokeWidth="0.8"
                />

                {/* Rounded Bicuspid Crown pointing UP */}
                <path
                  d="M11 45 
                     C9 40 9 28 11 19 
                     C13 12 16 8 20 6.5 
                     C22 6 23 7.5 24 7.5 
                     C25 7.5 26 6 28 6.5 
                     C32 8 35 12 37 19 
                     C39 28 39 40 37 45 
                     C33 43 28 44 24 44 
                     C20 44 15 43 11 45 Z"
                  fill={crownFill}
                  stroke={crownStroke}
                  strokeWidth={strokeW}
                />

                {/* Cervical line */}
                <path
                  d="M11 45 C17 42.5 31 42.5 37 45"
                  stroke={rootStroke}
                  strokeWidth="0.8"
                  opacity="0.75"
                />

                {/* Bicuspid groove */}
                <path
                  d="M20 11 Q24 13 28 11"
                  stroke="#64748b"
                  strokeWidth="0.7"
                  strokeLinecap="round"
                  opacity="0.4"
                />
                <ellipse cx="16" cy="28" rx="4" ry="10" fill={`url(#${shineGrad})`} />
              </>
            )}

            {/* ─── 3. LOWER CANINE (43 / 33) ─── */}
            {category === "canine" && (
              <>
                {/* Very Long Stout Root pointing down (reaches lowest point at apex) */}
                <path
                  d="M19 45 C18 60 17 74 19 85 C20 87 22 87 24 87 C26 87 28 87 29 85 C31 74 30 60 29 45 Z"
                  fill={`url(#${rootGrad})`}
                  stroke={rootStroke}
                  strokeWidth="0.9"
                />

                {/* Pointed Canine Diamond Cusp Crown pointing UP */}
                <path
                  d="M12 45 
                     C10 39 11 26 13 17 
                     C15 12 18 8 24 3 
                     C30 8 33 12 35 17 
                     C37 26 38 39 36 45 
                     C32 43 28 44 24 44 
                     C20 44 16 43 12 45 Z"
                  fill={crownFill}
                  stroke={crownStroke}
                  strokeWidth={strokeW}
                />

                {/* Cervical line */}
                <path
                  d="M12 45 C17 42.5 31 42.5 36 45"
                  stroke={rootStroke}
                  strokeWidth="0.8"
                  opacity="0.75"
                />

                {/* Labial ridge line */}
                <path
                  d="M24 42 V8"
                  stroke="#64748b"
                  strokeWidth="0.6"
                  strokeLinecap="round"
                  opacity="0.35"
                />
                <ellipse cx="17" cy="28" rx="4" ry="11" fill={`url(#${shineGrad})`} />
              </>
            )}

            {/* ─── 4. LOWER INCISOR (41, 42 / 31, 32) ─── */}
            {category === "incisor" && (
              <>
                {/* Very Slender Straight Root pointing down */}
                <path
                  d="M20 45 C19 58 19 72 20 82 C21 84 23 85 24 85 C25 85 27 84 28 82 C29 72 29 58 28 45 Z"
                  fill={`url(#${rootGrad})`}
                  stroke={rootStroke}
                  strokeWidth="0.8"
                />

                {/* Slender Chisel Crown with flat horizontal incisal edge at top */}
                <path
                  d="M13 45 
                     C12 39 12 25 13 16 
                     C13.5 10 15 5 17 5 
                     L31 5 
                     C33 5 34.5 10 35 16 
                     C36 25 36 39 35 45 
                     C31 43 28 44 24 44 
                     C20 44 17 43 13 45 Z"
                  fill={crownFill}
                  stroke={crownStroke}
                  strokeWidth={strokeW}
                />

                {/* Cervical line */}
                <path
                  d="M13 45 C17 42.5 31 42.5 35 45"
                  stroke={rootStroke}
                  strokeWidth="0.8"
                  opacity="0.75"
                />

                <ellipse cx="17" cy="28" rx="4" ry="10" fill={`url(#${shineGrad})`} />
              </>
            )}
          </g>
        )}

        {/* ─── CLINICAL TREATMENT OVERLAYS (VECTOR) ─── */}
        {treatment && (
          <g>
            {/* Extraction: Red anatomical X */}
            {status === "extraction" && (
              <g stroke="#dc2626" strokeWidth="3" strokeLinecap="round" opacity="0.9">
                <line x1="8" y1="12" x2="40" y2="76" />
                <line x1="40" y1="12" x2="8" y2="76" />
              </g>
            )}

            {/* Crown: Blue prosthetic translucent cap over the anatomical crown */}
            {status === "crown" && (
              <rect
                x="8"
                y={isUpper ? "44" : "5"}
                width="32"
                height="38"
                rx="6"
                fill="#3b82f6"
                fillOpacity="0.25"
                stroke="#1d4ed8"
                strokeWidth="1.5"
                strokeDasharray="3 2"
              />
            )}

            {/* Filling: Amber composite filling restoration */}
            {status === "filling" && (
              <circle
                cx="24"
                cy={isUpper ? "66" : "22"}
                r="6.5"
                fill="#f59e0b"
                stroke="#b45309"
                strokeWidth="1.5"
              />
            )}

            {/* Root Canal: Purple endodontic canal path running along roots */}
            {status === "root_canal" && (
              <>
                <path
                  d={isUpper ? "M24 6 V 64" : "M24 82 V 24"}
                  stroke="#7c3aed"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeDasharray="3 3"
                />
                <circle
                  cx="24"
                  cy={isUpper ? "64" : "24"}
                  r="3.5"
                  fill="#7c3aed"
                  opacity="0.8"
                />
              </>
            )}

            {/* Decay: Orange-brown carious cavity spots */}
            {status === "decay" && (
              <>
                <circle
                  cx="20"
                  cy={isUpper ? "60" : "24"}
                  r="3.5"
                  fill="#ea580c"
                  stroke="#9a3412"
                  strokeWidth="0.8"
                  opacity="0.9"
                />
                <circle
                  cx="28"
                  cy={isUpper ? "68" : "32"}
                  r="2.5"
                  fill="#9a3412"
                  opacity="0.75"
                />
              </>
            )}

            {/* Treated: Emerald checkmark indicator */}
            {status === "treated" && (
              <circle
                cx="24"
                cy={isUpper ? "64" : "24"}
                r="5.5"
                fill="#10b981"
                stroke="#047857"
                strokeWidth="1.5"
              />
            )}
          </g>
        )}
      </svg>

      {/* Tiny corner treatment badge */}
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
