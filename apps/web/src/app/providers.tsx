'use client';

import { UserProvider } from '@/contexts/userContext';
import { ClinicalOptionsProvider } from '@/contexts/clinicalOptionsContext';
import { ClinicalInfoProvider } from '@/contexts/clinicalInfoContext';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <UserProvider>
      <ClinicalOptionsProvider>
        <ClinicalInfoProvider>
          {children}
        </ClinicalInfoProvider>
      </ClinicalOptionsProvider>
    </UserProvider>
  );
}
