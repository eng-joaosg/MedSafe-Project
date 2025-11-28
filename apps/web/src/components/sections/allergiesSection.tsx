'use client';
import React from 'react';
import { InputSearch } from '@/components/InputSearch';
import { InputDropdown } from '@/components/InputDropdown';

interface Allergy {
  name: string;
  severity: string;
}

interface Props {
  userItems: Allergy[];
  systemOptions: string[];
  setUserItems: (allergies: Allergy[]) => void;
  editable?: boolean;
}

export default function AllergiesSection({ userItems, systemOptions, setUserItems, editable = true }: Props) {
  const severityOptions = ['Leve', 'Moderada', 'Grave', 'Severa'];

  const addAllergy = () => {
    if (
      userItems.length < 10 &&
      userItems.every(a => a.name && systemOptions.includes(a.name)) &&
      new Set(userItems.filter(a => a.name).map(a => a.name)).size === userItems.filter(a => a.name).length
    ) {
      setUserItems([...userItems, { name: '', severity: '' }]);
    }
  };

  const removeAllergy = (index: number) => {
    if (userItems.length === 1) {
      setUserItems([{ name: '', severity: '' }]);
    } else {
      setUserItems(userItems.filter((_, i) => i !== index));
    }
  };

  const updateAllergyName = (index: number, value: string) => {
    const updated = [...userItems];
    updated[index].name = value;
    setUserItems(updated);
  };

  const updateAllergySeverity = (index: number, value: string) => {
    const updated = [...userItems];
    updated[index].severity = value;
    setUserItems(updated);
  };

  return (
    <div className="w-full mx-auto border-grayscale-200 border mb-8">
      <h3 className="text-grayscale-100 font-semibold text-left mb-3">Alergias:</h3>
      {userItems.map((a, i) => (
        <div key={i} className="mb-4 pt-8">
          <InputSearch
            label="Alergia"
            placeholder="Buscar alergia..."
            value={a.name}
            onChange={(v) => updateAllergyName(i, v)}
            options={systemOptions}
            editable={editable}
          />
          <InputDropdown
            label="Severidade"
            value={a.severity}
            onChange={(v) => updateAllergySeverity(i, v)}
            options={severityOptions}
            editable={editable}
          />
          <div className="flex justify-between mt-2 px-4">
            <button
              onClick={() => removeAllergy(i)}
              disabled={!editable}
              className={`flex items-center justify-center w-8 h-8 rounded-full border transition-colors
                ${editable ? 'text-info hover:text-info-dark border-info' : 'text-grayscale-400 border-grayscale-300 cursor-not-allowed'}`}
            >
              -
            </button>
            {i === userItems.length - 1 && userItems.length < 10 && (
              <button
                onClick={addAllergy}
                disabled={!editable}
                className={`flex items-center justify-center w-8 h-8 rounded-full border transition-colors
                  ${editable ? 'text-info hover:text-info-dark border-info' : 'text-grayscale-400 border-grayscale-300 cursor-not-allowed'}`}
              >
                +
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
