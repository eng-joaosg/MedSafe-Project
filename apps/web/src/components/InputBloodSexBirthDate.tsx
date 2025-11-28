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
  editable?: boolean;
}

const ChevronDownIcon = () => (
  <svg className="w-4 h-4 text-grayscale-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
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
    <InputGroup editable={editable}>
      
      {/* Tipo sanguíneo */}
      <div className="flex flex-col flex-[0.9] items-center pl-1 pr-3 border-r border-grayscale-200 h-full justify-center relative min-w-0">
        <span className="text-md text-grayscale-700 whitespace-nowrap">Tipo sanguíneo:</span>
        <div className="relative w-full h-full flex items-center">
          <select
            value={blood}
            onChange={(e) => setBlood(e.target.value)}
            disabled={!editable}
            className={`bg-transparent text-center outline-none w-full h-full appearance-none 
              ${editable ? 'text-grayscale-900 cursor-text' : 'text-grayscale-500 cursor-not-allowed'}
            `}
          >
            <option value="">-</option>
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
      <div className="flex flex-col flex-[0.8] items-center -ml-1 pr-2 border-r border-grayscale-200 h-full justify-center relative min-w-0">
        <span className="text-md text-grayscale-700 whitespace-nowrap">Sexo:</span>
        <div className="relative w-full h-full flex items-center">
          <select
            value={sex}
            onChange={(e) => setSex(e.target.value)}
            disabled={!editable}
            className={`bg-transparent text-center outline-none w-full h-full appearance-none
              ${editable ? 'text-grayscale-900 cursor-text' : 'text-grayscale-500 cursor-not-allowed'}
            `}
          >
            <option value="">-</option>
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
              className={`
                bg-transparent outline-none text-center w-full
                pr-2
                md:pr-4
                [&::-webkit-calendar-picker-indicator]:invert-20
                ${editable ? 'text-grayscale-900 cursor-text' : 'text-grayscale-500 cursor-not-allowed'}
              `}
              min="1940-01-01"
              max={new Date().toISOString().split('T')[0]}
            />
          </div>
        </div>
      </div>

    </InputGroup>
  );
}

export default InputBloodSexBirthDate;
