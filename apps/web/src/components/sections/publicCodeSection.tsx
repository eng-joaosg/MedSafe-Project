'use client';
import React, { useState, useEffect } from 'react';
import { generatePublicCode } from '@/lib/utils';
import EditSaveButton from '@/components/buttons/EditSaveButton';

export interface PublicCodeSessionProps {
  editable: boolean;
  initialCode?: string | null;
  onCodeGenerated?: (code: string) => void;
}

export default function PublicCodeSection({
  editable,
  initialCode = null,
  onCodeGenerated,
}: PublicCodeSessionProps) {
  const [code, setCode] = useState<string | null>(initialCode);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setCode(initialCode ?? null);
  }, [initialCode]);

  const handleGenerateConfirmed = () => {
    setLoading(true);

    const newCode = generatePublicCode();
    setCode(newCode);
    if (onCodeGenerated) onCodeGenerated(newCode);

    setLoading(false);
    setShowConfirm(false);
  };

  const handleClickGenerate = () => {
    if (code) {
      setShowConfirm(true);
    } else {
      handleGenerateConfirmed();
    }
  };

  return (
    <>
      <div className="w-full flex justify-between items-center my-4 px-4 sm:px-8">
        <div className="wrap-break-word">
          {code ? `Senha pública: ${code}` : ''}
        </div>

        {editable && (
          <EditSaveButton
            label={code ? 'Nova senha' : 'Gerar senha'}
            onClick={handleClickGenerate}
            loading={loading}
            widthClass="w-30"
          />
        )}
      </div>

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-transparent p-4">
          <div className="bg-white rounded-xl w-full max-w-md p-6">
            <h2 className="text-lg font-semibold mb-4 text-black">Confirmar ação</h2>

            <p className="mb-6 text-black">
              Gerar uma nova senha pública irá invalidar a senha anterior.
              Deseja continuar?
            </p>

            <div className="flex w-full justify-between gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="
                  flex items-center justify-center
                  w-32 h-12
                  rounded-4xl border-4 font-semibold select-none
                  bg-transparent
                  text-error border-error
                  cursor-pointer
                "
              >
                Cancelar
              </button>

              <button
                onClick={handleGenerateConfirmed}
                disabled={loading}
                className={`
                  flex items-center justify-center
                  w-32 h-12
                  rounded-4xl border-4 font-semibold select-none
                  bg-transparent
                  ${
                    loading
                      ? "text-success border-success cursor-not-allowed"
                      : "text-success border-success cursor-pointer"
                  }
                `}
              >
                {loading ? (
                  <div className="h-5 w-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  "Confirmar"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
