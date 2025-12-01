'use client';
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Input from "@/components/inputs/Input";
import ConfirmButton from "@/components/buttons/ConfirmButton";
import { resetPassword } from "@/lib/api";

export default function ResetPasswordPage() {
  const router = useRouter();
  const params = useParams();

  // Decodifica o email da URL
  const emailRaw = Array.isArray(params.email) ? params.email[0] : params.email ?? '';
  const email = decodeURIComponent(emailRaw);
  const code = Array.isArray(params.code) ? params.code[0] : params.code ?? '';

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const passwordsMatch = newPassword && confirmPassword && newPassword === confirmPassword;

  async function handleReset() {
    setMessage('');

    if (!email || !code) {
      setMessage("Link inválido ou expirado.");
      return;
    }

    if (!newPassword || !confirmPassword) {
      setMessage("Preencha ambos os campos de senha.");
      return;
    }

    if (!passwordsMatch) {
      setMessage("As senhas não coincidem.");
      return;
    }

    setLoading(true);
    try {
      await resetPassword(email, code, newPassword);
      setMessage("Senha redefinida com sucesso!");
      setTimeout(() => router.push("/auth/login"), 1500);
    } catch (err: any) {
      setMessage(err.message || "Erro ao redefinir a senha.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-center pt-20">
      <h2 className="text-xl font-semibold mb-4">Redefinir senha</h2>

      <p className="mb-4 text-center">
        Redefina sua senha para a conta <strong>{email}</strong>
      </p>

      {/* Container principal do form */}
      <div className="w-full max-w-md space-y-4">
        <Input
          fieldName="Nova senha"
          type="password"
          value={newPassword}
          onChange={setNewPassword}
        />
        <Input
          fieldName="Confirme a nova senha"
          type="password"
          value={confirmPassword}
          onChange={setConfirmPassword}
          className={!passwordsMatch && confirmPassword ? "border-error" : ""}
        />
        {!passwordsMatch && confirmPassword && (
          <p className="text-error text-xs mt-1 animate-fade">
            As senhas não coincidem.
          </p>
        )}

        {message && (
          <p className={`text-center mt-2 ${message.includes('sucesso') ? 'text-success' : 'text-error'}`}>
            {message}
          </p>
        )}
        <div className="flex justify-center">
          <div className="mt-4">
            <ConfirmButton
              onClick={handleReset}
              label="Redefinir senha"
              loading={loading}
              disabled={loading || !newPassword || !confirmPassword}
            />
          </div>
        </div>

        {/* Informações sobre a senha */}
        <div className="pt-4 pl-6 text-xs text-left">
          <p>- Deve ter entre 8 e 16 caracteres;</p>
          <p>- Deve conter ao menos um caracter especial (!@#$%&*);</p>
          <p>- Deve conter ao menos uma letra minúscula e uma maiúscula;</p>
          <p>- Deve conter ao menos um número.</p>
        </div>
      </div>
    </div>
  );
}
