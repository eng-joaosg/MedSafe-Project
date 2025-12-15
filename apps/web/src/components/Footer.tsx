'use client';

import { useRouter } from 'next/navigation';

export default function Footer() {
  const router = useRouter();

  return (
    <footer className="w-full h-30 py-4 bg-primary-800 mt-10">
      <div className="px-4 text-center text-sm">
        © {new Date().getFullYear()}.
        <br />
        <button
          onClick={() => router.push('/about')}
          className="underline hover:text-primary-300"
        >
          Sobre
        </button>
      </div>
    </footer>
  );
}
