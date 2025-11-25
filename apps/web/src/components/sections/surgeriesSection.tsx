'use client';
import React from 'react';
import { InputSearch } from '@/components/InputSearch';

interface Props {
  userItems: string[];
  systemOptions: string[];
  setUserItems: (surgeries: string[]) => void;
  editable?: boolean; // <-- adicionado
}

export default function SurgeriesSection({ userItems, systemOptions, setUserItems, editable = true }: Props) {

  const addSurgery = () => {
    if (
      userItems.length < 10 &&
      userItems.every(s => s && systemOptions.includes(s)) &&
      new Set(userItems.filter(Boolean)).size === userItems.filter(Boolean).length
    ) {
      setUserItems([...userItems, '']);
    }
  };

  const removeSurgery = (index: number) => {
    if (userItems.length === 1) {
      setUserItems(['']);
    } else {
      setUserItems(userItems.filter((_, i) => i !== index));
    }
  };

  const updateSurgery = (index: number, value: string) => {
    const updated = [...userItems];
    updated[index] = value;
    setUserItems(updated);
  };

  return (
    <div className="w-full mx-auto border-grayscale-200 border mb-8">
      <h3 className="text-grayscale-100 font-semibold text-left mb-3">Cirurgias:</h3>
      {userItems.map((s, i) => (
        <div key={i} className="mb-4 pt-8">
          <InputSearch
            label="Cirurgia"
            placeholder="Buscar cirurgia..."
            value={s}
            onChange={(v) => updateSurgery(i, v)}
            options={systemOptions}
            editable={editable} // <-- agora recebe
          />
          <div className="flex justify-between mt-2 px-4">
            <button
              onClick={() => removeSurgery(i)}
              disabled={!editable} // <-- desabilita quando não editável
              className={`flex items-center justify-center w-8 h-8 rounded-full border transition-colors
                ${editable ? 'text-info hover:text-info-dark border-info' : 'text-grayscale-400 border-grayscale-300 cursor-not-allowed'}`}
            >
              -
            </button>
            {i === userItems.length - 1 && userItems.length < 10 && (
              <button
                onClick={addSurgery}
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
