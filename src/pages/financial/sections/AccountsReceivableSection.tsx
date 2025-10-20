import React, { useEffect, useMemo, useState } from 'react';
import { Box, Paper, Stack, TextField, MenuItem, Button, Typography, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, TablePagination, Dialog, DialogTitle, DialogContent, DialogActions, Chip, useMediaQuery } from '@mui/material';
import { accountsReceivableService, AccountReceivableDetail, AccountReceivableListItem, AccountReceivableStatus, PaginatedReceivables } from '../../../services/accountsReceivableService';
import CreateAccountReceivableDialog from './CreateAccountReceivableDialog';
import SettleAccountReceivableDialog from './SettleAccountReceivableDialog';

const statusOptions: { value: AccountReceivableStatus | ''; label: string }[] = [
  { value: '', label: 'Todos' },
  { value: 'PENDING', label: 'PENDENTE' },
  { value: 'RECEIVED', label: 'RECEBIDO' },
  { value: 'OVERDUE', label: 'EM ATRASO' },
];

const statusMeta = (status: AccountReceivableStatus) => {
  switch (status) {
    case 'RECEIVED':
      return { label: 'RECEBIDO', color: 'success' as const };
    case 'OVERDUE':
      return { label: 'EM ATRASO', color: 'error' as const };
    case 'PENDING':
    default:
      return { label: 'PENDENTE', color: 'warning' as const };
  }
};

const AccountsReceivableSection: React.FC = () => {
  const isMobile = useMediaQuery('(max-width:800px)');

  const [data, setData] = useState<PaginatedReceivables | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [draftFilters, setDraftFilters] = useState<{ customerQuery?: string; status?: AccountReceivableStatus | ''; dueDateFrom?: string; dueDateTo?: string; competenceMonth?: string }>({});
  const [filters, setFilters] = useState<typeof draftFilters>({});

  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detail, setDetail] = useState<AccountReceivableDetail | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [settleOpen, setSettleOpen] = useState(false);

  const queryParams = useMemo(() => ({
    customerQuery: filters.customerQuery,
    status: (filters.status as AccountReceivableStatus) || undefined,
    dueDateFrom: filters.dueDateFrom,
    dueDateTo: filters.dueDateTo,
    competenceMonth: filters.competenceMonth,
    page: page + 1,
    pageSize: rowsPerPage,
  }), [filters.customerQuery, filters.status, filters.dueDateFrom, filters.dueDateTo, filters.competenceMonth, page, rowsPerPage]);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await accountsReceivableService.list(queryParams);
      setData(res);
    } catch (e: any) {
      setError(e?.message || 'Erro ao carregar contas a receber');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [page, rowsPerPage, filters.customerQuery, filters.status, filters.dueDateFrom, filters.dueDateTo, filters.competenceMonth]);

  const handleChangePage = (_: unknown, newPage: number) => setPage(newPage);
  const handleChangeRowsPerPage = (e: React.ChangeEvent<HTMLInputElement>) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); };

  const openDetail = async (id: string) => {
    setDetailOpen(true);
    setDetailLoading(true);
    try {
      const d = await accountsReceivableService.getById(id);
      setDetail(d);
    } catch {
      setDetail(null);
    } finally {
      setDetailLoading(false);
    }
  };

  const visibleColSpan = isMobile ? 4 : 6;

  return (
    <Box>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ xs: 'stretch', sm: 'center' }} justifyContent="space-between" spacing={1} mb={2}>
          <Typography variant="h6">Contas a receber</Typography>
          <Button variant="contained" onClick={() => setCreateOpen(true)} sx={{ width: { xs: '100%', sm: 'auto' } }}>Nova conta a receber</Button>
        </Stack>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'stretch', sm: 'center' }} flexWrap={{ sm: 'wrap' }} useFlexGap>
          <TextField
            size="small"
            label="Cliente (nome/email)"
            placeholder="Buscar..."
            value={draftFilters.customerQuery ?? ''}
            onChange={(e) => setDraftFilters((f) => ({ ...f, customerQuery: e.target.value || undefined }))}
            fullWidth
            sx={{ flex: 2, minWidth: { xs: 0, sm: 260 } }}
          />

          <TextField
            size="small"
            select
            label="Status"
            value={draftFilters.status ?? ''}
            onChange={(e) => setDraftFilters((f) => ({ ...f, status: (e.target.value as AccountReceivableStatus | '') }))}
            fullWidth
            sx={{ flex: 1, minWidth: { xs: 0, sm: 180 } }}
          >
            {statusOptions.map((o) => (
              <MenuItem key={o.value || 'all'} value={o.value}>{o.label}</MenuItem>
            ))}
          </TextField>

          <TextField
            size="small"
            label="Venc. (de)"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={draftFilters.dueDateFrom ?? ''}
            onChange={(e) => setDraftFilters((f) => ({ ...f, dueDateFrom: e.target.value || undefined }))}
            fullWidth
            sx={{ flex: 1, minWidth: { xs: 0, sm: 170 } }}
          />

          <TextField
            size="small"
            label="Venc. (até)"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={draftFilters.dueDateTo ?? ''}
            onChange={(e) => setDraftFilters((f) => ({ ...f, dueDateTo: e.target.value || undefined }))}
            fullWidth
            sx={{ flex: 1, minWidth: { xs: 0, sm: 170 } }}
          />

          <TextField
            size="small"
            label="Mês competência"
            type="month"
            InputLabelProps={{ shrink: true }}
            value={draftFilters.competenceMonth ?? ''}
            onChange={(e) => setDraftFilters((f) => ({ ...f, competenceMonth: e.target.value || undefined }))}
            fullWidth
            sx={{ flex: 1, minWidth: { xs: 0, sm: 190 } }}
          />

          <Button variant="contained" onClick={() => { setFilters(draftFilters); setPage(0); }} sx={{ width: { xs: '100%', sm: 'auto' } }}>Filtrar</Button>
          <Button variant="outlined" onClick={() => { setDraftFilters({}); setFilters({}); setPage(0); }} sx={{ width: { xs: '100%', sm: 'auto' } }}>Limpar</Button>
        </Stack>
      </Paper>

      {isMobile ? (
        <Stack spacing={1}>
          {loading && <Typography sx={{ p: 2 }}>Carregando...</Typography>}
          {error && !loading && <Typography sx={{ p: 2 }} color="error">{error}</Typography>}
          {!loading && !error && (data?.items?.length ?? 0) === 0 && (
            <Typography sx={{ p: 2 }} color="text.secondary">Nenhuma conta a receber encontrada</Typography>
          )}
          {!loading && !error && data?.items?.map((row: AccountReceivableListItem) => (
            <Paper key={row.id} sx={{ p: 2, cursor: 'pointer', transition: 'all .2s', '&:hover': { boxShadow: 3, backgroundColor: 'action.hover', transform: 'translateY(-2px)' } }} onClick={() => openDetail(row.id)}>
              <Stack spacing={0.5}>
                <Typography variant="subtitle2" noWrap>{row.customerName || '-'} {row.customerEmail ? `(${row.customerEmail})` : ''}</Typography>
                <Typography>Valor: <strong>{Number(row.amount).toFixed(2)}</strong></Typography>
                <Typography>Venc.: {new Date(row.dueDate).toLocaleDateString('pt-BR')}</Typography>
                <Typography>Competência: {row.competenceDate ? new Date(row.competenceDate).toLocaleDateString('pt-BR', { year: 'numeric', month: '2-digit' }) : '-'}</Typography>
                <Box>
                  <Chip size="small" label={statusMeta(row.status).label} color={statusMeta(row.status).color} sx={{ minWidth: 110, '& .MuiChip-label': { width: '100%', textAlign: 'center', px: 0 } }} />
                </Box>
              </Stack>
            </Paper>
          ))}
        </Stack>
      ) : (
        <Paper>
          <TableContainer sx={{ overflowX: 'auto' }}>
            <Table size="small" sx={{ minWidth: 760 }}>
              <TableHead>
                <TableRow>
                  <TableCell>Cliente</TableCell>
                  <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>Valor</TableCell>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>Vencimento</TableCell>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>Mês competência</TableCell>
                  <TableCell align="center" sx={{ whiteSpace: 'nowrap' }}>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading && (
                  <TableRow><TableCell colSpan={visibleColSpan}>Carregando...</TableCell></TableRow>
                )}
                {error && !loading && (
                  <TableRow><TableCell colSpan={visibleColSpan} style={{ color: 'red' }}>{error}</TableCell></TableRow>
                )}
                {!loading && !error && (data?.items?.length ?? 0) === 0 && (
                  <TableRow><TableCell colSpan={visibleColSpan}>Nenhuma conta a receber encontrada</TableCell></TableRow>
                )}
                {!loading && !error && data?.items?.map((row: AccountReceivableListItem) => (
                  <TableRow key={row.id} hover sx={{ cursor: 'pointer' }} onClick={() => openDetail(row.id)}>
                    <TableCell>
                      <Typography noWrap>{row.customerName || '-'}</Typography>
                      {!!row.customerEmail && (
                        <Typography variant="body2" color="text.secondary" noWrap>{row.customerEmail}</Typography>
                      )}
                    </TableCell>
                    <TableCell align="right" onClick={(e) => { e.stopPropagation(); openDetail(row.id); }} sx={{ color: 'primary.main', fontWeight: 600 }}>
                      {Number(row.amount).toFixed(2)}
                    </TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>{new Date(row.dueDate).toLocaleDateString('pt-BR')}</TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.competenceDate ? new Date(row.competenceDate).toLocaleDateString('pt-BR', { year: 'numeric', month: '2-digit' }) : '-'}</TableCell>
                    <TableCell align="center">
                      <Chip size="small" label={statusMeta(row.status).label} color={statusMeta(row.status).color} sx={{ minWidth: 110, '& .MuiChip-label': { width: '100%', textAlign: 'center', px: 0 } }} />
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
            onPageChange={(_e, p) => handleChangePage(_e, p)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25, 50]}
          />
        </Paper>
      )}

      <Dialog open={detailOpen} onClose={() => setDetailOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Conta a receber</DialogTitle>
        <DialogContent dividers>
          {detailLoading && (
            <Typography>Carregando...</Typography>
          )}
          {!detailLoading && detail && (
            <Stack spacing={1}>
              <Typography>Cliente: <strong>{detail.customer?.name || detail.customerName || '-'}</strong> {detail.customer?.email || detail.customerEmail ? `(${detail.customer?.email || detail.customerEmail})` : ''}</Typography>
              <Typography>Valor: <strong>{Number(detail.amount).toFixed(2)}</strong></Typography>
              <Typography>Vencimento: <strong>{new Date(detail.dueDate).toLocaleDateString('pt-BR')}</strong></Typography>
              <Typography>Mês de competência: <strong>{detail.competenceDate ? new Date(detail.competenceDate).toLocaleDateString('pt-BR', { year: 'numeric', month: '2-digit' }) : '-'}</strong></Typography>
              <Typography>Status: <strong>{statusMeta(detail.status).label}</strong></Typography>
              {detail.receivedAt && (
                <Typography>Recebido em: <strong>{new Date(detail.receivedAt).toLocaleDateString('pt-BR')}</strong></Typography>
              )}

            {!!detail.sales?.length && (
              <Box sx={{ mt: 1 }}>
                <Typography variant="subtitle2">Vendas</Typography>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Data</TableCell>
                      <TableCell align="right">Quantidade</TableCell>
                      <TableCell align="right">Valor unitário</TableCell>
                      <TableCell align="right">Total</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {detail.sales.map((s) => (
                      <TableRow key={s.id}>
                        <TableCell>{new Date(s.saleDate).toLocaleDateString('pt-BR')}</TableCell>
                        <TableCell align="right">{s.quantity}</TableCell>
                        <TableCell align="right">{Number(s.unitPrice).toFixed(2)}</TableCell>
                        <TableCell align="right">{Number(s.totalValue).toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>
            )}

            {(detail.reportDownloadUrl || (detail.status === 'RECEIVED' && detail.paymentReceiptDownloadUrl)) && (
              <Box sx={{ mt: 1 }}>
                <Typography variant="subtitle2">Downloads</Typography>
                {detail.reportDownloadUrl && (
                  <a href={detail.reportDownloadUrl} target="_blank" rel="noreferrer">Baixar relatório da venda</a>
                )}
                {detail.status === 'RECEIVED' && detail.paymentReceiptDownloadUrl && (
                  <>
                    <br />
                    <a href={detail.paymentReceiptDownloadUrl} target="_blank" rel="noreferrer">Baixar comprovante de pagamento</a>
                  </>
                )}
              </Box>
            )}
          </Stack>
        )}
      </DialogContent>
      <DialogActions>
        {detail && detail.status !== 'RECEIVED' && (
          <Button variant="contained" color="success" onClick={() => setSettleOpen(true)} sx={{ mr: 1 }}>
            Dar baixa
          </Button>
        )}
        <Button onClick={() => setDetailOpen(false)}>Fechar</Button>
      </DialogActions>
    </Dialog>
    

      <CreateAccountReceivableDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={async () => {
          setCreateOpen(false);
          setPage(0);
          await load();
        }}
      />

      <SettleAccountReceivableDialog
        open={settleOpen}
        receivableId={detail?.id || null}
        onClose={() => setSettleOpen(false)}
        onSettled={async () => {
          setSettleOpen(false);
          // refresh current detail and list
          if (detail?.id) {
            const fresh = await accountsReceivableService.getById(detail.id);
            setDetail(fresh);
          }
          await load();
        }}
      />
    </Box>
  );
};

export default AccountsReceivableSection;
