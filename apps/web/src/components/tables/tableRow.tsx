interface TableRowProps {
  fieldName: string;
  value: string;
  className?: string;
  height?: string;
}

export default function TableRow({ fieldName, value, className = '', height }: TableRowProps) {
  const rowHeight = height ?? 'h-18';

  return (
    <div className={`relative w-full md:max-w-md mb-4 ${className}`}>
      <span className="absolute top-1 left-6 text-md text-grayscale-900 pointer-events-none">
        {fieldName}:
      </span>

      <div
        className={`
          bg-grayscale-200
          text-grayscale-900
          ${rowHeight}
          w-full
          rounded-none md:rounded-4xl
          border-2 border-transparent
          flex
          items-start
          justify-start
          px-4
          pt-8
          text-base
          pl-12
        `}
      >
        {value}
      </div>
    </div>
  );
}
