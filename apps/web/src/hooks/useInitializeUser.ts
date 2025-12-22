'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  ClinicalInfo,
  getAllClinicalInfo,
  getClinicalInfo,
  Medication,
  refreshToken,
} from '@/lib/api';
import { generatePublicCode } from '@/lib/utils';
import { useClinicalOptions } from '@/contexts/clinicalOptionsContext';
import { useUser } from '@/contexts/userContext';
import { useClinicalInfo } from '@/contexts/clinicalInfoContext';
import { EmergencyContact } from '@/components/sections/contactsSections';

export function useInitializeUser() {
  const router = useRouter();
  const pathname = usePathname();

  const { user, setUser, isLoggedOut } = useUser();
  const { clinicalInfo, setClinicalInfo } = useClinicalInfo();

  const {
    diseases: systemDiseases,
    medications: systemMedications,
    allergies: systemAllergies,
    surgeries: systemSurgeries,
    addDisease,
    addMedication,
    addAllergy,
    addSurgery,
  } = useClinicalOptions();

  const [loading, setLoading] = useState(true);
  const [blood, setBlood] = useState('');
  const [sex, setSex] = useState('');
  const [birth, setBirth] = useState('');
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [diseases, setDiseases] = useState<string[]>(['']);
  const [medications, setMedications] = useState<Medication[]>([
    { name: '', dosage: null, usageInterval: null },
  ]);
  const [allergies, setAllergies] = useState<{ name: string; severity: string }[]>([
    { name: '', severity: '' },
  ]);
  const [surgeries, setSurgeries] = useState<string[]>(['']);
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [publicCode, setPublicCode] = useState('');
  const [originalData, setOriginalData] = useState<ClinicalInfo | null>(null);

  // ------------------------------------------------------
  // 1️⃣ Efeito para garantir sessão
  // ------------------------------------------------------
  useEffect(() => {
    if (!pathname.startsWith('/client-user')) {
      setLoading(false);
      return;
    }

    if (isLoggedOut) {
      router.replace('/auth/login');
      return;
    }

    async function ensureSession() {
      if (!user?.id) {
        const session = await refreshToken();
        if (!session) {
          router.replace('/auth/login');
          return;
        }

        const newUser = {
          id: session.id,
          clinicalInfoId: session.clinicalInfoId,
          firstName: session.firstName ?? '',
          lastName: session.lastName ?? '',
          role: session.role ?? '',
        };

        setUser(newUser);
      }
    }

    ensureSession();
  }, [pathname, isLoggedOut, user?.id]);

  // ------------------------------------------------------
  // 2️⃣ Efeito para carregar dados clínicos
  // ------------------------------------------------------
  useEffect(() => {
    if (!user?.clinicalInfoId) {
      setLoading(false);
      return;
    }

    async function loadClinicalInfo() {
      setLoading(true);

      // Carrega opções do sistema se ainda estiverem vazias
      if (
        !systemDiseases.length ||
        !systemMedications.length ||
        !systemAllergies.length ||
        !systemSurgeries.length
      ) {
        const options = await getAllClinicalInfo();
        options.diseases?.forEach(addDisease);
        options.medications?.forEach(addMedication);
        options.allergies?.forEach(addAllergy);
        options.surgeries?.forEach(addSurgery);
      }

      let info = clinicalInfo;
      if (!info) {
        info = await getClinicalInfo();
        if (info) setClinicalInfo(info);
      }

      if (!info) {
        setLoading(false);
        return;
      }

      setBlood(info.bloodType || '');
      setSex(info.sex || '');
      const birthDate = info.dateOfBirth ? new Date(info.dateOfBirth) : null;
      setBirth(birthDate ? birthDate.toISOString().slice(0, 10) : '');
      setDiseases(info.diseases?.length ? info.diseases : ['']);
      setAllergies(
        info.allergies?.length ? info.allergies : [{ name: '', severity: '' }]
      );
      setSurgeries(info.surgeries?.length ? info.surgeries : ['']);
      setMedications(
        info.medications?.length
          ? info.medications
          : [{ name: '', dosage: null, usageInterval: null }]
      );
      setAdditionalInfo(info.otherInfo || '');
      setContacts(
        info.contacts?.map(c => ({
          firstName: c.firstName || '',
          lastName: c.lastName || '',
          ddd: c.ddd ?? null,
          phone: c.phone ?? null,
          relationship: c.relationship || '',
        })) || []
      );

      const finalPublicCode = info.publicCode ?? generatePublicCode();
      setPublicCode(finalPublicCode);
      setOriginalData({ ...info, publicCode: finalPublicCode });

      setLoading(false);
    }

    loadClinicalInfo();
  }, [user?.clinicalInfoId]);

  return {
    loading,
    blood, setBlood,
    sex, setSex,
    birth, setBirth,
    contacts, setContacts,
    diseases, setDiseases,
    medications, setMedications,
    allergies, setAllergies,
    surgeries, setSurgeries,
    additionalInfo, setAdditionalInfo,
    publicCode, setPublicCode,
    originalData, setOriginalData,
  };
}
