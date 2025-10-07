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
    Inventory as InventoryIcon,
    AttachFile as AttachFileIcon,
} from '@mui/icons-material';
import { Sale } from '../services/salesService';

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
        if (sale.customer?.user) {
            if (sale.customer.user.type === 'INDIVIDUAL') {
                return sale.customer.user.individual?.fullName || 'Nome não informado';
            } else {
                return sale.customer.user.company?.legalName || 'Razão social não informada';
            }
        }
        return 'Cliente não encontrado';
    };

    const getCustomerDocument = () => {
        if (sale.customer?.user) {
            if (sale.customer.user.type === 'INDIVIDUAL') {
                return sale.customer.user.individual?.cpf || 'CPF não informado';
            } else {
                return sale.customer.user.company?.cnpj || 'CNPJ não informado';
            }
        }
        return 'Documento não encontrado';
    };

    const handleDownloadReceipt = () => {
        if (sale.receiptFileUrl) {
            window.open(sale.receiptFileUrl, '_blank');
        }
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
            PaperProps={{
                sx: { borderRadius: 2 }
            }}
        >
            <DialogTitle sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                pb: 1
            }}>
                <Typography variant="h6" component="div">
                    Detalhes da Venda
                </Typography>
                <IconButton
                    onClick={onClose}
                    size="small"
                    sx={{ color: 'text.secondary' }}
                >
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
                        {/* Informações da Venda */}
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
                                        {formatCurrency(sale.unitPrice)}
                                    </Typography>
                                </Box>
                                <Box gridColumn="span 2">
                                    <Typography variant="body2" color="text.secondary">
                                        Valor Total
                                    </Typography>
                                    <Typography variant="h6" color="primary" fontWeight="bold">
                                        {formatCurrency(sale.totalPrice)}
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>

                        <Divider sx={{ my: 2 }} />

                        {/* Informações do Cliente */}
                        <Box mb={3}>
                            <Typography variant="h6" gutterBottom color="primary">
                                Informações do Cliente
                            </Typography>
                            <Box display="flex" alignItems="center" gap={1} mb={1}>
                                {sale.customer?.user.type === 'INDIVIDUAL' ? (
                                    <PersonIcon color="primary" />
                                ) : (
                                    <BusinessIcon color="primary" />
                                )}
                                <Typography variant="body1" fontWeight="medium">
                                    {getCustomerName()}
                                </Typography>
                                <Chip
                                    label={sale.customer?.user.type === 'INDIVIDUAL' ? 'PF' : 'PJ'}
                                    size="small"
                                    color={sale.customer?.user.type === 'INDIVIDUAL' ? 'primary' : 'secondary'}
                                />
                            </Box>
                            <Typography variant="body2" color="text.secondary">
                                {sale.customer?.user.type === 'INDIVIDUAL' ? 'CPF' : 'CNPJ'}: {getCustomerDocument()}
                            </Typography>
                            {sale.customer?.user.type === 'COMPANY' && sale.customer.user.company?.tradeName && (
                                <Typography variant="body2" color="text.secondary">
                                    Nome Fantasia: {sale.customer.user.company.tradeName}
                                </Typography>
                            )}
                        </Box>

                        <Divider sx={{ my: 2 }} />

                        {/* Informações do Produto */}
                        <Box mb={3}>
                            <Typography variant="h6" gutterBottom color="primary">
                                Informações do Produto
                            </Typography>
                            <Box display="flex" alignItems="center" gap={1} mb={1}>
                                <InventoryIcon color="primary" />
                                <Typography variant="body1" fontWeight="medium">
                                    {sale.product?.name || 'Produto não encontrado'}
                                </Typography>
                            </Box>
                            {sale.product?.description && (
                                <Typography variant="body2" color="text.secondary">
                                    {sale.product.description}
                                </Typography>
                            )}
                            {sale.product?.price && (
                                <Typography variant="body2" color="text.secondary">
                                    Preço de Catálogo: {formatCurrency(sale.product.price)}
                                </Typography>
                            )}
                        </Box>

                        {/* Arquivo Anexo */}
                        {sale.receiptFileKey && (
                            <>
                                <Divider sx={{ my: 2 }} />
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
                                                {sale.receiptFileKey.split('/').pop()}
                                            </Typography>
                                        </Box>
                                        {sale.receiptFileUrl && (
                                            <Tooltip title="Baixar comprovante">
                                                <IconButton
                                                    onClick={handleDownloadReceipt}
                                                    color="primary"
                                                    size="small"
                                                >
                                                    <DownloadIcon />
                                                </IconButton>
                                            </Tooltip>
                                        )}
                                    </Box>
                                </Box>
                            </>
                        )}
                    </Box>
                )}
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button onClick={onClose} variant="outlined">
                    Fechar
                </Button>
                {sale.receiptFileUrl && (
                    <Button
                        onClick={handleDownloadReceipt}
                        variant="contained"
                        startIcon={<DownloadIcon />}
                    >
                        Baixar Comprovante
                    </Button>
                )}
            </DialogActions>
        </Dialog>
    );
};

export default SaleDetailsModal;
