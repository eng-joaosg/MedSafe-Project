import { ClinicalInfo, Contact } from '@/lib/api';

// Remove o id do contato
export function stripId(c?: Contact) {
  if (!c) return { firstName: '', lastName: '', ddd: null, phone: null, relationship: '' };
  const { id, ...rest } = c;
  return rest;
}

// Constroi snapshot do estado atual
export function buildCurrentSnapshot(params: {
  userFirstName: string;
  userLastName: string;
  blood: string;
  sex: string;
  birth: string;
  additionalInfo: string;
  allergies: any[];
  medications: any[];
  diseases: string[];
  surgeries: string[];
  contacts: Contact[];
  publicCode?: string;
  originalData?: ClinicalInfo | null;
}): ClinicalInfo {
  const { userFirstName, userLastName, blood, sex, birth, additionalInfo, allergies, medications, diseases, surgeries, contacts, publicCode, originalData } = params;

  const contactsWithId: Contact[] = contacts.map((c, idx) => ({ id: idx + 1, ...stripId(c) }));

  return {
    id: originalData?.id || '',
    firstName: userFirstName,
    lastName: userLastName,
    bloodType: blood,
    sex,
    dateOfBirth: birth,
    otherInfo: additionalInfo,
    allergies,
    medications,
    diseases,
    surgeries,
    contacts: contactsWithId,
    publicCode: publicCode ?? originalData?.publicCode ?? crypto.randomUUID(),
  };
}

// Compara se houve mudanças
export function noChangesMade(current: ClinicalInfo, original: ClinicalInfo | null) {
  if (!original) return false;

  if (current.firstName !== original.firstName) return false;
  if (current.lastName !== original.lastName) return false;
  if (current.bloodType !== original.bloodType) return false;
  if (current.sex !== original.sex) return false;
  if (current.dateOfBirth !== original.dateOfBirth) return false;
  if (current.otherInfo !== original.otherInfo) return false;

  const contactsEqual = JSON.stringify(current.contacts.map(c => ({ ...c, id: undefined }))) ===
                        JSON.stringify(original.contacts.map(c => ({ ...c, id: undefined })));
  if (!contactsEqual) return false;

  const arraysEqual = (a: any[], b: any[]) => JSON.stringify(a) === JSON.stringify(b);

  if (!arraysEqual(current.allergies, original.allergies)) return false;
  if (!arraysEqual(current.medications, original.medications)) return false;
  if (!arraysEqual(current.diseases, original.diseases)) return false;
  if (!arraysEqual(current.surgeries, original.surgeries)) return false;

  return true;
}
