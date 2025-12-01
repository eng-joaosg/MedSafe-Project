'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ClinicalInfo, getClinicalInfo } from '@/lib/api';

// ------------------------------------------------------
// TIPOS
// ------------------------------------------------------

interface ClinicalInfoContextType {
  clinicalInfo: ClinicalInfo | null;
  setClinicalInfo: (data: ClinicalInfo | null) => void;
  loading: boolean;
}

// ------------------------------------------------------
// CONTEXTO
// ------------------------------------------------------

const ClinicalInfoContext = createContext<ClinicalInfoContextType>({
  clinicalInfo: null,
  setClinicalInfo: () => {},
  loading: true,
});

export const useClinicalInfo = () => useContext(ClinicalInfoContext);

// ------------------------------------------------------
// PROVIDER
// ------------------------------------------------------

export function ClinicalInfoProvider({ children }: { children: ReactNode }) {
  const [clinicalInfo, setClinicalInfo] = useState<ClinicalInfo | null>(null);
  const [loading, setLoading] = useState(true);

  // -----------------------------------------
  // Carregar do backend ao montar
  // -----------------------------------------
  useEffect(() => {
    const fetchInfo = async () => {
      setLoading(true);
      try {
        const data = await getClinicalInfo();
        setClinicalInfo(data);
      } catch (err) {
        console.error('Erro ao carregar ClinicalInfo:', err);
        setClinicalInfo(null);
      } finally {
        setLoading(false);
      }
    };

    fetchInfo();
  }, []);

  return (
    <ClinicalInfoContext.Provider value={{ clinicalInfo, setClinicalInfo, loading }}>
      {children}
    </ClinicalInfoContext.Provider>
  );
}
