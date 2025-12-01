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
  const containerClass = editable
    ? "bg-grayscale-50 border-2 border-transparent hover:border-info focus-within:border-info"
    : "bg-grayscale-200 border-2 border-grayscale-300 cursor-not-allowed";

  const selectClass = editable
    ? "text-grayscale-900 cursor-pointer"
    : "text-grayscale-500 cursor-not-allowed";

  return (
    <div className="relative w-full max-w-md mx-auto mb-4">
      {/* Label */}
      <span className="absolute top-1 left-6 text-md text-grayscale-700 pointer-events-none">
        {label}:
      </span>

      {/* Container com comportamento idêntico ao InputGroup */}
      <div
        className={`
          ${containerClass}
          transition-all w-full h-18 px-4 pt-4 
          rounded-none md:rounded-3xl
          flex items-center
        `}
      >
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={!editable}
          className={`
            w-full text-center outline-none appearance-none bg-transparent
            ${selectClass}
          `}
        >
          <option value="">-</option>
          {options.map((op) => (
            <option key={op} value={op}>
              {op}
            </option>
          ))}
        </select>

        {/* Ícone */}
        <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <ChevronDownIcon />
        </span>
      </div>
    </div>
  );
}
