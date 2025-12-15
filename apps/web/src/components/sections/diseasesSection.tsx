'use client';
import React from 'react';
import { InputSearch } from '../inputs/InputSearch';

interface DiseasesSectionProps {
  userItems: string[];
  setUserItems: (items: string[]) => void;
  systemOptions: string[];
  editable?: boolean;
}

export default function DiseasesSection({
  userItems,
  setUserItems,
  systemOptions,
  editable = true,
}: DiseasesSectionProps) {

  const addDisease = () => {
    if (!editable) return;
    if (userItems.length < 10) {
      const last = userItems[userItems.length - 1];
      if (last && last.trim() !== '') {
        setUserItems([...userItems, '']);
      }
    }
  };

  const removeDisease = (index: number) => {
    if (!editable) return;
    if (userItems.length === 1) {
      setUserItems(['']);
    } else {
      setUserItems(userItems.filter((_, i) => i !== index));
    }
  };

  const updateDisease = (index: number, value: string) => {
    if (!editable) return;
    const updated = [...userItems];
    updated[index] = value;
    setUserItems(updated);
  };

  const isLastComplete = userItems[userItems.length - 1]?.trim() !== '';

  return (
    <div className="w-full mx-auto border-grayscale-200 border-x-0 md:border-x pb-4">
      <h3 className="text-grayscale-100 font-semibold text-lg text-left p-4">Doenças pré-existentes:</h3>

      {userItems.map((d, i) => (
        <div key={i} className="mb-4">
          <InputSearch
            label="Doença"
            placeholder="Buscar doença..."
            value={d}
            onChange={(v) => updateDisease(i, v)}
            onSelect={(v: string) => updateDisease(i, v)}
            options={systemOptions}
            editable={editable}
          />

          {editable && (
            <div className="flex justify-between mt-2 px-4">
              <button
                onClick={() => removeDisease(i)}
                className="flex items-center justify-center text-info hover:text-info-dark transition-colors w-8 h-8 rounded-full border border-info"
              >
                -
              </button>

              {i === userItems.length - 1 && userItems.length < 5 && (
                <button
                  onClick={isLastComplete ? addDisease : undefined}
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