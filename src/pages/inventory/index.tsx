import React, { useEffect, useMemo, useState } from 'react';
import { Box, Stack, Typography, Paper, Button } from '@mui/material';
import FiltersBar, { InventoryFilters } from './components/FiltersBar';
import MovementsTable from './components/MovementsTable';
import MovementDetailsDialog from './components/MovementDetailsDialog';
import CreateInputDialog from './components/CreateInputDialog';
import { inventoryService, PaginatedUnifiedResponse, UnifiedMovement } from '../../services/inventoryService';

const InventoryPage: React.FC = () => {
  const [data, setData] = useState<PaginatedUnifiedResponse | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [detail, setDetail] = useState<UnifiedMovement | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);

  const [filters, setFilters] = useState<InventoryFilters>({});

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

  const handleOpenDetails = async (id: string) => {
    try {
      const d = await inventoryService.getUnifiedMovementById(id);
      setDetail(d);
    } catch {}
  };

  const handleCreate = async (payload: { itemType: string; quantity: number; unitPrice: number; total: number; movementDate?: string; supplierId?: string }) => {
    setCreateLoading(true);
    try {
      await inventoryService.createInputMovement(payload);
      setCreateOpen(false);
      setPage(0);
      await load();
    } finally {
      setCreateLoading(false);
    }
  };

  return (
    <Box p={2}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5">Estoque - Movimentações</Typography>
        <Button variant="contained" onClick={() => setCreateOpen(true)}>Criar entrada</Button>
      </Stack>

      <Paper sx={{ p: 2, mb: 2 }}>
        <FiltersBar
          filters={filters}
          onChange={(f) => setFilters(f)}
          onClear={() => { setFilters({}); setPage(0); }}
        />
      </Paper>

      <MovementsTable
        data={data}
        loading={loading}
        error={error}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={(_e, p) => setPage(p)}
        onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
        onDetails={handleOpenDetails}
      />

      <MovementDetailsDialog open={!!detail} movement={detail} onClose={() => setDetail(null)} />

      <CreateInputDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSubmit={handleCreate}
      />
    </Box>
  );
};

export default InventoryPage;
