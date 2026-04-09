import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
  useMediaQuery,
} from '@mui/material';
import {
  AccountPayableDetail,
  AccountPayableListItem,
  AccountPayableStatus,
  PaginatedAccountsPayable,
  accountsPayableService,
} from '../../../services/accountsPayableService';
import CreateAccountPayableDialog from './CreateAccountPayableDialog';
import RegisterAccountPayablePaymentDialog from './RegisterAccountPayablePaymentDialog';

const statusOptions: { value: AccountPayableStatus | ''; label: string }[] = [
  { value: '', label: 'Todos' },
  { value: 'PENDING', label: 'PENDENTE' },
  { value: 'PARTIALLY_PAID', label: 'PAGO PARCIAL' },
  { value: 'PAID', label: 'PAGO' },
];

const statusMeta = (status: AccountPayableStatus) => {
  switch (status) {
    case 'PAID':
      return { label: 'PAGO', color: 'success' as const };
    case 'PARTIALLY_PAID':
      return { label: 'PAGO PARCIAL', color: 'info' as const };
    case 'PENDING':
    default:
      return { label: 'PENDENTE', color: 'warning' as const };
  }
};

const formatMoney = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
    Number(value || 0),
  );

const AccountsPayableSection: React.FC = () => {
  const isMobile = useMediaQuery('(max-width:800px)');
  const [data, setData] = useState<PaginatedAccountsPayable | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [draftFilters, setDraftFilters] = useState<{ query?: string; status?: AccountPayableStatus | ''; dueDateFrom?: string; dueDateTo?: string; referenceMonth?: string }>({});
  const [filters, setFilters] = useState<typeof draftFilters>({});

  const [createOpen, setCreateOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detail, setDetail] = useState<AccountPayableDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [payOpen, setPayOpen] = useState(false);

  const queryParams = useMemo(
    () => ({
      query: filters.query,
      status: (filters.status as AccountPayableStatus) || undefined,
      dueDateFrom: filters.dueDateFrom,
      dueDateTo: filters.dueDateTo,
      referenceMonth: filters.referenceMonth,
      page: page + 1,
      pageSize: rowsPerPage,
    }),
    [filters, page, rowsPerPage],
  );

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await accountsPayableService.list(queryParams);
      setData(res);
    } catch (e: any) {
      setError(e?.message || 'Erro ao carregar contas a pagar');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryParams.query, queryParams.status, queryParams.dueDateFrom, queryParams.dueDateTo, queryParams.referenceMonth, page, rowsPerPage]);

  const openDetail = async (id: string) => {
    setDetailOpen(true);
    setDetailLoading(true);
    try {
      const d = await accountsPayableService.getById(id);
      setDetail(d);
    } catch {
      setDetail(null);
    } finally {
      setDetailLoading(false);
    }
  };

  return (
    <Box>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          alignItems={{ xs: 'stretch', sm: 'center' }}
          justifyContent="space-between"
          spacing={1}
          mb={2}
        >
          <Typography variant="h6">Contas a pagar</Typography>
          <Button variant="contained" onClick={() => setCreateOpen(true)}>
            Nova conta a pagar
          </Button>
        </Stack>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} useFlexGap flexWrap={{ sm: 'wrap' }}>
          <TextField
            size="small"
            label="Fornecedor/Descrição"
            value={draftFilters.query ?? ''}
            onChange={(e) => setDraftFilters((f) => ({ ...f, query: e.target.value || undefined }))}
          />
          <TextField
            size="small"
            select
            label="Status"
            value={draftFilters.status ?? ''}
            onChange={(e) =>
              setDraftFilters((f) => ({ ...f, status: e.target.value as AccountPayableStatus | '' }))
            }
          >
            {statusOptions.map((o) => (
              <MenuItem key={o.value || 'all'} value={o.value}>
                {o.label}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            size="small"
            label="Venc. (de)"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={draftFilters.dueDateFrom ?? ''}
            onChange={(e) => setDraftFilters((f) => ({ ...f, dueDateFrom: e.target.value || undefined }))}
          />
          <TextField
            size="small"
            label="Venc. (até)"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={draftFilters.dueDateTo ?? ''}
            onChange={(e) => setDraftFilters((f) => ({ ...f, dueDateTo: e.target.value || undefined }))}
          />
          <TextField
            size="small"
            label="Mês referência"
            type="month"
            InputLabelProps={{ shrink: true }}
            value={draftFilters.referenceMonth ?? ''}
            onChange={(e) =>
              setDraftFilters((f) => ({ ...f, referenceMonth: e.target.value || undefined }))
            }
          />
          <Button variant="contained" onClick={() => { setFilters(draftFilters); setPage(0); }}>
            Filtrar
          </Button>
          <Button variant="outlined" onClick={() => { setDraftFilters({}); setFilters({}); setPage(0); }}>
            Limpar
          </Button>
        </Stack>
      </Paper>

      {isMobile ? (
        <Stack spacing={1}>
          {!loading && !error && data?.items?.map((row: AccountPayableListItem) => (
            <Paper key={row.id} sx={{ p: 2, cursor: 'pointer' }} onClick={() => openDetail(row.id)}>
              <Stack spacing={0.5}>
                <Typography variant="subtitle2" noWrap>{row.supplierName || 'Sem fornecedor'}</Typography>
                <Typography>Venc.: {new Date(row.dueDate).toLocaleDateString('pt-BR')}</Typography>
                <Typography>Total: <strong>{formatMoney(row.totalAmount)}</strong></Typography>
                <Typography>Pendente: <strong>{formatMoney(row.pendingAmount)}</strong></Typography>
                <Box>
                  <Chip size="small" label={statusMeta(row.status).label} color={statusMeta(row.status).color} />
                </Box>
              </Stack>
            </Paper>
          ))}
        </Stack>
      ) : (
        <Paper>
          <TableContainer sx={{ overflowX: 'auto' }}>
            <Table size="small" sx={{ minWidth: 900 }}>
              <TableHead>
                <TableRow>
                  <TableCell>Fornecedor</TableCell>
                  <TableCell>Descrição</TableCell>
                  <TableCell>Vencimento</TableCell>
                  <TableCell>Mês ref.</TableCell>
                  <TableCell align="right">Total</TableCell>
                  <TableCell align="right">Pago</TableCell>
                  <TableCell align="right">Pendente</TableCell>
                  <TableCell align="center">Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading && <TableRow><TableCell colSpan={8}>Carregando...</TableCell></TableRow>}
                {error && !loading && <TableRow><TableCell colSpan={8} style={{ color: 'red' }}>{error}</TableCell></TableRow>}
                {!loading && !error && (data?.items?.length ?? 0) === 0 && (
                  <TableRow><TableCell colSpan={8}>Nenhuma conta a pagar encontrada</TableCell></TableRow>
                )}
                {!loading && !error && data?.items?.map((row) => (
                  <TableRow key={row.id} hover sx={{ cursor: 'pointer' }} onClick={() => openDetail(row.id)}>
                    <TableCell>{row.supplierName || '-'}</TableCell>
                    <TableCell>{row.description || '-'}</TableCell>
                    <TableCell>{new Date(row.dueDate).toLocaleDateString('pt-BR')}</TableCell>
                    <TableCell>{row.referenceMonth || '-'}</TableCell>
                    <TableCell align="right">{formatMoney(row.totalAmount)}</TableCell>
                    <TableCell align="right">{formatMoney(row.paidAmount)}</TableCell>
                    <TableCell align="right">{formatMoney(row.pendingAmount)}</TableCell>
                    <TableCell align="center">
                      <Chip size="small" label={statusMeta(row.status).label} color={statusMeta(row.status).color} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={data?.total ?? 0}
            page={page}
            onPageChange={(_, p) => setPage(p)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
            rowsPerPageOptions={[5, 10, 25, 50]}
          />
        </Paper>
      )}

      <Dialog open={detailOpen} onClose={() => setDetailOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Conta a pagar</DialogTitle>
        <DialogContent dividers>
          {detailLoading && <Typography>Carregando...</Typography>}
          {!detailLoading && detail && (
            <Stack spacing={1}>
              <Typography>Fornecedor: <strong>{detail.supplier?.name || 'Sem fornecedor'}</strong></Typography>
              <Typography>Descrição: <strong>{detail.description || '-'}</strong></Typography>
              <Typography>Vencimento: <strong>{new Date(detail.dueDate).toLocaleDateString('pt-BR')}</strong></Typography>
              <Typography>Total: <strong>{formatMoney(detail.totalAmount)}</strong></Typography>
              <Typography>Pago: <strong>{formatMoney(detail.paidAmount)}</strong></Typography>
              <Typography>Pendente: <strong>{formatMoney(detail.pendingAmount)}</strong></Typography>
              <Typography>Status: <strong>{statusMeta(detail.status).label}</strong></Typography>

              {detail.attachmentDownloadUrl && (
                <Typography>
                  Comprovante da conta:{' '}
                  <a href={detail.attachmentDownloadUrl} target="_blank" rel="noreferrer">
                    {detail.attachmentOriginalName || 'Baixar arquivo'}
                  </a>
                </Typography>
              )}

              <Box sx={{ mt: 1 }}>
                <Typography variant="subtitle2">Pagamentos</Typography>
                {detail.payments.length === 0 ? (
                  <Typography color="text.secondary">Nenhum pagamento registrado</Typography>
                ) : (
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Data</TableCell>
                        <TableCell align="right">Valor</TableCell>
                        <TableCell>Obs.</TableCell>
                        <TableCell>Recibo</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {detail.payments.map((payment) => (
                        <TableRow key={payment.id}>
                          <TableCell>{new Date(payment.paymentDate).toLocaleDateString('pt-BR')}</TableCell>
                          <TableCell align="right">{formatMoney(payment.amount)}</TableCell>
                          <TableCell>{payment.note || '-'}</TableCell>
                          <TableCell>
                            {payment.attachmentDownloadUrl ? (
                              <a href={payment.attachmentDownloadUrl} target="_blank" rel="noreferrer">
                                {payment.attachmentOriginalName || 'Baixar'}
                              </a>
                            ) : '-'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </Box>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          {detail && detail.status !== 'PAID' && (
            <Button variant="contained" color="success" onClick={() => setPayOpen(true)}>
              Registrar pagamento
            </Button>
          )}
          <Button onClick={() => setDetailOpen(false)}>Fechar</Button>
        </DialogActions>
      </Dialog>

      <CreateAccountPayableDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={async () => {
          setCreateOpen(false);
          setPage(0);
          await load();
        }}
      />

      <RegisterAccountPayablePaymentDialog
        open={payOpen}
        accountPayableId={detail?.id || null}
        onClose={() => setPayOpen(false)}
        onPaid={async () => {
          setPayOpen(false);
          if (detail?.id) {
            const fresh = await accountsPayableService.getById(detail.id);
            setDetail(fresh);
          }
          await load();
        }}
      />
    </Box>
  );
};

export default AccountsPayableSection;
