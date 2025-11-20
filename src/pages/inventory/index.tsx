import React, { useEffect, useMemo, useState } from 'react';
import { Box, Stack, Typography, Paper, Button, Tabs, Tab, useMediaQuery } from '@mui/material';
import FiltersBar, { InventoryFilters } from './components/FiltersBar';
import MovementsTable from './components/MovementsTable';
import MovementDetailsDialog from './components/MovementDetailsDialog';
import CreateInputDialog from './components/CreateInputDialog';
import CreateOutputDialog from './components/CreateOutputDialog';
import CreateCocoKitoDialog from './components/CreateCocoKitoDialog';
import StockTable from './components/StockTable';
import MobileMovementCard from './components/MobileMovementCard';
import { inventoryService, PaginatedUnifiedResponse, UnifiedMovement, InventoryItem } from '../../services/inventoryService';

const InventoryPage: React.FC = () => {
  const isNarrow = useMediaQuery('(max-width:800px)');
  const [tab, setTab] = useState(0);
  const [data, setData] = useState<PaginatedUnifiedResponse | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stock, setStock] = useState<InventoryItem[] | null>(null);
  const [stockLoading, setStockLoading] = useState(false);
  const [stockError, setStockError] = useState<string | null>(null);

  const [detail, setDetail] = useState<UnifiedMovement | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [createOutputOpen, setCreateOutputOpen] = useState(false);
  const [createOutputLoading, setCreateOutputLoading] = useState(false);
const [cocoKitoOpen, setCocoKitoOpen] = useState(false);
  const [filters, setFilters] = useState<InventoryFilters>({}); // draft filters (UI)
  const [appliedFilters, setAppliedFilters] = useState<InventoryFilters>({}); // applied filters (query)

  const handleCocoKitoSuccess = () => {
    setPage(0);
    loadMovements();
    if (tab === 1) {
      loadStock();
    }
  };

  const queryParams = useMemo(() => ({
    ...appliedFilters,
    page: page + 1,
    pageSize: rowsPerPage,
  }), [appliedFilters, page, rowsPerPage]);

  const loadMovements = async () => {
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

  const handleCreateOutput = async (payload: { itemType: string; quantity: number; movementDate: string; reason?: string }) => {
    setCreateOutputLoading(true);
    try {
      await inventoryService.createOutputMovement(payload);
      setCreateOutputOpen(false);
      setPage(0);
      await loadMovements();
    } finally {
      setCreateOutputLoading(false);
    }
  };

  const loadStock = async () => {
    setStockLoading(true);
    setStockError(null);
    try {
      const res = await inventoryService.getCurrentStock();
      setStock(res);
    } catch (e: any) {
      setStockError(e?.message || 'Erro ao carregar estoque atual');
    } finally {
      setStockLoading(false);
    }
  };

  useEffect(() => {
    if (tab === 0) {
      loadMovements();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, page, rowsPerPage, appliedFilters.itemType, appliedFilters.direction, appliedFilters.dateFrom, appliedFilters.dateTo]);

  useEffect(() => {
    if (tab === 1) {
      loadStock();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  const handleOpenDetails = async (id: string) => {
    try {
      const d = await inventoryService.getUnifiedMovementById(id);
      setDetail(d);
    } catch {}
  };

  const handleCreate = async (payload: { itemType: string; quantity: number; movementDate: string; purchaseId?: string }) => {
    setCreateLoading(true);
    try {
      await inventoryService.createInputMovement(payload);
      setCreateOpen(false);
      setPage(0);
      await loadMovements();
    } finally {
      setCreateLoading(false);
    }
  };

  return (
    <Box p={2}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5">Estoque</Typography>
        {tab === 0 && (
          <Box display="flex" gap={1}>
            <Button variant="contained" onClick={() => setCreateOpen(true)}>Criar entrada</Button>
            <Button 
              variant="contained" 
              color="secondary" 
              onClick={() => setCocoKitoOpen(true)}
              sx={{ backgroundColor: '#4caf50', '&:hover': { backgroundColor: '#388e3c' } }}
            >
              Entrada de Coco
            </Button>
            <Button variant="outlined" onClick={() => setCreateOutputOpen(true)}>Dar baixa</Button>
          </Box>
        )}
      </Stack>

      <Paper sx={{ mb: 2 }}>
        <Tabs value={tab} onChange={(_e, v) => setTab(v)} aria-label="tabs-estoque" variant="scrollable">
          <Tab label="Movimentações" />
          <Tab label="Situação Atual" />
        </Tabs>
      </Paper>

      {tab === 0 && (
        <>
          <Paper sx={{ p: 2, mb: 2 }}>
            <FiltersBar
              filters={filters}
              onChange={(f) => setFilters(f)}
              onClear={() => { setFilters({}); setAppliedFilters({}); setPage(0); }}
              onApply={() => { setAppliedFilters(filters); setPage(0); }}
            />
          </Paper>

          {isNarrow ? (
            <Box>
              {loading && (
                <Typography sx={{ p: 2 }}>Carregando...</Typography>
              )}
              {!loading && !error && (data?.items || []).map((m) => (
                <MobileMovementCard key={m.id} movement={m} onClick={() => handleOpenDetails(m.id)} />
              ))}
              {!loading && !error && (data?.items?.length ?? 0) === 0 && (
                <Typography sx={{ p: 2 }} color="text.secondary">Nenhuma movimentação encontrada</Typography>
              )}
            </Box>
          ) : (
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
          )}

          <MovementDetailsDialog open={!!detail} movement={detail} onClose={() => setDetail(null)} />

          <CreateInputDialog
            open={createOpen}
            onClose={() => setCreateOpen(false)}
            onSubmit={handleCreate}
          />

          <CreateOutputDialog
            open={createOutputOpen}
            onClose={() => setCreateOutputOpen(false)}
            onSubmit={handleCreateOutput}
          />
          <CreateCocoKitoDialog
            open={cocoKitoOpen}
            onClose={() => setCocoKitoOpen(false)}
            onSuccess={handleCocoKitoSuccess}
          />
        </>
      )}

      {tab === 1 && (
        <StockTable items={stock} loading={stockLoading} error={stockError} />
      )}
    </Box>
  );
};

export default InventoryPage;
