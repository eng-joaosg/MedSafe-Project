'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import Input from "@/components/Input";
import ConfirmButton from "@/components/ConfirmButton";
import { login } from "@/lib/api";
import { useUser } from "@/contexts/userContext";

export default function LoginPage() {
  const router = useRouter();
  const { setUser } = useUser();

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
      const res = await login({ email, password });

      // ✅ populando o contexto com os dados retornados do login
      setUser({
        id: res.id,
        clinicalInfoId: res.clinicalInfoId ?? null,
        firstName: res.firstName ?? "",
        lastName: res.lastName ?? "",
      });

      router.push(`/client-user/${res.id}`);
    } catch (err: any) {
      setMessage(err.message || "Erro inesperado ao fazer login.");
    } finally {
      setLoading(false);
    }
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
          <p className="text-sm text-error text-center md:text-base">
            {message}
          </p>
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
