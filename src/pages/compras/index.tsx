import React, { useEffect, useMemo, useState } from 'react';
import { Box, Paper, Stack, TextField, MenuItem, Button, Typography, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, TablePagination, Dialog, DialogTitle, DialogContent, DialogActions, Divider, Grid, Autocomplete, Link, useMediaQuery } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { purchasesService, PaginatedPurchases, PurchaseListItem, CreatePurchaseRequest, PurchaseDetails } from '../../services/purchasesService';
import { suppliersService, Supplier } from '../../services/suppliersService';
import ModalSucess from './componentes/ModalSucess';

const Compras: React.FC = () => {
  const [data, setData] = useState<PaginatedPurchases | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState<{ itemType?: string; dateFrom?: string; dateTo?: string; supplierQuery?: string }>({});
  const [draftFilters, setDraftFilters] = useState<{ itemType?: string; dateFrom?: string; dateTo?: string; supplierQuery?: string }>({});
  const [itemTypes, setItemTypes] = useState<string[]>([]);

  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [successOpen, setSuccessOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successDetails, setSuccessDetails] = useState<PurchaseDetails | null>(null);
  const [supplierQuery, setSupplierQuery] = useState('');
  const [supplierResults, setSupplierResults] = useState<Supplier[]>([]);
  const [form, setForm] = useState<{ itemType: string; purchaseDate: string; unitPrice: string; quantity: string; supplierId: string; dueDate: string; description?: string }>({
    itemType: '',
    purchaseDate: new Date().toISOString().slice(0, 10),
    unitPrice: '',
    quantity: '',
    supplierId: '',
    dueDate: '',
    description: '',
  });
  const [receiptFile, setReceiptFile] = useState<File | null>(null);

  useEffect(() => {
    const loadTypes = async () => {
      try {
        const types = await purchasesService.listItemTypes();
        setItemTypes(types || []);
      } catch {
        setItemTypes([]);
      }
    };
    loadTypes();
  }, []);

  useEffect(() => {
    const loadSuppliers = async () => {
      if (!createOpen) return;
      try {
        setSupplierQuery('');
        const all = await suppliersService.listAll();
        setSupplierResults(all);
      } catch {
        setSupplierResults([]);
      }
    };
    loadSuppliers();
  }, [createOpen]);

  const queryParams = useMemo(() => ({
    itemType: filters.itemType,
    dateFrom: filters.dateFrom,
    dateTo: filters.dateTo,
    supplierQuery: filters.supplierQuery,
    page: page + 1,
    pageSize: rowsPerPage,
  }), [filters.itemType, filters.dateFrom, filters.dateTo, filters.supplierQuery, page, rowsPerPage]);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await purchasesService.list(queryParams);
      setData(res);
    } catch (e: any) {
      setError(e?.message || 'Erro ao carregar compras');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, rowsPerPage, filters.itemType, filters.dateFrom, filters.dateTo, filters.supplierQuery]);

  const handleChangePage = (_: unknown, newPage: number) => setPage(newPage);
  const handleChangeRowsPerPage = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

  const isMobile = useMediaQuery('(max-width:600px)');
  const visibleColSpan = isMobile ? 4 : 6;

  return (
    <Box p={2}>
      <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ xs: 'stretch', sm: 'center' }} justifyContent="space-between" spacing={1} mb={2}>
        <Typography variant="h5">Compras</Typography>
        <Button
          variant="contained"
          onClick={() => { setCreateError(null); setCreateOpen(true); }}
          sx={{ width: { xs: '100%', sm: 'auto' } }}
        >
          Nova compra
        </Button>
      </Stack>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          alignItems={{ xs: 'stretch', sm: 'center' }}
          flexWrap={{ sm: 'wrap' }}
          useFlexGap
        >
          <TextField
            select
            size="small"
            label="Tipo de Item"
            value={draftFilters.itemType ?? ''}
            onChange={(e) => { setDraftFilters((f) => ({ ...f, itemType: e.target.value || undefined })); }}
            fullWidth
            sx={{ flex: 1, minWidth: { xs: 0, sm: 220 } }}
          >
            <MenuItem value="">Todos</MenuItem>
            {itemTypes.map((t) => (
              <MenuItem key={t} value={t}>{t}</MenuItem>
            ))}
          </TextField>

          <TextField
            size="small"
            label="Fornecedor (nome/email)"
            value={draftFilters.supplierQuery ?? ''}
            onChange={(e) => { setDraftFilters((f) => ({ ...f, supplierQuery: e.target.value || undefined })); }}
            placeholder="Buscar..."
            fullWidth
            sx={{ flex: 2, minWidth: { xs: 0, sm: 260 } }}
          />

          <TextField
            size="small"
            label="De"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={draftFilters.dateFrom ?? ''}
            onChange={(e) => { setDraftFilters((f) => ({ ...f, dateFrom: e.target.value || undefined })); }}
            fullWidth
            sx={{ flex: 1, minWidth: { xs: 0, sm: 170 } }}
          />

          <TextField
            size="small"
            label="Até"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={draftFilters.dateTo ?? ''}
            onChange={(e) => { setDraftFilters((f) => ({ ...f, dateTo: e.target.value || undefined })); }}
            fullWidth
            sx={{ flex: 1, minWidth: { xs: 0, sm: 170 } }}
          />

          <Button
            variant="contained"
            onClick={() => { setFilters(draftFilters); setPage(0); }}
            sx={{ width: { xs: '100%', sm: 'auto' } }}
          >
            Filtrar
          </Button>
          <Button
            variant="outlined"
            onClick={() => { setDraftFilters({}); setFilters({}); setPage(0); }}
            sx={{ width: { xs: '100%', sm: 'auto' } }}
          >
            Limpar
          </Button>
        </Stack>
      </Paper>

      <Paper>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Data</TableCell>
                <TableCell>Tipo de Item</TableCell>
                <TableCell>Fornecedor</TableCell>
                <TableCell align="right">Qtd</TableCell>
                <TableCell align="right" sx={{ display: { xs: 'none', sm: 'table-cell' } }}>PU</TableCell>
                <TableCell align="right" sx={{ display: { xs: 'none', sm: 'table-cell' } }}>Total</TableCell>
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
                <TableRow><TableCell colSpan={visibleColSpan}>Nenhuma compra encontrada</TableCell></TableRow>
              )}
              {!loading && !error && data?.items?.map((row: PurchaseListItem) => (
                <React.Fragment key={row.id}>
                <TableRow
                  hover
                  onClick={async () => {
                    try {
                      const details = await purchasesService.getById(row.id);
                      setSuccessDetails(details);
                      setSuccessOpen(true);
                    } catch (e: any) {
                      setErrorMsg(e?.message || 'Erro ao carregar detalhes');
                    }
                  }}
                  sx={{ cursor: 'pointer' }}
                >
                  <TableCell>{new Date(row.purchaseDate).toLocaleDateString()}</TableCell>
                  <TableCell>{row.itemType}</TableCell>
                  <TableCell>
                    {row.supplierName || '-'}
                    {row.supplierEmail ? ` (${row.supplierEmail})` : ''}
                  </TableCell>
                  <TableCell align="right">{row.quantity}</TableCell>
                  <TableCell align="right" sx={{ display: { xs: 'none', sm: 'table-cell' } }}>{Number(row.unitPrice ?? 0).toFixed(2)}</TableCell>
                  <TableCell align="right" sx={{ display: { xs: 'none', sm: 'table-cell' } }}>{Number(row.totalValue ?? 0).toFixed(2)}</TableCell>
                  
                </TableRow>
                
                </React.Fragment>
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

      {/* Create Purchase Dialog */}
      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 2 } }}>
        <DialogTitle>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="h6">Nova compra</Typography>
          </Stack>
        </DialogTitle>
        <DialogContent dividers sx={{ bgcolor: 'background.default' }}>
          <Stack spacing={2}>
            {createError && <Typography color="error">{createError}</Typography>}
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    select
                    label="Tipo de Item"
                    value={form.itemType}
                    onChange={(e) => setForm((f) => ({ ...f, itemType: e.target.value }))}
                    required
                    fullWidth
                  >
                    <MenuItem value="">Selecione</MenuItem>
                    {itemTypes.map((t) => (
                      <MenuItem key={t} value={t}>{t}</MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Data da compra"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    value={form.purchaseDate ?? ''}
                    onChange={(e) => setForm((f) => ({ ...f, purchaseDate: e.target.value }))}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Preço unitário"
                    type="number"
                    inputProps={{ step: '0.01', min: '0' }}
                    value={form.unitPrice}
                    onChange={(e) => setForm((f) => ({ ...f, unitPrice: e.target.value }))}
                    required
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Quantidade"
                    type="number"
                    inputProps={{ step: '1', min: '1' }}
                    value={form.quantity}
                    onChange={(e) => setForm((f) => ({ ...f, quantity: e.target.value }))}
                    required
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Total (calculado)"
                    value={(() => {
                      const q = Number(form.quantity);
                      const pu = Number(form.unitPrice);
                      if (!Number.isFinite(q) || !Number.isFinite(pu)) return '';
                      return (q * pu).toFixed(2);
                    })()}
                    InputProps={{ readOnly: true }}
                    fullWidth
                  />
                </Grid>
              </Grid>
            </Paper>

            <Divider />

            {/* Supplier search with Autocomplete */}
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Autocomplete
                    options={supplierResults}
                    getOptionLabel={(o) => o ? `${o.name}${o.email ? ` (${o.email})` : ''}` : ''}
                    value={supplierResults.find(s => s.id === form.supplierId) || null}
                    onChange={(_e, val) => setForm((f) => ({ ...f, supplierId: val?.id || '' }))}
                    inputValue={supplierQuery}
                    onInputChange={async (_e, v) => {
                      setSupplierQuery(v);
                      try {
                        if (!v || v.trim().length === 0) {
                          const all = await suppliersService.listAll();
                          setSupplierResults(all);
                        } else {
                          const results = await suppliersService.search({ name: v, email: v });
                          setSupplierResults(results);
                        }
                      } catch {
                        setSupplierResults([]);
                      }
                    }}
                    renderInput={(params) => (
                      <TextField {...params} label="Fornecedor (nome/email)" placeholder="Buscar e selecionar" fullWidth />
                    )}
                  />
                </Grid>
              </Grid>
            </Paper>

            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Data de vencimento"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    value={form.dueDate}
                    onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))}
                    required
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Descrição (opcional)"
                    value={form.description ?? ''}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button variant="outlined" component="label">
                    Anexar recibo (PDF opcional)
                    <input type="file" hidden accept="application/pdf" onChange={(e) => {
                      const f = e.target.files?.[0] || null;
                      setReceiptFile(f);
                    }} />
                  </Button>
                  {receiptFile && (
                    <Typography variant="body2" sx={{ ml: 2, display: 'inline' }}>{receiptFile.name}</Typography>
                  )}
                </Grid>
              </Grid>
            </Paper>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setCreateOpen(false)} disabled={creating} variant="outlined">Cancelar</Button>
          <Button
            variant="contained"
            disabled={creating}
            onClick={async () => {
              setCreateError(null);
              if (!form.itemType) { setCreateError('Selecione o tipo de item'); return; }
              const qty = Number(form.quantity);
              const pu = Number(form.unitPrice);
              if (!Number.isFinite(qty) || qty <= 0) { setCreateError('Quantidade inválida'); return; }
              if (!Number.isFinite(pu) || pu < 0) { setCreateError('Preço unitário inválido'); return; }
              if (!form.dueDate) { setCreateError('Informe a data de vencimento'); return; }
              if (!form.supplierId) { setCreateError('Informe o Fornecedor'); return; }
              const payload: CreatePurchaseRequest = {
                itemType: form.itemType,
                purchaseDate: form.purchaseDate,
                unitPrice: pu,
                quantity: qty,
                supplierId: form.supplierId,
                dueDate: new Date(form.dueDate).toISOString(),
                description: form.description || undefined,
              };
              setCreating(true);
              try {
                const created = await purchasesService.create(payload, receiptFile || undefined);
                setCreateOpen(false);
                setSuccessDetails(created);
                setSuccessOpen(true);
                setForm({ itemType: '', purchaseDate: new Date().toISOString().slice(0, 10), unitPrice: '', quantity: '', supplierId: '', dueDate: '', description: '' });
                setSupplierQuery('');
                setSupplierResults([]);
                setReceiptFile(null);
                setPage(0);
                await load();
              } catch (e: any) {
                setErrorMsg(e?.message || 'Erro ao criar compra');
              } finally {
                setCreating(false);
              }
            }}
          >
            {creating ? 'Salvando...' : 'Salvar'}
          </Button>
        </DialogActions>
      </Dialog>

      <ModalSucess
        open={successOpen}
        details={successDetails}
        onClose={() => { setSuccessOpen(false); setSuccessDetails(null); }}
      />

      {/* Error modal */}
      <Dialog open={!!errorMsg} onClose={() => setErrorMsg(null)} PaperProps={{ sx: { borderRadius: 2 } }}>
        <DialogTitle>
          <Stack direction="row" spacing={1} alignItems="center">
            <ErrorOutlineIcon color="error" />
            <Typography variant="h6">Erro</Typography>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Typography>{errorMsg}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setErrorMsg(null)} variant="contained" color="error">OK</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Compras;
