import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Stack, Chip, Typography, Divider } from '@mui/material';
import { UnifiedMovement } from '../../../services/inventoryService';

interface MovementDetailsDialogProps {
  open: boolean;
  movement: UnifiedMovement | null;
  onClose: () => void;
}

const directionLabel = (d: UnifiedMovement['direction']) => d === 'entrada' ? 'Entrada' : 'Saída';

const MovementDetailsDialog: React.FC<MovementDetailsDialogProps> = ({ open, movement, onClose }) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Detalhes da Movimentação</DialogTitle>
      <DialogContent dividers>
        {movement && (
          <Stack spacing={1}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Chip label={directionLabel(movement.direction)} color={movement.direction === 'entrada' ? 'success' : 'warning'} size="small" />
              <Typography variant="subtitle1">{movement.itemType}</Typography>
            </Stack>
            <Divider />
            <Typography variant="body2">Quantidade: {movement.quantity}</Typography>
            <Typography variant="body2">Data: {new Date(movement.movementDate).toLocaleString()}</Typography>
            {movement.direction === 'entrada' ? (
              <>
                {movement.supplierName && <Typography variant="body2">Fornecedor: {movement.supplierName}</Typography>}
                {movement.supplierEmail && <Typography variant="body2">Email: {movement.supplierEmail}</Typography>}
                {movement.unitPrice != null && <Typography variant="body2">Preço Unitário: {Number(movement.unitPrice).toFixed(2)}</Typography>}
                {movement.total != null && <Typography variant="body2">Total: {Number(movement.total).toFixed(2)}</Typography>}
              </>
            ) : (
              <>
                {movement.reason && <Typography variant="body2">Razão: {movement.reason}</Typography>}
                {movement.saleCustomerName && (
                  <Typography variant="body2">Cliente: {movement.saleCustomerName}</Typography>
                )}
                {movement.saleId && <Typography variant="body2">Venda: {movement.saleId}</Typography>}
              </>
            )}
          </Stack>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Fechar</Button>
      </DialogActions>
    </Dialog>
  );
};

export default MovementDetailsDialog;
