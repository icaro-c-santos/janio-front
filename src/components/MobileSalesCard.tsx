import React from 'react';
import {
    Card,
    CardContent,
    Typography,
    Box,
    Chip,
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

    const getCustomerName = (sale: Sale) => {
        if (sale.customer?.user) {
            if (sale.customer.user.type === 'INDIVIDUAL') {
                return sale.customer.user.individual?.fullName || 'Nome não informado';
            } else {
                return sale.customer.user.company?.legalName || 'Razão social não informada';
            }
        }
        return 'Cliente não encontrado';
    };

    const getProductName = (sale: Sale) => {
        if (sale.product) {
            return sale.product.name;
        }
        return 'Produto não encontrado';
    };

    const handleDownloadReceipt = (e: React.MouseEvent) => {
        e.stopPropagation(); // Previne que o clique abra o modal de detalhes
        if (sale.receiptFileUrl) {
            window.open(sale.receiptFileUrl, '_blank');
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
                        {formatCurrency(sale.totalPrice)}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {sale.receiptFileUrl && (
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
                        <Chip
                            label="Concluída"
                            size="small"
                            color="success"
                        />
                    </Box>
                </Box>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {formatDate(sale.saleDate)} • Criada em {formatDate(sale.createdAt)}
                </Typography>

                <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                        Cliente
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2">
                            {getCustomerName(sale)}
                        </Typography>
                        {sale.customer?.user && (
                            <Chip
                                label={sale.customer.user.type === 'INDIVIDUAL' ? 'PF' : 'PJ'}
                                size="small"
                                color={sale.customer.user.type === 'INDIVIDUAL' ? 'primary' : 'secondary'}
                            />
                        )}
                    </Box>
                </Box>

                <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                        Produto
                    </Typography>
                    <Typography variant="body2">
                        {getProductName(sale)}
                    </Typography>
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
                            {formatCurrency(sale.unitPrice)}
                        </Typography>
                    </Box>
                </Box>
            </CardContent>
        </Card>
    );
};

export default MobileSalesCard;
