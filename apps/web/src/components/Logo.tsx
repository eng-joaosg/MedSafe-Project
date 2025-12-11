interface LogoProps {
  className?: string;
}

export default function Logo({ className = '' }: LogoProps) {
  const baseClasses = `text-6xl font-[1000] tracking-wider select-none cursor-default text-center content-center justify-center`;
  const combinedClasses = `${baseClasses} ${className}`;
  return (
    <h1 className={combinedClasses}>
      MedSafe
    </h1>
  );
}
