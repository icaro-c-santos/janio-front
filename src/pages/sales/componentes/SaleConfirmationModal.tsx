import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Box,
    Divider,
    Chip,
    Paper,
} from '@mui/material';
import { CheckCircle as CheckCircleIcon } from '@mui/icons-material';
import { CreateSaleRequest } from '../../../services/salesService';

interface SaleConfirmationModalProps {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    saleData: CreateSaleRequest | null;
    customerName?: string;
    loading?: boolean;
}

const SaleConfirmationModal: React.FC<SaleConfirmationModalProps> = ({
    open,
    onClose,
    onConfirm,
    saleData,
    customerName = 'Cliente',
    loading = false,
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
                    <CheckCircleIcon color="primary" />
                    <Typography variant="h6">Confirmar Venda</Typography>
                </Box>
            </DialogTitle>

            <DialogContent>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Revise os dados da venda antes de confirmar:
                </Typography>

                <Paper sx={{ p: 2, mb: 2 }}>
                    <Typography variant="subtitle1" gutterBottom>
                        Informações da Venda
                    </Typography>

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
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

                        {saleData.receipt && (
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography variant="body2" color="text.secondary">
                                    Anexo:
                                </Typography>
                                <Chip label="PDF" size="small" color="primary" />
                            </Box>
                        )}
                    </Box>
                </Paper>

                <Paper sx={{ p: 2 }}>
                    <Typography variant="subtitle1" gutterBottom>
                        Valores
                    </Typography>

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
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
                            <Typography variant="h6" color="primary">
                                Valor Total:
                            </Typography>
                            <Typography variant="h6" color="primary" fontWeight="bold">
                                {formatCurrency(totalValue)}
                            </Typography>
                        </Box>
                    </Box>
                </Paper>
            </DialogContent>

            <DialogActions sx={{ p: 3, pt: 1 }}>
                <Button
                    onClick={onClose}
                    disabled={loading}
                    variant="outlined"
                >
                    Cancelar
                </Button>
                <Button
                    onClick={onConfirm}
                    disabled={loading}
                    variant="contained"
                    startIcon={loading ? <Box sx={{ width: 20, height: 20 }} /> : <CheckCircleIcon />}
                >
                    {loading ? 'Confirmando...' : 'Confirmar Venda'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default SaleConfirmationModal;
