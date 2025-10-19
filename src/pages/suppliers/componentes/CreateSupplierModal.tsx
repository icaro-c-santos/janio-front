import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Stack, Typography, TextField, Button } from '@mui/material';

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: { name: string; email?: string }) => Promise<void>;
}

const CreateSupplierModal: React.FC<Props> = ({ open, onClose, onSubmit }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const reset = () => {
    setName('');
    setEmail('');
    setError(null);
    setSaving(false);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 2 } }}>
      <DialogTitle>
        <Typography variant="h6">Novo fornecedor</Typography>
      </DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2}>
          {error && <Typography color="error">{error}</Typography>}
          <TextField
            label="Nome"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            fullWidth
          />
          <TextField
            label="Email (opcional)"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => { reset(); onClose(); }} variant="outlined" disabled={saving}>Cancelar</Button>
        <Button
          variant="contained"
          disabled={saving}
          onClick={async () => {
            setError(null);
            if (!name.trim()) { setError('Informe o nome'); return; }
            setSaving(true);
            try {
              await onSubmit({ name: name.trim(), email: email.trim() || undefined });
              reset();
              onClose();
            } catch (e: any) {
              setError(e?.message || 'Erro ao salvar fornecedor');
            } finally {
              setSaving(false);
            }
          }}
        >
          {saving ? 'Salvando...' : 'Salvar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateSupplierModal;
