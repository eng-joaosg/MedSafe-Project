'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@/contexts/userContext';
import { useClinicalInfo } from '@/contexts/clinicalInfoContext';
import {
  getClinicalInfo,
  ClinicalInfo,
  Contact,
  Medication,
  Allergy,
} from '@/lib/api';
import TableRowThreeColumn from '@/components/tables/tableRowThreeColumn';
import TableRow from '@/components/tables/tableRow';
import OneColumnTable from '@/components/tables/oneColumnTable';

export default function ClientUserPublicDataPage() {
  const { user } = useUser();
  const { clinicalInfo: contextClinicalInfo } = useClinicalInfo();
  const [clinicalInfo, setClinicalInfo] = useState<ClinicalInfo | null>(contextClinicalInfo || null);
  const [loading, setLoading] = useState(!contextClinicalInfo);

  useEffect(() => {
    if (clinicalInfo) {
      setLoading(false);
      return;
    }

    if (!user.clinicalInfoId) {
      setLoading(false);
      return;
    }

    const loadClinicalInfo = async () => {
      try {
        const info = await getClinicalInfo();
        setClinicalInfo(info);
      } catch (err) {
        console.error('Erro ao carregar info clínica:', err);
      } finally {
        setLoading(false);
      }
    };

    loadClinicalInfo();
  }, [user.clinicalInfoId, clinicalInfo]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Carregando informações...</p>
      </div>
    );
  }

  const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || '-';
  const bloodType = clinicalInfo?.bloodType || 'N/I';
  const sex = clinicalInfo?.sex || '-';
  const dateOfBirth = clinicalInfo?.dateOfBirth || '';

  const calculateAge = (dob: string) => {
    if (!dob) return '-';
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
    return age.toString();
  };

  const age = calculateAge(dateOfBirth);

  // --------- Contatos ---------
  const contacts: Contact[] = clinicalInfo?.contacts || [];
  const validContacts: Contact[] =
    contacts.filter(c => (c.firstName?.trim() || c.lastName?.trim())); // Apenas contatos com nome ou sobrenome

  const validDiseases: string[] =
    clinicalInfo?.diseases?.filter((d) => d?.trim()) || [];

  const validMedications: Medication[] =
    clinicalInfo?.medications?.filter((m) => m.name && m.dosage && m.usageInterval) || [];

  const validAllergies: Allergy[] =
    clinicalInfo?.allergies?.filter((a) => a.name && a.severity) || [];

  const validSurgeries: string[] =
    clinicalInfo?.surgeries?.filter((s) => s?.trim()) || [];

  return (
    <div className="w-full flex flex-col items-center mx-auto pt-10 md:max-w-lg">
      <h2 className="text-2xl font-semibold mb-6">Informações Públicas</h2>

      <TableRow fieldName="Nome" value={fullName} />

      <TableRowThreeColumn
        col1={bloodType}
        col2={sex}
        col3={age}
        col1Label="Tipo sanguíneo"
        col2Label="Sexo"
        col3Label="Idade"
        col1Flex={1}
        col2Flex={1}
        col3Flex={1}
        className="md:max-w-md overflow-hidden mb-4"
      />

      {validContacts.map((contact, idx) => {
        const contactLines = [
          `${contact.firstName || ''} ${contact.lastName || ''}`.trim() || '-',
          `Parentesco: ${contact.relationship || '-'} - Telefone: (${contact.ddd || '-'}) ${contact.phone || '-'}`,
        ];
        return (
          <OneColumnTable
            key={idx}
            fieldName="Contato de Emergência"
            lines={contactLines}
          />
        );
      })}

      {validDiseases.length > 0 && (
        <OneColumnTable fieldName="Doenças Pré-Existentes" lines={validDiseases} />
      )}

      {validMedications.length > 0 && (
        <OneColumnTable
          fieldName="Medicamentos"
          lines={validMedications.map(
            (m) => `${m.name}: ${m.dosage}mg c/${m.usageInterval}hrs`
          )}
        />
      )}

      {validAllergies.length > 0 && (
        <OneColumnTable
          fieldName="Alergias"
          lines={validAllergies.map((a) => `${a.name} - ${a.severity}`)}
        />
      )}

      {validSurgeries.length > 0 && (
        <OneColumnTable
          fieldName="Cirurgias"
          lines={validSurgeries}
        />
      )}

      {clinicalInfo?.otherInfo && (
        <TableRow
          fieldName="Informações Adicionais"
          value={clinicalInfo.otherInfo}
          height="h-60"
        />
      )}
    </div>
  );
}
