'use client';
import React, { useState } from 'react';
import Input from '@/components/Input';
import { InputBloodSexBirthDate } from '@/components/InputBloodSexBirthDate';
import DiseasesSection from '@/components/sections/diseasesSection';
import MedicationsSection from '@/components/sections/medicationsSection';
import AllergiesSection from '@/components/sections/allergiesSection';
import SurgeriesSection from '@/components/sections/surgeriesSection';
import ContactsSection from '@/components/sections/contactsSections';
import AdditionalInfoSection from '@/components/sections/additinalInfoSections';

interface EmergencyContact {
  name: string;
  surname: string;
  ddd: string;
  phone: string;
  relation: string;
}

interface Medication {
  name: string;
  dosage: string;
  interval: string;
}

export default function ClientUserPage() {
  const [editable, setEditable] = useState(false);

  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');

  const [blood, setBlood] = useState('');
  const [sex, setSex] = useState('');
  const [birth, setBirth] = useState('');

  const [contacts, setContacts] = useState<EmergencyContact[]>([{ name: '', surname: '', ddd: '', phone: '', relation: '' }]);
  const [diseases, setDiseases] = useState<string[]>(['']);
  const [medications, setMedications] = useState<Medication[]>([{ name: '', dosage: '', interval: '' }]);
  const [allergies, setAllergies] = useState<string[]>(['']);
  const [surgeries, setSurgeries] = useState<string[]>(['']);
  const [additionalInfo, setAdditionalInfo] = useState('');

  // Opções do sistema
  const diseaseOptions = ['Diabetes', 'Hipertensão', 'Asma', 'Doença Celíaca'];
  const medicationOptions = ['Paracetamol', 'Ibuprofeno', 'Amoxicilina', 'Dipirona', 'Omeprazol'];
  const allergyOptions = ['Pólen', 'Amendoim', 'Lactose', 'Glúten', 'Frutos do Mar'];
  const surgeryOptions = ['Apendicectomia', 'Colecistectomia', 'Hérnia', 'Cesárea', 'Artroplastia'];

  const handleNumberInput = (value: string) => value.replace(/\D/g, '');

  return (
    <div className="w-full flex flex-col items-center pt-10 md:px-6">

      {/* Botão Editar / Salvar */}
      <div className="w-full flex justify-end mb-4">
        <button
          onClick={() => setEditable(!editable)}
          className="px-4 py-2 bg-info text-white rounded-md"
        >
          {editable ? 'Salvar' : 'Editar'}
        </button>
      </div>

      {/* Nome e Sobrenome */}
      <Input
        fieldName="Nome"
        value={name}
        onChange={setName}
        placeholder="Digite seu nome"
        className=""
        editable={!editable}
      />
      <Input
        fieldName="Sobrenome"
        value={surname}
        onChange={setSurname}
        placeholder="Digite seu sobrenome"
        className=""
        editable={!editable}
      />

      {/* Dados básicos */}
      <div className="w-full mx-auto border-grayscale-200 border mb-4">
        <h3 className="text-grayscale-100 font-semibold mb-3">Dados básicos:</h3>
        <div className="flex justify-center">
          <InputBloodSexBirthDate
            blood={blood}
            setBlood={setBlood}
            sex={sex}
            setSex={setSex}
            birth={birth}
            setBirth={setBirth}
            editable={!editable}
          />
        </div>
      </div>

      {/* Seções */}
      <ContactsSection
        userItems={contacts}
        setUserItems={setContacts}
        editable={editable}
      />
      <DiseasesSection
        userItems={diseases}
        setUserItems={setDiseases}
        systemOptions={diseaseOptions}
        editable={editable}
      />
      <MedicationsSection
        userItems={medications}
        setUserItems={setMedications}
        systemOptions={medicationOptions}
        editable={editable}
      />
      <AllergiesSection
        userItems={allergies}
        setUserItems={setAllergies}
        systemOptions={allergyOptions}
        editable={editable}
      />
      <SurgeriesSection
        userItems={surgeries}
        setUserItems={setSurgeries}
        systemOptions={surgeryOptions}
        editable={editable}
      />
      <AdditionalInfoSection
        additionalInfo={additionalInfo}
        setAdditionalInfo={setAdditionalInfo}
        editable={editable}
      />
    </div>
  );
}
