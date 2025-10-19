import React, { useEffect, useMemo, useState } from 'react';
import { Box, Paper, Stack, TextField, Button, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow } from '@mui/material';
import { suppliersService, Supplier } from '../../../services/suppliersService';
import CreateSupplierModal from '../components/CreateSupplierModal';

const SuppliersSection: React.FC = () => {
  const [data, setData] = useState<Supplier[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openCreate, setOpenCreate] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await suppliersService.list(query);
      setData(list);
    } catch (e: any) {
      setError(e?.message || 'Erro ao carregar fornecedores');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const paginated = useMemo(() => {
    const start = page * rowsPerPage;
    const end = start + rowsPerPage;
    return data.slice(start, end);
  }, [data, page, rowsPerPage]);

  const applyFilter = async () => {
    setPage(0);
    await load();
  };

  return (
    <Box p={2}>
      <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ xs: 'stretch', sm: 'center' }} justifyContent="space-between" spacing={1} mb={2}>
        <Typography variant="h5">Fornecedores</Typography>
        <Button variant="contained" onClick={() => setOpenCreate(true)} sx={{ width: { xs: '100%', sm: 'auto' } }}>Novo fornecedor</Button>
      </Stack>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'stretch', sm: 'center' }} useFlexGap flexWrap={{ sm: 'wrap' }}>
          <TextField
            size="small"
            label="Nome ou Email"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar..."
            fullWidth
            sx={{ flex: 2, minWidth: { xs: 0, sm: 260 } }}
          />
          <Button variant="contained" onClick={applyFilter} sx={{ width: { xs: '100%', sm: 'auto' } }}>Filtrar</Button>
          <Button variant="outlined" onClick={() => { setQuery(''); applyFilter(); }} sx={{ width: { xs: '100%', sm: 'auto' } }}>Limpar</Button>
        </Stack>
      </Paper>

      <Paper>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Nome</TableCell>
                <TableCell>Email</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading && (
                <TableRow><TableCell colSpan={2}>Carregando...</TableCell></TableRow>
              )}
              {error && !loading && (
                <TableRow><TableCell colSpan={2} style={{ color: 'red' }}>{error}</TableCell></TableRow>
              )}
              {!loading && !error && data.length === 0 && (
                <TableRow><TableCell colSpan={2}>Nenhum fornecedor encontrado</TableCell></TableRow>
              )}
              {!loading && !error && paginated.map((s) => (
                <TableRow key={s.id} hover>
                  <TableCell>{s.name}</TableCell>
                  <TableCell>{s.email || '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={data.length}
          page={page}
          onPageChange={(_e, p) => setPage(p)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
          rowsPerPageOptions={[5, 10, 25, 50]}
        />
      </Paper>

      <CreateSupplierModal
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        onSubmit={async (payload) => {
          await suppliersService.create(payload);
          await load();
        }}
      />
    </Box>
  );
};

export default SuppliersSection;
