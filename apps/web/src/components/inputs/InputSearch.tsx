'use client';
import React, { useState } from 'react';

interface Props {
  label: string;
  value: string;
  onChange: (v: string) => void;
  onSelect?: (v: string) => void;
  placeholder?: string;
  options?: string[];
  editable?: boolean;
}

const SearchIcon = () => (
  <svg
    className="w-4 h-4 text-grayscale-700"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M21 21l-4.35-4.35M11 18a7 7 0 100-14 7 7 0 000 14z"
    />
  </svg>
);

export function InputSearch({
  label,
  value,
  onChange,
  onSelect,
  placeholder,
  options = [],
  editable = true,
}: Props) {
  const [showDropdown, setShowDropdown] = useState(false);

  const filtered =
    value.length >= 3
      ? options.filter((o) => o.toLowerCase().includes(value.toLowerCase()))
      : [];

  return (
    <div className="relative w-full max-w-md mx-auto mb-4">
      <span className="absolute top-1 left-6 text-md text-grayscale-700 pointer-events-none">
        {label}:
      </span>

      <input
        type="text"
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setShowDropdown(true);
        }}
        onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
        placeholder={placeholder ?? 'Pesquisar...'}
        disabled={!editable}
        className={`
          ${editable
            ? 'bg-grayscale-50 text-grayscale-900 hover:border-info focus:border-info'
            : 'bg-grayscale-200 text-grayscale-500 cursor-not-allowed'}
          h-18
          w-full
          px-4 pt-4 pr-10
          rounded-none md:rounded-3xl
          border-2 border-transparent
          outline-none
          text-center
          transition-all
        `}
      />

      <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
        <SearchIcon />
      </span>

      {editable && showDropdown && filtered.length > 0 && (
        <div className="absolute left-0 right-0 bg-white shadow-lg border border-gray-200 rounded-md z-20">
          {filtered.map((item, idx) => (
            <div
              key={idx}
              className="px-4 py-2 cursor-pointer hover:bg-gray-100 text-grayscale-900"
              onMouseDown={() => {
                onChange(item);
                if (onSelect) onSelect(item);
                setShowDropdown(false);
              }}
            >
              {item}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
