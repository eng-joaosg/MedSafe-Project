'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import Input from "@/components/inputs/Input";
import ConfirmButton from "@/components/buttons/ConfirmButton";
import { login } from "@/lib/api";
import { useUser } from "@/contexts/userContext";

export default function LoginPage() {
  const router = useRouter();
  const { setUser } = useUser();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showVerificationButton, setShowVerificationButton] = useState(false);

  async function handleLogin() {
    setMessage("");
    setShowVerificationButton(false);

    if (!email.trim() || !password.trim()) {
      setMessage("Preencha todos os campos.");
      return;
    }

    setLoading(true);

    try {
      const res = await login({ email, password });

      setUser({
        id: res.id,
        clinicalInfoId: res.clinicalInfoId,
        firstName: res.firstName ?? "",
        lastName: res.lastName ?? "",
        role: res.role!.toString(),
      });

      router.push('/client-user');

    } catch (err: any) {
      const backendMessage =
        err?.response?.data?.message ||
        err?.message ||
        "";

      if (
        typeof backendMessage === "string" &&
        backendMessage.toLowerCase().includes("verificada")
      ) {
        setMessage("Conta ainda não verificada.");
        setShowVerificationButton(true);
      } else if (
        typeof backendMessage === "string" &&
        backendMessage.toLowerCase().includes("email") &&
        backendMessage.toLowerCase().includes("senha")
      ) {
        setMessage("Email ou senha incorretos.");
      } else {
        setMessage(
          typeof backendMessage === "string"
            ? backendMessage
            : "Erro inesperado ao fazer login."
        );
      }
    }
    finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-center pt-20">
      <h2 className="text-xl font-semibold mb-4">Entrar</h2>

      <div className="w-full max-w-md space-y-4">
        <Input
          fieldName="E-mail"
          type="email"
          value={email}
          onChange={setEmail}
        />

        <Input
          fieldName="Senha"
          type="password"
          value={password}
          onChange={setPassword}
        />
      </div>

      <div className="h-4 mt-2 flex items-center justify-center">
        {message && (
          <p className="text-sm text-error text-center md:text-base">
            {message}
          </p>
        )}
      </div>

      {/* Botões principais */}
      <div className="w-full max-w-md flex items-center justify-between mt-4 pr-4">
        <div className="flex flex-col text-left pl-4 text-base mr-5">
          <p>
            Não tem uma conta?{" "}
            <span
              onClick={() => router.push("/auth/register")}
              className="text-info cursor-pointer hover:underline"
            >
              Inscreva-se.
            </span>
          </p>

          <p
            onClick={() => router.push("/auth/new-verification-code/forgot-password")}
            className="text-info cursor-pointer hover:underline"
          >
            Recuperar senha.
          </p>
        </div>

        <ConfirmButton
          widthClass="w-30"
          onClick={handleLogin}
          label="Entrar"
          loading={loading}
          disabled={loading || !email.trim() || !password.trim()}
        />
      </div>

      {/* Novo código de validação - só aparece se conta não verificada */}
      {showVerificationButton && (
        <div className="w-full max-w-md mt-4 flex flex-col text-left pl-2 pt-8 text-sm md:text-base">
          <p>
            Para gerar um novo código de validação{" "}
            <span
              onClick={() => router.push("/auth/new-verification-code/verify-account")}
              className="text-info cursor-pointer hover:underline"
            >
              clique aqui.
            </span>
          </p>
        </div>
      )}
    </div>
  );
}
