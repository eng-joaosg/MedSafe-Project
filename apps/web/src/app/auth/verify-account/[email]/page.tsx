'use client';

import { useState } from "react";
import ConfirmButton from "@/components/ConfirmButton";
import { apiFetch } from "@/lib/api";

type VerifyAccountEmailPageProps = {
  params: { email: string };
};

export default function VerifyAccountEmailPage({ params }: VerifyAccountEmailPageProps) {
  const { email } = params;
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleVerify() {
    if (!code.trim()) return;

    setLoading(true);
    try {
      await apiFetch(`/auth/verify-code`, {
        method: "POST",
        body: JSON.stringify({ email, code }),
      });

      setMessage("Conta verificada com sucesso!");
    } catch (err: any) {
      setMessage("Código inválido ou expirado.");
    }
    setLoading(false);
  }

  return (
    <div className="flex flex-col min-h-screen items-center pt-20 px-6">
      <h2 className="text-xl font-semibold mb-4">Verifique sua conta</h2>
      <p className="text-sm text-gray-600 mb-4">Um código foi enviado para: <span className="font-medium">{email}</span></p>

      <input
        type="text"
        placeholder="Digite o código"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        className="border p-2 rounded w-full max-w-xs text-center"
      />

      {message && <p className="text-sm text-center mt-2 text-red-500">{message}</p>}

      <div className="mt-4">
        <ConfirmButton
          onClick={handleVerify}
          label="Verificar conta"
          loading={loading}
          disabled={loading || !code.trim()}
        />
      </div>
    </div>
  );
}
