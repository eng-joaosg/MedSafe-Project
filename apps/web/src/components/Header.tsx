'use client';
import { useEffect, useState } from 'react';
import LogoButton from './buttons/LogoButton';
import UserIcon from './UserIcon';

export default function Header() {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  return (
    <header className="w-full h-16 bg-primary-800 shadow-md fixed top-0 left-0 z-50">
      <div className="container mx-auto h-full flex justify-between items-center px-4">
        <LogoButton />
        {hydrated && <UserIcon />}
      </div>
    </header>
  );
}
