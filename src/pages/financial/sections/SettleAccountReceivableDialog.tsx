import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Stack, TextField, Typography } from '@mui/material';
import { accountsReceivableService } from '../../../services/accountsReceivableService';

interface Props {
  open: boolean;
  receivableId: string | null;
  onClose: () => void;
  onSettled: () => void;
}

const SettleAccountReceivableDialog: React.FC<Props> = ({ open, receivableId, onClose, onSettled }) => {
  const [paidAt, setPaidAt] = useState<string>(new Date().toISOString().slice(0, 10));
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Dar baixa</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2}>
          {error && <Typography color="error">{error}</Typography>}
          <TextField
            label="Data do pagamento"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={paidAt}
            onChange={(e) => setPaidAt(e.target.value)}
            required
            fullWidth
          />
          <Button variant="outlined" component="label">
            Anexar comprovante (PDF opcional)
            <input type="file" hidden accept="application/pdf" onChange={(e) => setReceiptFile(e.target.files?.[0] || null)} />
          </Button>
          {receiptFile && <Typography variant="body2">{receiptFile.name}</Typography>}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button variant="outlined" onClick={onClose} disabled={saving}>Cancelar</Button>
        <Button
          variant="contained"
          disabled={saving}
          onClick={async () => {
            setError(null);
            if (!paidAt) { setError('Informe a data do pagamento'); return; }
            if (!receivableId) { setError('ID inválido'); return; }
            try {
              setSaving(true);
              await accountsReceivableService.settle(receivableId, { paidAt }, receiptFile);
              onSettled();
            } catch (e: any) {
              setError(e?.message || 'Erro ao dar baixa');
            } finally {
              setSaving(false);
            }
          }}
        >
          {saving ? 'Salvando...' : 'Confirmar baixa'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SettleAccountReceivableDialog;
