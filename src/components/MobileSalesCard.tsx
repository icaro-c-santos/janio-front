import React from 'react';
import {
    Card,
    CardContent,
    Typography,
    Box,
    Divider,
    IconButton,
    Tooltip,
} from '@mui/material';
import { Download as DownloadIcon } from '@mui/icons-material';
import { Sale } from '../services/salesService';

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

    const handleDownloadReceipt = (e: React.MouseEvent) => {
        e.stopPropagation(); // Previne que o clique abra o modal de detalhes
        if (sale.receiptDownloadUrl) {
            window.open(sale.receiptDownloadUrl, '_blank');
        }
    };

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
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Typography variant="h6" component="div" color="primary">
                        {formatCurrency(Number(sale.totalPrice))}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {sale.receiptDownloadUrl && (
                            <Tooltip title="Baixar comprovante">
                                <IconButton
                                    size="small"
                                    color="primary"
                                    onClick={handleDownloadReceipt}
                                >
                                    <DownloadIcon />
                                </IconButton>
                            </Tooltip>
                        )}
                    </Box>
                </Box>

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
