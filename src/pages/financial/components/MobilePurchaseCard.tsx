import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { PurchaseListItem } from '../../../services/purchasesService';

interface MobilePurchaseCardProps {
  purchase: PurchaseListItem;
  onClick?: () => void;
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

const MobilePurchaseCard: React.FC<MobilePurchaseCardProps> = ({ purchase, onClick }) => {
  return (
    <Card
      onClick={onClick}
      sx={{ mb: 2, cursor: 'pointer', '&:hover': { backgroundColor: 'action.hover' } }}
    >
      <CardContent>
        <Box display="flex" justifyContent="space-between" mb={1}>
          <Typography variant="subtitle1" fontWeight={600}>{purchase.itemType}</Typography>
          <Typography variant="body2" color="text.secondary">
            {new Date(purchase.purchaseDate).toLocaleDateString('pt-BR')}
          </Typography>
        </Box>

        <Box mb={1}>
          <Typography variant="body2" color="text.secondary">Fornecedor</Typography>
          <Typography variant="body1">
            {purchase.supplierName || '-'}{purchase.supplierEmail ? ` (${purchase.supplierEmail})` : ''}
          </Typography>
        </Box>

        <Box display="flex" justifyContent="space-between">
          <Typography variant="body2">Qtd: {purchase.quantity}</Typography>
          {purchase.unitPrice != null && (
            <Typography variant="body2">PU: {Number(purchase.unitPrice).toFixed(2)}</Typography>
          )}
          {purchase.totalValue != null && (
            <Typography variant="body2">Total: {formatCurrency(Number(purchase.totalValue))}</Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default MobilePurchaseCard;
