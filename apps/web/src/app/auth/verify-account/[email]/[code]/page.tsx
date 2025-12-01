'use client';

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import ConfirmButton from "@/components/buttons/ConfirmButton";
import Input from "@/components/inputs/Input";
import { verifyAccountCode } from "@/lib/api";

export default function VerifyAccountEmailPage() {
  const params = useParams();
  const router = useRouter();

  const emailParam = params.email;
  const codeParam = params.code;
  if (!emailParam || Array.isArray(emailParam)) {
    return (
      <div className="flex flex-col items-center pt-20 px-6 w-full">
        <p className="text-error">E-mail inválido na URL.</p>
      </div>
    );
  }

  const email = decodeURIComponent(emailParam);

  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "">("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (codeParam && !Array.isArray(codeParam)) {
      setCode(codeParam);
    }
  }, [codeParam]);

  async function handleVerify() {
    if (!code.trim()) return;

    setLoading(true);
    setMessage("");
    setMessageType("");

    try {
      await verifyAccountCode(email, code);

      setMessage("Conta verificada com sucesso!");
      setMessageType("success");

      setTimeout(() => router.push("/auth/login"), 1500);

    } catch (err: any) {
      setMessage(err.message || "Erro inesperado ao verificar código.");
      setMessageType("error");
    }

    setLoading(false);
  }

  return (
    <div className="flex flex-col items-center pt-20 px-6">
      <h2 className="text-xl font-semibold mb-4">Verifique sua conta</h2>

      <p className="text-sm mb-4 text-center">
        Digite o código enviado para:{" "}
        <span className="font-medium">{email}</span>
      </p>

      <div className="w-full max-w-md">
        <Input
          fieldName="Código"
          value={code}
          onChange={(value) => setCode(value)}
        />
      </div>

      {message && (
        <p
          className={`text-sm text-center mt-2 ${
            messageType === "success" ? "text-success" : "text-error"
          }`}
        >
          {message}
        </p>
      )}

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
