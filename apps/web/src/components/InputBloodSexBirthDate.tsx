'use client';
import React from 'react';
import InputGroup from './InputGroup';

interface Props {
  blood: string;
  setBlood: (v: string) => void;
  sex: string;
  setSex: (v: string) => void;
  birth: string;
  setBirth: (v: string) => void;
  editable?: boolean; // nova prop
}

const ChevronDownIcon = () => (
  <svg className="w-4 h-4 text-grayscale-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
  </svg>
);

const CalendarIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <rect x="3" y="4" width="18" height="17" rx="2" />
    <line x1="3" y1="10" x2="21" y2="10" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="16" x2="16" y1="2" y2="6" />
  </svg>
);

export function InputBloodSexBirthDate({
  blood,
  setBlood,
  sex,
  setSex,
  birth,
  setBirth,
  editable = true,
}: Props) {
  return (
    <InputGroup>
      {/* Tipo sanguíneo */}
      <div className="flex flex-col flex-[0.9] items-center px-1 border-r border-grayscale-200 h-full justify-center relative min-w-0">
        <span className="text-md text-grayscale-700 whitespace-nowrap">Tipo sanguíneo:</span>
        <div className="relative w-full h-full flex items-center">
          <select
            value={blood}
            onChange={(e) => setBlood(e.target.value)}
            disabled={!editable} // <-- aqui
            className="bg-transparent text-center outline-none w-full h-full appearance-none text-grayscale-900"
          >
            <option value="">N/I</option>
            <option value="A+">A+</option>
            <option value="A-">A-</option>
            <option value="B+">B+</option>
            <option value="B-">B-</option>
            <option value="AB+">AB+</option>
            <option value="AB-">AB-</option>
            <option value="O+">O+</option>
            <option value="O-">O-</option>
          </select>
          <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <ChevronDownIcon />
          </span>
        </div>
      </div>

      {/* Sexo */}
      <div className="flex flex-col flex-[0.8] items-center px-2 border-r border-grayscale-200 h-full justify-center relative min-w-0">
        <span className="text-md text-grayscale-700 whitespace-nowrap">Sexo:</span>
        <div className="relative w-full h-full flex items-center">
          <select
            value={sex}
            onChange={(e) => setSex(e.target.value)}
            disabled={!editable}
            className="bg-transparent text-center outline-none w-full h-full appearance-none text-grayscale-900"
          >
            <option value="">N/I</option>
            <option value="Masc.">Masc.</option>
            <option value="Fem.">Fem.</option>
            <option value="Outro">Outro</option>
          </select>
          <span className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
            <ChevronDownIcon />
          </span>
        </div>
      </div>

      {/* Data de nascimento */}
      <div className="flex flex-col flex-[1.2] items-center px-1 h-full justify-center min-w-0">
        <span className="text-md text-grayscale-700 whitespace-nowrap">Data de nascimento:</span>
        <div className="relative w-full h-full flex items-center justify-center">
          <div className="flex w-full justify-center">
            <input
              type="date"
              value={birth}
              onChange={(e) => setBirth(e.target.value)}
              disabled={!editable}
              className="bg-transparent outline-none appearance-none text-grayscale-900 text-center w-full"
              min="1940-01-01"
              max={new Date().toISOString().split('T')[0]}
            />
          </div>
          <span className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
            <CalendarIcon />
          </span>
        </div>
      </div>
    </InputGroup>
  );
}
