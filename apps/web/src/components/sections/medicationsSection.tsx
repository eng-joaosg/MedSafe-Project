'use client';
import React from 'react';
import { InputSearch } from '@/components/InputSearch';
import InputDouble from '@/components/InputDouble';

interface Medication {
  name: string;
  dosage: string;
  interval: string;
}

interface Props {
  userItems: Medication[];
  systemOptions: string[];
  setUserItems: (meds: Medication[]) => void;
  editable?: boolean; // <-- adicionado
}

export default function MedicationsSection({
  userItems,
  systemOptions,
  setUserItems,
  editable = true, // <-- padrão true
}: Props) {

  const addMedication = () => {
    if (
      !editable) return; // não permite adicionar se não for editável
    if (
      userItems.length < 10 &&
      userItems.every(m => m.name && systemOptions.includes(m.name)) &&
      new Set(userItems.map(m => m.name).filter(Boolean)).size === userItems.filter(m => m.name).length
    ) {
      setUserItems([...userItems, { name: '', dosage: '', interval: '' }]);
    }
  };

  const removeMedication = (index: number) => {
    if (!editable) return; // não permite remover se não for editável
    if (userItems.length === 1) {
      setUserItems([{ name: '', dosage: '', interval: '' }]);
    } else {
      setUserItems(userItems.filter((_, i) => i !== index));
    }
  };

  const updateMedication = (index: number, field: keyof Medication, value: string) => {
    if (!editable) return; // não permite atualizar se não for editável
    const updated = [...userItems];
    updated[index][field] = value;
    setUserItems(updated);
  };

  const handleNumberInput = (value: string) => value.replace(/\D/g, '');

  return (
    <div className="w-full mx-auto border-grayscale-200 border mb-8">
      <h3 className="text-grayscale-100 font-semibold text-left mb-3">Medicamentos:</h3>
      {userItems.map((m, i) => (
        <div key={i} className="mb-4 pt-8">
          <InputSearch
            label="Medicamento"
            placeholder="Buscar medicamento..."
            value={m.name}
            onChange={(v) => updateMedication(i, 'name', v)}
            options={systemOptions}
            editable={!editable} // <-- aqui
          />
          <div className="flex justify-center w-full items-center">
            <InputDouble
              fieldName1="Dosagem"
              value1={m.dosage}
              onChange1={(v) => updateMedication(i, 'dosage', handleNumberInput(v))}
              placeholder1="mg"
              fieldName2="Intervalo"
              value2={m.interval}
              onChange2={(v) => updateMedication(i, 'interval', handleNumberInput(v))}
              placeholder2="h"
              editable={editable} // <-- aqui
            />
          </div>
          <div className="flex justify-between mt-2 px-4">
            <button
              onClick={() => removeMedication(i)}
              disabled={!editable} // <-- desabilitado quando não editável
              className="flex items-center justify-center text-info hover:text-info-dark transition-colors w-8 h-8 rounded-full border border-info disabled:opacity-50 disabled:cursor-not-allowed"
            >
              -
            </button>
            {i === userItems.length - 1 && userItems.length < 10 && (
              <button
                onClick={addMedication}
                disabled={!editable} // <-- desabilitado quando não editável
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
