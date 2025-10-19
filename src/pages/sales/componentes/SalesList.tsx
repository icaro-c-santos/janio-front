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
    CircularProgress,
    Pagination,
} from '@mui/material';
import { Sale } from '../../../services/salesService';

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


    return (
        <Paper sx={{ width: '100%', overflow: 'hidden' }}>
            <TableContainer sx={{ overflowX: 'auto' }}>
                <Table size="small" sx={{ minWidth: 650 }}>
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ whiteSpace: 'nowrap' }}>Data</TableCell>
                            <TableCell>Cliente</TableCell>
                            <TableCell sx={{ whiteSpace: 'nowrap' }}>Quantidade</TableCell>
                            <TableCell sx={{ whiteSpace: 'nowrap' }}>Preço Unit.</TableCell>
                            <TableCell sx={{ whiteSpace: 'nowrap' }}>Total</TableCell>
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
                                    <TableCell sx={{ whiteSpace: 'nowrap' }}>
                                        <Typography variant="body2">{formatDate(sale.saleDate)}</Typography>
                                    </TableCell>
                                    <TableCell sx={{ minWidth: 200 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
                                            <Typography variant="body2" noWrap sx={{ maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {getCustomerName(sale)}
                                            </Typography>
                                        </Box>
                                    </TableCell>
                                    <TableCell sx={{ whiteSpace: 'nowrap' }}>
                                        <Typography variant="body2">{sale.quantity}</Typography>
                                    </TableCell>
                                    <TableCell sx={{ whiteSpace: 'nowrap' }}>
                                        <Typography variant="body2">{formatCurrency(Number(sale.unitPrice))}</Typography>
                                    </TableCell>
                                    <TableCell sx={{ whiteSpace: 'nowrap' }}>
                                        <Typography variant="body2" fontWeight="medium" color="primary">
                                            {formatCurrency(Number(sale.totalPrice))}
                                        </Typography>
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
