'use client';
import React from 'react';
import { InputSearch } from '@/components/inputs/InputSearch';
import InputDouble from '@/components/inputs/InputDouble';
import { Medication } from '@/lib/api';

interface Props {
  userItems: Medication[];
  systemOptions: string[];
  setUserItems: (meds: Medication[]) => void;
  editable?: boolean;
}

export default function MedicationsSection({
  userItems,
  systemOptions,
  setUserItems,
  editable = true,
}: Props) {

  const addMedication = () => {
    if (!editable) return;
    if (userItems.length < 10) {
      const last = userItems[userItems.length - 1];
      // só adiciona se o último estiver completo
      if (last.name.trim() !== '' && last.dosage && last.usageInterval) {
        setUserItems([...userItems, { name: '', dosage: null, usageInterval: null }]);
      }
    }
  };

  const removeMedication = (index: number) => {
    if (!editable) return;
    if (userItems.length === 1) {
      setUserItems([{ name: '', dosage: null, usageInterval: null }]);
    } else {
      setUserItems(userItems.filter((_, i) => i !== index));
    }
  };

  const updateMedication = (
    index: number,
    field: keyof Medication,
    value: string
  ) => {
    if (!editable) return;

    const updated = [...userItems];

    if (field === 'name') {
      updated[index].name = value;
    } else {
      const num = Number(value);
      updated[index][field] = isNaN(num) ? null : num;
    }

    setUserItems(updated);
  };

  const handleNumberInput = (value: string) => value.replace(/\D/g, '');

  // verifica se o último medicamento está completo
  const isLastComplete = (() => {
    const last = userItems[userItems.length - 1];
    return last.name.trim() !== '' && !!last.dosage && !!last.usageInterval;
  })();

  return (
    <div className="w-full mx-auto border-grayscale-200 border-y md:border pb-2">
      <h3 className="text-grayscale-100 font-semibold text-left text-lg p-4">
        Medicamentos:
      </h3>

      {userItems.map((m, i) => (
        <div key={i} className="mb-4">
          <InputSearch
            label="Medicamento"
            placeholder="Buscar medicamento..."
            value={m.name}
            onChange={(v) => updateMedication(i, 'name', v)}
            onSelect={(v: string) => updateMedication(i, 'name', v)}
            options={systemOptions}
            editable={editable}
          />

          <div className="flex justify-center w-full items-center mt-2">
            <InputDouble
              fieldName1="Dosagem(mg)"
              value1={m.dosage ?? ''}
              onChange1={(v) => updateMedication(i, 'dosage', handleNumberInput(v))}
              fieldName2="Intervalo(h)"
              value2={m.usageInterval ?? ''}
              onChange2={(v) => updateMedication(i, 'usageInterval', handleNumberInput(v))}
              editable={editable}
            />
          </div>

          {editable && (
            <div className="flex justify-between mt-2 px-4">
              <button
                onClick={() => removeMedication(i)}
                className="flex items-center justify-center text-info hover:text-info-dark transition-colors w-8 h-8 rounded-full border border-info"
              >
                -
              </button>

              {i === userItems.length - 1 && userItems.length < 10 && (
                <button
                  onClick={isLastComplete ? addMedication : undefined}
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