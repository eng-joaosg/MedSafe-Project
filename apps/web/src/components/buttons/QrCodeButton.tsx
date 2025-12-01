'use client';

interface QrCodeButtonProps {
  label?: string;
  onClick?: () => void;
  hasPublicCode: boolean;
  editable: boolean;
  className?: string;
  widthClass?: string;
}

export default function QrCodeButton({
  label = 'QR Code',
  onClick,
  hasPublicCode,
  editable,
  className = '',
  widthClass = 'w-40',
}: QrCodeButtonProps) {
  const isDisabled = !hasPublicCode || editable;
  return (
    <button
      onClick={onClick}
      disabled={isDisabled}
      className={`
        flex items-center justify-center
        ${widthClass} h-12
        rounded-4xl
        border-4
        font-semibold
        transition-colors duration-250 ease-in-out
        select-none
        ${isDisabled
          ? 'bg-transparent text-grayscale-200 border-grayscale-200 cursor-not-allowed'
          : 'bg-transparent text-primary-100 border-primary-100 hover:text-grayscale-50 hover:border-grayscale-50 active:text-primary-300 active:border-primary-300 cursor-pointer'
        }
        ${className}
      `}
    >
      {label}
    </button>
  );
}
