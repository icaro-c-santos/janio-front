import React, { useEffect, useMemo, useState } from 'react';
import { Box, Paper, Stack, TextField, MenuItem, Button, Typography, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, TablePagination } from '@mui/material';
import { purchasesService, PaginatedPurchases, PurchaseListItem } from '../services/purchasesService';


const Compras: React.FC = () => {
  const [data, setData] = useState<PaginatedPurchases | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState<{ itemType?: string; dateFrom?: string; dateTo?: string; supplierQuery?: string }>({});
  const [itemTypes, setItemTypes] = useState<string[]>([]);

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

  return (
    <Box p={2}>
      <Typography variant="h5" mb={2}>Compras</Typography>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'stretch', sm: 'center' }}>
          <TextField
            select
            size="small"
            label="Tipo de Item"
            value={filters.itemType ?? ''}
            onChange={(e) => { setFilters((f) => ({ ...f, itemType: e.target.value || undefined })); setPage(0); }}
            sx={{ minWidth: 220 }}
          >
            <MenuItem value="">Todos</MenuItem>
            {itemTypes.map((t) => (
              <MenuItem key={t} value={t}>{t}</MenuItem>
            ))}
          </TextField>

          <TextField
            size="small"
            label="Fornecedor (nome/email)"
            value={filters.supplierQuery ?? ''}
            onChange={(e) => { setFilters((f) => ({ ...f, supplierQuery: e.target.value || undefined })); setPage(0); }}
            placeholder="Buscar..."
            sx={{ minWidth: 260 }}
          />

          <TextField
            size="small"
            label="De"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={filters.dateFrom ?? ''}
            onChange={(e) => { setFilters((f) => ({ ...f, dateFrom: e.target.value || undefined })); setPage(0); }}
          />

          <TextField
            size="small"
            label="Até"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={filters.dateTo ?? ''}
            onChange={(e) => { setFilters((f) => ({ ...f, dateTo: e.target.value || undefined })); setPage(0); }}
          />

          <Button variant="outlined" onClick={() => { setFilters({}); setPage(0); }}>Limpar</Button>
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
                <TableCell align="right">PU</TableCell>
                <TableCell align="right">Total</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading && (
                <TableRow><TableCell colSpan={6}>Carregando...</TableCell></TableRow>
              )}
              {error && !loading && (
                <TableRow><TableCell colSpan={6} style={{ color: 'red' }}>{error}</TableCell></TableRow>
              )}
              {!loading && !error && (data?.items?.length ?? 0) === 0 && (
                <TableRow><TableCell colSpan={6}>Nenhuma compra encontrada</TableCell></TableRow>
              )}
              {!loading && !error && data?.items?.map((row: PurchaseListItem) => (
                <TableRow key={row.id} hover>
                  <TableCell>{new Date(row.purchaseDate).toLocaleDateString()}</TableCell>
                  <TableCell>{row.itemType}</TableCell>
                  <TableCell>
                    {row.supplierName || '-'}
                    {row.supplierEmail ? ` (${row.supplierEmail})` : ''}
                  </TableCell>
                  <TableCell align="right">{row.quantity}</TableCell>
                  <TableCell align="right">{Number(row.unitPrice ?? 0).toFixed(2)}</TableCell>
                  <TableCell align="right">{Number(row.totalValue ?? 0).toFixed(2)}</TableCell>
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
    </Box>
  );
};

export default Compras;
