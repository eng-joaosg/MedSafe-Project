'use client';
import React from 'react';
import { InputSearch } from '../InputSearch';

interface DiseasesSectionProps {
  userItems: string[];
  setUserItems: (items: string[]) => void;
  systemOptions: string[];
  editable?: boolean; // agora opcional, padrão true
}

export default function DiseasesSection({
  userItems,
  setUserItems,
  systemOptions,
  editable = true,
}: DiseasesSectionProps) {

  const addDisease = () => {
    if (!editable) return; // não permite adicionar se não for editável
    if (
      userItems.length < 10 &&
      userItems.every(d => d && systemOptions.includes(d)) &&
      new Set(userItems.filter(Boolean)).size === userItems.filter(Boolean).length
    ) {
      setUserItems([...userItems, '']);
    }
  };

  const removeDisease = (index: number) => {
    if (!editable) return; // não permite remover se não for editável
    if (userItems.length === 1) {
      setUserItems(['']);
    } else {
      setUserItems(userItems.filter((_, i) => i !== index));
    }
  };

  const updateDisease = (index: number, value: string) => {
    if (!editable) return; // não permite atualizar se não for editável
    const updated = [...userItems];
    updated[index] = value;
    setUserItems(updated);
  };

  return (
    <div className="w-full mx-auto border-grayscale-200 border mb-8">
      <h3 className="text-grayscale-100 font-semibold text-left mb-3">Doenças pré-existentes:</h3>
      {userItems.map((d, i) => (
        <div key={i} className="mb-4 pt-8">
          <InputSearch
            label="Doença"
            placeholder="Buscar doença..."
            value={d}
            onChange={(v) => updateDisease(i, v)}
            options={systemOptions}
            editable={editable} // <-- corrigido
          />
          <div className="flex justify-between mt-2 px-4">
            <button
              onClick={() => removeDisease(i)}
              disabled={!editable}
              className="flex items-center justify-center text-info hover:text-info-dark transition-colors w-8 h-8 rounded-full border border-info disabled:opacity-50 disabled:cursor-not-allowed"
            >
              -
            </button>
            {i === userItems.length - 1 && userItems.length < 10 && (
              <button
                onClick={addDisease}
                disabled={
                  !editable ||
                  userItems.some(d => !d || !systemOptions.includes(d)) ||
                  new Set(userItems.filter(Boolean)).size !== userItems.filter(Boolean).length
                }
                className="flex items-center justify-center text-info hover:text-info-dark transition-colors w-8 h-8 rounded-full border border-info disabled:opacity-50 disabled:cursor-not-allowed"
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
