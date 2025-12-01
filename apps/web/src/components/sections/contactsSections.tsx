'use client';
import React from 'react';
import Input from '@/components/inputs/Input';
import { InputPhone } from '../inputs/InputPhone';
import { InputDropdown } from '../inputs/InputDropdown';

export interface EmergencyContact {
  id: number;
  firstName: string;
  lastName: string;
  ddd: number | null;
  phone: number | null;
  relationship: string;
}

interface Props {
  userItems: EmergencyContact[];
  setUserItems: React.Dispatch<React.SetStateAction<EmergencyContact[]>>;
  editable: boolean;
}

export default function ContactsSection({ userItems, setUserItems, editable }: Props) {
  const addContact = () => {
    if (userItems.length < 3) {
      setUserItems([
        ...userItems,
        { id: userItems.length + 1, firstName: '', lastName: '', ddd: null, phone: null, relationship: '' }
      ]);
    }
  };

  const removeContact = (index: number) => {
    if (userItems.length === 1) {
      setUserItems([{ id: 1, firstName: '', lastName: '', ddd: null, phone: null, relationship: '' }]);
    } else {
      const filtered = userItems.filter((_, i) => i !== index);
      const resequenced = filtered.map((c, idx) => ({ ...c, id: idx + 1 }));
      setUserItems(resequenced);
    }
  };

  const updateContact = (
    index: number,
    field: 'firstName' | 'lastName' | 'relationship' | 'ddd' | 'phone',
    value: string | number | null
  ) => {
    const newContacts = [...userItems];
    if (field === 'ddd' || field === 'phone') {
      const num = Number(value);
      newContacts[index][field] = num > 0 ? num : null;
    } else {
      newContacts[index][field] = String(value || '');
    }
    setUserItems(newContacts);
  };

  // Verifica se um contato está completamente preenchido
  const isContactComplete = (c: EmergencyContact) =>
    !!c.firstName &&
    !!c.lastName &&
    !!c.ddd && c.ddd > 0 &&
    !!c.phone && c.phone > 0 &&
    !!c.relationship;

  return (
    <div className="w-full mx-auto border-grayscale-200 border-y md:border pb-2">
      <h3 className="text-grayscale-100 text-lg text-left p-4 font-semibold mb-3">Contatos de emergência:</h3>

      {userItems.map((c, i) => (
        <div key={c.id} className="mb-4">
          <Input
            fieldName="Nome"
            value={c.firstName}
            onChange={(v) => updateContact(i, 'firstName', v)}
            placeholder="Digite o nome"
            editable={editable}
          />

          <Input
            fieldName="Sobrenome"
            value={c.lastName}
            onChange={(v) => updateContact(i, 'lastName', v)}
            placeholder="Digite o sobrenome"
            editable={editable}
          />

          <div className="flex justify-center w-full items-center">
            <InputPhone
              ddd={c.ddd}
              setDDD={(v) => updateContact(i, 'ddd', v)}
              phone={c.phone}
              setPhone={(v) => updateContact(i, 'phone', v)}
              editable={editable}
            />
          </div>

          <InputDropdown
            label="Parentesco"
            value={c.relationship}
            onChange={(v) => updateContact(i, 'relationship', v)}
            options={[
              "Pai", "Mãe", "Irmão", "Irmã", "Avô", "Avó", 
              "Tio", "Tia", "Primo", "Prima", 
              "Cônjuge", "Amigo(a)", "Outro"
            ]}
            editable={editable}
          />

          {editable && (
            <div className="flex justify-between mt-2 px-4">
              <button
                onClick={() => removeContact(i)}
                className="flex items-center justify-center w-8 h-8 rounded-full border transition-colors
                  text-info hover:text-info-dark border-info"
              >
                -
              </button>

              {/* Botão + só aparece até 2 contatos e no último */}
              {i < 2 && i === userItems.length - 1 && (
                <button
                  onClick={isContactComplete(c) ? addContact : undefined}
                  disabled={!isContactComplete(c)}
                  className={`flex items-center justify-center w-8 h-8 rounded-full border transition-colors
                    ${isContactComplete(c)
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
