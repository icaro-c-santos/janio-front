import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Chip,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Divider,
  TextField,
  MenuItem,
} from '@mui/material';
import { inventoryService, PaginatedUnifiedResponse, UnifiedMovement } from '../services/inventoryService';
import { suppliersService, Supplier } from '../services/suppliersService';

const directionLabel = (d: UnifiedMovement['direction']) => d === 'entrada' ? 'Entrada' : 'Saída';

export default function Estoque() {
  const [data, setData] = useState<PaginatedUnifiedResponse | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [detail, setDetail] = useState<UnifiedMovement | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [createError, setCreateError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<{ itemType: string; quantity: string; unitPrice: string; supplierId?: string; movementDate?: string }>({
    itemType: '',
    quantity: '',
    unitPrice: '',
    supplierId: undefined,
    movementDate: new Date().toISOString().slice(0,10),
  });

  const [filters, setFilters] = useState<{ itemType?: string; direction?: 'entrada' | 'saida'; dateFrom?: string; dateTo?: string; }>(() => ({}));

  const queryParams = useMemo(() => ({
    ...filters,
    page: page + 1,
    pageSize: rowsPerPage,
  }), [filters, page, rowsPerPage]);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await inventoryService.getUnifiedMovements(queryParams);
      setData(res);
    } catch (e: any) {
      setError(e?.message || 'Erro ao carregar movimentos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, rowsPerPage, filters.itemType, filters.direction, filters.dateFrom, filters.dateTo]);

  const handleChangePage = (_: unknown, newPage: number) => setPage(newPage);
  const handleChangeRowsPerPage = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

  return (
    <Box p={2}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5">Estoque - Movimentações</Typography>
        <Button variant="contained" onClick={async () => {
          setCreateError(null);
          setCreateOpen(true);
          try {
            const list = await suppliersService.listAll();
            setSuppliers(list);
          } catch (e:any) {
            // keep suppliers empty if error
          }
        }}>Criar entrada</Button>
      </Stack>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField
            select
            size="small"
            label="Tipo de Item"
            value={filters.itemType ?? ''}
            onChange={(e) => setFilters((f) => ({ ...f, itemType: e.target.value || undefined }))}
            sx={{ minWidth: 200 }}
          >
            <MenuItem value="">Todos</MenuItem>
            <MenuItem value="COCO">COCO</MenuItem>
            <MenuItem value="GARRAFA_DESCARTAVEL">GARRAFA_DESCARTAVEL</MenuItem>
            <MenuItem value="GARRAFA_REUTILIZAVEL">GARRAFA_REUTILIZAVEL</MenuItem>
            <MenuItem value="ROTULO">ROTULO</MenuItem>
            <MenuItem value="ETIQUETA">ETIQUETA</MenuItem>
            <MenuItem value="CLORO">CLORO</MenuItem>
          </TextField>

          <TextField
            select
            size="small"
            label="Direção"
            value={filters.direction ?? ''}
            onChange={(e) => setFilters((f) => ({ ...f, direction: (e.target.value as any) || undefined }))}
            sx={{ minWidth: 160 }}
          >
            <MenuItem value="">Todas</MenuItem>
            <MenuItem value="entrada">Entrada</MenuItem>
            <MenuItem value="saida">Saída</MenuItem>
          </TextField>

          <TextField
            size="small"
            label="De"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={filters.dateFrom ?? ''}
            onChange={(e) => setFilters((f) => ({ ...f, dateFrom: e.target.value || undefined }))}
          />

          <TextField
            size="small"
            label="Até"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={filters.dateTo ?? ''}
            onChange={(e) => setFilters((f) => ({ ...f, dateTo: e.target.value || undefined }))}
          />

          <Button variant="outlined" onClick={() => { setFilters({}); setPage(0); }}>Limpar</Button>
        </Stack>
      </Paper>

      <Paper>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Tipo</TableCell>
                <TableCell>Item</TableCell>
                <TableCell align="right">Quantidade</TableCell>
                <TableCell>Data</TableCell>
                <TableCell>Detalhes</TableCell>
                <TableCell align="right">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading && (
                <TableRow>
                  <TableCell colSpan={6}>Carregando...</TableCell>
                </TableRow>
              )}
              {error && !loading && (
                <TableRow>
                  <TableCell colSpan={6} color="error.main">{error}</TableCell>
                </TableRow>
              )}
              {!loading && !error && data?.items?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6}>Nenhuma movimentação encontrada</TableCell>
                </TableRow>
              )}
              {!loading && !error && data?.items?.map((row) => (
                <TableRow key={row.id} hover>
                  <TableCell>
                    <Chip label={directionLabel(row.direction)} color={row.direction === 'entrada' ? 'success' : 'warning'} size="small" />
                  </TableCell>
                  <TableCell>{row.itemType}</TableCell>
                  <TableCell align="right">{row.quantity}</TableCell>
                  <TableCell>{new Date(row.movementDate).toLocaleString()}</TableCell>
                  <TableCell>
                    {row.direction === 'entrada' ? (
                      <Stack>
                        {row.supplierName && <Typography variant="body2">Fornecedor: {row.supplierName}</Typography>}
                        {row.unitPrice != null && <Typography variant="body2">PU: {Number(row.unitPrice).toFixed(2)}</Typography>}
                        {row.total != null && <Typography variant="body2">Total: {Number(row.total).toFixed(2)}</Typography>}
                      </Stack>
                    ) : (
                      <Stack>
                        {row.reason && <Typography variant="body2">Razão: {row.reason}</Typography>}
                        {row.saleCustomerName && <Typography variant="body2">Cliente: {row.saleCustomerName}</Typography>}
                        {row.saleId && <Typography variant="body2">Venda: {row.saleId}</Typography>}
                      </Stack>
                    )}
                  </TableCell>
                  <TableCell align="right">
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={async () => {
                        try {
                          const d = await inventoryService.getUnifiedMovementById(row.id);
                          setDetail(d);
                        } catch (e) {}
                      }}
                    >
                      Detalhes
                    </Button>
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
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25, 50]}
        />
      </Paper>

      <Dialog open={!!detail} onClose={() => setDetail(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Detalhes da Movimentação</DialogTitle>
        <DialogContent dividers>
          {detail && (
            <Stack spacing={1}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Chip label={directionLabel(detail.direction)} color={detail.direction === 'entrada' ? 'success' : 'warning'} size="small" />
                <Typography variant="subtitle1">{detail.itemType}</Typography>
              </Stack>
              <Divider />
              <Typography variant="body2">Quantidade: {detail.quantity}</Typography>
              <Typography variant="body2">Data: {new Date(detail.movementDate).toLocaleString()}</Typography>
              {detail.direction === 'entrada' ? (
                <>
                  {detail.supplierName && <Typography variant="body2">Fornecedor: {detail.supplierName}</Typography>}
                  {detail.supplierEmail && <Typography variant="body2">Email: {detail.supplierEmail}</Typography>}
                  {detail.unitPrice != null && <Typography variant="body2">Preço Unitário: {Number(detail.unitPrice).toFixed(2)}</Typography>}
                  {detail.total != null && <Typography variant="body2">Total: {Number(detail.total).toFixed(2)}</Typography>}
                </>
              ) : (
                <>
                  {detail.reason && <Typography variant="body2">Razão: {detail.reason}</Typography>}
                  {detail.saleCustomerName && (
                    <Typography variant="body2">Cliente: {detail.saleCustomerName}</Typography>
                  )}
                  {detail.saleId && <Typography variant="body2">Venda: {detail.saleId}</Typography>}
                </>
              )}
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetail(null)}>Fechar</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Nova entrada</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2}>
            {createError && (
              <Typography color="error">{createError}</Typography>
            )}
            <TextField
              select
              label="Tipo de Item"
              value={form.itemType}
              onChange={(e) => setForm((f) => ({ ...f, itemType: e.target.value }))}
              required
            >
              <MenuItem value="">Selecione</MenuItem>
              <MenuItem value="COCO">COCO</MenuItem>
              <MenuItem value="GARRAFA_DESCARTAVEL">GARRAFA_DESCARTAVEL</MenuItem>
              <MenuItem value="GARRAFA_REUTILIZAVEL">GARRAFA_REUTILIZAVEL</MenuItem>
              <MenuItem value="ROTULO">ROTULO</MenuItem>
              <MenuItem value="ETIQUETA">ETIQUETA</MenuItem>
              <MenuItem value="CLORO">CLORO</MenuItem>
            </TextField>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                label="Quantidade"
                type="number"
                value={form.quantity}
                onChange={(e) => setForm((f) => ({ ...f, quantity: e.target.value }))}
                inputProps={{ step: '1', min: '0' }}
                required
                fullWidth
              />
              <TextField
                label="Preço Unitário"
                type="number"
                value={form.unitPrice}
                onChange={(e) => setForm((f) => ({ ...f, unitPrice: e.target.value }))}
                inputProps={{ step: '0.01', min: '0' }}
                required
                fullWidth
              />
            </Stack>

            <TextField
              select
              label="Fornecedor (opcional)"
              value={form.supplierId ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, supplierId: e.target.value || undefined }))}
            >
              <MenuItem value="">Sem fornecedor</MenuItem>
              {suppliers.map((s) => (
                <MenuItem key={s.id} value={s.id}>{s.name}{s.email ? ` - ${s.email}` : ''}</MenuItem>
              ))}
            </TextField>

            <TextField
              label="Data da entrada"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={form.movementDate ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, movementDate: e.target.value }))}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateOpen(false)} disabled={creating}>Cancelar</Button>
          <Button
            variant="contained"
            disabled={creating}
            onClick={async () => {
              setCreateError(null);
              // basic validation
              const qty = Number(form.quantity);
              const pu = Number(form.unitPrice);
              if (!form.itemType) { setCreateError('Selecione o tipo de item'); return; }
              if (!Number.isFinite(qty) || qty <= 0) { setCreateError('Quantidade inválida'); return; }
              if (!Number.isFinite(pu) || pu < 0) { setCreateError('Preço unitário inválido'); return; }
              const total = qty * pu;
              setCreating(true);
              try {
                await inventoryService.createInputMovement({
                  itemType: form.itemType,
                  quantity: qty,
                  unitPrice: pu,
                  total,
                  movementDate: form.movementDate ? new Date(form.movementDate).toISOString() : undefined,
                  supplierId: form.supplierId || undefined,
                });
                setCreateOpen(false);
                // reset and refresh
                setForm({ itemType: '', quantity: '', unitPrice: '', supplierId: undefined, movementDate: new Date().toISOString().slice(0,10) });
                setPage(0);
                await load();
              } catch (e:any) {
                setCreateError(e?.message || 'Erro ao criar entrada');
              } finally {
                setCreating(false);
              }
            }}
          >
            {creating ? 'Salvando...' : 'Salvar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
