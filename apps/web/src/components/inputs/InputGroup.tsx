'use client';
import React from 'react';

interface Props {
  children: React.ReactNode;
  editable?: boolean;
}

export default function InputGroup({ children, editable = true }: Props) {
  const base =
    'transition-all w-full max-w-md h-18 mb-4 flex items-center justify-center gap-4 p-2 rounded-none md:rounded-3xl';

  const editableClass =
    'bg-grayscale-50 border-2 border-transparent hover:border-info focus-within:border-info';
  const disabledClass = 'bg-grayscale-200 border-2 border-grayscale-300';

  return (
    <div
      role="group"
      aria-disabled={!editable}
      className={`${editable ? editableClass : disabledClass} ${base}`}
    >
      {children}
    </div>
  );
}
