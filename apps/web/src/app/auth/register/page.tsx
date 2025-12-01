"use client";

import { useState, useEffect } from "react";
import ConfirmButton from "@/components/buttons/ConfirmButton";
import Input from "@/components/inputs/Input";
import { findEmail, register } from "@/lib/api";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [canProceed, setCanProceed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [registered, setRegistered] = useState(false);

  const passwordMatches =
    password.length > 0 &&
    confirmPassword.length > 0 &&
    password === confirmPassword;

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
      const emailExists = await findEmail(email);
      if (!emailExists) {
        setCanProceed(true);
        return;
      }

      setMessage("Este e-mail já está em uso.");
    } catch (err) {
      setMessage("Erro ao verificar e-mail.");
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister() {
    if (!passwordMatches) return;

    setLoading(true);

    try {
      await register({
        email,
        firstName,
        lastName,
        password,
      });

      setRegistered(true);
    } catch (err) {
      setMessage("Erro ao registrar. Tente novamente.");
    }

    setLoading(false);
  }

  if (registered) {
    return (
      <div className="flex flex-col items-center pt-20 px-6 text-center">
        <h2 className="text-xl font-semibold mb-4">Verifique seu e-mail 📩</h2>

        <p className="text-sm max-w-sm">
          Enviamos um e-mail com o código de verificação para:
        </p>

        <p className="text-sm font-medium mt-1">{email}</p>

        <p className="text-xs mt-4">
          Caso não encontre, verifique sua caixa de spam.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center pt-6 px-4 w-full">
      <h1>CADASTRE-SE</h1>
      <div className="h-6 flex justify-center items-center mb-2">
        {message && (
          <span className="text-error text-sm animate-fade">{message}</span>
        )}
      </div>

      <div className="w-full max-w-md">
        <Input fieldName="E-mail" value={email} onChange={setEmail} />

        {/* Campos adicionais aparecem apenas após confirmação */}
        <div
          className={`transition-all duration-300 ease-in-out overflow-hidden
          ${canProceed ? "mt-4 max-h-[1000px] opacity-100" : "max-h-0 opacity-0"}`}
        >
          <Input fieldName="Nome" value={firstName} onChange={setFirstName} />
          <Input fieldName="Sobrenome" value={lastName} onChange={setLastName} />
          <Input fieldName="Senha" value={password} onChange={setPassword} />

          <div className="mt-2">
            <Input
              fieldName="Confirmar Senha"
              value={confirmPassword}
              onChange={setConfirmPassword}
              className={!passwordMatches && confirmPassword ? "border-error" : ""}
            />
            {!passwordMatches && confirmPassword && (
              <p className="text-error text-xs mt-1 animate-fade">
                As senhas não coincidem.
              </p>
            )}
          </div>

          <div className="pt-4 text-xs text-justify pl-10">
            <p>A senha deve ter entre 8 e 16 caracteres;</p>
            <p>Deve conter ao menos um caracter especial (!@#$%&*);</p>
            <p>Deve conter ao menos uma letra minúscula e uma maiúscula;</p>
            <p>Deve conter ao menos um número.</p>
          </div>
        </div>

        {/* Botão sempre visível */}
        <div className="w-full flex justify-center mt-4">
          <ConfirmButton
            onClick={canProceed ? handleRegister : handleConfirmEmail}
            label={canProceed ? "Registrar" : "Confirmar e-mail"}
            loading={loading}
            disabled={
              loading ||
              (!canProceed && (!email.trim() || !isValidEmail(email))) ||
              (canProceed && !passwordMatches)
            }
          />
        </div>
      </div>
    </div>
  );
}
