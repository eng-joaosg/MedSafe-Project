'use client';

import { useState, useEffect } from "react";
import ConfirmButton from "@/components/buttons/ConfirmButton";
import Input from "@/components/inputs/Input";
import { changePassword } from "@/lib/api";
import { useUser } from "@/contexts/userContext";

export default function ChangePasswordPage() {
  const { user } = useUser();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageColor, setMessageColor] = useState("text-error");

  const passwordMatches = newPassword === confirmPassword;

  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => setMessage(""), 3000);
    return () => clearTimeout(timer);
  }, [message]);

  const passwordRules = (password: string) => {
    const errors: string[] = [];
    if (password.length < 8 || password.length > 16)
      errors.push("Senha deve ter entre 8 e 16 caracteres.");
    if (!/[A-Z]/.test(password)) errors.push("Deve conter ao menos 1 letra maiúscula.");
    if (!/[a-z]/.test(password)) errors.push("Deve conter ao menos 1 letra minúscula.");
    if (!/[0-9]/.test(password)) errors.push("Deve conter ao menos 1 número.");
    if (!/[\W_]/.test(password)) errors.push("Deve conter ao menos 1 caractere especial (!@#$%&*).");
    return errors;
  };

  async function handleChangePassword() {
    setMessage("");

    if (!currentPassword.trim() || !newPassword.trim() || !confirmPassword.trim()) {
      setMessageColor("text-error");
      setMessage("Preencha todos os campos.");
      return;
    }

    if (!passwordMatches) {
      setMessageColor("text-error");
      setMessage("Nova senha e confirmação não coincidem.");
      return;
    }

    const errors = passwordRules(newPassword);
    if (errors.length > 0) {
      setMessageColor("text-error");
      setMessage(errors.join(" "));
      return;
    }

    setLoading(true);
    try {
      await changePassword(user.id!, { password: currentPassword, newPassword });
      setMessageColor("text-success");
      setMessage("Senha alterada com sucesso!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setMessageColor("text-error");
      setMessage(err?.message || "Erro ao alterar a senha.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-center pt-20 px-6 min-h-screen bg-grayscale-10">
      <h2 className="text-2xl font-semibold mb-6">Alterar Senha</h2>

      <div className="w-full max-w-md space-y-4">
        <Input
          fieldName="Senha Atual"
          type="password"
          value={currentPassword}
          onChange={setCurrentPassword}
          placeholder="Digite sua senha atual"
        />

        <Input
          fieldName="Nova Senha"
          type="password"
          value={newPassword}
          onChange={setNewPassword}
          placeholder="Digite a nova senha"
        />

        <Input
          fieldName="Confirmar Nova Senha"
          type="password"
          value={confirmPassword}
          onChange={setConfirmPassword}
          placeholder="Confirme a nova senha"
          className={!passwordMatches && confirmPassword ? "border-error" : ""}
        />

        {!passwordMatches && confirmPassword && (
          <p className="text-error text-xs mt-1 animate-fade">
            As senhas não coincidem.
          </p>
        )}

        {/* Div fixa para mensagens */}
        <div className="min-h-6 flex justify-center items-center">
          {message && (
            <p className={`${messageColor} text-sm text-center animate-fade`}>
              {message}
            </p>
          )}
        </div>

        {/* Botão Alterar Senha */}
        <ConfirmButton
          onClick={handleChangePassword}
          label="Alterar Senha"
          loading={loading}
          disabled={loading}
        />

        {/* Regras de senha */}
        <div className="pt-4 pl-12 text-xs text-justify">
          <p>Senha entre 8 e 16 caracteres;</p>
          <p>Ao menos 1 letra maiúscula;</p>
          <p>Ao menos 1 letra minúscula;</p>
          <p>Ao menos 1 número;</p>
          <p>Ao menos 1 caractere especial (!@#$%&*).</p>
        </div>
      </div>
    </div>
  );
}
