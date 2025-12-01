'use client';
import React, { useState } from 'react';
import ConfirmButton from '@/components/buttons/ConfirmButton';
import Input from '@/components/inputs/Input';
import { deleteAccount } from '@/lib/api';
import { useUser } from '@/contexts/userContext';
import { useRouter } from 'next/navigation';

export default function DeleteAccountPage() {
  const { user, clearUser, setLoggedOut } = useUser();
  const router = useRouter();

  const [password, setPassword] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleDeleteConfirmed = async () => {
    if (!user?.id) {
      setErrorMessage("Usuário não encontrado.");
      setShowConfirm(false);
      return;
    }

    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      await deleteAccount(user.id, { password });
      clearUser();
      setLoggedOut(true);
      if (typeof window !== 'undefined') {
        localStorage.clear();
        sessionStorage.clear();
      }

      setSuccessMessage('Conta deletada com sucesso!');
      setPassword('');
      router.replace('/');
    } catch (err: any) {
      setErrorMessage(err.message || 'Erro ao deletar a conta.');
    } finally {
      setShowConfirm(false);
      setLoading(false);
    }
  };

  const handleClickConfirm = () => {
    if (!password) {
      setErrorMessage("Informe sua senha.");
      return;
    }
    setShowConfirm(true);
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-6 ">Apagar conta</h1>

      <Input
        fieldName="Senha"
        value={password}
        onChange={setPassword}
        type="password"
        placeholder="Digite sua senha"
        editable
      />

      {errorMessage && <p className="text-error mb-4">{errorMessage}</p>}
      {successMessage && <p className="text-success mb-4">{successMessage}</p>}

      <div className='flex flex-col items-center'>
        <ConfirmButton
          label="Confirmar"
          onClick={handleClickConfirm}
          loading={loading}
          widthClass="w-40"
        />
      </div>

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-transparent p-4">
          <div className="bg-white rounded-xl w-full max-w-md p-6">
            <h2 className="text-lg font-semibold mb-4 text-black">Confirmar ação</h2>
            <p className="mb-6 text-black">
              Você tem certeza que deseja deletar sua conta? Esta ação é irreversível.
            </p>

            <div className="flex w-full justify-between gap-3">
              <ConfirmButton
                label="Cancelar"
                onClick={() => setShowConfirm(false)}
                className="text-error border-error"
                widthClass="w-32"
              />

              <ConfirmButton
                label="Confirmar"
                onClick={handleDeleteConfirmed}
                loading={loading}
                widthClass="w-32"
                className="text-success border-success"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
