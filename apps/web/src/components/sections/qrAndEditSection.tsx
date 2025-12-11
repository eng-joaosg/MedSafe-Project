'use client';

import React from 'react';
import { getClinicalInfoQrCode } from '@/lib/api';
import { useUser } from '@/contexts/userContext';
import QrCodeButton from '../buttons/QrCodeButton';
import EditSaveButton from '../buttons/EditSaveButton';

interface Props {
  publicCode: string;
  editable: boolean;
  saving: boolean;
  setEditable: (val: boolean) => void;
  onSave: () => Promise<void>;
}

export default function QrAndEditSection({
  publicCode,
  editable,
  saving,
  setEditable,
  onSave,
}: Props) {
  const { user } = useUser();

  const handleQrDownload = async () => {
    if (!user.id) return;

    try {
      const requestId = crypto.randomUUID();
      const cookie = document.cookie;
      const blob = await getClinicalInfoQrCode(requestId, cookie);

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `qr_${publicCode}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error('Erro ao baixar QR Code:', err);
      alert(err?.message || 'Não foi possível baixar o QR Code.');
    }
  };

  const handleEditSaveClick = async () => {
    if (editable) {
      await onSave();
    } else {
      setEditable(true);
    }
  };

  return (
    <div className="w-full flex justify-between items-center mb-4 px-8">
      <div>
        {publicCode && !editable && (
          <QrCodeButton
            hasPublicCode={true}
            editable={editable}
            onClick={handleQrDownload}
            widthClass="w-32"
          />
        )}
      </div>
      <div>
        <EditSaveButton
          label={saving ? 'Salvando...' : editable ? 'Salvar' : 'Editar'}
          onClick={handleEditSaveClick}
          loading={saving}
          disabled={saving}
          widthClass="w-20"
        />
      </div>
    </div>
  );
}
