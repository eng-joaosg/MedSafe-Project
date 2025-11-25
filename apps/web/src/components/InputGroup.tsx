export default function InputGroup({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="
        bg-grayscale-50
        border-2 border-transparent
        hover:border-info
        focus-within:border-info
        transition-all
        w-full
        max-w-md md:max-w-md
        h-18
        mb-4
        flex
        items-center
        justify-center
        gap-4
        p-2
        rounded-none md:rounded-3xl
      "
    >
      {children}
    </div>
  );
}
