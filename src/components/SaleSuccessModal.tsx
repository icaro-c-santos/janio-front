import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Box,
    Paper,
    Divider,
    Chip,
} from '@mui/material';
import { CheckCircle as CheckCircleIcon, Receipt as ReceiptIcon } from '@mui/icons-material';
import { CreateSaleRequest } from '../services/salesService';

interface SaleSuccessModalProps {
    open: boolean;
    onClose: () => void;
    saleData: CreateSaleRequest | null;
    customerName?: string;
}

const SaleSuccessModal: React.FC<SaleSuccessModalProps> = ({
    open,
    onClose,
    saleData,
    customerName = 'Cliente',
}) => {
    if (!saleData) return null;

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        }).format(value);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('pt-BR');
    };

    const totalValue = (saleData.quantity || 0) * (saleData.unitPrice || 0);

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
        >
            <DialogTitle>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CheckCircleIcon color="success" sx={{ fontSize: 32 }} />
                    <Typography variant="h5" color="success.main">
                        Venda Realizada com Sucesso!
                    </Typography>
                </Box>
            </DialogTitle>

            <DialogContent>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                    Sua venda foi processada e registrada no sistema. Aqui está o resumo:
                </Typography>

                <Paper sx={{ p: 3, mb: 2, bgcolor: 'success.50', border: '1px solid', borderColor: 'success.200' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <ReceiptIcon color="success" />
                        <Typography variant="h6" color="success.main">
                            Comprovante de Venda
                        </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="body2" color="text.secondary">
                                Cliente:
                            </Typography>
                            <Typography variant="body2" fontWeight="medium">
                                {customerName}
                            </Typography>
                        </Box>

                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="body2" color="text.secondary">
                                Data da Venda:
                            </Typography>
                            <Typography variant="body2" fontWeight="medium">
                                {saleData.saleDate ? formatDate(saleData.saleDate) : '-'}
                            </Typography>
                        </Box>

                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="body2" color="text.secondary">
                                Quantidade:
                            </Typography>
                            <Typography variant="body2" fontWeight="medium">
                                {saleData.quantity} unidade(s)
                            </Typography>
                        </Box>

                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="body2" color="text.secondary">
                                Preço Unitário:
                            </Typography>
                            <Typography variant="body2" fontWeight="medium">
                                {formatCurrency(saleData.unitPrice)}
                            </Typography>
                        </Box>

                        <Divider sx={{ my: 1 }} />

                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="h6" color="success.main">
                                Valor Total:
                            </Typography>
                            <Typography variant="h6" color="success.main" fontWeight="bold">
                                {formatCurrency(totalValue)}
                            </Typography>
                        </Box>
                    </Box>
                </Paper>

                <Box sx={{
                    p: 2,
                    bgcolor: 'info.50',
                    borderRadius: 1,
                    border: '1px solid',
                    borderColor: 'info.200'
                }}>
                    <Typography variant="body2" color="info.main" sx={{ textAlign: 'center' }}>
                        💡 <strong>Dica:</strong> Você pode visualizar esta venda na listagem de vendas a qualquer momento.
                    </Typography>
                </Box>
            </DialogContent>

            <DialogActions sx={{ p: 3, pt: 1 }}>
                <Button
                    onClick={onClose}
                    variant="contained"
                    color="success"
                    fullWidth
                    size="large"
                >
                    Continuar
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default SaleSuccessModal;
