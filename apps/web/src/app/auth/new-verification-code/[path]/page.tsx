'use client';

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Input from "@/components/inputs/Input";
import ConfirmButton from "@/components/buttons/ConfirmButton";
import { generateVerificationCode } from "@/lib/api";

export default function NewVerificationCodePage() {
  const router = useRouter();
  const params = useParams();
  const type = params.path as "verify-account" | "forgot-password";

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"info" | "error">("info");

  async function handleGenerateCode() {
    setMessage("");
    if (!email.trim()) {
      setMessage("Informe um e-mail.");
      setMessageType("error");
      return;
    }

    setLoading(true);

    try {
      await generateVerificationCode(email, type);

      setMessage(
        type === "forgot-password"
          ? "Caso seu e-mail esteja em nossa base de dados, enviaremos um código para redefinir sua senha."
          : "Caso seu e-mail esteja em nossa base de dados, enviaremos um código para verificar sua conta."
      );
      setMessageType("info");
    } catch (err: any) {
      setMessage("Erro interno, tente novamente mais tarde.");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-center pt-20 px-6">
      <h2 className="text-xl font-semibold mb-4">
        {type === "forgot-password"
          ? "Gerar código para redefinir senha"
          : "Gerar código de verificação de conta"}
      </h2>

      <div className="w-full max-w-md">
        <Input
          fieldName="E-mail"
          type="email"
          value={email}
          onChange={setEmail}
          placeholder="Digite seu e-mail"
        />
      </div>

      {message && (
        <p
          className={`text-center mb-4 ${
            messageType === "info" ? "text-info" : "text-error"
          }`}
        >
          {message}
        </p>
      )}

      <ConfirmButton
        onClick={handleGenerateCode}
        label="Gerar código"
        loading={loading}
        disabled={loading || !email.trim()}
      />

      <p
        className="text-info cursor-pointer mt-6 hover:underline"
        onClick={() => router.push("/auth/login")}
      >
        Voltar para login
      </p>
    </div>
  );
}
