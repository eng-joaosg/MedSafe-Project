'use client';
import React from 'react';
import InputGroup from './InputGroup';

interface Props {
  ddd: string;
  setDDD: (v: string) => void;
  phone: string;
  setPhone: (v: string) => void;
  editable?: boolean;
}

const ChevronDownIcon = () => (
  <svg className="w-4 h-4 text-grayscale-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
  </svg>
);

export function InputPhone({ ddd, setDDD, phone, setPhone, editable = false }: Props) {
  return (
    <InputGroup>

      {/* DDD */}
      <div className="flex flex-col flex-[0.3] items-start px-2 border-r border-grayscale-200 justify-center relative min-w-0">
        <span className="text-md text-grayscale-700 whitespace-nowrap mb-1">DDD:</span>

        <div className="relative w-full flex items-center">
          <select
            value={ddd}
            onChange={(e) => setDDD(e.target.value)}
            disabled={!editable}
            className="
              bg-transparent text-center outline-none
              w-full appearance-none
              text-grayscale-900
            "
          >
            <option value="">(--)</option>
            <option value="11">11</option>
            <option value="21">21</option>
            <option value="31">31</option>
            <option value="41">41</option>
            <option value="61">61</option>
          </select>

          {ddd === "" && (
            <span className="absolute right-3 pointer-events-none">
              <ChevronDownIcon />
            </span>
          )}
        </div>
      </div>

      {/* Telefone */}
      <div className="flex flex-col flex-[0.8] items-start justify-center px-2 min-w-0">
        <span className="text-md text-grayscale-700 whitespace-nowrap mb-1">Telefone:</span>

        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          disabled={!editable}
          className="bg-transparent text-center outline-none text-md w-full appearance-none text-grayscale-900"
          placeholder="Digite apenas números"
        />
      </div>

    </InputGroup>
  );
}
