'use client';
import React from 'react';

interface InputProps {
  className?: string;
  fieldName: string;
  value: string;
  onChange: (value: string) => void;
  type?: string; // agora aceita type
}

export default function Input({
  className = '',
  fieldName,
  value,
  onChange,
  type
}: InputProps) {

  // Se o dev não passar "type", usa inferência automática
  const inputType =
    type ?? (fieldName.toLowerCase().includes("senha") ? "password" : "text");

  return (
    <div className="relative w-full max-w-md mx-auto mb-4">

      <span className="absolute top-1 left-6 text-md text-grayscale-700 pointer-events-none">
        {fieldName}:
      </span>

      <input
        type={inputType}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`
          bg-grayscale-50
          text-grayscale-900
          h-14
          w-full
          px-4 pt-4
          rounded-3xl
          border-2 border-transparent
          hover:border-info
          focus:border-info
          focus:outline-none
          text-center
          transition-all
          ${className}
        `}
      />
    </div>
  );
}
