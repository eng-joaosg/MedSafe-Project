'use client';
import React from 'react';
import InputGroup from './InputGroup';

interface InputDoubleProps {
  fieldName1: string;
  value1: string | number;
  onChange1: (v: string) => void;
  placeholder1?: string;

  fieldName2: string;
  value2: string | number;
  onChange2: (v: string) => void;
  placeholder2?: string;

  editable?: boolean;
}

export function InputDouble({
  fieldName1,
  value1,
  onChange1,
  placeholder1 = '',
  fieldName2,
  value2,
  onChange2,
  placeholder2 = '',
  editable = true,
}: InputDoubleProps) {
  const inputClass = `
    text-center 
    outline-none 
    text-md 
    w-full 
    bg-transparent
    appearance-none
    ${editable ? 'text-grayscale-900' : 'text-grayscale-500 cursor-not-allowed'}
  `;

  return (
    <InputGroup editable={editable}>
      {/* Primeiro campo */}
      <div className="flex flex-col flex-1 items-start px-2 border-r border-grayscale-200 justify-center min-w-0">
        <span className="text-md text-grayscale-700 whitespace-nowrap mb-1">
          {fieldName1}:
        </span>

        <input
          type="text"
          value={value1}
          onChange={(e) => editable && onChange1(e.target.value)}
          placeholder={placeholder1}
          disabled={!editable}
          className={inputClass}
        />
      </div>

      {/* Segundo campo */}
      <div className="flex flex-col flex-1 items-start px-2 justify-center min-w-0">
        <span className="text-md text-grayscale-700 whitespace-nowrap mb-1">
          {fieldName2}:
        </span>

        <input
          type="text"
          value={value2}
          onChange={(e) => editable && onChange2(e.target.value)}
          placeholder={placeholder2}
          disabled={!editable}
          className={inputClass}
        />
      </div>
    </InputGroup>
  );
}

export default InputDouble;
