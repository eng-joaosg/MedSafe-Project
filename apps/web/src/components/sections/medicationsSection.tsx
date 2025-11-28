'use client';
import React from 'react';
import { InputSearch } from '@/components/InputSearch';
import InputDouble from '@/components/InputDouble';
import { Medication } from '@/lib/api';

interface Props {
  userItems: Medication[];
  systemOptions: string[];
  setUserItems: (meds: Medication[]) => void;
  editable?: boolean; // padrão true
}

export default function MedicationsSection({
  userItems,
  systemOptions,
  setUserItems,
  editable = true,
}: Props) {

  // Função para adicionar um novo medicamento
  const addMedication = () => {
    if (!editable) return; 
    if (
      userItems.length < 10 &&
      userItems.every(m => m.name && systemOptions.includes(m.name)) &&
      new Set(userItems.map(m => m.name).filter(Boolean)).size === userItems.filter(m => m.name).length
    ) {
      setUserItems([...userItems, { name: '', dosage: null, usageInterval: null }]);
    }
  };

  // Função para remover um medicamento
  const removeMedication = (index: number) => {
    if (!editable) return; 
    if (userItems.length === 1) {
      setUserItems([{ name: '', dosage: null, usageInterval: null }]);
    } else {
      setUserItems(userItems.filter((_, i) => i !== index));
    }
  };

  // Função para atualizar os dados do medicamento
  const updateMedication = (index: number, field: keyof Medication, value: string) => {
    if (!editable) return;
    const updated = [...userItems];
    if (field === 'dosage' || field === 'usageInterval') {
      const num = Number(value);
      updated[index][field] = isNaN(num) ? null : num; // Atualiza a dosagem ou o intervalo com número ou null
    } else {
      updated[index][field] = value; // Atualiza o nome
    }
    setUserItems(updated);
  };

  // Função para garantir que apenas números sejam inseridos
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
            editable={editable} 
          />
          <div className="flex justify-center w-full items-center mt-2">
            <InputDouble
              fieldName1="Dosagem"
              value1={m.dosage ?? ''}
              onChange1={(v) => updateMedication(i, 'dosage', handleNumberInput(v))}
              placeholder1="mg"
              fieldName2="Intervalo"
              value2={m.usageInterval ?? ''}
              onChange2={(v) => updateMedication(i, 'usageInterval', handleNumberInput(v))}
              placeholder2="h"
              editable={editable}
            />
          </div>
          <div className="flex justify-between mt-2 px-4">
            <button
              onClick={() => removeMedication(i)}
              disabled={!editable}
              className="flex items-center justify-center text-info hover:text-info-dark transition-colors w-8 h-8 rounded-full border border-info disabled:opacity-50 disabled:cursor-not-allowed"
            >
              -
            </button>
            {i === userItems.length - 1 && userItems.length < 10 && (
              <button
                onClick={addMedication}
                disabled={!editable}
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
