import React from 'react';
import { Card, CardContent, Typography, Box, Chip } from '@mui/material';
import { UnifiedMovement } from '../../../services/inventoryService';

interface MobileMovementCardProps {
  movement: UnifiedMovement;
  onClick?: () => void;
}

const directionLabel = (d: UnifiedMovement['direction']) => d === 'entrada' ? 'Entrada' : 'Saída';

const MobileMovementCard: React.FC<MobileMovementCardProps> = ({ movement, onClick }) => {
  return (
    <Card
      onClick={onClick}
      sx={{
        mb: 2,
        cursor: 'pointer',
        '&:hover': { backgroundColor: 'action.hover' },
      }}
    >
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
          <Chip
            label={directionLabel(movement.direction)}
            color={movement.direction === 'entrada' ? 'success' : 'warning'}
            size="small"
          />
          <Typography variant="body2" color="text.secondary">
            {new Date(movement.movementDate).toLocaleString('pt-BR')}
          </Typography>
        </Box>

        <Box mb={1}>
          <Typography variant="subtitle1" fontWeight={600}>
            {movement.itemType}
          </Typography>
        </Box>

        <Box>
          {movement.direction === 'entrada' ? (
            <>
              {movement.supplierName && (
                <Typography variant="body2">Fornecedor: {movement.supplierName}</Typography>
              )}
              {movement.unitPrice != null && (
                <Typography variant="body2">PU: {Number(movement.unitPrice).toFixed(2)}</Typography>
              )}
              {movement.total != null && (
                <Typography variant="body2">Total: {Number(movement.total).toFixed(2)}</Typography>
              )}
            </>
          ) : (
            <>
              {movement.reason && (
                <Typography variant="body2">Razão: {movement.reason}</Typography>
              )}
              {movement.saleCustomerName && (
                <Typography variant="body2">Cliente: {movement.saleCustomerName}</Typography>
              )}
              {movement.saleId && (
                <Typography variant="body2">Venda: {movement.saleId}</Typography>
              )}
            </>
          )}
        </Box>

        <Box mt={1} textAlign="right">
          <Typography variant="body2" color="text.secondary">
            Quantidade: {movement.quantity}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default MobileMovementCard;
