'use client';

import { useState, useEffect } from "react";
import ConfirmButton from "@/components/ConfirmButton";
import Input from "@/components/Input";
import { api } from "@/services/api";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [nome, setNome] = useState("");
  const [sobrenome, setSobrenome] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmSenha, setConfirmSenha] = useState("");

  const [canProceed, setCanProceed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const senhaConfere = senha.length > 0 && confirmSenha.length > 0 && senha === confirmSenha;

  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => setMessage(""), 3000);
    return () => clearTimeout(timer);
  }, [message]);

  function isValidEmail(email: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  async function handleConfirmEmail() {
    if (!email.trim()) {
      setMessage("Informe um e-mail.");
      return;
    }

    if (!isValidEmail(email)) {
      setMessage("E-mail inválido.");
      return;
    }

    setLoading(true);
    try {
      await api.findEmail(email);
      setCanProceed(true);
    } catch (err: any) {
      if (err.status === 409) setMessage("Este e-mail já está em uso.");
      else setMessage("Erro ao conectar ao servidor.");
    }
    setLoading(false);
  }

  return (
    <div className="flex flex-col min-h-screen items-center pt-6 px-4 w-full">
      <div className="h-6 flex justify-center items-center mb-2">
        {message && (
          <span className="text-error text-sm animate-fade">{message}</span>
        )}
      </div>

      <div className="w-full max-w-md">

        {/* Campo de e-mail */}
        <Input fieldName="E-mail" value={email} onChange={setEmail} />

        {/* Campos extras */}
        <div
          className={`
            transition-all duration-300 ease-in-out overflow-hidden
            ${canProceed ? "mt-4 max-h-[1000px] opacity-100" : "max-h-0 opacity-0"}
          `}
        >
          <Input fieldName="Nome" value={nome} onChange={setNome} />
          <Input fieldName="Sobrenome" value={sobrenome} onChange={setSobrenome} />
          <Input fieldName="Senha" value={senha} onChange={setSenha} />

          {/* Confirmação de senha */}
          <div className="mt-2">
            <Input
              fieldName="Confirmar Senha"
              value={confirmSenha}
              onChange={setConfirmSenha}
              className={!senhaConfere && confirmSenha ? "border-red-500" : ""}
            />

            {!senhaConfere && confirmSenha && (
              <p className="text-red-500 text-xs mt-1 animate-fade">
                As senhas não coincidem.
              </p>
            )}
          </div>

          <div className="pt-4 text-xs text-justify">
            <p>A senha deve ter entre 8 e 16 caracteres;</p>
            <p>Deve conter ao menos um caracter especial (!@#$%&*);</p>
            <p>Deve conter ao menos uma letra minúscula;</p>
            <p>Deve conter ao menos uma letra maiúscula;</p>
            <p>Deve conter ao menos um número.</p>
          </div>
        </div>

        {/* Botão */}
        <div className="w-full flex justify-center mt-4">
          <ConfirmButton
            onClick={canProceed ? undefined : handleConfirmEmail}
            label={canProceed ? "Registrar" : "Confirmar e-mail"}
            loading={loading}
            disabled={
              loading ||
              (!canProceed && (!email.trim() || !isValidEmail(email))) ||
              (canProceed && !senhaConfere)
            }
          />
        </div>
      </div>
    </div>
  );
}
