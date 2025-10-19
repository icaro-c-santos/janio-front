import React, { useEffect, useMemo, useState } from 'react';
import { Box, Paper, Stack, TextField, MenuItem, Button, useMediaQuery, Table, TableHead, TableRow, TableCell, TableBody, Typography, Dialog, DialogTitle, DialogContent, DialogActions, CircularProgress } from '@mui/material';
import { accountsPayableService, AccountPayType, AccountPayableListItem, AccountPayableDetail, AccountPayableStatus } from '../../../services/accountsPayableService';

const statusOptions: { value: AccountPayableStatus; label: string }[] = [
  { value: 'PENDING', label: 'Pendente' },
  { value: 'PAID', label: 'Paga' },
  { value: 'OVERDUE', label: 'Vencida' },
];

const AccountsPayableSection: React.FC = () => {
  const isMobile = useMediaQuery('(max-width:800px)');
  const [filters, setFilters] = useState<{ beneficiary?: string; status?: AccountPayableStatus | ''; dueDateFrom?: string; dueDateTo?: string; accountPayTypeId?: string }>({});
  const [types, setTypes] = useState<AccountPayType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<AccountPayableListItem[]>([]);

  const [detailOpen, setDetailOpen] = useState(false);
  const [detail, setDetail] = useState<AccountPayableDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const loadTypes = async () => {
    try {
      const res = await accountsPayableService.listTypes();
      setTypes(res);
    } catch { }
  };

  const applyFilters = async () => {
    setLoading(true);
    setError(null);
    try {
      const query = {
        beneficiary: filters.beneficiary || undefined,
        status: (filters.status as AccountPayableStatus) || undefined,
        dueDateFrom: filters.dueDateFrom || undefined,
        dueDateTo: filters.dueDateTo || undefined,
        accountPayTypeId: filters.accountPayTypeId || undefined,
      };
      const res = await accountsPayableService.list(query);
      setItems(res);
    } catch (e: any) {
      setError(e?.message || 'Erro ao carregar contas a pagar');
    } finally {
      setLoading(false);
    }
  };

  const openDetail = async (id: string) => {
    setDetailOpen(true);
    setDetailLoading(true);
    try {
      const d = await accountsPayableService.getById(id);
      setDetail(d);
    } catch (e: any) {
      setDetail(null);
    } finally {
      setDetailLoading(false);
    }
  };

  useEffect(() => { loadTypes(); }, []);
  useEffect(() => { applyFilters(); }, []);

  const clearFilters = async () => {
    setFilters({});
    await applyFilters();
  };

  return (
    <Box>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack spacing={2} direction={{ xs: 'column', md: 'row' }}>
          <TextField label="Beneficiário" value={filters.beneficiary || ''} onChange={(e) => setFilters((f) => ({ ...f, beneficiary: e.target.value }))} fullWidth />
          <TextField select label="Status" value={filters.status || ''} onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value as any }))} fullWidth>
            <MenuItem value="">Todos</MenuItem>
            {statusOptions.map(s => <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>)}
          </TextField>
          <TextField label="Vencimento (de)" type="date" InputLabelProps={{ shrink: true }} value={filters.dueDateFrom || ''} onChange={(e) => setFilters((f) => ({ ...f, dueDateFrom: e.target.value }))} fullWidth />
          <TextField label="Vencimento (até)" type="date" InputLabelProps={{ shrink: true }} value={filters.dueDateTo || ''} onChange={(e) => setFilters((f) => ({ ...f, dueDateTo: e.target.value }))} fullWidth />
        </Stack>
        <Stack spacing={2} direction={{ xs: 'column', md: 'row' }} sx={{ mt: 2 }}>
          <TextField select label="Tipo" value={filters.accountPayTypeId || ''} onChange={(e) => setFilters((f) => ({ ...f, accountPayTypeId: e.target.value }))} fullWidth>
            <MenuItem value="">Todos</MenuItem>
            {types.map(t => <MenuItem key={t.id} value={t.id}>{t.name}</MenuItem>)}
          </TextField>
          <Box sx={{ display: 'flex', alignItems: 'flex-end' }}>
            <Button variant="contained" onClick={applyFilters}>Filtrar</Button>
            <Button variant="text" sx={{ ml: 1 }} onClick={clearFilters}>Limpar</Button>
          </Box>
        </Stack>
      </Paper>

      {!isMobile && (
        <Paper>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Beneficiário</TableCell>
                <TableCell align="right">Total</TableCell>
                <TableCell>Vencimento</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading && (
                <TableRow><TableCell colSpan={4} align="center"><Box py={3}><CircularProgress size={24} /></Box></TableCell></TableRow>
              )}
              {error && !loading && (
                <TableRow><TableCell colSpan={4} align="center"><Typography color="error">{error}</Typography></TableCell></TableRow>
              )}
              {!loading && !error && items.length === 0 && (
                <TableRow><TableCell colSpan={4} align="center"><Typography color="text.secondary">Nenhuma conta encontrada</Typography></TableCell></TableRow>
              )}
              {!loading && !error && items.map(it => (
                <TableRow key={it.id} hover onClick={() => openDetail(it.id)} sx={{ cursor: 'pointer' }}>
                  <TableCell>{it.beneficiary || '-'}</TableCell>
                  <TableCell align="right">{Number(it.totalValue).toFixed(2)}</TableCell>
                  <TableCell>{new Date(it.dueDate).toLocaleDateString('pt-BR')}</TableCell>
                  <TableCell>{it.status}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      )}

      {isMobile && (
        <Stack spacing={1}>
          {loading && <Box py={3} textAlign="center"><CircularProgress size={24} /></Box>}
          {error && !loading && <Typography color="error" textAlign="center">{error}</Typography>}
          {!loading && !error && items.length === 0 && (
            <Typography color="text.secondary" textAlign="center">Nenhuma conta encontrada</Typography>
          )}
          {!loading && !error && items.map(it => (
            <Paper
              key={it.id}
              sx={{
                p: 2,
                cursor: 'pointer',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  boxShadow: 3,
                  backgroundColor: 'action.hover',
                  transform: 'translateY(-2px)'
                },
              }}
              onClick={() => openDetail(it.id)}
            >
              <Stack spacing={0.5}>
                <Typography variant="subtitle2">{it.beneficiary || '-'}</Typography>
                <Typography>Total: <strong>{Number(it.totalValue).toFixed(2)}</strong></Typography>
                <Typography>Venc.: {new Date(it.dueDate).toLocaleDateString('pt-BR')}</Typography>
                <Typography>Status: {it.status}</Typography>
              </Stack>
            </Paper>
          ))}
        </Stack>
      )}

      <Dialog open={detailOpen} onClose={() => setDetailOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Conta a pagar</DialogTitle>
        <DialogContent dividers>
          {detailLoading && <Box py={3} textAlign="center"><CircularProgress size={24} /></Box>}
          {!detailLoading && detail && (
            <Stack spacing={1}>
              <Typography>Beneficiário: <strong>{detail.beneficiary || '-'}</strong></Typography>
              <Typography>Total: <strong>{Number(detail.totalValue).toFixed(2)}</strong></Typography>
              <Typography>Vencimento: <strong>{new Date(detail.dueDate).toLocaleDateString('pt-BR')}</strong></Typography>
              <Typography>Status: <strong>{detail.status}</strong></Typography>
              {detail.supplier && (
                <Box sx={{ mt: 1 }}>
                  <Typography variant="subtitle2">Fornecedor</Typography>
                  <Typography>Nome: <strong>{detail.supplier.name}</strong></Typography>
                  <Typography>Email: <strong>{detail.supplier.email || '-'}</strong></Typography>
                </Box>
              )}
              {detail.purchase && (
                <Box sx={{ mt: 1 }}>
                  <Typography variant="subtitle2">Compra</Typography>
                  <Typography>ID: <strong>{detail.purchase.id}</strong></Typography>
                  <Typography>Item: <strong>{detail.purchase.itemType}</strong></Typography>
                  <Typography>Data: <strong>{new Date(detail.purchase.purchaseDate).toLocaleDateString('pt-BR')}</strong></Typography>
                  <Typography>Quantidade: <strong>{detail.purchase.quantity}</strong></Typography>
                  <Typography>PU: <strong>{Number(detail.purchase.unitPrice).toFixed(2)}</strong></Typography>
                  <Typography>Total: <strong>{Number(detail.purchase.totalValue).toFixed(2)}</strong></Typography>
                  {detail.purchase.supplier && (
                    <Typography>Fornecedor da compra: <strong>{detail.purchase.supplier.name}</strong> {detail.purchase.supplier.email ? `(${detail.purchase.supplier.email})` : ''}</Typography>
                  )}
                </Box>
              )}
              {(detail.receiptDownloadUrl || detail.paymentReceiptDownloadUrl) && (
                <Box sx={{ mt: 1 }}>
                  <Typography variant="subtitle2">Comprovantes</Typography>
                  {detail.receiptDownloadUrl && <a href={detail.receiptDownloadUrl} target="_blank" rel="noreferrer">Download do PDF enviado</a>}
                  {detail.paymentReceiptDownloadUrl && <>
                    <br />
                    <a href={detail.paymentReceiptDownloadUrl} target="_blank" rel="noreferrer">Download do recibo de pagamento</a>
                  </>}
                </Box>
              )}
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailOpen(false)}>Fechar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AccountsPayableSection;
