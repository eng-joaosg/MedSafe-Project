'use client';
import React from 'react';

interface InputTextProps {
  className?: string;
  fieldName: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  height?: string;
  editable?: boolean;
  maxLength?: number;
}

export default function InputText({
  className = '',
  fieldName,
  value,
  onChange,
  placeholder,
  height = 'h-60',
  editable = true,
  maxLength,
}: InputTextProps) {
  return (
    <div className="relative w-full max-w-md mx-auto mb-4">
      <span className="absolute top-1 left-6 text-md text-grayscale-900 pointer-events-none">
        {fieldName}:
      </span>

      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={!editable}
        maxLength={maxLength}
        className={`
          ${editable ? 'bg-grayscale-50 text-grayscale-900 hover:border-info focus:border-info' : 'bg-grayscale-200 text-grayscale-500 cursor-not-allowed'}
          ${height}
          w-full
          px-4 pt-8
          rounded-none md:rounded-3xl
          border-2 border-transparent
          focus:outline-none
          transition-all
          text-left
          align-top
          resize-none
          ${className}
        `}
      />
    </div>
  );
}
