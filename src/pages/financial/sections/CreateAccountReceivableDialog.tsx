import React, { useEffect, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Stack, TextField, Autocomplete, Typography } from '@mui/material';
import { customersService, Customer } from '../../../services/customersService';
import { accountsReceivableService } from '../../../services/accountsReceivableService';

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

const CreateAccountReceivableDialog: React.FC<Props> = ({ open, onClose, onCreated }) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loadingCustomers, setLoadingCustomers] = useState(false);

  const [form, setForm] = useState<{ customerId: string; amount: string; dueDate: string; competenceMonth?: string; description?: string }>({
    customerId: '',
    amount: '',
    dueDate: new Date().toISOString().slice(0, 10),
    competenceMonth: new Date().toISOString().slice(0, 7),
    description: '',
  });
  const [reportFile, setReportFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    (async () => {
      setLoadingCustomers(true);
      try {
        const list = await customersService.getAllCustomers();
        setCustomers(list);
      } catch (e: any) {
        setCustomers([]);
      } finally {
        setLoadingCustomers(false);
      }
    })();
  }, [open]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Nova conta a receber</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2}>
          {error && <Typography color="error">{error}</Typography>}

          <Autocomplete
            options={customers}
            loading={loadingCustomers}
            getOptionLabel={(o) => (o ? `${o.name}${o.email ? ` (${o.email})` : ''}` : '')}
            value={customers.find((c) => c.id === form.customerId) || null}
            onChange={(_e, val) => setForm((f) => ({ ...f, customerId: val?.id || '' }))}
            renderInput={(params) => (
              <TextField {...params} label="Cliente" placeholder="Selecione" required fullWidth />
            )}
          />

          <TextField
            label="Valor"
            type="number"
            inputProps={{ min: 0, step: '0.01' }}
            value={form.amount}
            onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
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
            label="Mês de competência"
            type="month"
            InputLabelProps={{ shrink: true }}
            value={form.competenceMonth || ''}
            onChange={(e) => setForm((f) => ({ ...f, competenceMonth: e.target.value }))}
            fullWidth
          />

          <TextField
            label="Descrição (opcional)"
            value={form.description || ''}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            fullWidth
          />

          <Button variant="outlined" component="label">
            Anexar relatório (PDF)
            <input type="file" hidden accept="application/pdf" onChange={(e) => setReportFile(e.target.files?.[0] || null)} />
          </Button>
          {reportFile && <Typography variant="body2">{reportFile.name}</Typography>}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button variant="outlined" onClick={onClose} disabled={saving}>Cancelar</Button>
        <Button
          variant="contained"
          disabled={saving}
          onClick={async () => {
            setError(null);
            const amount = Number(form.amount);
            if (!form.customerId) { setError('Selecione o cliente'); return; }
            if (!Number.isFinite(amount) || amount < 0) { setError('Valor inválido'); return; }
            if (!form.dueDate) { setError('Informe a data de vencimento'); return; }
            try {
              setSaving(true);
              await accountsReceivableService.create({
                customerId: form.customerId,
                amount,
                dueDate: form.dueDate,
                competenceMonth: form.competenceMonth || undefined,
                description: form.description || undefined,
              }, reportFile);
              onCreated();
            } catch (e: any) {
              setError(e?.message || 'Erro ao criar conta a receber');
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

export default CreateAccountReceivableDialog;
