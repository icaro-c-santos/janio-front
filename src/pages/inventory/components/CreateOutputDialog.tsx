import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Stack, Typography, TextField, MenuItem, Button, Divider } from '@mui/material';

interface CreateOutputDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: { itemType: string; quantity: number; movementDate: string; reason?: string }) => Promise<void>;
}

const CreateOutputDialog: React.FC<CreateOutputDialogProps> = ({ open, onClose, onSubmit }) => {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<{ itemType: string; quantity: string; movementDate: string; reason?: string }>(
    {
      itemType: '',
      quantity: '',
      movementDate: new Date().toISOString().slice(0, 10),
      reason: '',
    }
  );
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleContinue = () => {
    setError(null);
    const qty = Number(form.quantity);
    if (!form.itemType) { setError('Selecione o tipo de item'); return; }
    if (!Number.isFinite(qty) || qty <= 0) { setError('Quantidade inválida'); return; }
    setConfirmOpen(true);
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>Dar baixa no estoque</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2}>
            {error && <Typography color="error">{error}</Typography>}
            <TextField select label="Tipo de Item" value={form.itemType} onChange={(e) => setForm((f) => ({ ...f, itemType: e.target.value }))} required>
              <MenuItem value="">Selecione</MenuItem>
              <MenuItem value="COCO">COCO</MenuItem>
              <MenuItem value="GARRAFA_DESCARTAVEL">GARRAFA_DESCARTAVEL</MenuItem>
              <MenuItem value="GARRAFA_REUTILIZAVEL">GARRAFA_REUTILIZAVEL</MenuItem>
              <MenuItem value="ROTULO">ROTULO</MenuItem>
              <MenuItem value="ETIQUETA">ETIQUETA</MenuItem>
              <MenuItem value="CLORO">CLORO</MenuItem>
            </TextField>

            <TextField label="Quantidade" type="number" value={form.quantity} onChange={(e) => setForm((f) => ({ ...f, quantity: e.target.value }))} inputProps={{ step: '1', min: '1' }} required fullWidth />
            <TextField label="Data da baixa" type="date" InputLabelProps={{ shrink: true }} value={form.movementDate} onChange={(e) => setForm((f) => ({ ...f, movementDate: e.target.value }))} />
            <TextField label="Razão (opcional)" value={form.reason ?? ''} onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))} fullWidth />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={saving}>Cancelar</Button>
          <Button variant="contained" onClick={handleContinue} disabled={saving}>{saving ? 'Confirmando...' : 'Continuar'}</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Confirmar baixa</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2}>
            <Typography variant="subtitle2">Resumo</Typography>
            <Divider />
            <Typography>Tipo de Item: <strong>{form.itemType || '-'}</strong></Typography>
            <Typography>Data da baixa: <strong>{form.movementDate || '-'}</strong></Typography>
            <Typography>Quantidade: <strong>{form.quantity || '-'}</strong></Typography>
            <Typography>Razão: <strong>{form.reason || '-'}</strong></Typography>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)} disabled={saving}>Voltar</Button>
          <Button
            variant="contained"
            onClick={async () => {
              setSaving(true);
              try {
                await onSubmit({
                  itemType: form.itemType,
                  quantity: Number(form.quantity),
                  movementDate: new Date(form.movementDate).toISOString(),
                  reason: form.reason || undefined,
                });
                setConfirmOpen(false);
              } catch (e: any) {
                setError(e?.message || 'Erro ao dar baixa');
              } finally {
                setSaving(false);
              }
            }}
            disabled={saving}
          >{saving ? 'Salvando...' : 'Confirmar'}</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default CreateOutputDialog;
