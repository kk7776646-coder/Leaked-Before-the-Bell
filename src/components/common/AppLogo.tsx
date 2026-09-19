import React from 'react';

interface AppLogoProps {
  className?: string;
}

export const AppLogo: React.FC<AppLogoProps> = ({
  className = 'w-11 h-11',
}) => {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} shrink-0 overflow-visible`}
    >
      <defs>
        {/* Navy Outer Ring Gradient */}
        <linearGradient id="lbbRingGradient" x1="10" y1="15" x2="90" y2="95" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#041228" />
          <stop offset="50%" stopColor="#092040" />
          <stop offset="100%" stopColor="#020A1A" />
        </linearGradient>

        {/* Electric Royal Blue Bell Gradient */}
        <linearGradient id="lbbBellGradient" x1="46" y1="26" x2="46" y2="75" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0066FF" />
          <stop offset="100%" stopColor="#003BCC" />
        </linearGradient>

        {/* Document Fold Gradient */}
        <linearGradient id="lbbFoldGradient" x1="58" y1="6" x2="70" y2="18" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0066FF" />
          <stop offset="100%" stopColor="#0044CC" />
        </linearGradient>
      </defs>

      {/* 1. Dark Navy Outer Arc Frame */}
      <path
        d="M 20 32 C 8 48 8 76 22 90 C 38 104 68 104 84 88 C 96 74 97 50 86 34"
        stroke="url(#lbbRingGradient)"
        strokeWidth="5.5"
        strokeLinecap="round"
      />

      {/* 2. Document Sheet at Top */}
      <g>
        {/* White Document Body */}
        <path
          d="M 26 6 L 58 6 L 70 18 L 70 48 Q 70 50 68 50 L 26 50 Q 24 50 24 48 L 24 8 Q 24 6 26 6 Z"
          fill="#FFFFFF"
          stroke="#071833"
          strokeWidth="3"
          strokeLinejoin="round"
        />
        {/* Folded Corner */}
        <path
          d="M 58 6 L 58 18 L 70 18 Z"
          fill="url(#lbbFoldGradient)"
          stroke="#071833"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        {/* Document Text Bars */}
        <line x1="31" y1="14" x2="52" y2="14" stroke="#4A80F0" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="31" y1="21" x2="48" y2="21" stroke="#5A92F2" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="31" y1="28" x2="42" y2="28" stroke="#7EA8F6" strokeWidth="2.5" strokeLinecap="round" />
      </g>

      {/* 3. Four Electric Blue Scanner Brackets [ ] */}
      <g stroke="#0066FF" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
        {/* Top-Left Bracket */}
        <path d="M 18 42 V 32 H 28" />
        {/* Top-Right Bracket */}
        <path d="M 64 32 H 74 V 42" />
        {/* Bottom-Left Bracket */}
        <path d="M 18 68 V 78 H 28" />
        {/* Bottom-Right Bracket */}
        <path d="M 64 78 H 74 V 68" />
      </g>

      {/* 4. Central Security Bell */}
      <g>
        {/* Bell Crown Knob */}
        <ellipse cx="46" cy="30" rx="5" ry="4" fill="url(#lbbBellGradient)" />

        {/* Bell Flared Body */}
        <path
          d="M 46 31 C 38 31 33 39 30 50 C 28 57 25 62 18 66 Q 16 67 17 69 L 75 69 Q 76 67 74 66 C 67 62 64 57 62 50 C 59 39 54 31 46 31 Z"
          fill="url(#lbbBellGradient)"
        />

        {/* Bell Clapper */}
        <path
          d="M 39 69 C 39 75 53 75 53 69 Z"
          fill="#071833"
        />
      </g>

      {/* 5. Three Bright Red Alert Radiation Rays (Crisp, Outside Bell Shoulder) */}
      <g stroke="#FF3B30" strokeWidth="3.2" strokeLinecap="round">
        <line x1="65" y1="36" x2="75" y2="29" />
        <line x1="67" y1="43" x2="77" y2="39" />
        <line x1="66" y1="50" x2="75" y2="52" />
      </g>

      {/* 6. Three Electric Blue Circuit Board Lines & Nodes (Clean Right Trace) */}
      <g stroke="#0066FF" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
        {/* Top Circuit Line */}
        <path d="M 70 56 H 77 L 83 49 H 90" />
        <circle cx="90" cy="49" r="2.8" fill="#0066FF" stroke="#FFFFFF" strokeWidth="0.8" />

        {/* Middle Circuit Line */}
        <path d="M 71 63 H 78 L 84 56 H 92" />
        <circle cx="92" cy="56" r="2.8" fill="#0066FF" stroke="#FFFFFF" strokeWidth="0.8" />

        {/* Bottom Circuit Line */}
        <path d="M 72 70 H 77 L 82 64 H 88" />
        <circle cx="88" cy="64" r="2.8" fill="#0066FF" stroke="#FFFFFF" strokeWidth="0.8" />
      </g>
    </svg>
  );
};
