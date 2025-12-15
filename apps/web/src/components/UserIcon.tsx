'use client';

import { useState, useRef, useEffect } from 'react';
import { useUser } from '@/contexts/userContext';
import { useClinicalInfo } from '@/contexts/clinicalInfoContext';
import { useClinicalOptions } from '@/contexts/clinicalOptionsContext';
import { refreshToken, logout } from '@/lib/api';
import { usePathname, useRouter } from 'next/navigation';

interface UserIconProps {
  className?: string;
  onClick?: () => void;
}

export default function UserIcon({ className = '', onClick }: UserIconProps) {
  const { user, setUser, clearUser, setLoggedOut } = useUser();
  const { setClinicalInfo } = useClinicalInfo();
  const { resetAll: resetAllClinicalOptions } = useClinicalOptions();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const pathname = usePathname();
  const router = useRouter();

  // Marca que o componente já foi montado (client-side)
  useEffect(() => {
    setHydrated(true);
  }, []);

  // Fecha o menu se clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (tooltipRef.current && !tooltipRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ⚡ Refresh token apenas uma vez após montar
  useEffect(() => {
    let mounted = true;

    const tryRefreshToken = async () => {
      if (user.id || loading) return;
      setLoading(true);
      try {
        const session = await refreshToken();
        if (mounted && session?.id) {
          setUser({
            id: session.id,
            firstName: session.firstName || '',
            lastName: session.lastName || '',
            clinicalInfoId: session.clinicalInfoId ?? null,
            role: session.role!,
          });
        }
      } catch {
        handleLogout();
      } finally {
        if (mounted) setLoading(false);
      }
    };

    tryRefreshToken();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // roda só uma vez no mount

  if (!hydrated) return null; // evita SSR

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error('Erro ao fazer logout:', err);
    } finally {
      clearUser();
      setLoggedOut(true);
      setClinicalInfo(null);
      resetAllClinicalOptions();

      if (typeof window !== 'undefined') {
        sessionStorage.clear();
        localStorage.clear();
      }

      router.replace('/');
    }
  };

  const handleDeleteAccount = () => {
    router.push('/auth/delete-account');
  };

  const handleClick = () => {
    setOpen((prev) => !prev);
    onClick?.();
  };

  const isLoggedIn = !!user.id;

  // ⚡ Opções dinâmicas baseadas na página
  let options: { label: string; action: () => void }[] = [];
  if (isLoggedIn) {
    if (pathname === '/client-user') {
      options = [
        { label: 'Perfil Público', action: () => router.push('/client-user/public-data') },
        { label: 'Trocar Senha', action: () => router.push('/auth/change-password') },
        { label: 'Apagar Conta', action: handleDeleteAccount },
        { label: 'Sair', action: handleLogout },
      ];
    } else if (pathname === '/client-user/public-data') {
      options = [
        { label: 'Perfil', action: () => router.push('/client-user') },
        { label: 'Trocar Senha', action: () => router.push('/auth/change-password') },
        { label: 'Apagar Conta', action: handleDeleteAccount },
        { label: 'Sair', action: handleLogout },
      ];
    } else {
      options = [
        { label: 'Perfil', action: () => router.push('/client-user') },
        { label: 'Perfil Público', action: () => router.push('/client-user/public-data') },
        { label: 'Trocar Senha', action: () => router.push('/auth/change-password') },
        { label: 'Apagar Conta', action: handleDeleteAccount },
        { label: 'Sair', action: handleLogout },
      ];
    }
  } else {
    options = [
      { label: 'Entrar', action: () => router.push('/auth/login') },
      { label: 'Registrar-se', action: () => router.push('/auth/register') },
    ];
  }

  return (
    <div className="relative" ref={tooltipRef}>
      <div
        onClick={handleClick}
        role="button"
        aria-label="User menu"
        className={`cursor-pointer flex items-center justify-center w-9 h-9 rounded-full bg-transparent hover:text-primary-100 active:text-primary-300 transition-colors duration-250 ease-in-out ${className}`}
      >
        <svg
          viewBox="0 0 1024 1024"
          className="w-9 h-9"
          fill="currentColor"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g>
            <path d="M512 661.3c-117.6 0-213.3-95.7-213.3-213.3S394.4 234.7 512 234.7 725.3 330.4 725.3 448 629.6 661.3 512 661.3z m0-341.3c-70.6 0-128 57.4-128 128s57.4 128 128 128 128-57.4 128-128-57.4-128-128-128z" />
            <path d="M837 862.9c-15.7 0-30.8-8.7-38.2-23.7C744.3 729.5 634.4 661.3 512 661.3s-232.3 68.1-286.8 177.9c-10.5 21.1-36.1 29.7-57.2 19.2s-29.7-36.1-19.2-57.2C217.8 662.3 357 576 512 576s294.2 86.3 363.2 225.2c10.5 21.1 1.9 46.7-19.2 57.2-6.1 3-12.6 4.5-19 4.5z" />
            <path d="M512 1002.7c-270.6 0-490.7-220.1-490.7-490.7S241.4 21.3 512 21.3s490.7 220.1 490.7 490.7-220.1 490.7-490.7 490.7z m0-896c-223.5 0-405.3 181.8-405.3 405.3S288.5 917.3 512 917.3 917.3 735.5 917.3 512 735.5 106.7 512 106.7z" />
          </g>
        </svg>
      </div>

      {open && (
        <div className="absolute right-0 mt-2 w-48 bg-primary-900 text-grayscale-200 shadow-lg rounded-md p-2 transition-opacity duration-200 z-50">
          {options.map((opt) => (
            <button
              key={opt.label}
              onClick={() => {
                opt.action();
                setOpen(false);
              }}
              className="block w-full text-left px-2 py-1 hover:bg-primary-800 rounded"
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
