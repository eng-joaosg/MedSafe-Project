'use client';
import React from 'react';
import Input from '@/components/Input';
import { InputPhone } from '../InputPhone';
import { InputDropdown } from '../InputDropdown';

export interface EmergencyContact {
  name: string;
  surname: string;
  ddd: string;
  phone: string;
  relation: string;
}

interface Props {
  userItems: EmergencyContact[];
  setUserItems: React.Dispatch<React.SetStateAction<EmergencyContact[]>>;
  editable: boolean;
}

export default function ContactsSection({ userItems, setUserItems, editable }: Props) {
  const addContact = () => {
    if (userItems.length < 3) {
      setUserItems([...userItems, { name: '', surname: '', ddd: '', phone: '', relation: '' }]);
    }
  };

  const removeContact = (index: number) => {
    if (index === 0) {
      const newContacts = [...userItems];
      newContacts[0] = { name: '', surname: '', ddd: '', phone: '', relation: '' };
      setUserItems(newContacts);
    } else {
      setUserItems(userItems.filter((_, i) => i !== index));
    }
  };

  const updateContact = (index: number, field: keyof EmergencyContact, value: string) => {
    const newContacts = [...userItems];
    newContacts[index][field] = value;
    setUserItems(newContacts);
  };

  return (
    <div className="w-full mx-auto border-grayscale-200 border-x mb-4">
      <h3 className="text-grayscale-100 font-semibold mb-3">Contatos de emergência:</h3>
      {userItems.map((c, i) => (
        <div key={i} className="mb-4 pt-8">
          <Input fieldName="Nome" value={c.name} onChange={(v) => updateContact(i, 'name', v)} placeholder="Digite o nome" editable={editable} />
          <Input fieldName="Sobrenome" value={c.surname} onChange={(v) => updateContact(i, 'surname', v)} placeholder="Digite o sobrenome" editable={editable} />
          <div className='flex justify-center w-full items-center'>
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
            value={c.relation}
            onChange={(v) => updateContact(i, 'relation', v)}
            options={["Pai","Mãe","Irmão","Irmã","Avô","Avó","Tio","Tia","Primo","Prima","Cônjuge","Amigo(a)","Outro"]}
            editable={editable}
          />
          <div className="flex justify-between mt-2 px-4">
            <button onClick={() => removeContact(i)} className="flex items-center justify-center text-info hover:text-info-dark transition-colors w-8 h-8 rounded-full border border-info" disabled={!editable || (i === 0 && userItems.length === 1)}>-</button>
            {i < 2 && i === userItems.length - 1 && (
              <button onClick={addContact} className="flex items-center justify-center text-info hover:text-info-dark transition-colors w-8 h-8 rounded-full border border-info" disabled={!editable}>+</button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
