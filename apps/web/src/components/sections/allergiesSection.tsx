'use client';
import React from 'react';
import { InputSearch } from '@/components/inputs/InputSearch';
import { InputDropdown } from '@/components/inputs/InputDropdown';

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
    if (!editable) return;
    if (userItems.length < 10) {
      const last = userItems[userItems.length - 1];
      // só adiciona se a última alergia estiver completa
      if (last.name.trim() !== '' && last.severity.trim() !== '') {
        setUserItems([...userItems, { name: '', severity: '' }]);
      }
    }
  };

  const removeAllergy = (index: number) => {
    if (!editable) return;
    if (userItems.length === 1) {
      setUserItems([{ name: '', severity: '' }]);
    } else {
      setUserItems(userItems.filter((_, i) => i !== index));
    }
  };

  const updateAllergyName = (index: number, value: string) => {
    if (!editable) return;
    const updated = [...userItems];
    updated[index].name = value;
    setUserItems(updated);
  };

  const updateAllergySeverity = (index: number, value: string) => {
    if (!editable) return;
    const updated = [...userItems];
    updated[index].severity = value;
    setUserItems(updated);
  };

  // verifica se a última alergia está completa
  const isLastComplete = (() => {
    const last = userItems[userItems.length - 1];
    return last.name.trim() !== '' && last.severity.trim() !== '';
  })();

  return (
    <div className="w-full mx-auto border-grayscale-200 border-x-0 md:border-x">
      <h3 className="text-grayscale-100 font-semibold text-left text-lg p-4">Alergias:</h3>

      {userItems.map((a, i) => (
        <div key={i} className="mb-8">
          <InputSearch
            label="Alergia"
            placeholder="Buscar alergia..."
            value={a.name}
            onChange={(v) => updateAllergyName(i, v)}
            onSelect={(v: string) => updateAllergyName(i, v)}
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

          {editable && (
            <div className="flex justify-between mt-2 px-2">
              <button
                onClick={() => removeAllergy(i)}
                className="flex items-center justify-center w-8 h-8 rounded-full border text-info hover:text-info-dark border-info transition-colors"
              >
                -
              </button>

              {i === userItems.length - 1 && userItems.length < 10 && (
                <button
                  onClick={isLastComplete ? addAllergy : undefined}
                  disabled={!isLastComplete}
                  className={`flex items-center justify-center w-8 h-8 rounded-full border transition-colors
                    ${isLastComplete
                      ? 'text-info hover:text-info-dark border-info'
                      : 'text-grayscale-300 border-grayscale-300'}`}
                >
                  +
                </button>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}