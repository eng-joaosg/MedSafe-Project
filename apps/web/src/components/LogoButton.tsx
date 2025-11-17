'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

interface LogoButtonProps {
  className?: string;
}

const SIZE_CLASS = 'text-2xl';

export default function LogoButton({ className = '' }: LogoButtonProps) {
  const [isClicked, setIsClicked] = useState(false);
  const router = useRouter();

  const handleClick = () => {
    setIsClicked(true);
    setTimeout(() => setIsClicked(false), 200);

    router.push('/'); 
  };

  const baseClasses = `
    ${SIZE_CLASS}
    font-black tracking-wider select-none 
    cursor-pointer 
    hover:text-primary-100
    active:text-primary-300
    transition-colors duration-250 ease-in-out
  `;

  return (
    <button
      className={`${baseClasses} ${className}`}
      onClick={handleClick}
      aria-label="MedSafe Logo Button"
    >
      MedSafe
    </button>
  );
}
