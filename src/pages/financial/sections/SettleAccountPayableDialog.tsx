import React, { useEffect, useMemo, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Stack, Box, Alert } from '@mui/material';
import { accountsPayableService } from '../../../services/accountsPayableService';

interface Props {
  open: boolean;
  onClose: () => void;
  accountId: string | null;
  onSettled: () => void;
}

const todayIso = (): string => new Date().toISOString().slice(0, 10);

const SettleAccountPayableDialog: React.FC<Props> = ({ open, onClose, accountId, onSettled }) => {
  const [paidAt, setPaidAt] = useState<string>(todayIso());
  const [receipt, setReceipt] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setPaidAt(todayIso());
      setReceipt(null);
      setError(null);
    }
  }, [open]);

  const handleFile = (file?: File | null) => {
    if (!file) { setReceipt(null); return; }
    if (file.type !== 'application/pdf') {
      setError('O arquivo deve ser PDF');
      return;
    }
    setError(null);
    setReceipt(file);
  };

  const handleSubmit = async () => {
    if (!accountId) return;
    setLoading(true);
    setError(null);
    try {
      await accountsPayableService.settle(accountId, { paidAt }, receipt);
      onSettled();
    } catch (e: any) {
      setError(e?.message || 'Erro ao dar baixa');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Dar baixa</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            label="Data do pagamento"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={paidAt}
            onChange={(e) => setPaidAt(e.target.value)}
            required
            fullWidth
          />
          <Box>
            <Button component="label" variant="outlined">
              {receipt ? 'PDF selecionado' : 'Anexar recibo (PDF opcional)'}
              <input hidden type="file" accept="application/pdf" onChange={(e) => handleFile(e.target.files?.[0] || null)} />
            </Button>
            {receipt && <span style={{ marginLeft: 8 }}>{receipt.name}</span>}
          </Box>
          {error && <Alert severity="error">{error}</Alert>}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>Cancelar</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={loading || !accountId}>{loading ? 'Salvando...' : 'Confirmar baixa'}</Button>
      </DialogActions>
    </Dialog>
  );
};

export default SettleAccountPayableDialog;
