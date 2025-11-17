'use client';

import Link from "next/link";

interface UserIconProps {
  className?: string;
  onClick?: () => void;
}

export default function RegisterButton({ className = '', onClick }: UserIconProps) {
  return (
    <Link
        href="auth/register"
        onClick={onClick}
        role="button"
        aria-label="Register button"
        className={`
            cursor-pointer
            flex items-center justify-center
            w-40 h-12
            rounded-4xl
            bg-transparent
            border-4
            text-primary-100
            border-primary-100
            hover:text-grayscale-50
            hover:border-grayscale-50
            active:text-primary-300
            active:border-primary-300
            transition-colors duration-250 ease-in-out
            ${className}
      `}
    >
        Cadastre-se aqui
    </Link>
  );
}
