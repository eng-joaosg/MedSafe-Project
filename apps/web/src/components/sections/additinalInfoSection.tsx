'use client';
import React from 'react';
import InputText from '../inputs/inputText';

interface Props {
  additionalInfo: string;
  setAdditionalInfo: (value: string) => void;
  editable?: boolean;
}

export default function AdditionalInfoSection({ additionalInfo, setAdditionalInfo, editable = true }: Props) {
  return (
    <div className="w-full mx-auto mb-8 pt-4">
      <InputText
        fieldName="Informações adicionais"
        value={additionalInfo}
        onChange={(val) => setAdditionalInfo(val.slice(0, 255))}
        placeholder="Digite informações adicionais (máx. 255 caracteres)"
        editable={editable}
      />
      <p className="text-grayscale-40 text-sm mt-1">{additionalInfo.length}/255</p>
    </div>
  );
}
