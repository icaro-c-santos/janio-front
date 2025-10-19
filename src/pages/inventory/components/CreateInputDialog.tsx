import React, { useEffect, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Stack, Typography, TextField, MenuItem, Button } from '@mui/material';
import { suppliersService, Supplier } from '../../../services/suppliersService';

interface CreateInputDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: { itemType: string; quantity: number; unitPrice: number; total: number; movementDate?: string; supplierId?: string }) => Promise<void>;
}

const CreateInputDialog: React.FC<CreateInputDialogProps> = ({ open, onClose, onSubmit }) => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loadingSuppliers, setLoadingSuppliers] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<{ itemType: string; quantity: string; unitPrice: string; supplierId?: string; movementDate?: string }>({
    itemType: '',
    quantity: '',
    unitPrice: '',
    supplierId: undefined,
    movementDate: new Date().toISOString().slice(0, 10),
  });

  useEffect(() => {
    const loadSuppliers = async () => {
      if (open) {
        setLoadingSuppliers(true);
        try {
          const list = await suppliersService.listAll();
          setSuppliers(list);
        } catch {
          setSuppliers([]);
        } finally {
          setLoadingSuppliers(false);
        }
      }
    };
    loadSuppliers();
  }, [open]);

  const handleSave = async () => {
    setError(null);
    const qty = Number(form.quantity);
    const pu = Number(form.unitPrice);
    if (!form.itemType) { setError('Selecione o tipo de item'); return; }
    if (!Number.isFinite(qty) || qty <= 0) { setError('Quantidade inválida'); return; }
    if (!Number.isFinite(pu) || pu < 0) { setError('Preço unitário inválido'); return; }
    const total = qty * pu;
    setSaving(true);
    try {
      await onSubmit({
        itemType: form.itemType,
        quantity: qty,
        unitPrice: pu,
        total,
        movementDate: form.movementDate ? new Date(form.movementDate).toISOString() : undefined,
        supplierId: form.supplierId || undefined,
      });
      setForm({ itemType: '', quantity: '', unitPrice: '', supplierId: undefined, movementDate: new Date().toISOString().slice(0, 10) });
      onClose();
    } catch (e: any) {
      setError(e?.message || 'Erro ao criar entrada');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Nova entrada</DialogTitle>
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

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField label="Quantidade" type="number" value={form.quantity} onChange={(e) => setForm((f) => ({ ...f, quantity: e.target.value }))} inputProps={{ step: '1', min: '0' }} required fullWidth />
            <TextField label="Preço Unitário" type="number" value={form.unitPrice} onChange={(e) => setForm((f) => ({ ...f, unitPrice: e.target.value }))} inputProps={{ step: '0.01', min: '0' }} required fullWidth />
          </Stack>

          <TextField select label="Fornecedor (opcional)" value={form.supplierId ?? ''} onChange={(e) => setForm((f) => ({ ...f, supplierId: e.target.value || undefined }))} disabled={loadingSuppliers}>
            <MenuItem value="">Sem fornecedor</MenuItem>
            {suppliers.map((s) => (
              <MenuItem key={s.id} value={s.id}>{s.name}{s.email ? ` - ${s.email}` : ''}</MenuItem>
            ))}
          </TextField>

          <TextField label="Data da entrada" type="date" InputLabelProps={{ shrink: true }} value={form.movementDate ?? ''} onChange={(e) => setForm((f) => ({ ...f, movementDate: e.target.value }))} />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={saving}>Cancelar</Button>
        <Button variant="contained" onClick={handleSave} disabled={saving}>{saving ? 'Salvando...' : 'Salvar'}</Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateInputDialog;
