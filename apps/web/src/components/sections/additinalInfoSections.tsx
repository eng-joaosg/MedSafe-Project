'use client';
import React from 'react';
import Input from '@/components/Input';

interface Props {
  additionalInfo: string;
  setAdditionalInfo: (value: string) => void;
  editable?: boolean; // <-- adicionado
}

export default function AdditionalInfoSection({ additionalInfo, setAdditionalInfo, editable = true }: Props) {
  return (
    <div className="w-full mx-auto mb-8 p-4">
      <Input
        fieldName="Informações adicionais"
        value={additionalInfo}
        onChange={(val) => setAdditionalInfo(val.slice(0, 255))}
        placeholder="Digite informações adicionais (máx. 255 caracteres)"
        className="text-left"
        height="h-60"
        editable={editable}
      />
      <p className="text-grayscale-40 text-sm mt-1">{additionalInfo.length}/255</p>
    </div>
  );
}
