'use client';

interface ConfirmButtonProps {
  label: string;
  onClick?: () => void;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
}

export default function ConfirmButton({
  label,
  onClick,
  loading = false,
  disabled = false,
  className = "",
}: ConfirmButtonProps) {

  const blocked = disabled || loading;

  return (
    <button
      onClick={onClick}
      disabled={blocked}
      className={`
        flex items-center justify-center
        w-40 h-12
        rounded-4xl
        border-4
        font-semibold
        transition-colors duration-250 ease-in-out
        select-none

        ${blocked
          ? "bg-transparent text-primary-300 border-primary-300 cursor-not-allowed"
          : "bg-transparent text-primary-100 border-primary-100 hover:text-grayscale-50 hover:border-grayscale-50 active:text-primary-300 active:border-primary-300 cursor-pointer"
        }

        ${className}
      `}
    >
      {loading ? (
        <div className="h-5 w-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
      ) : (
        label
      )}
    </button>
  );
}
