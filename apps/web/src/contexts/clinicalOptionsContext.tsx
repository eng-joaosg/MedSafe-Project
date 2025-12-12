'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

// ------------------------------------------------------
// TYPES DAS OPÇÕES CLÍNICAS
// ------------------------------------------------------

export interface ClinicalOptions {
  diseases: string[];
  medications: string[];
  allergies: string[];
  surgeries: string[];
}

// ------------------------------------------------------
// DEFAULT STRUCTURE
// ------------------------------------------------------

const defaultOptions: ClinicalOptions = {
  diseases: [],
  medications: [],
  allergies: [],
  surgeries: [],
};

// Tempo de expiração em minutos
const EXPIRATION_MINUTES = 30;

// Nome da chave salva no sessionStorage
const STORAGE_KEY = 'clinical_options';

// ------------------------------------------------------
// CONTEXT TYPE
// ------------------------------------------------------

interface ClinicalOptionsContextType {
  diseases: string[];
  medications: string[];
  allergies: string[];
  surgeries: string[];

  addDisease: (name: string) => void;
  addMedication: (name: string) => void;
  addAllergy: (name: string) => void;
  addSurgery: (name: string) => void;

  removeDisease: (name: string) => void;
  removeMedication: (name: string) => void;
  removeAllergy: (name: string) => void;
  removeSurgery: (name: string) => void;

  resetAll: () => void;
}

// Criando contexto com valores vazios (placeholder)
const ClinicalOptionsContext = createContext<ClinicalOptionsContextType>({
  diseases: [],
  medications: [],
  allergies: [],
  surgeries: [],

  addDisease: () => {},
  addMedication: () => {},
  addAllergy: () => {},
  addSurgery: () => {},

  removeDisease: () => {},
  removeMedication: () => {},
  removeAllergy: () => {},
  removeSurgery: () => {},

  resetAll: () => {},
});

// ------------------------------------------------------
// HOOK
// ------------------------------------------------------

export function useClinicalOptions() {
  return useContext(ClinicalOptionsContext);
}

// ------------------------------------------------------
// PROVIDER — COM SESSION STORAGE + EXPIRAÇÃO
// ------------------------------------------------------

export function ClinicalOptionsProvider({ children }: { children: ReactNode }) {
  const [options, setOptions] = useState<ClinicalOptions>(defaultOptions);
  const [isMounted, setIsMounted] = useState(false); // Adicionado para hidratação

  // ------------------------------------------------------
  // CARREGA DO SESSION STORAGE NA PRIMEIRA RENDERIZAÇÃO
  // ------------------------------------------------------
  useEffect(() => {
    if (typeof window === 'undefined') {
        setIsMounted(true); // Se fosse SSR, forçamos a montagem
        return;
    }

    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) {
        setIsMounted(true); // Termina a hidratação se estiver vazio
        return;
    }

    try {
      const parsed = JSON.parse(raw);
      const { expiresAt, options: savedOptions } = parsed;

      // Expirou?
      if (Date.now() > expiresAt) {
        sessionStorage.removeItem(STORAGE_KEY);
      } else {
        // Carrega as opções válidas
        setOptions(savedOptions);
      }
    } catch (e) {
      console.error('Erro ao ler ClinicalOptions do sessionStorage:', e);
    } finally {
        setIsMounted(true); // Garante que children será renderizado após a tentativa de load
    }
  }, []);

  // ------------------------------------------------------
  // SALVAR COM EXPIRAÇÃO
  // ------------------------------------------------------
  const saveToStorage = (updated: ClinicalOptions) => {
    if (typeof window === 'undefined') return;

    const payload = {
      options: updated,
      expiresAt: Date.now() + EXPIRATION_MINUTES * 60 * 1000,
    };

    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  };

  // ------------------------------------------------------
  // FUNÇÃO INTERNA DE UPDATE
  // ------------------------------------------------------
  const update = (mutate: (prev: ClinicalOptions) => ClinicalOptions) => {
    setOptions(prev => {
      const updated = mutate(prev);
      saveToStorage(updated);
      return updated;
    });
  };

  // ------------------------------------------------------
  // FUNÇÕES PARA ADICIONAR (sem duplicados)
  // ------------------------------------------------------

  const addDisease = (name: string) => {
    update(prev => ({
      ...prev,
      diseases: [...new Set([...prev.diseases, name])],
    }));
  };

  const addMedication = (name: string) => {
    update(prev => ({
      ...prev,
      medications: [...new Set([...prev.medications, name])],
    }));
  };

  const addAllergy = (name: string) => {
    update(prev => ({
      ...prev,
      allergies: [...new Set([...prev.allergies, name])],
    }));
  };

  const addSurgery = (name: string) => {
    update(prev => ({
      ...prev,
      surgeries: [...new Set([...prev.surgeries, name])],
    }));
  };

  // ------------------------------------------------------
  // FUNÇÕES PARA REMOVER
  // ------------------------------------------------------

  const removeDisease = (name: string) => {
    update(prev => ({
      ...prev,
      diseases: prev.diseases.filter(x => x !== name),
    }));
  };

  const removeMedication = (name: string) => {
    update(prev => ({
      ...prev,
      medications: prev.medications.filter(x => x !== name),
    }));
  };

  const removeAllergy = (name: string) => {
    update(prev => ({
      ...prev,
      allergies: prev.allergies.filter(x => x !== name),
    }));
  };

  const removeSurgery = (name: string) => {
    update(prev => ({
      ...prev,
      surgeries: prev.surgeries.filter(x => x !== name),
    }));
  };

  // ------------------------------------------------------
  // RESET GERAL
  // ------------------------------------------------------

  const resetAll = () => {
    setOptions(defaultOptions);
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(STORAGE_KEY);
    }
  };

  return (
    <ClinicalOptionsContext.Provider
      value={{
        diseases: options.diseases,
        medications: options.medications,
        allergies: options.allergies,
        surgeries: options.surgeries,

        addDisease,
        addMedication,
        addAllergy,
        addSurgery,

        removeDisease,
        removeMedication,
        removeAllergy,
        removeSurgery,

        resetAll,
      }}
    >
      {isMounted ? children : null} {/* Renderização condicional para hidratação */}
    </ClinicalOptionsContext.Provider>
  );
}