'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { ClinicalInfo } from '@/lib/api';

// ------------------------------------------------------
// TIPOS
// ------------------------------------------------------

interface ClinicalInfoContextType {
  clinicalInfo: ClinicalInfo | null;
  setClinicalInfo: (data: ClinicalInfo | null) => void;
  loading: boolean;
  setLoading: (value: boolean) => void;
}

// ------------------------------------------------------
// CONTEXTO
// ------------------------------------------------------

const ClinicalInfoContext = createContext<ClinicalInfoContextType>({
  clinicalInfo: null,
  setClinicalInfo: () => {},
  loading: false,
  setLoading: () => {},
});

export const useClinicalInfo = () => useContext(ClinicalInfoContext);

// ------------------------------------------------------
// PROVIDER
// ------------------------------------------------------

export function ClinicalInfoProvider({ children }: { children: ReactNode }) {
  const [clinicalInfo, setClinicalInfo] = useState<ClinicalInfo | null>(null);
  const [loading, setLoading] = useState(false);

  return (
    <ClinicalInfoContext.Provider
      value={{ clinicalInfo, setClinicalInfo, loading, setLoading }}
    >
      {children}
    </ClinicalInfoContext.Provider>
  );
}
