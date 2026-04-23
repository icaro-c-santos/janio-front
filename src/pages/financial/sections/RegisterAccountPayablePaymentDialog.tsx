import React, { useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { accountsPayableService } from '../../../services/accountsPayableService';

interface Props {
  open: boolean;
  accountPayableId: string | null;
  onClose: () => void;
  onPaid: () => void;
}

const RegisterAccountPayablePaymentDialog: React.FC<Props> = ({
  open,
  accountPayableId,
  onClose,
  onPaid,
}) => {
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().slice(0, 10));
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [attachment, setAttachment] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Registrar pagamento</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2}>
          {error && <Typography color="error">{error}</Typography>}
          <TextField
            label="Data do pagamento"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={paymentDate}
            onChange={(e) => setPaymentDate(e.target.value)}
            required
            fullWidth
          />
          <TextField
            label="Valor pago"
            type="number"
            inputProps={{ min: 0, step: '0.01' }}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            fullWidth
          />
          <TextField
            label="Observação (opcional)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            fullWidth
            multiline
            rows={2}
          />
          <Button variant="outlined" component="label">
            Anexar recibo (PDF ou imagem, opcional)
            <input
              type="file"
              hidden
              accept="application/pdf,image/png,image/jpeg,image/jpg,image/webp"
              onChange={(e) => setAttachment(e.target.files?.[0] || null)}
            />
          </Button>
          {attachment && <Typography variant="body2">{attachment.name}</Typography>}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button variant="outlined" onClick={onClose} disabled={saving}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          disabled={saving}
          onClick={async () => {
            setError(null);
            if (!accountPayableId) {
              setError('Conta inválida');
              return;
            }
            const numericAmount = Number(amount);
            if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
              setError('Informe um valor válido');
              return;
            }
            try {
              setSaving(true);
              await accountsPayableService.addPayment(
                accountPayableId,
                { paymentDate, amount: numericAmount, note: note || undefined },
                attachment,
              );
              onPaid();
            } catch (e: any) {
              setError(e?.message || 'Erro ao registrar pagamento');
            } finally {
              setSaving(false);
            }
          }}
        >
          {saving ? 'Salvando...' : 'Confirmar pagamento'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RegisterAccountPayablePaymentDialog;
