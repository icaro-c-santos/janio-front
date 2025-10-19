import React from 'react';
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, CircularProgress, Box } from '@mui/material';
import { InventoryItem } from '../../../services/inventoryService';

interface StockTableProps {
  items: InventoryItem[] | null;
  loading: boolean;
  error: string | null;
}

const itemLabel = (t: string) => t;

const StockTable: React.FC<StockTableProps> = ({ items, loading, error }) => {
  return (
    <Paper>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Item</TableCell>
              <TableCell align="right">Quantidade</TableCell>
              <TableCell>Atualizado em</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading && (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  <Box py={3}><CircularProgress size={24} /></Box>
                </TableCell>
              </TableRow>
            )}
            {error && !loading && (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  <Typography color="error">{error}</Typography>
                </TableCell>
              </TableRow>
            )}
            {!loading && !error && ((items?.length ?? 0) === 0) && (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  <Typography color="text.secondary">Nenhum item encontrado</Typography>
                </TableCell>
              </TableRow>
            )}
            {!loading && !error && (items || []).map((row, idx) => (
              <TableRow key={`${row.itemType}-${idx}`}>
                <TableCell>{itemLabel(row.itemType)}</TableCell>
                <TableCell align="right">{row.quantity}</TableCell>
                <TableCell>{row.updatedAt ? new Date(row.updatedAt).toLocaleString('pt-BR') : '-'}</TableCell>
                <TableCell>
                  {(() => {
                    const status = row.status || 'ok';
                    const label = status === 'critico' ? 'crítico' : status === 'atencao' ? 'atenção' : 'ok';
                    const color = status === 'critico' ? 'error.main' : status === 'atencao' ? 'warning.main' : 'success.main';
                    return <Typography sx={{ color, fontWeight: 600 }}>{label}</Typography>;
                  })()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default StockTable;
