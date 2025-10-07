import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Button,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    Alert,
    CircularProgress,
    Pagination,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import CustomerForm from '../components/CustomerForm';
import MobileCustomerForm from '../components/MobileCustomerForm';
import MobileCustomerCard from '../components/MobileCustomerCard';
import { customersService, Customer } from '../services/customersService';
import { useMobile } from '../hooks/useMobile';

const Customers: React.FC = () => {
    const isMobile = useMobile();
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const pageSize = 10;

    const loadCustomers = async (pageNumber: number = 1) => {
        setLoading(true);
        setError(null);

        try {
            const response = await customersService.getAllCustomers(pageNumber, pageSize);

            if (response.success && response.data) {
                setCustomers(response.data.items);
                setTotalItems(response.data.total);
                setTotalPages(Math.ceil(response.data.total / pageSize));
                setPage(response.data.page);
            } else {
                setError(response.error || 'Erro ao carregar clientes');
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar clientes';

            // Tratamento específico para diferentes tipos de erro
            if (errorMessage.includes('conexão')) {
                setError('Erro de conexão. Verifique se a API está rodando.');
            } else if (errorMessage.includes('500')) {
                setError('Erro interno do servidor. Tente novamente mais tarde.');
            } else {
                setError(errorMessage);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCustomers();
    }, []);

    const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
        loadCustomers(value);
    };

    const handleFormSuccess = () => {
        setShowForm(false);
        loadCustomers(page);
    };

    const handleFormCancel = () => {
        setShowForm(false);
    };

    const formatPhone = (customer: Customer) => {
        const phone = customer.user.primaryPhone;
        if (!phone || !phone.areaCode || !phone.number) {
            return 'Não informado';
        }
        return `(${phone.areaCode}) ${phone.number}`;
    };

    const formatDocument = (customer: Customer) => {
        if (customer.user.type === 'INDIVIDUAL' && customer.user.individual) {
            return customer.user.individual.cpf;
        } else if (customer.user.type === 'COMPANY' && customer.user.company) {
            return customer.user.company.cnpj;
        }
        return '-';
    };

    const getCustomerName = (customer: Customer) => {
        if (customer.user.type === 'INDIVIDUAL' && customer.user.individual) {
            return customer.user.individual.fullName;
        } else if (customer.user.type === 'COMPANY' && customer.user.company) {
            return customer.user.company.legalName;
        }
        return '-';
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" component="h1">
                    Clientes
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setShowForm(true)}
                >
                    Novo Cliente
                </Button>
            </Box>

            {error && (
                <Alert
                    severity="error"
                    sx={{ mb: 2 }}
                    action={
                        <Button
                            color="inherit"
                            size="small"
                            onClick={() => loadCustomers(page)}
                        >
                            Tentar Novamente
                        </Button>
                    }
                >
                    {error}
                </Alert>
            )}

            {isMobile ? (
                // Mobile View - Cards
                <Box>
                    {loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                            <CircularProgress />
                        </Box>
                    ) : customers.length === 0 ? (
                        <Paper sx={{ p: 3, textAlign: 'center' }}>
                            <Typography variant="body1" color="text.secondary">
                                Nenhum cliente encontrado
                            </Typography>
                        </Paper>
                    ) : (
                        <>
                            {customers.map((customer) => (
                                <MobileCustomerCard
                                    key={customer.userId}
                                    customer={customer}
                                    onEdit={() => {/* TODO: Implementar edição */ }}
                                    onDelete={() => {/* TODO: Implementar exclusão */ }}
                                />
                            ))}

                            {totalPages > 1 && (
                                <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                                    <Pagination
                                        count={totalPages}
                                        page={page}
                                        onChange={handlePageChange}
                                        color="primary"
                                        size="small"
                                    />
                                </Box>
                            )}
                        </>
                    )}
                </Box>
            ) : (
                // Desktop View - Table
                <Paper sx={{ width: '100%', overflow: 'hidden' }}>
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Nome/Razão Social</TableCell>
                                    <TableCell>Email</TableCell>
                                    <TableCell>Documento</TableCell>
                                    <TableCell>Tipo</TableCell>
                                    <TableCell>Telefone</TableCell>
                                    <TableCell>Cidade</TableCell>
                                    <TableCell>Ações</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={7} align="center">
                                            <CircularProgress />
                                        </TableCell>
                                    </TableRow>
                                ) : customers.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} align="center">
                                            Nenhum cliente encontrado
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    customers.map((customer) => (
                                        <TableRow key={customer.userId} hover>
                                            <TableCell>{getCustomerName(customer)}</TableCell>
                                            <TableCell>{customer.user.email || 'Não informado'}</TableCell>
                                            <TableCell>{formatDocument(customer)}</TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={customer.user.type === 'INDIVIDUAL' ? 'Pessoa Física' : 'Pessoa Jurídica'}
                                                    color={customer.user.type === 'INDIVIDUAL' ? 'primary' : 'secondary'}
                                                    size="small"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                {formatPhone(customer)}
                                                {customer.user.primaryPhone?.isWhatsapp && (
                                                    <Chip label="WhatsApp" size="small" color="success" sx={{ ml: 1 }} />
                                                )}
                                            </TableCell>
                                            <TableCell>{customer.user.primaryAddress.city}</TableCell>
                                            <TableCell>
                                                <IconButton size="small" color="primary">
                                                    <EditIcon />
                                                </IconButton>
                                                <IconButton size="small" color="error">
                                                    <DeleteIcon />
                                                </IconButton>
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
                                onChange={handlePageChange}
                                color="primary"
                            />
                        </Box>
                    )}
                </Paper>
            )}

            <Dialog
                open={showForm}
                onClose={handleFormCancel}
                maxWidth={isMobile ? "sm" : "md"}
                fullWidth
                fullScreen={isMobile}
            >
                {!isMobile && <DialogTitle>Cadastrar Novo Cliente</DialogTitle>}
                <DialogContent sx={{ p: isMobile ? 0 : 2 }}>
                    {isMobile ? (
                        <MobileCustomerForm
                            onSuccess={handleFormSuccess}
                            onCancel={handleFormCancel}
                        />
                    ) : (
                        <CustomerForm
                            onSuccess={handleFormSuccess}
                            onCancel={handleFormCancel}
                        />
                    )}
                </DialogContent>
            </Dialog>
        </Box>
    );
};

export default Customers;
