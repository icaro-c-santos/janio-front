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
    IconButton,
    Tooltip,
} from '@mui/material';
import {
    Close as CloseIcon,
    Download as DownloadIcon,
    Person as PersonIcon,
    Business as BusinessIcon,
    AttachFile as AttachFileIcon,
} from '@mui/icons-material';
import { Sale } from '../../../services/salesService';

interface SaleDetailsModalProps {
    open: boolean;
    onClose: () => void;
    sale: Sale | null;
    loading?: boolean;
}

const SaleDetailsModal: React.FC<SaleDetailsModalProps> = ({
    open,
    onClose,
    sale,
    loading = false,
}) => {
    if (!sale) return null;

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        }).format(value);
    };

    const getCustomerName = () => {
        return sale.customerName || sale.customerEmail || 'Nome não informado';
    };

    const handleDownloadReceipt = () => {
        if (sale.receiptDownloadUrl) {
            window.open(sale.receiptDownloadUrl, '_blank');
        }
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
            PaperProps={{ sx: { borderRadius: 2 } }}
        >
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
                <Typography variant="h6" component="div">
                    Detalhes da Venda
                </Typography>
                <IconButton onClick={onClose} size="small" sx={{ color: 'text.secondary' }}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent sx={{ pt: 2 }}>
                {loading ? (
                    <Box display="flex" justifyContent="center" py={4}>
                        <Typography>Carregando detalhes...</Typography>
                    </Box>
                ) : (
                    <Box>
                        <Box mb={3}>
                            <Typography variant="h6" gutterBottom color="primary">
                                Informações da Venda
                            </Typography>
                            <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2}>
                                <Box>
                                    <Typography variant="body2" color="text.secondary">
                                        ID da Venda
                                    </Typography>
                                    <Typography variant="body1" fontFamily="monospace">
                                        {sale.id}
                                    </Typography>
                                </Box>
                                <Box>
                                    <Typography variant="body2" color="text.secondary">
                                        Data da Venda
                                    </Typography>
                                    <Typography variant="body1">
                                        {formatDate(sale.saleDate)}
                                    </Typography>
                                </Box>
                                <Box>
                                    <Typography variant="body2" color="text.secondary">
                                        Quantidade
                                    </Typography>
                                    <Typography variant="body1" fontWeight="medium">
                                        {sale.quantity} {sale.quantity === 1 ? 'unidade' : 'unidades'}
                                    </Typography>
                                </Box>
                                <Box>
                                    <Typography variant="body2" color="text.secondary">
                                        Preço Unitário
                                    </Typography>
                                    <Typography variant="body1" fontWeight="medium">
                                        {formatCurrency(Number(sale.unitPrice))}
                                    </Typography>
                                </Box>
                                <Box gridColumn="span 2">
                                    <Typography variant="body2" color="text.secondary">
                                        Valor Total
                                    </Typography>
                                    <Typography variant="h6" color="primary" fontWeight="bold">
                                        {formatCurrency(Number(sale.totalPrice))}
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>

                        <Divider sx={{ my: 2 }} />

                        <Box mb={3}>
                            <Typography variant="h6" gutterBottom color="primary">
                                Informações do Cliente
                            </Typography>
                            <Box display="flex" alignItems="center" gap={1} mb={1}>
                                {sale.customerName === 'INDIVIDUAL' ? (
                                    <PersonIcon color="primary" />
                                ) : (
                                    <BusinessIcon color="primary" />
                                )}
                                <Typography variant="body1" fontWeight="medium">
                                    {getCustomerName()}
                                </Typography>
                                {sale.customerType && (
                                    <Chip
                                        label={sale.customerType}
                                        size="small"
                                        color={sale.customerType === 'PJ' ? 'primary' : 'secondary'}
                                    />
                                )}
                            </Box>
                        </Box>

                        <Divider sx={{ my: 2 }} />

                        {(sale.receiptFileKey || sale.receiptDownloadUrl) && (
                            <Box>
                                <Typography variant="h6" gutterBottom color="primary">
                                    Comprovante
                                </Typography>
                                <Box display="flex" alignItems="center" gap={2}>
                                    <AttachFileIcon color="action" />
                                    <Box flex={1}>
                                        <Typography variant="body2" color="text.secondary">
                                            Arquivo anexado
                                        </Typography>
                                        <Typography variant="body2" fontFamily="monospace" fontSize="0.8rem">
                                            {sale.receiptFileKey ? sale.receiptFileKey.split('/').pop() : 'Recibo'}
                                        </Typography>
                                    </Box>
                                    {sale.receiptDownloadUrl && (
                                        <Tooltip title="Baixar comprovante">
                                            <IconButton onClick={handleDownloadReceipt} color="primary" size="small">
                                                <DownloadIcon />
                                            </IconButton>
                                        </Tooltip>
                                    )}
                                </Box>
                            </Box>
                        )}
                    </Box>
                )}
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button onClick={onClose} variant="outlined">
                    Fechar
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default SaleDetailsModal;
