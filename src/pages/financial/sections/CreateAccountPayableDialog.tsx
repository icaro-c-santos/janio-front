import React, { useEffect, useMemo, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Stack, MenuItem, Box, Alert } from '@mui/material';
import { AccountPayType } from '../../../services/accountsPayableService';
import { suppliersService, Supplier } from '../../../services/suppliersService';
import { accountsPayableService } from '../../../services/accountsPayableService';

interface Props {
  open: boolean;
  onClose: () => void;
  types: AccountPayType[];
  onCreated: () => void;
}

const CreateAccountPayableDialog: React.FC<Props> = ({ open, onClose, types, onCreated }) => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [supplierId, setSupplierId] = useState<string>('');
  const [beneficiary, setBeneficiary] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [totalValue, setTotalValue] = useState<string>('');
  const [accountPayTypeId, setAccountPayTypeId] = useState<string>('');
  const [receipt, setReceipt] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    suppliersService.listAll().then(setSuppliers).catch(() => setSuppliers([]));
  }, [open]);

  const beneficiaryRequired = useMemo(() => !supplierId, [supplierId]);

  const reset = () => {
    setSupplierId('');
    setBeneficiary('');
    setDescription('');
    setDueDate('');
    setTotalValue('');
    setAccountPayTypeId('');
    setReceipt(null);
    setError(null);
  };

  const handleFile = (f?: File | null) => {
    if (!f) { setReceipt(null); return; }
    if (f.type !== 'application/pdf') {
      setError('O arquivo deve ser PDF');
      return;
    }
    setError(null);
    setReceipt(f);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      const numericTotal = Number(totalValue);
      const validationErrors: string[] = [];
      if (!dueDate) validationErrors.push('Data de vencimento é obrigatória');
      if (!numericTotal || isNaN(numericTotal) || numericTotal <= 0) validationErrors.push('Valor total inválido');
      if (beneficiaryRequired && !beneficiary.trim()) validationErrors.push('Beneficiário é obrigatório');
      if (validationErrors.length) {
        setError(validationErrors.join(' | '));
        setLoading(false);
        return;
      }

      await accountsPayableService.create({
        supplierId: supplierId || undefined,
        beneficiary: beneficiaryRequired ? beneficiary.trim() : undefined,
        description: description.trim() || undefined,
        dueDate,
        totalValue: numericTotal,
        accountPayTypeId: accountPayTypeId || undefined,
      }, receipt);

      reset();
      onCreated();
    } catch (e: any) {
      setError(e?.message || 'Erro ao criar conta a pagar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Cadastrar Conta</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            select
            label="Fornecedor (opcional)"
            value={supplierId}
            onChange={(e) => setSupplierId(e.target.value)}
            fullWidth
          >
            <MenuItem value="">Nenhum</MenuItem>
            {suppliers.map(s => (
              <MenuItem key={s.id} value={s.id}>{s.name}{s.email ? ` (${s.email})` : ''}</MenuItem>
            ))}
          </TextField>

          {beneficiaryRequired && (
            <TextField
              label="Beneficiário"
              value={beneficiary}
              onChange={(e) => setBeneficiary(e.target.value)}
              required
              fullWidth
            />
          )}

          <TextField
            select
            label="Tipo (opcional)"
            value={accountPayTypeId}
            onChange={(e) => setAccountPayTypeId(e.target.value)}
            fullWidth
          >
            <MenuItem value="">Nenhum</MenuItem>
            {types.map(t => (
              <MenuItem key={t.id} value={t.id}>{t.name}</MenuItem>
            ))}
          </TextField>

          <TextField
            label="Descrição (opcional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            fullWidth
          />

          <TextField
            label="Data de vencimento"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            required
            fullWidth
          />

          <TextField
            label="Valor total"
            type="number"
            inputProps={{ step: '0.01', min: '0' }}
            value={totalValue}
            onChange={(e) => setTotalValue(e.target.value)}
            required
            fullWidth
          />

          <Box>
            <Button component="label" variant="outlined">
              {receipt ? 'PDF selecionado' : 'Anexar PDF (opcional)'}
              <input hidden type="file" accept="application/pdf" onChange={(e) => handleFile(e.target.files?.[0] || null)} />
            </Button>
            {receipt && <span style={{ marginLeft: 8 }}>{receipt.name}</span>}
          </Box>

          {error && <Alert severity="error">{error}</Alert>}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>Cancelar</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={loading}>{loading ? 'Salvando...' : 'Salvar'}</Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateAccountPayableDialog;
