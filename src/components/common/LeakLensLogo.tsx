import React from 'react';

interface LeakLensLogoProps {
  className?: string;
  size?: number | string;
  variant?: 'emblem' | 'icon' | 'badge';
  monochrome?: boolean;
}

/**
 * LeakLens Official Brand Logo
 * Features the signature examination document with inspection viewfinder brackets,
 * centered alert bell, orbital security dynamic swoosh, and cyber forensics circuit traces.
 */
export const LeakLensLogo: React.FC<LeakLensLogoProps> = ({
  className = 'w-9 h-9',
  size,
  variant = 'icon',
  monochrome = false,
}) => {
  const style = size ? { width: size, height: size } : undefined;

  // The emblem vector
  return (
    <div
      className={`inline-flex items-center justify-center shrink-0 select-none ${className}`}
      style={style}
      aria-label="LeakLens Logo"
    >
      <svg
        viewBox="0 0 500 500"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-2xs transition-transform duration-200"
      >
        {/* Orbital Sweeping Ring - Top-Right Crescent */}
        <path
          d="M 375 315 C 418 265 465 185 415 115 C 362 42 248 24 158 65 C 98 94 58 145 42 195 C 58 170 102 122 170 102 C 270 72 362 108 398 168 C 428 222 396 280 375 315 Z"
          fill={monochrome ? 'currentColor' : '#0B5CFF'}
          className={monochrome ? '' : 'text-[#0B5CFF] dark:text-[#38BDF8]'}
        />

        {/* Orbital Sweeping Ring - Bottom-Left Crescent */}
        <path
          d="M 125 185 C 82 235 35 315 85 385 C 138 458 252 476 342 435 C 402 406 442 355 458 305 C 442 330 398 378 330 398 C 230 428 138 392 102 332 C 72 278 104 220 125 185 Z"
          fill={monochrome ? 'currentColor' : '#0B5CFF'}
          className={monochrome ? '' : 'text-[#0B5CFF] dark:text-[#38BDF8]'}
        />

        {/* Document Sheet Fill & Outline */}
        <path
          d="M 145 88 C 145 74 156 62 170 62 L 285 62 L 345 122 L 345 370 C 345 384 334 396 320 396 L 170 396 C 156 396 145 384 145 370 Z"
          fill="currentColor"
          className="text-white dark:text-[#071A3D]"
        />
        <path
          d="M 145 88 C 145 74 156 62 170 62 L 285 62 L 345 122 L 345 370 C 345 384 334 396 320 396 L 170 396 C 156 396 145 384 145 370 Z"
          stroke={monochrome ? 'currentColor' : '#0F172A'}
          className={monochrome ? '' : 'stroke-[#0F172A] dark:stroke-[#E2E8F0]'}
          strokeWidth="18"
          strokeLinejoin="round"
        />

        {/* Dog-ear Fold Flap */}
        <path
          d="M 285 62 L 285 122 L 345 122 Z"
          fill={monochrome ? 'currentColor' : '#0F172A'}
          className={monochrome ? '' : 'fill-[#0F172A] dark:fill-[#E2E8F0]'}
        />

        {/* Document Header Text Lines */}
        <rect
          x="175"
          y="105"
          width="90"
          height="14"
          rx="7"
          fill={monochrome ? 'currentColor' : '#0F172A'}
          className={monochrome ? '' : 'fill-[#0F172A] dark:fill-[#E2E8F0]'}
        />
        <rect
          x="175"
          y="132"
          width="135"
          height="14"
          rx="7"
          fill={monochrome ? 'currentColor' : '#0F172A'}
          className={monochrome ? '' : 'fill-[#0F172A] dark:fill-[#E2E8F0]'}
        />
        <rect
          x="175"
          y="159"
          width="110"
          height="14"
          rx="7"
          fill={monochrome ? 'currentColor' : '#0F172A'}
          className={monochrome ? '' : 'fill-[#0F172A] dark:fill-[#E2E8F0]'}
        />

        {/* Target Viewfinder Brackets */}
        {/* Top-Left Bracket */}
        <path
          d="M 180 230 L 180 200 C 180 195 185 190 190 190 L 220 190"
          stroke={monochrome ? 'currentColor' : '#0F172A'}
          className={monochrome ? '' : 'stroke-[#0F172A] dark:stroke-[#E2E8F0]'}
          strokeWidth="15"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        {/* Top-Right Bracket */}
        <path
          d="M 295 190 L 325 190 C 330 190 335 195 335 200 L 335 230"
          stroke={monochrome ? 'currentColor' : '#0F172A'}
          className={monochrome ? '' : 'stroke-[#0F172A] dark:stroke-[#E2E8F0]'}
          strokeWidth="15"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        {/* Bottom-Left Bracket */}
        <path
          d="M 180 340 L 180 370 C 180 375 185 380 190 380 L 220 380"
          stroke={monochrome ? 'currentColor' : '#0F172A'}
          className={monochrome ? '' : 'stroke-[#0F172A] dark:stroke-[#E2E8F0]'}
          strokeWidth="15"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        {/* Bottom-Right Bracket */}
        <path
          d="M 295 380 L 325 380 C 330 380 335 375 335 370 L 335 340"
          stroke={monochrome ? 'currentColor' : '#0F172A'}
          className={monochrome ? '' : 'stroke-[#0F172A] dark:stroke-[#E2E8F0]'}
          strokeWidth="15"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />

        {/* Center Alert Bell */}
        {/* Bell Crown Loop */}
        <circle
          cx="258"
          cy="224"
          r="16"
          fill={monochrome ? 'currentColor' : '#0F172A'}
          className={monochrome ? '' : 'fill-[#0F172A] dark:fill-[#E2E8F0]'}
        />
        {/* Bell Body */}
        <path
          d="M 258 226 C 235 233 218 255 208 288 C 198 318 188 333 182 340 C 180 342 182 345 186 345 L 330 345 C 334 345 336 342 334 340 C 328 333 318 318 308 288 C 298 255 281 233 258 226 Z"
          fill={monochrome ? 'currentColor' : '#0F172A'}
          className={monochrome ? '' : 'fill-[#0F172A] dark:fill-[#E2E8F0]'}
        />
        {/* Bell Clapper */}
        <ellipse
          cx="258"
          cy="360"
          rx="18"
          ry="12"
          fill={monochrome ? 'currentColor' : '#0F172A'}
          className={monochrome ? '' : 'fill-[#0F172A] dark:fill-[#E2E8F0]'}
        />

        {/* Bell Alert Acoustic / Radar Rays */}
        <path
          d="M 315 255 L 335 245"
          stroke={monochrome ? 'currentColor' : '#0B5CFF'}
          className={monochrome ? '' : 'stroke-[#0B5CFF] dark:stroke-[#38BDF8]'}
          strokeWidth="10"
          strokeLinecap="round"
        />
        <path
          d="M 326 280 L 350 280"
          stroke={monochrome ? 'currentColor' : '#0B5CFF'}
          className={monochrome ? '' : 'stroke-[#0B5CFF] dark:stroke-[#38BDF8]'}
          strokeWidth="10"
          strokeLinecap="round"
        />
        <path
          d="M 315 305 L 338 315"
          stroke={monochrome ? 'currentColor' : '#0B5CFF'}
          className={monochrome ? '' : 'stroke-[#0B5CFF] dark:stroke-[#38BDF8]'}
          strokeWidth="10"
          strokeLinecap="round"
        />

        {/* Circuit Cyber Traces and Connector Nodes */}
        {/* Trace 1 */}
        <path
          d="M 345 280 L 375 280 L 405 250 L 448 250"
          stroke={monochrome ? 'currentColor' : '#0F172A'}
          className={monochrome ? '' : 'stroke-[#0F172A] dark:stroke-[#E2E8F0]'}
          strokeWidth="12"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <circle
          cx="458"
          cy="250"
          r="14"
          fill={monochrome ? 'currentColor' : '#0F172A'}
          className={monochrome ? '' : 'fill-[#0F172A] dark:fill-[#E2E8F0]'}
        />
        <circle cx="458" cy="250" r="6" fill="white" className="dark:fill-[#071A3D]" />

        {/* Trace 2 */}
        <path
          d="M 345 320 L 385 320 L 415 290 L 434 290"
          stroke={monochrome ? 'currentColor' : '#0F172A'}
          className={monochrome ? '' : 'stroke-[#0F172A] dark:stroke-[#E2E8F0]'}
          strokeWidth="12"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <circle
          cx="444"
          cy="290"
          r="14"
          fill={monochrome ? 'currentColor' : '#0F172A'}
          className={monochrome ? '' : 'fill-[#0F172A] dark:fill-[#E2E8F0]'}
        />
        <circle cx="444" cy="290" r="6" fill="white" className="dark:fill-[#071A3D]" />

        {/* Trace 3 */}
        <path
          d="M 345 355 L 375 355 L 405 340 L 424 340"
          stroke={monochrome ? 'currentColor' : '#0F172A'}
          className={monochrome ? '' : 'stroke-[#0F172A] dark:stroke-[#E2E8F0]'}
          strokeWidth="12"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <circle
          cx="434"
          cy="340"
          r="14"
          fill={monochrome ? 'currentColor' : '#0F172A'}
          className={monochrome ? '' : 'fill-[#0F172A] dark:fill-[#E2E8F0]'}
        />
        <circle cx="434" cy="340" r="6" fill="white" className="dark:fill-[#071A3D]" />
      </svg>
    </div>
  );
};

export default LeakLensLogo;
