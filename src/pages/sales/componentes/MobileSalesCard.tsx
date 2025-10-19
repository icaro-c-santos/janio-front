import React from 'react';
import {
    Card,
    CardContent,
    Typography,
    Box,
    Divider,
} from '@mui/material';
import { Sale } from '../../../services/salesService';

interface MobileSalesCardProps {
    sale: Sale;
    onClick: (sale: Sale) => void;
}

const MobileSalesCard: React.FC<MobileSalesCardProps> = ({ sale, onClick }) => {
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        }).format(value);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('pt-BR');
    };

    const getCustomerName = (sale: Sale) => sale.customerName || 'Cliente não informado';

    return (
        <Card
            sx={{
                mb: 2,
                cursor: 'pointer',
                '&:hover': {
                    backgroundColor: 'action.hover',
                }
            }}
            onClick={() => onClick(sale)}
        >
            <CardContent>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {formatDate(sale.saleDate)}
                </Typography>

                <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                        Cliente
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2">
                            {getCustomerName(sale)}
                        </Typography>
                    </Box>
                </Box>

                <Divider sx={{ my: 1 }} />

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                        <Typography variant="body2" color="text.secondary">
                            Quantidade
                        </Typography>
                        <Typography variant="body1" fontWeight="medium">
                            {sale.quantity} unidade(s)
                        </Typography>
                    </Box>

                    <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="body2" color="text.secondary">
                            Preço Unit.
                        </Typography>
                        <Typography variant="body1" fontWeight="medium">
                            {formatCurrency(Number(sale.unitPrice))}
                        </Typography>
                    </Box>
                </Box>
            </CardContent>
        </Card>
    );
};

export default MobileSalesCard;
