export function saveToSession<T>(key: string, value: T) {
  try {
    sessionStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('Erro ao salvar no sessionStorage', e);
  }
}

export function getFromSession<T>(key: string): T | null {
  try {
    const data = sessionStorage.getItem(key);
    return data ? (JSON.parse(data) as T) : null;
  } catch (e) {
    console.error('Erro ao ler do sessionStorage', e);
    return null;
  }
}

export function removeFromSession(key: string) {
  try {
    sessionStorage.removeItem(key);
  } catch (e) {
    console.error('Erro ao remover do sessionStorage', e);
  }
}
