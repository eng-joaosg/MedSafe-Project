'use client';
import React from 'react';
import DiseasesSection from '@/components/sections/diseasesSection';
import MedicationsSection from '@/components/sections/medicationsSection';
import AllergiesSection from '@/components/sections/allergiesSection';
import SurgeriesSection from '@/components/sections/surgeriesSection';
import ContactsSection from '@/components/sections/contactsSections';
import AdditionalInfoSection from '@/components/sections/additinalInfoSection';
import PublicCodeSection from '@/components/sections/publicCodeSection';
import BasicInfoSection from '@/components/sections/basicInfoSection';
import { SpinLoader } from '@/components/SpinLoader';
import { useUser } from '@/contexts/userContext';
import { useClinicalOptions } from '@/contexts/clinicalOptionsContext';
import { useInitializeUser } from '@/hooks/useInitializeUser';
import { useSaveClinicalInfo } from '@/hooks/useSaveClinicalInfo';
import QrAndEditSection from '@/components/sections/qrAndEditSection';

export default function ClientUserPage() {
  const { user, setUser } = useUser();
  const {
    diseases: diseaseOptionsFromContext,
    medications: medicationOptionsFromContext,
    allergies: allergyOptionsFromContext,
    surgeries: surgeryOptionsFromContext,
  } = useClinicalOptions();

  const {
    loading,
    blood,
    setBlood,
    sex,
    setSex,
    birth,
    setBirth,
    contacts,
    setContacts,
    diseases,
    setDiseases,
    medications,
    setMedications,
    allergies,
    setAllergies,
    surgeries,
    setSurgeries,
    additionalInfo,
    setAdditionalInfo,
    publicCode,
    setPublicCode,
    originalData,
    setOriginalData,
  } = useInitializeUser();

  const { handleSave, editable, setEditable, saving } = useSaveClinicalInfo({
    contacts,
    diseases,
    medications,
    allergies,
    surgeries,
    additionalInfo,
    publicCode,
    setPublicCode,
    originalData,
    setOriginalData,
    birth,
    blood,
    sex,
    firstName: user.firstName,
    lastName: user.lastName,
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <SpinLoader />
      </div>
    );
  }
  const contactsToRender =
    contacts.length > 0
      ? contacts
      : [{ firstName: '', lastName: '', ddd: null, phone: null, relationship: '' }];

  return (
    <div className="w-full flex flex-col items-center pt-10 md:px-6">
      <QrAndEditSection
        publicCode={publicCode}
        editable={editable}
        saving={saving}
        setEditable={setEditable}
        onSave={handleSave}
      />
      <PublicCodeSection
        initialCode={publicCode}
        editable={editable}
        onCodeGenerated={(code) => setPublicCode(code)}
      />
      <BasicInfoSection
        firstName={user.firstName}
        setFirstName={(v) => setUser((prev) => ({ ...prev, firstName: v }))}
        lastName={user.lastName}
        setLastName={(v) => setUser((prev) => ({ ...prev, lastName: v }))}
        blood={blood}
        setBlood={setBlood}
        sex={sex}
        setSex={setSex}
        birth={birth}
        setBirth={setBirth}
        editable={editable}
      />
      <ContactsSection
        userItems={contactsToRender}
        setUserItems={setContacts}
        editable={editable}
      />
      <DiseasesSection
        userItems={diseases}
        setUserItems={setDiseases}
        systemOptions={diseaseOptionsFromContext}
        editable={editable}
      />
      <MedicationsSection
        userItems={medications}
        setUserItems={setMedications}
        systemOptions={medicationOptionsFromContext}
        editable={editable}
      />
      <AllergiesSection
        userItems={allergies}
        setUserItems={setAllergies}
        systemOptions={allergyOptionsFromContext}
        editable={editable}
      />
      <SurgeriesSection
        userItems={surgeries}
        setUserItems={setSurgeries}
        systemOptions={surgeryOptionsFromContext}
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
