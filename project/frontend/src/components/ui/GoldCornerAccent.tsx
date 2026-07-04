'use client';

import React from 'react';

interface GoldCornerAccentProps {
  className?: string;
  size?: number;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

/**
 * Gold corner ornament motif derived from the invoice PDF (bills.service.ts corner triangles).
 * Used as a signature brand element — ONLY on login card and dashboard header.
 * Restraint is the point: if it shows up everywhere, it stops being a signature.
 */
const GoldCornerAccent: React.FC<GoldCornerAccentProps> = ({
  className = '',
  size = 48,
  position = 'top-right',
}) => {
  const rotations: Record<string, string> = {
    'top-left': 'rotate(0)',
    'top-right': 'rotate(90)',
    'bottom-right': 'rotate(180)',
    'bottom-left': 'rotate(270)',
  };

  const positions: Record<string, string> = {
    'top-left': 'top-0 left-0',
    'top-right': 'top-0 right-0',
    'bottom-right': 'bottom-0 right-0',
    'bottom-left': 'bottom-0 left-0',
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`absolute ${positions[position]} pointer-events-none ${className}`}
      style={{ transform: rotations[position] }}
      aria-hidden="true"
    >
      {/* Corner triangle — matches invoice PDF gold ornament */}
      <polygon
        points="0,0 48,0 0,48"
        fill="url(#goldGradientCorner)"
        opacity="0.15"
      />
      {/* Inner decorative line */}
      <line
        x1="4"
        y1="0"
        x2="0"
        y2="4"
        stroke="#C9A54E"
        strokeWidth="1"
        opacity="0.4"
      />
      <line
        x1="12"
        y1="0"
        x2="0"
        y2="12"
        stroke="#C9A54E"
        strokeWidth="0.75"
        opacity="0.3"
      />
      <line
        x1="20"
        y1="0"
        x2="0"
        y2="20"
        stroke="#C9A54E"
        strokeWidth="0.5"
        opacity="0.2"
      />
      <defs>
        <linearGradient id="goldGradientCorner" x1="0" y1="0" x2="48" y2="48">
          <stop offset="0%" stopColor="#C9A54E" />
          <stop offset="100%" stopColor="#A88B3D" />
        </linearGradient>
      </defs>
    </svg>
  );
};

export default GoldCornerAccent;
