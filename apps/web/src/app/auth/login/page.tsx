'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import Input from "@/components/Input";
import ConfirmButton from "@/components/ConfirmButton";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleLogin() {
    setMessage("");

    if (!email.trim() || !password.trim()) {
      setMessage("Preencha todos os campos.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_GATEWAY_URL}/gateway/auth/login`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        }
      );

      if (!res.ok) {
        if (res.status === 401) {
          throw new Error("E-mail ou senha incorretos.");
        }
        if (res.status === 403) {
          throw new Error("Conta não verificada.");
        }
        throw new Error("Falha ao fazer login.");
      }

      router.push("/dashboard");
    } catch (err: any) {
      setMessage(err.message || "Erro inesperado ao fazer login.");
    }

    setLoading(false);
  }

  return (
    <div className="flex flex-col items-center pt-20 px-6">
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
          <p className="text-sm text-error text-center md:text-base">{message}</p>
        )}
      </div>
      <div className="w-full max-w-md flex items-center justify-between mt-4">
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
            onClick={() => router.push("/auth/recovery")}
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
    </div>
  );
}
