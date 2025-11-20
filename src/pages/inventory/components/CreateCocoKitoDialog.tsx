// src/pages/inventory/components/CreateCocoKitoDialog.tsx
import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Stack,
  Divider,
} from '@mui/material';
import { inventoryService } from '../../../services/inventoryService';

interface CreateCocoKitoDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const CreateCocoKitoDialog: React.FC<CreateCocoKitoDialogProps> = ({ open, onClose, onSuccess }) => {
  const [form, setForm] = useState({
    quantity: '',
    unitPrice: '',
    movementDate: new Date().toISOString().slice(0, 10),
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.quantity || !form.unitPrice || !form.movementDate) {
      setError('Preencha todos os campos obrigatórios');
      return;
    }

    const quantityValue = parseFloat(form.quantity.replace(',', '.'));
    const unitPriceValue = parseFloat(form.unitPrice.replace(',', '.'));

    if (isNaN(quantityValue) || isNaN(unitPriceValue) || quantityValue <= 0 || unitPriceValue < 0) {
      setError('Quantidade e preço devem ser números positivos');
      return;
    }

    setConfirmOpen(true);
  };

  const confirmSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      const quantityValue = parseFloat(form.quantity.replace(',', '.'));
      const unitPriceValue = parseFloat(form.unitPrice.replace(',', '.'));

      await inventoryService.createCocoKitoInput({
        quantity: quantityValue,
        unitPrice: unitPriceValue,
        movementDate: form.movementDate,
      });

      onClose();
      if (onSuccess) onSuccess();
      setForm({
        quantity: '',
        unitPrice: '',
        movementDate: new Date().toISOString().slice(0, 10),
      });
      setConfirmOpen(false);
    } catch (err: any) {
      setError(err.message || 'Erro ao registrar entrada de coco');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle>Entrada de Coco</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 2 }}>
              <TextField
                label="Quantidade (kg)"
                type="text"
                value={form.quantity}
                onChange={(e) => setForm(f => ({ ...f, quantity: e.target.value.replace(/[^0-9,.]/g, '') }))}
                fullWidth
                required
                inputMode="decimal"
              />

              <TextField
                label="Preço Unitário (R$)"
                type="text"
                value={form.unitPrice}
                onChange={(e) => setForm(f => ({ ...f, unitPrice: e.target.value.replace(/[^0-9,.]/g, '') }))}
                fullWidth
                required
                inputMode="decimal"
              />

              <TextField 
                label="Data da entrada" 
                type="date" 
                InputLabelProps={{ shrink: true }} 
                value={form.movementDate} 
                onChange={(e) => setForm(f => ({ ...f, movementDate: e.target.value }))} 
                fullWidth
                required
              />

              {error && (
                <Typography color="error" variant="body2">
                  {error}
                </Typography>
              )}
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={onClose} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" variant="contained" color="primary" disabled={loading}>
              {loading ? 'Verificando...' : 'Continuar'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Confirmar entrada de coco</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2}>
            <Typography variant="subtitle2">Resumo da entrada</Typography>
            <Divider />
            <Typography>Quantidade: <strong>{form.quantity} kg</strong></Typography>
            <Typography>Preço Unitário: <strong>R$ {form.unitPrice}</strong></Typography>
            <Typography>Data: <strong>{new Date(form.movementDate).toLocaleDateString('pt-BR')}</strong></Typography>
            <Typography>Total: <strong>R$ {(parseFloat(form.quantity.replace(',', '.')) * parseFloat(form.unitPrice.replace(',', '.')) || 0).toFixed(2)}</strong></Typography>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)} disabled={loading}>
            Voltar
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={confirmSubmit}
            disabled={loading}
          >
            {loading ? 'Salvando...' : 'Confirmar'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default CreateCocoKitoDialog;