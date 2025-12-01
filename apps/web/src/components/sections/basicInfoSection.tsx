'use client';
import React from 'react';
import Input from '@/components/inputs/Input';
import { InputBloodSexBirthDate } from '@/components/inputs/InputBloodSexBirthDate';

interface BasicInfoSectionProps {
  firstName: string;
  setFirstName: (v: string) => void;
  lastName: string;
  setLastName: (v: string) => void;
  blood: string;
  setBlood: (v: string) => void;
  sex: string;
  setSex: (v: string) => void;
  birth: string;
  setBirth: (v: string) => void;
  editable: boolean;
}

export default function BasicInfoSection({
  firstName,
  setFirstName,
  lastName,
  setLastName,
  blood,
  setBlood,
  sex,
  setSex,
  birth,
  setBirth,
  editable,
}: BasicInfoSectionProps) {
  return (
    <div className="w-full flex flex-col items-center">
      <div className="w-full mx-auto border-grayscale-200 border-t md:border-x pb-2">
        <h2 className="text-grayscale-100 text-lg font-semibold mb-3 text-left p-4">Dados básicos:</h2>
        <Input fieldName="Nome" value={firstName} onChange={setFirstName} placeholder="Digite seu nome" editable={editable} />
        <Input fieldName="Sobrenome" value={lastName} onChange={setLastName} placeholder="Digite seu sobrenome" editable={editable} />
        <div className="flex justify-center">
          <InputBloodSexBirthDate
            blood={blood} setBlood={setBlood}
            sex={sex} setSex={setSex}
            birth={birth} setBirth={setBirth}
            editable={editable}
          />
        </div>
      </div>
    </div>
  );
}
