'use client';
import React from 'react';
import { InputSearch } from '@/components/InputSearch';

interface Props {
  userItems: string[];
  systemOptions: string[];
  setUserItems: (allergies: string[]) => void;
  editable?: boolean; // <-- adicionado
}

export default function AllergiesSection({ userItems, systemOptions, setUserItems, editable = true }: Props) {

  const addAllergy = () => {
    if (
      userItems.length < 10 &&
      userItems.every(a => a && systemOptions.includes(a)) &&
      new Set(userItems.filter(Boolean)).size === userItems.filter(Boolean).length
    ) {
      setUserItems([...userItems, '']);
    }
  };

  const removeAllergy = (index: number) => {
    if (userItems.length === 1) {
      setUserItems(['']);
    } else {
      setUserItems(userItems.filter((_, i) => i !== index));
    }
  };

  const updateAllergy = (index: number, value: string) => {
    const updated = [...userItems];
    updated[index] = value;
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
            value={a}
            onChange={(v) => updateAllergy(i, v)}
            options={systemOptions}
            editable={editable} // <-- agora recebe
          />
          <div className="flex justify-between mt-2 px-4">
            <button
              onClick={() => removeAllergy(i)}
              disabled={!editable} // <-- desabilita quando não editável
              className={`flex items-center justify-center w-8 h-8 rounded-full border transition-colors
                ${editable ? 'text-info hover:text-info-dark border-info' : 'text-grayscale-400 border-grayscale-300 cursor-not-allowed'}`}
            >
              -
            </button>
            {i === userItems.length - 1 && userItems.length < 10 && (
              <button
                onClick={addAllergy}
                disabled={!editable} // <-- desabilita quando não editável
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
