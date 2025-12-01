'use client';
import React from 'react';
import { InputSearch } from '@/components/inputs/InputSearch';

interface Props {
  userItems: string[];
  systemOptions: string[];
  setUserItems: (surgeries: string[]) => void;
  editable?: boolean;
}

export default function SurgeriesSection({
  userItems,
  systemOptions,
  setUserItems,
  editable = true,
}: Props) {

  const addSurgery = () => {
    if (!editable) return;
    if (userItems.length < 10) {
      const last = userItems[userItems.length - 1];
      // só adiciona se a última estiver preenchida
      if (last && last.trim() !== '') {
        setUserItems([...userItems, '']);
      }
    }
  };

  const removeSurgery = (index: number) => {
    if (!editable) return;

    if (userItems.length === 1) {
      setUserItems(['']);
    } else {
      setUserItems(userItems.filter((_, i) => i !== index));
    }
  };

  const updateSurgery = (index: number, value: string) => {
    if (!editable) return;
    const updated = [...userItems];
    updated[index] = value;
    setUserItems(updated);
  };

  // verifica se a última cirurgia está preenchida
  const isLastComplete = userItems[userItems.length - 1]?.trim() !== '';

  return (
    <div className="w-full mx-auto border-grayscale-200 border-y md:border mb-8 pb-4">
      <h3 className="text-grayscale-100 font-semibold text-left p-4 text-lg">
        Cirurgias:
      </h3>

      {userItems.map((s, i) => (
        <div key={i} className="mb-4">
          <InputSearch
            label="Cirurgia"
            placeholder="Buscar cirurgia..."
            value={s}
            onChange={v => updateSurgery(i, v)}
            onSelect={(v: string) => updateSurgery(i, v)}
            options={systemOptions}
            editable={editable}
          />

          {editable && (
            <div className="flex justify-between mt-2 px-4">
              <button
                onClick={() => removeSurgery(i)}
                className="flex items-center justify-center w-8 h-8 rounded-full border text-info hover:text-info-dark border-info transition-colors"
              >
                -
              </button>

              {i === userItems.length - 1 && userItems.length < 5 && (
                <button
                  onClick={isLastComplete ? addSurgery : undefined}
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