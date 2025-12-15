import { useState } from 'react';
import { useUser } from '@/contexts/userContext';
import { useClinicalInfo } from '@/contexts/clinicalInfoContext';
import {
  saveClinicalInfo,
  changeUserName,
  createAndAssociateClinicalInfo,
  ClinicalInfo,
  getClinicalInfo,
} from '@/lib/api';
import { generatePublicCode } from '@/lib/utils';

interface SaveClinicalInfoProps {
  contacts: any[];
  diseases: string[];
  medications: any[];
  allergies: any[];
  surgeries: any[];
  additionalInfo: string;
  publicCode: string;
  setPublicCode: (value: string) => void;
  birth: string;
  blood: string;
  sex: string;
  firstName: string;
  lastName: string;
  originalData: ClinicalInfo | null;
  setOriginalData: (data: ClinicalInfo) => void;
}

export function useSaveClinicalInfo({
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
  firstName,
  lastName,
}: SaveClinicalInfoProps) {
  const { user, setUser } = useUser();
  const { setClinicalInfo } = useClinicalInfo();

  const [editable, setEditable] = useState(false);
  const [saving, setSaving] = useState(false);

  // Remove apenas o id dos contatos
  const stripId = (c?: any) => {
    if (!c) return { firstName: '', lastName: '', ddd: null, phone: null, relationship: '' };
    const { id, ...rest } = c;
    return rest;
  };

  // Verifica se um contato está completo
  const isContactComplete = (c: any) =>
    !!c.firstName &&
    !!c.lastName &&
    !!c.ddd && c.ddd > 0 &&
    !!c.phone && c.phone > 0 &&
    !!c.relationship;

  // Monta o snapshot atual para salvar
  const buildCurrentSnapshot = (): ClinicalInfo => {
    // Filtra apenas contatos completos
    const contactsNoId = contacts.filter(isContactComplete).map(stripId);

    return {
      id: originalData?.id || '',
      firstName: firstName || '',
      lastName: lastName || '',
      bloodType: blood || '',
      sex: sex || '',
      dateOfBirth: birth,
      otherInfo: additionalInfo,
      allergies,
      medications,
      diseases,
      surgeries,
      contacts: contactsNoId,
      publicCode: publicCode || originalData?.publicCode || generatePublicCode(),
    };
  };

  const noChangesMade = (current: ClinicalInfo, original: ClinicalInfo | null) => {
    if (!original) return false;

    if (current.firstName !== original.firstName) return false;
    if (current.lastName !== original.lastName) return false;
    if (current.bloodType !== original.bloodType) return false;
    if (current.sex !== original.sex) return false;
    if (current.dateOfBirth !== original.dateOfBirth) return false;
    if (current.otherInfo !== original.otherInfo) return false;
    if (current.publicCode !== original.publicCode) return false;
    const contactsEqual =
      JSON.stringify(current.contacts) === JSON.stringify(original.contacts);
    if (!contactsEqual) return false;

    const arraysEqual = (a: any[], b: any[]) => JSON.stringify(a) === JSON.stringify(b);

    if (!arraysEqual(current.allergies, original.allergies)) return false;
    if (!arraysEqual(current.medications, original.medications)) return false;
    if (!arraysEqual(current.diseases, original.diseases)) return false;
    if (!arraysEqual(current.surgeries, original.surgeries)) return false;

    return true;
  };

  const handleSave = async () => {
    if (!user.id) return;
    if (saving) return;
    setSaving(true);

    try {
      let effectivePublicCode = publicCode || originalData?.publicCode;
      if (!effectivePublicCode) {
        effectivePublicCode = generatePublicCode();
        setPublicCode(effectivePublicCode);
      }

      const current = buildCurrentSnapshot();

      if (!current.firstName.trim() || !current.lastName.trim())
        throw new Error('Nome e sobrenome são obrigatórios');

      if (!current.dateOfBirth?.trim()) {
        throw new Error('Data de nascimento é obrigatória');
      }

      if (noChangesMade(current, originalData)) {
        setEditable(false);
        setSaving(false);
        return;
      }

      const nameChanged =
        current.firstName !== (originalData?.firstName || user.firstName) ||
        current.lastName !== (originalData?.lastName || user.lastName);

      if (nameChanged && user.id) {
        await changeUserName(user.id, {
          newFirstName: current.firstName,
          newLastName: current.lastName,
        });
        setUser((prev) => ({ ...prev, firstName: current.firstName, lastName: current.lastName }));
      }

      let effectiveClinicalId = user.clinicalInfoId;

      if (!effectiveClinicalId) {
        const existing = await getClinicalInfo();
        if (existing?.id) {
          effectiveClinicalId = existing.id;
          await saveClinicalInfo(current, effectiveClinicalId);
        }

        if (!effectiveClinicalId) {
          current.publicCode = effectivePublicCode;
          const created = await createAndAssociateClinicalInfo(user.id, current);
          effectiveClinicalId = created.clinicalInfoId ?? null;
          setUser((prev) => ({ ...prev, clinicalInfoId: effectiveClinicalId }));
        }
      } else {
        await saveClinicalInfo(current, effectiveClinicalId);
      }

      setOriginalData({ ...current, id: effectiveClinicalId ?? '' });
      setClinicalInfo({ ...current, id: effectiveClinicalId ?? '' });
      setEditable(false);
    } catch (err: any) {
      console.error('Erro ao salvar informações clínicas:', err);
      alert(err?.message || 'Erro ao salvar informações clínicas');
    } finally {
      setSaving(false);
    }
  };

  return {
    handleSave,
    editable,
    setEditable,
    saving,
  };
}
