import React, { useEffect, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Stack, Typography, TextField, MenuItem, Button, Divider } from '@mui/material';
import { purchasesService, PurchaseListItem } from '../../../services/purchasesService';

interface CreateInputDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: { itemType: string; quantity: number; movementDate: string; purchaseId?: string }) => Promise<void>;
}

const CreateInputDialog: React.FC<CreateInputDialogProps> = ({ open, onClose, onSubmit }) => {
  const [purchases, setPurchases] = useState<PurchaseListItem[]>([]);
  const [loadingPurchases, setLoadingPurchases] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<{ itemType: string; quantity: string; purchaseId?: string; movementDate: string }>({
    itemType: '',
    quantity: '',
    purchaseId: undefined,
    movementDate: new Date().toISOString().slice(0, 10),
  });

  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    const loadPurchases = async () => {
      if (!open || !form.itemType) { setPurchases([]); return; }
      setLoadingPurchases(true);
      try {
        const res = await purchasesService.list({ itemType: form.itemType, page: 1, pageSize: 50 });
        setPurchases(res.items || []);
      } catch {
        setPurchases([]);
      } finally {
        setLoadingPurchases(false);
      }
    };
    loadPurchases();
  }, [open, form.itemType]);

  const handleSave = async () => {
    setError(null);
    const qty = Number(form.quantity);
    if (!form.itemType) { setError('Selecione o tipo de item'); return; }
    if (!Number.isFinite(qty) || qty <= 0) { setError('Quantidade inválida'); return; }
    setConfirmOpen(true);
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>Nova entrada</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2}>
            {error && <Typography color="error">{error}</Typography>}
            <TextField select label="Tipo de Item" value={form.itemType} onChange={(e) => setForm((f) => ({ ...f, itemType: e.target.value, purchaseId: undefined }))} required>
              <MenuItem value="">Selecione</MenuItem>
              <MenuItem value="COCO">COCO</MenuItem>
              <MenuItem value="GARRAFA_DESCARTAVEL">GARRAFA_DESCARTAVEL</MenuItem>
              <MenuItem value="GARRAFA_REUTILIZAVEL">GARRAFA_REUTILIZAVEL</MenuItem>
              <MenuItem value="ROTULO">ROTULO</MenuItem>
              <MenuItem value="ETIQUETA">ETIQUETA</MenuItem>
              <MenuItem value="CLORO">CLORO</MenuItem>
            </TextField>

            <TextField
              select
              label="Vincular a Compra (opcional)"
              value={form.purchaseId ?? ''}
              onChange={(e) => {
                const id = e.target.value || undefined;
                const selected = purchases.find(p => p.id === id);
                setForm((f) => ({ ...f, purchaseId: id, quantity: selected ? String(selected.quantity) : f.quantity }));
              }}
              disabled={!form.itemType || loadingPurchases}
              helperText={form.itemType ? (loadingPurchases ? 'Carregando compras...' : 'Ordenado da mais recente') : 'Selecione o tipo de item para carregar compras'}
            >
              <MenuItem value="">Sem vínculo</MenuItem>
              {purchases.map(p => (
                <MenuItem key={p.id} value={p.id}>
                  {new Date(p.purchaseDate).toLocaleDateString('pt-BR')} · {p.itemType} · Qtd {p.quantity} · {p.supplierName || '-'}
                </MenuItem>
              ))}
            </TextField>

            <TextField label="Quantidade" type="number" value={form.quantity} onChange={(e) => setForm((f) => ({ ...f, quantity: e.target.value }))} inputProps={{ step: '1', min: '1' }} required fullWidth />

            <TextField label="Data da entrada" type="date" InputLabelProps={{ shrink: true }} value={form.movementDate ?? ''} onChange={(e) => setForm((f) => ({ ...f, movementDate: e.target.value }))} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={saving}>Cancelar</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving}>{saving ? 'Confirmando...' : 'Continuar'}</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Confirmar entrada</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2}>
            <Typography variant="subtitle2">Resumo</Typography>
            <Divider />
            <Typography>Tipo de Item: <strong>{form.itemType || '-'}</strong></Typography>
            <Typography>Data da entrada: <strong>{form.movementDate || '-'}</strong></Typography>
            <Typography>Quantidade: <strong>{form.quantity || '-'}</strong></Typography>
            <Divider />
            <Typography variant="subtitle2">Compra vinculada</Typography>
            {form.purchaseId ? (
              (() => {
                const p = purchases.find(x => x.id === form.purchaseId);
                if (!p) return <Typography>Nenhuma</Typography>;
                return (
                  <Stack spacing={0.5}>
                    <Typography>Data da compra: <strong>{new Date(p.purchaseDate).toLocaleDateString('pt-BR')}</strong></Typography>
                    <Typography>Fornecedor: <strong>{p.supplierName || '-'} {p.supplierEmail ? `(${p.supplierEmail})` : ''}</strong></Typography>
                    <Typography>Quantidade da compra: <strong>{p.quantity}</strong></Typography>
                    <Typography>PU: <strong>{Number(p.unitPrice ?? 0).toFixed(2)}</strong></Typography>
                    <Typography>Total: <strong>{Number(p.totalValue ?? 0).toFixed(2)}</strong></Typography>
                  </Stack>
                );
              })()
            ) : (
              <Typography>Nenhuma</Typography>
            )}
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
                  purchaseId: form.purchaseId || undefined,
                });
                setForm({ itemType: '', quantity: '', purchaseId: undefined, movementDate: new Date().toISOString().slice(0, 10) });
                setConfirmOpen(false);
              } catch (e: any) {
                setError(e?.message || 'Erro ao criar entrada');
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

export default CreateInputDialog;
