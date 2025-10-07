import React from 'react';
import {
    Box,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    Chip,
    CircularProgress,
    Pagination,
    IconButton,
    Tooltip,
} from '@mui/material';
import { Download as DownloadIcon } from '@mui/icons-material';
import { Sale } from '../services/salesService';

interface SalesListProps {
    sales: Sale[];
    loading: boolean;
    page: number;
    totalPages: number;
    onPageChange: (event: React.ChangeEvent<unknown>, value: number) => void;
    onSaleClick: (sale: Sale) => void;
}

const SalesList: React.FC<SalesListProps> = ({
    sales,
    loading,
    page,
    totalPages,
    onPageChange,
    onSaleClick,
}) => {
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

    const handleDownloadReceipt = (e: React.MouseEvent, sale: Sale) => {
        e.stopPropagation(); // Previne que o clique abra o modal de detalhes
        if (sale.receiptFileUrl) {
            window.open(sale.receiptFileUrl, '_blank');
        }
    };

    return (
        <Paper sx={{ width: '100%', overflow: 'hidden' }}>
            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Data</TableCell>
                            <TableCell>Cliente</TableCell>
                            <TableCell>Produto</TableCell>
                            <TableCell>Quantidade</TableCell>
                            <TableCell>Preço Unit.</TableCell>
                            <TableCell>Total</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell align="center">Ações</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={8} align="center">
                                    <CircularProgress />
                                </TableCell>
                            </TableRow>
                        ) : sales.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} align="center">
                                    <Typography variant="body1" color="text.secondary">
                                        Nenhuma venda encontrada
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            sales.map((sale) => (
                                <TableRow
                                    key={sale.id}
                                    hover
                                    onClick={() => onSaleClick(sale)}
                                    sx={{
                                        cursor: 'pointer',
                                        '&:hover': {
                                            backgroundColor: 'action.hover',
                                        }
                                    }}
                                >
                                    <TableCell>
                                        <Typography variant="body2">
                                            {formatDate(sale.saleDate)}
                                        </Typography>

                                    </TableCell>
                                    <TableCell>
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
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2">
                                            {getProductName(sale)}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2">
                                            {sale.quantity}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2">
                                            {formatCurrency(sale.unitPrice)}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" fontWeight="medium" color="primary">
                                            {formatCurrency(sale.totalPrice)}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label="Concluída"
                                            size="small"
                                            color="success"
                                        />
                                    </TableCell>
                                    <TableCell align="center">
                                        {sale.receiptFileUrl && (
                                            <Tooltip title="Baixar comprovante">
                                                <IconButton
                                                    size="small"
                                                    color="primary"
                                                    onClick={(e) => handleDownloadReceipt(e, sale)}
                                                >
                                                    <DownloadIcon />
                                                </IconButton>
                                            </Tooltip>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {totalPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                    <Pagination
                        count={totalPages}
                        page={page}
                        onChange={onPageChange}
                        color="primary"
                    />
                </Box>
            )}
        </Paper>
    );
};

export default SalesList;
