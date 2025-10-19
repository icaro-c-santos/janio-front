import React from 'react';
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, Typography, Chip, Button, Box } from '@mui/material';
import { UnifiedMovement } from '../../../services/inventoryService';

interface MovementsTableProps {
  data: { items: UnifiedMovement[]; total: number } | null;
  loading: boolean;
  error: string | null;
  page: number;
  rowsPerPage: number;
  onPageChange: (event: React.MouseEvent<HTMLButtonElement> | null, page: number) => void;
  onRowsPerPageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onDetails: (id: string) => void;
}

const directionLabel = (d: UnifiedMovement['direction']) => d === 'entrada' ? 'Entrada' : 'Saída';

const MovementsTable: React.FC<MovementsTableProps> = ({ data, loading, error, page, rowsPerPage, onPageChange, onRowsPerPageChange, onDetails }) => {
  return (
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
            {!loading && !error && (data?.items?.length ?? 0) === 0 && (
              <TableRow>
                <TableCell colSpan={6}>Nenhuma movimentação encontrada</TableCell>
              </TableRow>
            )}
            {!loading && !error && (data?.items || []).map((row) => (
              <TableRow key={row.id} hover>
                <TableCell>
                  <Chip label={directionLabel(row.direction)} color={row.direction === 'entrada' ? 'success' : 'warning'} size="small" />
                </TableCell>
                <TableCell>{row.itemType}</TableCell>
                <TableCell align="right">{row.quantity}</TableCell>
                <TableCell>{new Date(row.movementDate).toLocaleString()}</TableCell>
                <TableCell>
                  {row.direction === 'entrada' ? (
                    <Box>
                      {row.supplierName && <Typography variant="body2">Fornecedor: {row.supplierName}</Typography>}
                      {row.unitPrice != null && <Typography variant="body2">PU: {Number(row.unitPrice).toFixed(2)}</Typography>}
                      {row.total != null && <Typography variant="body2">Total: {Number(row.total).toFixed(2)}</Typography>}
                    </Box>
                  ) : (
                    <Box>
                      {row.reason && <Typography variant="body2">Razão: {row.reason}</Typography>}
                      {row.saleCustomerName && <Typography variant="body2">Cliente: {row.saleCustomerName}</Typography>}
                      {row.saleId && <Typography variant="body2">Venda: {row.saleId}</Typography>}
                    </Box>
                  )}
                </TableCell>
                <TableCell align="right">
                  <Button size="small" variant="outlined" onClick={() => onDetails(row.id)}>Detalhes</Button>
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
        onPageChange={onPageChange}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={onRowsPerPageChange}
        rowsPerPageOptions={[5, 10, 25, 50]}
      />
    </Paper>
  );
};

export default MovementsTable;
