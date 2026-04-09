import React, { useEffect, useMemo, useState } from 'react';
import {
  Autocomplete,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { suppliersService, Supplier } from '../../../services/suppliersService';
import { accountsPayableService } from '../../../services/accountsPayableService';

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

const CreateAccountPayableDialog: React.FC<Props> = ({ open, onClose, onCreated }) => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loadingSuppliers, setLoadingSuppliers] = useState(false);
  const [supplierSearch, setSupplierSearch] = useState('');

  const [form, setForm] = useState<{
    supplierId?: string;
    dueDate: string;
    referenceMonth?: string;
    description?: string;
    totalAmount: string;
  }>({
    supplierId: undefined,
    dueDate: new Date().toISOString().slice(0, 10),
    referenceMonth: new Date().toISOString().slice(0, 7),
    description: '',
    totalAmount: '',
  });
  const [attachment, setAttachment] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    (async () => {
      setLoadingSuppliers(true);
      try {
        const list = await suppliersService.list();
        setSuppliers(list);
      } catch {
        setSuppliers([]);
      } finally {
        setLoadingSuppliers(false);
      }
    })();
  }, [open]);

  const selectedSupplier = useMemo(
    () => suppliers.find((s) => s.id === form.supplierId) || null,
    [suppliers, form.supplierId],
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Nova conta a pagar</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2}>
          {error && <Typography color="error">{error}</Typography>}
          <Autocomplete
            options={suppliers}
            loading={loadingSuppliers}
            inputValue={supplierSearch}
            onInputChange={(_, value) => setSupplierSearch(value)}
            getOptionLabel={(o) => `${o.name}${o.email ? ` (${o.email})` : ''}`}
            value={selectedSupplier}
            onChange={(_, value) =>
              setForm((f) => ({ ...f, supplierId: value?.id || undefined }))
            }
            renderInput={(params) => (
              <TextField
                {...params}
                label="Fornecedor (opcional)"
                placeholder="Selecione"
                fullWidth
              />
            )}
          />

          <TextField
            label="Valor total"
            type="number"
            inputProps={{ min: 0, step: '0.01' }}
            value={form.totalAmount}
            onChange={(e) => setForm((f) => ({ ...f, totalAmount: e.target.value }))}
            required
            fullWidth
          />

          <TextField
            label="Vencimento"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={form.dueDate}
            onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))}
            required
            fullWidth
          />

          <TextField
            label="Mês de referência"
            type="month"
            InputLabelProps={{ shrink: true }}
            value={form.referenceMonth || ''}
            onChange={(e) =>
              setForm((f) => ({ ...f, referenceMonth: e.target.value || undefined }))
            }
            fullWidth
          />

          <TextField
            label="Descrição (opcional)"
            value={form.description || ''}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            fullWidth
            multiline
            rows={2}
          />

          <Button variant="outlined" component="label">
            Anexar comprovante (PDF ou imagem, opcional)
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
            const totalAmount = Number(form.totalAmount);
            if (!Number.isFinite(totalAmount) || totalAmount <= 0) {
              setError('Valor total inválido');
              return;
            }
            if (!form.dueDate) {
              setError('Informe a data de vencimento');
              return;
            }
            try {
              setSaving(true);
              await accountsPayableService.create(
                {
                  dueDate: form.dueDate,
                  totalAmount,
                  supplierId: form.supplierId,
                  referenceMonth: form.referenceMonth || undefined,
                  description: form.description || undefined,
                },
                attachment,
              );
              onCreated();
            } catch (e: any) {
              setError(e?.message || 'Erro ao criar conta a pagar');
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

export default CreateAccountPayableDialog;
