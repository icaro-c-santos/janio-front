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
    Dialog,
    DialogTitle,
    DialogContent,
    Alert,
    CircularProgress,
    Pagination,
    TextField,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import CustomerForm from './components/CustomerForm';
import { customersService, Customer } from '../../services/customersService';
import { useMobile } from '../../hooks/useMobile';

const CustomersPage: React.FC = () => {
    const isMobile = useMobile();
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [search, setSearch] = useState('');
    const pageSize = 10;

    const loadCustomers = async (pageNumber: number = 1) => {
        setLoading(true);
        setError(null);

        try {
            const data = await customersService.getAllCustomers();
            setCustomers(data);
            setTotalItems(data.length);
            setTotalPages(Math.max(1, Math.ceil(data.length / pageSize)));
            setPage(pageNumber);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar clientes';
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

    useEffect(() => { loadCustomers(); }, []);

    const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
        setPage(value);
    };

    const handleFormSuccess = () => {
        setShowForm(false);
        loadCustomers(page);
    };

    const handleFormCancel = () => { setShowForm(false); };

    const filtered = customers.filter(c => {
        const q = search.trim().toLowerCase();
        if (!q) return true;
        return (
            c.name.toLowerCase().includes(q) ||
            (c.email ? c.email.toLowerCase().includes(q) : false)
        );
    });
    const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, gap: 2, flexWrap: 'wrap' }}>
                <Typography variant="h4" component="h1">Clientes</Typography>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <TextField size="small" placeholder="Buscar por nome ou email" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
                    <Button variant="contained" startIcon={<AddIcon />} onClick={() => setShowForm(true)}>Novo Cliente</Button>
                </Box>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }} action={<Button color="inherit" size="small" onClick={() => loadCustomers(page)}>Tentar Novamente</Button>}>
                    {error}
                </Alert>
            )}

            {isMobile ? (
                <Box>
                    {loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>
                    ) : filtered.length === 0 ? (
                        <Paper sx={{ p: 3, textAlign: 'center' }}>
                            <Typography variant="body1" color="text.secondary">Nenhum cliente encontrado</Typography>
                        </Paper>
                    ) : (
                        <>
                            {paged.map((customer) => (
                                <Paper key={customer.id} sx={{ p: 2, mb: 2 }}>
                                    <Typography variant="subtitle1">{customer.name}</Typography>
                                    <Typography variant="body2" color="text.secondary">{customer.email || 'Sem email'}</Typography>
                                    <Chip label={customer.type === 'PF' ? 'Pessoa Física' : 'Pessoa Jurídica'} size="small" sx={{ mt: 1 }} />
                                </Paper>
                            ))}

                            {Math.ceil(filtered.length / pageSize) > 1 && (
                                <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                                    <Pagination count={Math.ceil(filtered.length / pageSize)} page={page} onChange={handlePageChange} color="primary" size="small" />
                                </Box>
                            )}
                        </>
                    )}
                </Box>
            ) : (
                <Paper sx={{ width: '100%', overflow: 'hidden' }}>
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Nome</TableCell>
                                    <TableCell>Email</TableCell>
                                    <TableCell>Tipo</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={3} align="center"><CircularProgress /></TableCell>
                                    </TableRow>
                                ) : filtered.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={3} align="center">Nenhum cliente encontrado</TableCell>
                                    </TableRow>
                                ) : (
                                    paged.map((customer) => (
                                        <TableRow key={customer.id} hover>
                                            <TableCell>{customer.name}</TableCell>
                                            <TableCell>{customer.email || 'Não informado'}</TableCell>
                                            <TableCell>
                                                <Chip label={customer.type === 'PF' ? 'Pessoa Física' : 'Pessoa Jurídica'} color={customer.type === 'PF' ? 'primary' : 'secondary'} size="small" />
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    {Math.ceil(filtered.length / pageSize) > 1 && (
                        <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                            <Pagination count={Math.ceil(filtered.length / pageSize)} page={page} onChange={handlePageChange} color="primary" />
                        </Box>
                    )}
                </Paper>
            )}

            <Dialog open={showForm} onClose={handleFormCancel} maxWidth={isMobile ? 'sm' : 'md'} fullWidth fullScreen={isMobile}>
                {!isMobile && <DialogTitle>Cadastrar Novo Cliente</DialogTitle>}
                <DialogContent sx={{ p: isMobile ? 0 : 2 }}>
                    <CustomerForm onSuccess={handleFormSuccess} onCancel={handleFormCancel} />
                </DialogContent>
            </Dialog>
        </Box>
    );
};

export default CustomersPage;
