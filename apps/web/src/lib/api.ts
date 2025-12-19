const API_BASE_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL || 'http://localhost:3001/gateway';

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
    { firstName: null, lastName: null, ddd: null, phone: null, relationship: '' },
  ],
};

/**
 * Usuário (Client User)
 */
type FindEmailResponse = { emailAlreadyExists: boolean };

export async function findEmail(email: string): Promise<boolean> {
  try {
    const response = await apiFetch<FindEmailResponse>(
      `/auth/client-user/find-email?email=${encodeURIComponent(email)}`
    );
    return response.emailAlreadyExists;
  } catch {
    throw new Error('Não foi possível verificar o email.');
  }
}

export async function register(payload: { email: string; firstName: string; lastName: string; password: string }): Promise<void> {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/client-user/register`, {
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
  if (!/^\d{6}$/.test(verificationCode)) throw new Error('O código deve conter exatamente 6 dígitos.');

  try {
    const res = await fetch(`${API_BASE_URL}/auth/client-user/verify-account`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, verificationCode }),
    });
    if (!res.ok) throw new Error();
  } catch {
    throw new Error('Não foi possível verificar o código de ativação.');
  }
}

export async function generateVerificationCode(email: string, type: 'verify-account' | 'forgot-password'): Promise<void> {
  if (!email.trim()) throw new Error('O e-mail é obrigatório.');
  if (!type) throw new Error('O tipo de código é obrigatório.');

  try {
    const res = await fetch(
      `${API_BASE_URL}/auth/new-verification-code?type=${encodeURIComponent(type)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      }
    );
    if (!res.ok) throw new Error('Não foi possível gerar o código de verificação.');
  } catch {
    throw new Error('Não foi possível gerar o código de verificação.');
  }
}

/**
 * LOGIN → retorna SessionUser
 */
export async function login(payload: { email: string; password: string }): Promise<SessionUser> {
  const res = await fetch(`${API_BASE_URL}/auth/client-user/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    credentials: 'include',
  });

  if (!res.ok) {
    let errorMessage = 'Não foi possível realizar o login.';
    if (res.status === 403) errorMessage = 'Sua conta ainda não foi verificada.';
    else if (res.status === 401) errorMessage = 'Email ou senha incorretos.';
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

// Funções de usuário
export async function changeUserName(clientUserId: string, payload: { newFirstName: string; newLastName: string }): Promise<SessionUser> {
  if (!clientUserId) throw new Error('ID do usuário é obrigatório.');
  try {
    const res = await fetch(`${API_BASE_URL}/auth/client-user/change-name`, {
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

export async function associateClinicalInfo(clientUserId: string, clinicalInfoId: string): Promise<SessionUser> {
  if (!clientUserId || !clinicalInfoId) throw new Error('IDs obrigatórios.');
  try {
    const res = await fetch(
      `${API_BASE_URL}/auth/client-user/associate-clinical-info?clinicalInfoId=${encodeURIComponent(clinicalInfoId)}`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      }
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
    const res = await fetch(`${API_BASE_URL}/clinical-info`, {
      method: 'GET',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) return EmptyClinicalInfo;
    const data: ClinicalInfo = await res.json();
    data.contacts = (data.contacts && data.contacts.length > 0 ? data.contacts : [EmptyClinicalInfo.contacts[0]])
      .map((c, idx) => ({
        id: idx + 1,
        firstName: c?.firstName ?? null,
        lastName: c?.lastName ?? null,
        ddd: c?.ddd ?? null,
        phone: c?.phone ?? null,
        relationship: c?.relationship ?? '',
      }));

    return data;
  } catch {
    return EmptyClinicalInfo;
  }
}

export async function saveClinicalInfo(clinicalInfo: ClinicalInfo, clinicalInfoId: string): Promise<void> {
  if (!clinicalInfoId) throw new Error('ID das informações clínicas é obrigatório.');

  const contacts = clinicalInfo.contacts.map((contact) => ({
    ...contact,
    ddd: contact.ddd !== null ? String(contact.ddd) : '',
    phone: contact.phone !== null ? String(contact.phone) : '',
  }));

  try {
    const res = await fetch(`${API_BASE_URL}/clinical-info`, {
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

export async function createAndAssociateClinicalInfo(
  clientUserId: string,
  clinicalInfo: ClinicalInfo
): Promise<SessionUser> {
  if (!clientUserId) throw new Error('ID do usuário é obrigatório.');

  let created: ClinicalInfo;
  try {
    created = await createClinicalInfo(clinicalInfo);
  } catch (err) {
    console.error('Erro ao criar clinicalInfo:', err);
    throw new Error('Não foi possível criar as informações clínicas.');
  }

  if (!created?.id) throw new Error('Erro inesperado: clinicalInfo criado sem ID.');

  try {
    return await associateClinicalInfo(clientUserId, created.id);
  } catch (err) {
    console.error('Falha ao associar clinicalInfo, deletando registro criado...', err);
    try {
      await fetch(
        `${API_BASE_URL}/clinical-info/delete-recent?clinicalInfoId=${encodeURIComponent(created.id)}`,
        {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        }
      );
    } catch (deleteErr) {
      console.error('Erro ao deletar clinicalInfo após falha de associação:', deleteErr);
    }

    throw new Error('Não foi possível associar as informações clínicas.');
  }
}

export async function createClinicalInfo(clinicalInfo: ClinicalInfo): Promise<ClinicalInfo> {
  const contacts = clinicalInfo.contacts.map((contact) => ({
    ...contact,
    ddd: contact.ddd !== null ? String(contact.ddd) : '',
    phone: contact.phone !== null ? String(contact.phone) : '',
  }));

  try {
    const res = await fetch(`${API_BASE_URL}/clinical-info`, {
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
    const res = await fetch(`${API_BASE_URL}/clinical-info/all`, {
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
    const res = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
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

// Logout
export async function logout(): Promise<void> {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/logout`, { method: 'POST', credentials: 'include' });
    if (!res.ok) throw new Error();
  } catch {
    throw new Error('Não foi possível realizar logout.');
  }
}

// Alterar senha
export async function changePassword(clientUserId: string, payload: { password: string; newPassword: string }): Promise<void> {
  if (!clientUserId) throw new Error('ID do usuário é obrigatório.');
  if (!payload.password || !payload.newPassword) throw new Error('Senha atual e nova senha são obrigatórias.');

  try {
    const res = await fetch(`${API_BASE_URL}/auth/change-password`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ password: payload.password, newPassword: payload.newPassword }),
    });

    if (res.status === 200 || res.status === 204) return;
    if (res.status >= 400 && res.status < 500) {
      let data: any = {};
      try { data = await res.json(); } catch {}
      throw new Error(data.message || 'Dados inválidos.');
    }
    throw new Error('Não foi possível alterar a senha.');
  } catch {
    throw new Error('Erro ao alterar a senha.');
  }
}

// Deletar conta
export async function deleteAccount(clientUserId: string, payload: { password: string }): Promise<void> {
  if (!clientUserId) throw new Error('ID do usuário é obrigatório.');
  if (!payload.password) throw new Error('A senha é obrigatória.');

  try {
    const verifyRes = await verifyPassword(payload.password);
    if (!verifyRes.verified) throw new Error('Senha incorreta.');

    const clinicalRes = await fetch(`${API_BASE_URL}/clinical-info`, { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, credentials: 'include' });
    if (!clinicalRes.ok) {
      let data: any = {};
      try { data = await clinicalRes.json(); } catch {}
      throw new Error(data.message || 'Não foi possível deletar as informações clínicas.');
    }

    const res = await fetch(`${API_BASE_URL}/auth/client-user/delete-account`, { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ password: payload.password }) });
    if (res.status === 200 || res.status === 204) return;

    if (res.status >= 400 && res.status < 500) {
      let data: any = {};
      try { data = await res.json(); } catch {}
      throw new Error(data.message || 'Dados inválidos.');
    }

    throw new Error('Não foi possível deletar a conta.');
  } catch (err: any) {
    throw new Error(err.message || 'Erro ao deletar a conta.');
  }
}

// Verificar senha
export async function verifyPassword(password: string): Promise<{ verified: boolean }> {
  if (!password) throw new Error('A senha é obrigatória.');

  try {
    const res = await fetch(`${API_BASE_URL}/auth/verify-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ password }),
    });
    if (!res.ok) throw new Error('Não foi possível verificar a senha.');
    const data: { verified: boolean } = await res.json();
    return data;
  } catch {
    throw new Error('Erro ao verificar a senha.');
  }
}

// Reset de senha
export async function resetPassword(email: string, code: string, newPassword: string): Promise<{ success: boolean }> {
  if (!email) throw new Error('O e-mail é obrigatório.');
  if (!code) throw new Error('O código é obrigatório.');
  if (!newPassword) throw new Error('A nova senha é obrigatória.');

  try {
    const res = await fetch(`${API_BASE_URL}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, verificationCode: code, newPassword }),
    });

    if (!res.ok) {
      let data: any = {};
      try { data = await res.json(); } catch {}
      throw new Error(data.message || 'Não foi possível redefinir a senha.');
    }
    return { success: true };
  } catch (err: any) {
    throw new Error(err.message || 'Erro ao redefinir a senha.');
  }
}

// QR Code clínico
export async function getClinicalInfoQrCode(): Promise<Blob> {
  try {
    const res = await fetch(`${API_BASE_URL}/clinical-info/qr-code`, {
      method: 'GET',
      headers: {'Content-Type': 'application/pdf'},
      credentials: 'include',
    });
    if (!res.ok) throw new Error('Não foi possível obter o QR Code em PDF.');
    return res.blob();
  } catch (err: any) {
    throw new Error(err.message || 'Erro ao buscar o QR Code.');
  }
}

export async function getPublicData(id: string, code: string): Promise<ClinicalInfo> {
  if (!id || !/^[0-9a-fA-F-]{36}$/.test(id)) throw new Error('Usuário inválido.');
  if (!code || code.length !== 6) throw new Error('O código deve conter exatamente 6 caracteres.');

  try {
    const res = await fetch(
      `${API_BASE_URL}/public/clinical-info?id=${encodeURIComponent(id)}&code=${encodeURIComponent(code)}`,
      { method: 'GET', headers: { 'Content-Type': 'application/json' } }
    );

    let data: any = null;
    try { data = await res.json(); } catch {}

    if (!res.ok) {
      switch (res.status) {
        case 404: throw new Error('Usuário inválido.');
        case 401: throw new Error('Código incorreto.');
        default: throw new Error('Erro ao carregar dados públicos.');
      }
    }

    // Normaliza contatos, mantendo lista vazia se não houver
    data.contacts = (data.contacts ?? []).map((c: any, idx: number) => ({
      id: idx + 1,
      firstName: c?.firstName ?? null,
      lastName: c?.lastName ?? null,
      ddd: c?.ddd ?? null,
      phone: c?.phone ?? null,
      relationship: c?.relationship ?? '',
    }));

    publicDataAccessAlert(id);
    return data;
  } catch (err: any) {
    throw new Error(err.message || 'Erro ao buscar dados públicos.');
  }
}

// Alerta de acesso público
export async function publicDataAccessAlert(id: string): Promise<void> {
  if (!id || !/^[0-9a-fA-F-]{36}$/.test(id)) throw new Error('O ID deve ser um UUID válido.');
  try {
    await fetch(`${API_BASE_URL}/auth/clinical-info-access-alert?id=${encodeURIComponent(id)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    console.error('Erro ao disparar alerta de acesso público:', err.message || err);
  }
}
