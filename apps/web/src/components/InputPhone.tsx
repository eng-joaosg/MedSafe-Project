'use client';
import React from 'react';
import InputGroup from './InputGroup';

interface Props {
  ddd: number | null;
  setDDD: (v: number | null) => void;
  phone: number | null;
  setPhone: (v: number | null) => void;
  editable?: boolean;
}

const ChevronDownIcon = () => (
  <svg
    className="w-4 h-4 text-grayscale-700"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
  </svg>
);

const allBrazilDDDs = [
  11, 12, 13, 14, 15, 16, 17, 18, 19,
  21, 22, 24, 27, 28,
  31, 32, 33, 34, 35, 37, 38,
  41, 42, 43, 44, 45, 46,
  47, 48, 49,
  51, 53, 54, 55,
  61, 62, 64, 63, 65, 66, 67, 68, 69,
  71, 73, 74, 75, 77, 79,
  81, 82, 83, 84, 85, 86, 87, 88, 89,
  91, 92, 93, 94, 95, 96, 97, 98, 99
];

export function InputPhone({ ddd, setDDD, phone, setPhone, editable = false }: Props) {
  const handlePhoneChange = (value: string) => {
    // Remove tudo que não é número
    let digits = value.replace(/\D/g, '');

    // Remove zeros à esquerda
    digits = digits.replace(/^0+/, '');

    // Limita a 9 dígitos
    if (digits.length > 9) digits = digits.slice(0, 9);

    setPhone(digits ? Number(digits) : null);
  };

  return (
    <InputGroup editable={editable}>
      {/* DDD */}
      <div className="flex flex-col flex-[0.3] items-start px-2 border-r border-grayscale-200 justify-center relative min-w-0">
        <span className="text-md text-grayscale-700 whitespace-nowrap mb-1">DDD:</span>

        <div className="relative w-full flex items-center rounded-md px-1 py-1">
          <select
            value={ddd ?? ''}
            onChange={(e) => setDDD(e.target.value ? Number(e.target.value) : null)}
            disabled={!editable}
            className={`w-full appearance-none text-center outline-none bg-transparent
              ${editable ? 'text-grayscale-900 cursor-text' : 'text-grayscale-500 cursor-not-allowed'}
            `}
          >
            <option value="">(--)</option>
            {allBrazilDDDs.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>

          {ddd === null && (
            <span className="absolute right-3 pointer-events-none">
              <ChevronDownIcon />
            </span>
          )}
        </div>
      </div>

      {/* Telefone */}
      <div className="flex flex-col flex-[0.7] items-start justify-center px-2 min-w-0">
        <span className="text-md text-grayscale-700 whitespace-nowrap mb-1">Telefone:</span>

        <div className="rounded-md px-1 py-1">
          <input
            type="tel"
            value={phone ?? ''}
            onChange={(e) => handlePhoneChange(e.target.value)}
            disabled={!editable}
            placeholder="Digite apenas números"
            className={`w-full text-center text-md outline-none appearance-none bg-transparent
              ${editable ? 'text-grayscale-900 cursor-text' : 'text-grayscale-500 cursor-not-allowed'}
            `}
          />
        </div>
      </div>
    </InputGroup>
  );
}
