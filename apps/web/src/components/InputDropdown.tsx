'use client';
import React from 'react';

interface Props {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  editable?: boolean;
}

const ChevronDownIcon = () => (
  <svg className="w-4 h-4 text-grayscale-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
  </svg>
);

export function InputDropdown({ label, value, onChange, options, editable = true }: Props) {
  return (
    <div className="relative w-full max-w-md mx-auto mb-4">

      {/* Label dentro do campo */}
      <span className="absolute top-1 left-6 text-md text-grayscale-700 pointer-events-none">
        {label}:
      </span>

      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={!editable}
        className="
          bg-grayscale-50
          text-grayscale-900
          h-18
          w-full
          px-4 pt-4
          rounded-none md:rounded-3xl
          border-2 border-transparent
          hover:border-info
          focus:border-info
          outline-none
          text-center
          appearance-none
        "
      >
        <option value="">-</option>
        {options.map((op) => (
          <option key={op} value={op}>
            {op}
          </option>
        ))}
      </select>

      {/* Seta sempre visível */}
      <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
        <ChevronDownIcon />
      </span>
    </div>
  );
}
