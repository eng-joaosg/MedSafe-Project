// hooks/useInitializeUser.ts
'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { ClinicalInfo, getAllClinicalInfo, getClinicalInfo, refreshToken } from '@/lib/api';
import { generatePublicCode } from '@/lib/utils';
import { useClinicalOptions } from '@/contexts/clinicalOptionsContext';
import { useUser } from '@/contexts/userContext';
import { useClinicalInfo } from '@/contexts/clinicalInfoContext';
import { EmergencyContact } from '@/components/sections/contactsSections';

export interface Medication {
  name: string;
  dosage: number | null;
  usageInterval: number | null;
}

export interface Allergy {
  name: string;
  severity: string;
}

interface InitializeResult {
  loading: boolean;
  blood: string;
  setBlood: (value: string) => void;
  sex: string;
  setSex: (value: string) => void;
  birth: string;
  setBirth: (value: string) => void;
  contacts: EmergencyContact[];
  setContacts: React.Dispatch<React.SetStateAction<EmergencyContact[]>>;
  diseases: string[];
  setDiseases: (value: string[]) => void;
  medications: Medication[];
  setMedications: React.Dispatch<React.SetStateAction<Medication[]>>;
  allergies: Allergy[];
  setAllergies: React.Dispatch<React.SetStateAction<Allergy[]>>;
  surgeries: string[];
  setSurgeries: (value: string[]) => void;
  additionalInfo: string;
  setAdditionalInfo: (value: string) => void;
  publicCode: string;
  setPublicCode: (value: string) => void;
  originalData: ClinicalInfo | null;
  setOriginalData: (data: ClinicalInfo) => void;
}

export function useInitializeUser(): InitializeResult {
  const router = useRouter();
  const pathname = usePathname(); // pega a rota atual
  const { user, setUser, isLoggedOut } = useUser();
  const { clinicalInfo, setClinicalInfo } = useClinicalInfo();
  const {
    diseases: diseaseOptionsFromContext,
    medications: medicationOptionsFromContext,
    allergies: allergyOptionsFromContext,
    surgeries: surgeryOptionsFromContext,
    addDisease,
    addMedication,
    addAllergy,
    addSurgery,
  } = useClinicalOptions();

  const [loading, setLoading] = useState(true);
  const [blood, setBlood] = useState('');
  const [sex, setSex] = useState('');
  const [birth, setBirth] = useState('');
  const [contacts, setContacts] = useState<EmergencyContact[]>([
    { id: 1, firstName: '', lastName: '', ddd: null, phone: null, relationship: '' },
    { id: 2, firstName: '', lastName: '', ddd: null, phone: null, relationship: '' },
    { id: 3, firstName: '', lastName: '', ddd: null, phone: null, relationship: '' },
  ]);
  const [diseases, setDiseases] = useState<string[]>(['']);
  const [medications, setMedications] = useState<Medication[]>([{ name: '', dosage: null, usageInterval: null }]);
  const [allergies, setAllergies] = useState<Allergy[]>([{ name: '', severity: '' }]);
  const [surgeries, setSurgeries] = useState<string[]>(['']);
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [publicCode, setPublicCode] = useState('');
  const [originalData, setOriginalData] = useState<ClinicalInfo | null>(null);

  useEffect(() => {
    let mounted = true;

    async function initialize() {
      if (!mounted) return;

      // ⚡ Só inicializa dados clínicos se estiver na rota /client-user ou filhos
      if (!pathname.startsWith('/client-user')) {
        setLoading(false);
        return;
      }

      try {
        // Redireciona se deslogado
        if (isLoggedOut) {
          router.replace('/auth/login');
          return;
        }

        let currentUser = user;

        // Se usuário ainda não definido, tenta refresh token
        if (!user.id) {
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
            role: session.role?.toString() ?? '',
          };
          setUser(newUser);
          currentUser = newUser;

          if (session.role !== 'client') {
            router.replace('/auth/login');
            return;
          }
        }

        // Inicializa dados clínicos: prioriza contexto, depois backend
        let info: ClinicalInfo | null = clinicalInfo || null;
        if (!info) {
          info = await getClinicalInfo();
          if (info) setClinicalInfo(info);
        }

        if (info) {
          setBlood(info.bloodType || '');
          setSex(info.sex || '');
          setBirth(new Date(info.dateOfBirth).toISOString().slice(0, 10));
          setDiseases(info.diseases.length ? info.diseases : ['']);
          setAllergies(info.allergies.length ? info.allergies : [{ name: '', severity: '' }]);
          setSurgeries(info.surgeries.length ? info.surgeries : ['']);
          setMedications(info.medications.length ? info.medications : [{ name: '', dosage: null, usageInterval: null }]);
          setAdditionalInfo(info.otherInfo || '');
          setContacts(
            info.contacts?.length
              ? info.contacts.map((c, idx) => ({
                  id: idx + 1,
                  firstName: c.firstName || '',
                  lastName: c.lastName || '',
                  ddd: c.ddd ?? null,
                  phone: c.phone ?? null,
                  relationship: c.relationship || '',
                }))
              : contacts
          );

          const finalPublicCode = info.publicCode ?? generatePublicCode();
          setPublicCode(finalPublicCode);
          setOriginalData({ ...info, publicCode: finalPublicCode });
        }

        // Carrega opções do sistema caso estejam vazias
        if (
          !diseaseOptionsFromContext.length ||
          !medicationOptionsFromContext.length ||
          !allergyOptionsFromContext.length ||
          !surgeryOptionsFromContext.length
        ) {
          try {
            const options = await getAllClinicalInfo();
            options.diseases.forEach(addDisease);
            options.medications.forEach(addMedication);
            options.allergies.forEach(addAllergy);
            options.surgeries.forEach(addSurgery);
          } catch (err) {
            console.error('Erro ao carregar opções do sistema:', err);
          }
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    initialize();

    return () => {
      mounted = false;
    };
  }, [user, isLoggedOut, clinicalInfo, pathname]);

  return {
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
  };
}