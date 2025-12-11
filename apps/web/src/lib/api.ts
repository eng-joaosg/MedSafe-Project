const API_BASE_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL || 'http://localhost:3001';

/**
 * Função genérica para endpoints que retornam JSON
 */
export async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'include',
  });

  if (!res.ok) {
    throw new Error('Ocorreu um erro ao se comunicar com o servidor.');
  }

  return res.json();
}

/**
 * Sessão do usuário
 */
export interface SessionUser {
  id: string;
  firstName: string | null;
  lastName: string | null;
  clinicalInfoId: string | null;
  role: string | null;
}

/**
 * Tipos principais
 */
export interface Contact {
  id: number;
  firstName: string | null;
  lastName: string | null;
  ddd: number | null;
  phone: number | null;
  relationship: string;
}

export interface Medication {
  name: string;
  dosage: number | null;
  usageInterval: number | null;
}

export interface Allergy {
  name: string;
  severity: string;
}

export interface ClinicalInfo {
  id: string;
  firstName: string;
  lastName: string;
  bloodType: string;
  sex: string;
  dateOfBirth: string;
  otherInfo: string | null;
  publicCode?: string;

  allergies: Allergy[];
  diseases: string[];
  surgeries: string[];
  medications: Medication[];
  contacts: Contact[];
}

export interface ClinicalInfoOptions {
  diseases: string[];
  medications: string[];
  allergies: string[];
  surgeries: string[];
}

/**
 * Objeto padrão vazio
 */
export const EmptyClinicalInfo: ClinicalInfo = {
  id: '',
  firstName: '',
  lastName: '',
  bloodType: '',
  sex: '',
  dateOfBirth: '',
  otherInfo: null,
  publicCode: undefined,
  allergies: [],
  medications: [],
  diseases: [],
  surgeries: [],
  contacts: [
    { id: 1, firstName: null, lastName: null, ddd: null, phone: null, relationship: '' },
    { id: 2, firstName: null, lastName: null, ddd: null, phone: null, relationship: '' },
    { id: 3, firstName: null, lastName: null, ddd: null, phone: null, relationship: '' },
  ],
};

/**
 * Usuário (Client User)
 */
type FindEmailResponse = { emailAlreadyExists: boolean };

export async function findEmail(email: string): Promise<boolean> {
  try {
    const response = await apiFetch<FindEmailResponse>(
      `/gateway/client-user/find-email?email=${encodeURIComponent(email)}`,
    );
    return response.emailAlreadyExists;
  } catch {
    throw new Error('Não foi possível verificar o email.');
  }
}

export async function register(payload: {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
}): Promise<void> {
  try {
    const res = await fetch(`${API_BASE_URL}/gateway/client-user/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error();
  } catch {
    throw new Error('Não foi possível cadastrar o usuário.');
  }
}

export async function verifyAccountCode(email: string, verificationCode: string): Promise<void> {
  if (!/^\d{6}$/.test(verificationCode)) {
    throw new Error('O código deve conter exatamente 6 dígitos.');
  }

  try {
    const res = await fetch(`${API_BASE_URL}/gateway/client-user/verify-account`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, verificationCode }),
    });
    if (!res.ok) throw new Error();
  } catch {
    throw new Error('Não foi possível verificar o código de ativação.');
  }
}

export async function generateVerificationCode(
  email: string,
  type: 'verify-account' | 'forgot-password',
): Promise<void> {
  if (!email.trim()) {
    throw new Error('O e-mail é obrigatório.');
  }

  if (!type) {
    throw new Error('O tipo de código é obrigatório.');
  }

  try {
    const res = await fetch(
      `${API_BASE_URL}/gateway/new-verification-code?type=${encodeURIComponent(type)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      },
    );

    if (!res.ok) {
      throw new Error('Não foi possível gerar o código de verificação.');
    }
  } catch {
    throw new Error('Não foi possível gerar o código de verificação.');
  }
}

/**
 * LOGIN → retorna SessionUser
 */
export async function login(payload: { email: string; password: string }): Promise<SessionUser> {
  const res = await fetch(`${API_BASE_URL}/gateway/client-user/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    credentials: 'include',
  });

  if (!res.ok) {
    let errorMessage = 'Não foi possível realizar o login.';

    if (res.status === 403) {
      errorMessage = 'Sua conta ainda não foi verificada.';
    } else if (res.status === 401) {
      errorMessage = 'Email ou senha incorretos.';
    }

    throw new Error(errorMessage);
  }

  const data = await res.json();

  return {
    id: data.id,
    firstName: data.firstName ?? null,
    lastName: data.lastName ?? null,
    clinicalInfoId: data.clinicalInfoId ?? null,
    role: data.role ?? '',
  };
}

export async function changeUserName(
  clientUserId: string,
  payload: { newFirstName: string; newLastName: string },
): Promise<SessionUser> {
  if (!clientUserId) throw new Error('ID do usuário é obrigatório.');
  try {
    const res = await fetch(`${API_BASE_URL}/gateway/client-user/change-name`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error();
    const data = await res.json();
    return {
      id: data.id,
      firstName: data.firstName ?? null,
      lastName: data.lastName ?? null,
      clinicalInfoId: data.clinicalInfo?.id ?? null,
      role: data.role ?? null,
    };
  } catch {
    throw new Error('Não foi possível alterar o nome do usuário.');
  }
}

export async function associateClinicalInfo(
  clientUserId: string,
  clinicalInfoId: string,
): Promise<SessionUser> {
  if (!clientUserId || !clinicalInfoId) throw new Error('IDs obrigatórios.');
  try {
    const res = await fetch(
      `${API_BASE_URL}/gateway/client-user/associate-clinical-info?clinicalInfoId=${encodeURIComponent(
        clinicalInfoId,
      )}`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      },
    );
    if (!res.ok) throw new Error();
    const data = await res.json();
    return {
      id: data.id,
      firstName: data.firstName ?? null,
      lastName: data.lastName ?? null,
      clinicalInfoId: data.clinicalInfo?.id ?? null,
      role: data.role ?? null,
    };
  } catch {
    throw new Error('Não foi possível associar as informações clínicas.');
  }
}

/**
 * Clinical Info
 */
export async function getClinicalInfo(): Promise<ClinicalInfo> {
  try {
    const res = await fetch(`${API_BASE_URL}/gateway/clinical-info`, {
      method: 'GET',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) return EmptyClinicalInfo;
    const data: ClinicalInfo = await res.json();
    const normalizeContact = (c: any, forcedId: number): Contact => ({
      id: forcedId,
      firstName: c?.firstName ?? null,
      lastName: c?.lastName ?? null,
      ddd: c?.ddd ?? null,
      phone: c?.phone ?? null,
      relationship: c?.relationship ?? '',
    });
    data.contacts = [
      normalizeContact(data.contacts?.[0], 1),
      normalizeContact(data.contacts?.[1], 2),
      normalizeContact(data.contacts?.[2], 3),
    ];
    return data;
  } catch {
    return EmptyClinicalInfo;
  }
}

export async function saveClinicalInfo(
  clinicalInfo: ClinicalInfo,
  clinicalInfoId: string,
): Promise<void> {
  if (!clinicalInfoId) throw new Error('ID das informações clínicas é obrigatório.');
  const contacts: Contact[] = [
    { ...clinicalInfo.contacts?.[0], id: 1 },
    { ...clinicalInfo.contacts?.[1], id: 2 },
    { ...clinicalInfo.contacts?.[2], id: 3 },
  ];
  try {
    const res = await fetch(`${API_BASE_URL}/gateway/clinical-info`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ ...clinicalInfo, contacts }),
    });
    if (!res.ok) throw new Error();
  } catch {
    throw new Error('Não foi possível salvar as informações clínicas.');
  }
}

// Funções auxiliares de criação e listagem
export async function createAndAssociateClinicalInfo(
  clientUserId: string,
  clinicalInfo: ClinicalInfo,
): Promise<SessionUser> {
  if (!clientUserId) throw new Error('ID do usuário é obrigatório.');
  const created = await createClinicalInfo(clinicalInfo);
  return associateClinicalInfo(clientUserId, created.id);
}

export async function createClinicalInfo(clinicalInfo: ClinicalInfo): Promise<ClinicalInfo> {
  const contacts: Contact[] = [
    { ...clinicalInfo.contacts?.[0], id: 1 },
    { ...clinicalInfo.contacts?.[1], id: 2 },
    { ...clinicalInfo.contacts?.[2], id: 3 },
  ];
  try {
    const res = await fetch(`${API_BASE_URL}/gateway/clinical-info`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ ...clinicalInfo, contacts }),
    });
    if (!res.ok) throw new Error();
    return res.json();
  } catch {
    throw new Error('Não foi possível criar as informações clínicas.');
  }
}

export async function getAllClinicalInfo(): Promise<ClinicalInfoOptions> {
  try {
    const res = await fetch(`${API_BASE_URL}/gateway/clinical-info/all`, {
      method: 'GET',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) throw new Error();
    const data = await res.json();
    return {
      diseases: data.diseases ?? [],
      medications: data.medications ?? [],
      allergies: data.allergies ?? [],
      surgeries: data.surgeries ?? [],
    };
  } catch {
    return { diseases: [], medications: [], allergies: [], surgeries: [] };
  }
}

/**
 * Refresh Token → SessionUser
 */
export async function refreshToken(): Promise<SessionUser> {
  try {
    const res = await fetch(`${API_BASE_URL}/gateway/refresh-token`, {
      method: 'POST',
      credentials: 'include',
    });
    if (!res.ok) throw new Error();
    const data = await res.json();
    return {
      id: data.id,
      firstName: data.firstName ?? null,
      lastName: data.lastName ?? null,
      clinicalInfoId: data.clinicalInfoId ?? null,
      role: data.role ?? null,
    };
  } catch {
    throw new Error('Não foi possível renovar a sessão.');
  }
}

/**
 * Logout do usuário
 */
export async function logout(): Promise<void> {
  try {
    const res = await fetch(`${API_BASE_URL}/gateway/logout`, {
      method: 'POST',
      credentials: 'include',
    });
    if (!res.ok) throw new Error();
  } catch {
    throw new Error('Não foi possível realizar logout.');
  }
}

/**
 * Alterar a senha do usuário
 */
export async function changePassword(
  clientUserId: string,
  payload: { password: string; newPassword: string },
): Promise<void> {
  if (!clientUserId) throw new Error('ID do usuário é obrigatório.');
  if (!payload.password || !payload.newPassword) {
    throw new Error('Senha atual e nova senha são obrigatórias.');
  }

  try {
    const res = await fetch(`${API_BASE_URL}/gateway/change-password`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        password: payload.password,
        newPassword: payload.newPassword,
      }),
    });

    if (res.status === 200 || res.status === 204) {
      return;
    }
    if (res.status >= 400 && res.status < 500) {
      let data: any = {};
      try {
        data = await res.json();
      } catch {}
      throw new Error(data.message || 'Dados inválidos.');
    }
    throw new Error('Não foi possível alterar a senha.');
  } catch (err: any) {
    throw new Error('Erro ao alterar a senha.');
  }
}

/**
 * Deletar a conta do usuário junto com suas informações clínicas
 * Verifica a senha antes de prosseguir
 */
export async function deleteAccount(
  clientUserId: string,
  payload: { password: string },
): Promise<void> {
  if (!clientUserId) throw new Error('ID do usuário é obrigatório.');
  if (!payload.password) throw new Error('A senha é obrigatória.');

  try {
    const verifyRes = await verifyPassword(payload.password);
    if (!verifyRes.verified) {
      throw new Error('Senha incorreta.');
    }

    // 2️⃣ Deleta informações clínicas
    const clinicalRes = await fetch(`${API_BASE_URL}/gateway/clinical-info`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });

    if (!clinicalRes.ok) {
      let data: any = {};
      try {
        data = await clinicalRes.json();
      } catch {}
      throw new Error(data.message || 'Não foi possível deletar as informações clínicas.');
    }

    // 3️⃣ Deleta a conta do usuário
    const res = await fetch(`${API_BASE_URL}/gateway/client-user/delete-account`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ password: payload.password }),
    });

    if (res.status === 200 || res.status === 204) {
      return;
    }

    if (res.status >= 400 && res.status < 500) {
      let data: any = {};
      try {
        data = await res.json();
      } catch {}
      throw new Error(data.message || 'Dados inválidos.');
    }

    throw new Error('Não foi possível deletar a conta.');
  } catch (err: any) {
    throw new Error(err.message || 'Erro ao deletar a conta.');
  }
}

/**
 * Verifica se a senha do usuário está correta
 */
export async function verifyPassword(password: string): Promise<{ verified: boolean }> {
  if (!password) throw new Error('A senha é obrigatória.');

  try {
    const res = await fetch(`${API_BASE_URL}/gateway/verify-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ password }),
    });

    if (!res.ok) {
      let data: any = {};
      try {
        data = await res.json();
      } catch {}
      throw new Error('Não foi possível verificar a senha.');
    }

    const data: { verified: boolean } = await res.json();
    return data;
  } catch (err: any) {
    throw new Error('Erro ao verificar a senha.');
  }
}

/**
 * Reseta a senha do usuário usando o código enviado por e-mail
 */
export async function resetPassword(
  email: string,
  code: string,
  newPassword: string,
): Promise<{ success: boolean }> {
  if (newPassword === '') return { success: false };
  if (!email) throw new Error('O e-mail é obrigatório.');
  if (!code) throw new Error('O código é obrigatório.');
  if (!newPassword) throw new Error('A nova senha é obrigatória.');

  try {
    const res = await fetch(`${API_BASE_URL}/gateway/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, verificationCode: code, newPassword }),
    });

    if (!res.ok) {
      let data: any = {};
      try {
        data = await res.json();
      } catch {}
      throw new Error(data.message || 'Não foi possível redefinir a senha.');
    }
    return { success: true };
  } catch (err: any) {
    throw new Error(err.message || 'Erro ao redefinir a senha.');
  }
}

export async function getClinicalInfoQrCode(requestId: string, cookie: string): Promise<Blob> {
  if (!requestId) throw new Error('O x-request-id é obrigatório.');

  try {
    const res = await fetch(`${API_BASE_URL}/gateway/clinical-info/qr-code`, {
      method: 'GET',
      headers: {
        'x-request-id': requestId,
        'Content-Type': 'application/pdf',
        Cookie: cookie,
      },
      credentials: 'include',
    });

    if (!res.ok) {
      throw new Error('Não foi possível obter o QR Code em PDF.');
    }
    const blob = await res.blob();
    return blob;
  } catch (err: any) {
    throw new Error(err.message || 'Erro ao buscar o QR Code.');
  }
}

export async function getPublicData(id: string, code: string): Promise<ClinicalInfo> {
  // --- Validações locais ---
  if (!id || !/^[0-9a-fA-F-]{36}$/.test(id)) {
    throw new Error('Usuário inválido.');
  }
  if (!code || code.length !== 6) {
    throw new Error('O código deve conter exatamente 6 caracteres.');
  }

  try {
    const url = `${API_BASE_URL}/gateway/public/clinical-info?id=${encodeURIComponent(id)}&code=${encodeURIComponent(code)}`;
    
    const res = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    let data: any = null;
    try { data = await res.json(); } catch {}

    if (!res.ok) {
      switch (res.status) {
        case 404:
          throw new Error('Usuário inválido.');
        case 401:
          throw new Error('Código incorreto.');
        default:
          throw new Error('Erro ao carregar dados públicos.');
      }
    }

    const normalizeContact = (c: any, forcedId: number): Contact => ({
      id: forcedId,
      firstName: c?.firstName ?? null,
      lastName: c?.lastName ?? null,
      ddd: c?.ddd ?? null,
      phone: c?.phone ?? null,
      relationship: c?.relationship ?? '',
    });

    const ct = data.contacts ?? [];
    data.contacts = [
      normalizeContact(ct[0], 1),
      normalizeContact(ct[1], 2),
      normalizeContact(ct[2], 3),
    ];

    publicDataAccessAlert(id);
    return data;

  } catch (err: any) {
    throw new Error(err.message || 'Erro ao buscar dados públicos.');
  }
}

export async function publicDataAccessAlert(id: string): Promise<void> {
  if (!id || !/^[0-9a-fA-F-]{36}$/.test(id)) {
    throw new Error('O ID deve ser um UUID válido.');
  }

  try {
    // Agora envia o id via query string
    const url = `${API_BASE_URL}/gateway/public/clinical-info-access-alert?id=${encodeURIComponent(id)}`;
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    console.error('Erro ao disparar alerta de acesso público:', err.message || err);
  }
}