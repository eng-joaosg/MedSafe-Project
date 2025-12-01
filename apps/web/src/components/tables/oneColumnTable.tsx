interface OneRowTableProps {
  fieldName: string;
  lines: string[];
  className?: string;
}

export default function OneColumnTable({ fieldName, lines, className = '' }: OneRowTableProps) {
  return (
    <div className={`relative w-full md:max-w-md mb-4 ${className}`}>
      {/* Label fixa */}
      <span className="absolute top-1 left-6 text-md text-grayscale-900 pointer-events-none">
        {fieldName}:
      </span>

      {/* Container da tabela */}
      <div
        className="
          bg-grayscale-200
          text-grayscale-900
          w-full
          rounded-none md:rounded-4xl
          border-2 border-transparent
          flex flex-col justify-center
          py-4
          text-base
          text-left
          pt-10
          pl-12
        "
      >
        {lines.map((line, idx) => (
          <div key={idx}>{line}</div>
        ))}
      </div>
    </div>
  );
}
