'use client';
import React, { useState, useEffect } from 'react';
import Input from '@/components/Input';
import { InputBloodSexBirthDate } from '@/components/InputBloodSexBirthDate';
import DiseasesSection from '@/components/sections/diseasesSection';
import MedicationsSection from '@/components/sections/medicationsSection';
import AllergiesSection from '@/components/sections/allergiesSection';
import SurgeriesSection from '@/components/sections/surgeriesSection';
import ContactsSection, { EmergencyContact } from '@/components/sections/contactsSections';
import AdditionalInfoSection from '@/components/sections/additinalInfoSections';
import { useRouter } from 'next/navigation';
import { useUser } from '@/contexts/userContext';
import {
  getClinicalInfo,
  getAllClinicalInfo,
  associateClinicalInfo,
  createClinicalInfo,
  saveClinicalInfo,
  changeUserName,
  ClinicalInfo,
  Contact,
  Medication,
  Allergy,
} from '@/lib/api';

export default function ClientUserPage() {
  const router = useRouter();
  const { user, setUser } = useUser();

  const clientUserId = user.id;
  const clinicalInfoIdFromContext = user.clinicalInfoId;

  const [editable, setEditable] = useState(false);
  const [saving, setSaving] = useState(false);

  const [blood, setBlood] = useState('');
  const [sex, setSex] = useState('');
  const [birth, setBirth] = useState('');

  const [contacts, setContacts] = useState<EmergencyContact[]>([
    { id: 1, firstName: '', lastName: '', ddd: null, phone: null, relationship: '' },
  ]);

  const [diseases, setDiseases] = useState<string[]>(['']);
  const [medications, setMedications] = useState<Medication[]>([{ name: '', dosage: null, usageInterval: null }]);
  const [allergies, setAllergies] = useState<Allergy[]>([{ name: '', severity: '' }]);
  const [surgeries, setSurgeries] = useState<string[]>(['']);
  const [additionalInfo, setAdditionalInfo] = useState('');

  const [originalData, setOriginalData] = useState<ClinicalInfo | null>(null);

  const [diseaseOptions, setDiseaseOptions] = useState<string[]>([]);
  const [medicationOptions, setMedicationOptions] = useState<string[]>([]);
  const [allergyOptions, setAllergyOptions] = useState<string[]>([]);
  const [surgeryOptions, setSurgeryOptions] = useState<string[]>([]);

  useEffect(() => {
    let mounted = true;

    async function loadData() {
      try {
        if (!clientUserId) {
          router.replace('/auth/login');
          return;
        }

        const allOptions = await getAllClinicalInfo();
        setDiseaseOptions(allOptions.diseases);
        setMedicationOptions(allOptions.medications);
        setAllergyOptions(allOptions.allergies);
        setSurgeryOptions(allOptions.surgeries);

        if (clinicalInfoIdFromContext) {
          const clinical = await getClinicalInfo(clinicalInfoIdFromContext);

          setUser(prev => ({
            ...prev,
            firstName: prev.firstName || clinical.firstName || '',
            lastName: prev.lastName || clinical.lastName || '',
            clinicalInfoId: prev.clinicalInfoId || clinical.id || null,
          }));

          if (!mounted) return;

          setBlood(clinical.bloodType || '');
          setSex(clinical.sex || '');
          setBirth(clinical.dateOfBirth || '');
          setAdditionalInfo(clinical.otherInfo || '');
          setDiseases(clinical.diseases.length ? clinical.diseases : ['']);
          setAllergies(
            clinical.allergies.length
              ? clinical.allergies.map(a => ({ name: a.name || '', severity: a.severity || '' }))
              : [{ name: '', severity: '' }]
          );
          setSurgeries(clinical.surgeries.length ? clinical.surgeries : ['']);
          setMedications(
            clinical.medications.length
              ? clinical.medications.map(m => ({
                  name: m.name || '',
                  dosage: m.dosage ?? null,
                  usageInterval: m.usageInterval ?? null
                }))
              : [{ name: '', dosage: null, usageInterval: null }]
          );

          const filledContacts: EmergencyContact[] = Array(3)
            .fill(null)
            .map((_, idx) => {
              const c = clinical.contacts?.[idx];
              return {
                id: idx + 1,
                firstName: c?.firstName || '',
                lastName: c?.lastName || '',
                ddd: c?.ddd !== undefined && c?.ddd !== null ? Number(c.ddd) : null,
                phone: c?.phone !== undefined && c?.phone !== null ? Number(c.phone) : null,
                relationship: c?.relationship || '',
              };
            });

          setContacts(filledContacts.filter((c, i) => c.firstName || c.lastName || c.phone || c.relationship || i === 0));

        setOriginalData({
          id: clinical.id || '',
          firstName: clinical.firstName || '',
          lastName: clinical.lastName || '',
          bloodType: clinical.bloodType || '',
          sex: clinical.sex || '',
          dateOfBirth: clinical.dateOfBirth || '',
          otherInfo: clinical.otherInfo || '',
          allergies: clinical.allergies.map(a => ({ name: a.name || '', severity: a.severity || '' })),
          medications: clinical.medications.map(m => ({
            name: m.name || '',
            dosage: m.dosage ?? null,
            usageInterval: m.usageInterval ?? null
          })),
          diseases: clinical.diseases || [],
          surgeries: clinical.surgeries || [],
          contacts: filledContacts,
        });
        } else {
          setUser(prev => ({ ...prev, firstName: prev.firstName || '', lastName: prev.lastName || '' }));
        }
      } catch (err: any) {
        console.error('Erro ao carregar dados:', err);
        if (err?.status === 401 || err?.message?.includes('401')) router.replace('/auth/login');
      }
    }

    loadData();
    return () => { mounted = false; };
  }, [clientUserId, clinicalInfoIdFromContext]);

  function buildCurrentSnapshot(): ClinicalInfo {
    const contactsWithId: Contact[] = [
      { id: 1, ...stripId(contacts[0]) },
      { id: 2, ...stripId(contacts[1]) },
      { id: 3, ...stripId(contacts[2]) },
    ];

    return {
      id: originalData?.id || '',
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      bloodType: blood,
      sex,
      dateOfBirth: birth,
      otherInfo: additionalInfo,
      allergies: allergies.filter(a => a.name && a.severity && a.severity !== '-'),
      medications: medications.filter(m => m.name).map(m => ({
        name: m.name,
        dosage: m.dosage,
        usageInterval: m.usageInterval
      })),
      diseases: diseases.filter(d => d),
      surgeries: surgeries.filter(s => s),
      contacts: contactsWithId,
    };
  }

  function stripId(c?: Contact): Omit<Contact, 'id'> {
    if (!c) return { firstName: '', lastName: '', ddd: null, phone: null, relationship: '' };
    const { id, ...rest } = c;
    return rest;
  }

  function snapshotsEqual(a: ClinicalInfo | null, b: ClinicalInfo): boolean {
    if (!a) return false;
    const norm = (s: ClinicalInfo) =>
      JSON.stringify({
        firstName: s.firstName,
        lastName: s.lastName,
        bloodType: s.bloodType,
        sex: s.sex,
        dateOfBirth: s.dateOfBirth,
        otherInfo: s.otherInfo,
        allergies: s.allergies,
        medications: s.medications,
        diseases: s.diseases,
        surgeries: s.surgeries,
        contacts: s.contacts,
      });
    return norm(a) === norm(b);
  }

  const handleSave = async () => {
    if (saving) return;
    setSaving(true);
    try {
      if (!user.firstName.trim() || !user.lastName.trim()) throw new Error('Nome e sobrenome são obrigatórios');
      if (!birth) throw new Error('Data de nascimento é obrigatória');

      contacts.forEach(c => {
        if (c.phone) {
          if (!c.firstName.trim()) throw new Error('Contato com telefone deve ter nome');
          if (!c.relationship.trim()) throw new Error('Contato com telefone deve ter parentesco');
          if (!c.ddd) throw new Error('Contato com telefone deve ter DDD válido');
        }
      });

      allergies.forEach(a => {
        if (a.name && (!a.severity || a.severity === '-')) throw new Error(`A alergia ${a.name} deve ter severidade`);
      });

      const current = buildCurrentSnapshot();

      if (snapshotsEqual(originalData, current)) {
        setEditable(false);
        setSaving(false);
        return;
      }

      const nameChanged =
        current.firstName !== (originalData?.firstName || user.firstName || '') ||
        current.lastName !== (originalData?.lastName || user.lastName || '');

      if (nameChanged) {
        await changeUserName(clientUserId!, { newFirstName: current.firstName, newLastName: current.lastName });
        setUser(prev => ({ ...prev, firstName: current.firstName, lastName: current.lastName }));
      }

      let effectiveClinicalId = originalData?.id;

      if (!effectiveClinicalId) {
        const createdClinical = await createClinicalInfo(current as any);
        effectiveClinicalId = createdClinical.id;
        await associateClinicalInfo(clientUserId!, effectiveClinicalId);
        setUser(prev => ({ ...prev, clinicalInfoId: effectiveClinicalId ?? null }));
      } else {
        await saveClinicalInfo(current, effectiveClinicalId);
      }

      setOriginalData({ ...current, id: effectiveClinicalId });
      setEditable(false);
    } catch (err: any) {
      console.error('Erro ao salvar informações clínicas:', err);
      alert(err?.message || 'Erro ao salvar informações clínicas');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full flex flex-col items-center pt-10 md:px-6">
      <div className="w-full flex justify-end mb-4 pr-8">
        <button
          onClick={async () => { if (editable) await handleSave(); else setEditable(true); }}
          className="px-4 py-2 bg-info text-white rounded-md disabled:opacity-50"
          disabled={saving}
        >
          {saving ? 'Salvando...' : editable ? 'Salvar' : 'Editar'}
        </button>
      </div>

      <Input fieldName="Nome" value={user.firstName} onChange={v => setUser({ ...user, firstName: v })} placeholder="Digite seu nome" editable={editable} />
      <Input fieldName="Sobrenome" value={user.lastName} onChange={v => setUser({ ...user, lastName: v })} placeholder="Digite seu sobrenome" editable={editable} />

      <div className="w-full mx-auto border-grayscale-200 border mb-4">
        <h3 className="text-grayscale-100 font-semibold mb-3">Dados básicos:</h3>
        <div className="flex justify-center">
          <InputBloodSexBirthDate
            blood={blood} setBlood={setBlood}
            sex={sex} setSex={setSex}
            birth={birth} setBirth={setBirth}
            editable={editable}
          />
        </div>
      </div>

      <ContactsSection
        userItems={contacts.filter((c, i) => c.firstName || c.lastName || c.phone || c.relationship || i === 0)}
        setUserItems={setContacts}
        editable={editable}
      />

      <DiseasesSection userItems={diseases} setUserItems={setDiseases} systemOptions={diseaseOptions} editable={editable} />
      <MedicationsSection userItems={medications} setUserItems={setMedications} systemOptions={medicationOptions} editable={editable} />
      <AllergiesSection userItems={allergies} setUserItems={setAllergies} systemOptions={allergyOptions} editable={editable} />
      <SurgeriesSection userItems={surgeries} setUserItems={setSurgeries} systemOptions={surgeryOptions} editable={editable} />
      <AdditionalInfoSection setAdditionalInfo={setAdditionalInfo} additionalInfo={additionalInfo} editable={editable} />
    </div>
  );
}
