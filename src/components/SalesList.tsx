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

    const getCustomerName = (sale: Sale) => sale.customerName || `Cliente ${sale.customerId.slice(0, 8)}`;

    const handleDownloadReceipt = (e: React.MouseEvent, sale: Sale) => {
        e.stopPropagation(); // Previne que o clique abra o modal de detalhes
        if (sale.receiptDownloadUrl) {
            window.open(sale.receiptDownloadUrl, '_blank');
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
                            <TableCell>Quantidade</TableCell>
                            <TableCell>Preço Unit.</TableCell>
                            <TableCell>Total</TableCell>
                            <TableCell align="center">Ações</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={6} align="center">
                                    <CircularProgress />
                                </TableCell>
                            </TableRow>
                        ) : sales.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} align="center">
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
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2">
                                            {sale.quantity}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2">
                                            {formatCurrency(Number(sale.unitPrice))}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" fontWeight="medium" color="primary">
                                            {formatCurrency(Number(sale.totalPrice))}
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="center">
                                        {sale.receiptDownloadUrl && (
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
