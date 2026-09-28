import React from "react";

interface ClinicLogoProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
  size?: number | string;
}

export function ClinicLogo({ className = "w-8 h-8", size, ...props }: ClinicLogoProps) {
  const uniqueId = React.useId().replace(/:/g, "_");
  const gradTooth = `tooth-grad-${uniqueId}`;
  const gradCross = `cross-grad-${uniqueId}`;
  const gradGlow = `glow-${uniqueId}`;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      fill="none"
      width={size}
      height={size}
      className={className}
      {...props}
    >
      <defs>
        {/* Main Tooth Fill Gradient: Pure crystalline dental gradient */}
        <linearGradient id={gradTooth} x1="20%" y1="0%" x2="80%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="60%" stopColor="#f0f4ff" />
          <stop offset="100%" stopColor="#c7d2fe" />
        </linearGradient>

        {/* Medical Cross Accent Gradient: Vibrant Blue to Indigo */}
        <linearGradient id={gradCross} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#06b6d4" />
          <stop offset="50%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#6366f1" />
        </linearGradient>

        {/* Outer Glow filter for medical brilliance */}
        <filter id={gradGlow} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#38bdf8" floodOpacity="0.45" />
        </filter>
      </defs>

      {/* Stylized Modern Tooth Silhouette */}
      <path
        d="M 50 14
           C 65 14, 78 20, 78 36
           C 78 48, 73 60, 68 73
           C 63 84, 57 88, 54 88
           C 51.5 88, 50.5 82, 50 76
           C 49.5 82, 48.5 88, 46 88
           C 43 88, 37 84, 32 73
           C 27 60, 22 48, 22 36
           C 22 20, 35 14, 50 14 Z"
        fill={`url(#${gradTooth})`}
        filter={`url(#${gradGlow})`}
      />

      {/* Tooth Crown Ridge / Gloss Line */}
      <path
        d="M 33 26 C 39 21, 46 21, 50 23 C 54 21, 61 21, 67 26"
        stroke="#818cf8"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
        opacity="0.65"
      />

      {/* Modern Medical Plus / Cross in Center */}
      <g transform="translate(50, 48)">
        <rect x="-4" y="-14" width="8" height="28" rx="4" fill={`url(#${gradCross})`} />
        <rect x="-14" y="-4" width="28" height="8" rx="4" fill={`url(#${gradCross})`} />
        {/* Core Jewel Accent */}
        <circle cx="0" cy="0" r="3.2" fill="#ffffff" />
      </g>

      {/* Sparkling Brilliant Star Accent */}
      <path
        d="M 72 20 Q 76 20 76 16 Q 76 20 80 20 Q 76 20 76 24 Q 76 20 72 20 Z"
        fill="#38bdf8"
      />
      <circle cx="26" cy="24" r="1.5" fill="#38bdf8" opacity="0.85" />
    </svg>
  );
}

export default ClinicLogo;
