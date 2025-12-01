'use client';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import Input from '@/components/inputs/Input';
import ConfirmButton from '@/components/buttons/ConfirmButton';
import { getPublicData, ClinicalInfo, Contact, Medication, Allergy } from '@/lib/api';
import TableRowThreeColumn from '@/components/tables/tableRowThreeColumn';
import TableRow from '@/components/tables/tableRow';
import OneColumnTable from '@/components/tables/oneColumnTable';

export default function PublicAccessPage() {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id ?? '';

  const [code, setCode] = useState('');
  const [data, setData] = useState<ClinicalInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  async function handleVerify() {
    if (!code.trim()) {
      setMessage("Digite o código de acesso.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const res = await getPublicData(id, code);
      setData(res);
    } catch (err: any) {
      setMessage(err.message || "Código incorreto ou erro ao carregar dados.");
    } finally {
      setLoading(false);
    }
  }

  if (data) {
    const fullName = `${data.firstName || ''} ${data.lastName || ''}`.trim() || '-';
    const bloodType = data.bloodType || 'N/I';
    const sex = data.sex || '-';
    const dateOfBirth = data.dateOfBirth || '';

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

    // Filtra dados vazios
    const validContacts: Contact[] = data.contacts?.filter(c => c.firstName || c.lastName) || [];
    const validDiseases: string[] = data.diseases?.filter(d => d?.trim()) || [];
    const validMedications: Medication[] = data.medications?.filter(m => m.name && m.dosage && m.usageInterval) || [];
    const validAllergies: Allergy[] = data.allergies?.filter(a => a.name && a.severity) || [];
    const validSurgeries: string[] = data.surgeries?.filter(s => s?.trim()) || [];

    return (
      <div className="w-full flex flex-col items-center mx-auto pt-10 md:max-w-lg">
        <h2 className="text-2xl font-semibold mb-6">Dados médicos</h2>

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
          return <OneColumnTable key={idx} fieldName="Contato de Emergência" lines={contactLines} />;
        })}

        {validDiseases.length > 0 && (
          <OneColumnTable fieldName="Doenças Pré-Existentes" lines={validDiseases} />
        )}

        {validMedications.length > 0 && (
          <OneColumnTable
            fieldName="Medicamentos"
            lines={validMedications.map(m => `${m.name}: ${m.dosage}mg c/${m.usageInterval}hrs`)}
          />
        )}

        {validAllergies.length > 0 && (
          <OneColumnTable
            fieldName="Alergias"
            lines={validAllergies.map(a => `${a.name} - ${a.severity}`)}
          />
        )}

        {validSurgeries.length > 0 && (
          <OneColumnTable fieldName="Cirurgias" lines={validSurgeries} />
        )}

        {data.otherInfo && (
          <TableRow fieldName="Informações Adicionais" value={data.otherInfo} height="h-60" />
        )}
      </div>
    );
  }

  // Tela de acesso com código
  return (
    <div className="flex flex-col items-center pt-20 px-4">
      <h2 className="text-xl font-semibold mb-4">Acesso Público</h2>
      <p className="mb-4 text-center">Digite o código de acesso para visualizar as informações.</p>

      <div className="w-full max-w-md space-y-4">
        <Input fieldName="Código de acesso" value={code} onChange={setCode} maxLength={6} />
        {message && <p className="text-error text-center">{message}</p>}
        <ConfirmButton
          onClick={handleVerify}
          label="Verificar"
          loading={loading}
          disabled={loading || !code.trim()}
        />
      </div>
    </div>
  );
}
