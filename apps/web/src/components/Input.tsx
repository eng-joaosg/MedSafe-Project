interface InputProps {
  className?: string;
  fieldName: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  options?: string[];
  height?: string;
  editable?: boolean;
}

export default function Input({
  className = '',
  fieldName,
  value,
  onChange,
  type,
  placeholder,
  options,
  height,
  editable = true,
}: InputProps) {

  const inputType =
    type ?? (fieldName.toLowerCase().includes("senha") ? "password" : "text");

  const handleChange = (val: string) => {
    if (!options || options.includes(val)) {
      onChange(val);
    }
  };

  const inputHeight = height ?? 'h-18';

  return (
    <div className="relative w-full max-w-md mx-auto mb-4">

      <span className="absolute top-1 left-6 text-md text-grayscale-700 pointer-events-none">
        {fieldName}:
      </span>

      <input
        type={inputType}
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={placeholder}
        disabled={!editable}
        className={`
          ${editable ? 'bg-grayscale-50 text-grayscale-900 hover:border-info focus:border-info' : 'bg-grayscale-200 text-grayscale-500 cursor-not-allowed'}
          ${inputHeight}
          w-full
          px-4 pt-4
          rounded-none md:rounded-3xl
          border-2 border-transparent
          focus:outline-none
          text-center
          transition-all
          ${className}
        `}
      />
    </div>
  );
}
