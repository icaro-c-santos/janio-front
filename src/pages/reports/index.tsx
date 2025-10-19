import React, { useState, useEffect, useCallback } from 'react';
import {
    Box,
    Paper,
    Typography,
    Button,
    CircularProgress,
    Alert,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Chip,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    IconButton,
    Divider,
    Grid,
    Card,
    CardContent,
    CardActions,
    Pagination,
    InputAdornment,
} from '@mui/material';
import {
    Add as AddIcon,
    Download as DownloadIcon,
    Assessment as AssessmentIcon,
    Schedule as ScheduleIcon,
    CheckCircle as CheckCircleIcon,
    Error as ErrorIcon,
    HourglassEmpty as HourglassEmptyIcon,
    Search as SearchIcon,
    Clear as ClearIcon,
} from '@mui/icons-material';
import { apiRequest, API_CONFIG, buildApiUrl } from '../../config/api';

const REPORT_TYPE_LABELS: Record<string, string> = {
    SALES_SUMMARY: 'Resumo de Vendas',
    SALES_BY_CUSTOMER: 'Vendas por Cliente',
    INVENTORY_MOVES: 'Movimentações de Estoque',
};
const REPORT_STATUS_LABELS: Record<string, string> = {
    PENDING: 'Pendente',
    PROCESSING: 'Processando',
    READY: 'Pronto',
    FAILED: 'Falhou',
};
const needsCustomer = (type: string) => type === 'SALES_BY_CUSTOMER';
const needsProduct = (_type: string) => false;
import { useToast } from '../../hooks/useToast';

interface Report {
    id: string;
    name: string;
    description: string | null;
    type: string;
    status: string;
    fileKey: string | null;
    requestedBy: string | null;
    createdAt: string;
    updatedAt: string;
}

interface CreateReportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onReportCreated: () => void;
}

const CreateReportModal: React.FC<CreateReportModalProps> = ({
    isOpen,
    onClose,
    onReportCreated
}) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        type: '',
        customerId: '',
        productId: ''
    });
    type SimpleItem = { id: string; name: string };
    const [customers, setCustomers] = useState<SimpleItem[]>([]);
    const [products, setProducts] = useState<SimpleItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(false);
    const { error: showError, success: showSuccess } = useToast();

    useEffect(() => {
        if (isOpen) {
            loadCustomersAndProducts();
        }
    }, [isOpen]);

    const loadCustomersAndProducts = async () => {
        setLoadingData(true);
        try {
            const [customersResponse, productsResponse] = await Promise.all([
                apiRequest(API_CONFIG.ENDPOINTS.CUSTOMERS),
                apiRequest(API_CONFIG.ENDPOINTS.PRODUCTS)
            ]);

            let customersData = [] as any[];
            if (customersResponse.success && customersResponse.data) {
                customersData = customersResponse.data.items || customersResponse.data || [];
            } else if ((customersResponse as any).items) {
                customersData = (customersResponse as any).items;
            } else if (Array.isArray(customersResponse)) {
                customersData = customersResponse as any[];
            }

            const mappedCustomers = customersData.map((customer: any) => ({
                id: customer.userId || customer.id,
                name: customer.user?.type === 'INDIVIDUAL'
                    ? customer.user.individual?.fullName || 'Nome não informado'
                    : customer.user?.company?.legalName || 'Razão social não informada'
            }));

            let productsData = [] as any[];
            if ((productsResponse as any).success && (productsResponse as any).data) {
                productsData = Array.isArray((productsResponse as any).data) ? (productsResponse as any).data : [(productsResponse as any).data];
            } else if (Array.isArray(productsResponse)) {
                productsData = productsResponse as any[];
            } else if (Array.isArray((productsResponse as any).data)) {
                productsData = (productsResponse as any).data;
            }

            const mappedProducts = productsData.map((product: any) => ({
                id: product.id,
                name: product.name
            }));

            setCustomers(mappedCustomers);
            setProducts(mappedProducts);
        } catch (error) {
            showError('Erro ao carregar clientes e produtos');
        } finally {
            setLoadingData(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name || !formData.type) {
            showError('Nome e tipo são obrigatórios');
            return;
        }

        if (needsCustomer(formData.type) && !formData.customerId) {
            showError('Cliente é obrigatório para este tipo de relatório');
            return;
        }

        if (needsProduct(formData.type) && !formData.productId) {
            showError('Produto é obrigatório para este tipo de relatório');
            return;
        }

        setLoading(true);
        try {
            const reportData = {
                name: formData.name,
                description: formData.description || undefined,
                type: formData.type,
                customerId: needsCustomer(formData.type) ? formData.customerId : undefined,
                productId: needsProduct(formData.type) ? formData.productId : undefined,
            };

            await apiRequest(API_CONFIG.ENDPOINTS.REPORTS, {
                method: 'POST',
                body: JSON.stringify(reportData),
            });
            showSuccess('Relatório criado com sucesso!');
            onReportCreated();
            handleClose();
        } catch (error) {
            showError('Erro ao criar relatório');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setFormData({
            name: '',
            description: '',
            type: '',
            customerId: '',
            productId: ''
        });
        onClose();
    };

    return (
        <Dialog open={isOpen} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ pb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AssessmentIcon color="primary" />
                    <Typography variant="h6">Criar Novo Relatório</Typography>
                </Box>
            </DialogTitle>

            <form onSubmit={handleSubmit}>
                <DialogContent>
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Nome do Relatório"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                                placeholder="Digite o nome do relatório"
                                variant="outlined"
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Descrição"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                multiline
                                rows={3}
                                placeholder="Descrição opcional do relatório"
                                variant="outlined"
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <FormControl fullWidth required>
                                <InputLabel>Tipo de Relatório</InputLabel>
                                <Select
                                    value={formData.type}
                                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                    label="Tipo de Relatório"
                                >
                                    {Object.entries(REPORT_TYPE_LABELS).map(([key, label]) => (
                                        <MenuItem key={key} value={key}>
                                            {label}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        {needsCustomer(formData.type) && (
                            <Grid item xs={12}>
                                <FormControl fullWidth required>
                                    <InputLabel>Cliente</InputLabel>
                                    <Select
                                        value={formData.customerId}
                                        onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                                        label="Cliente"
                                        disabled={loadingData}
                                    >
                                        {loadingData ? (
                                            <MenuItem disabled>
                                                <CircularProgress size={20} sx={{ mr: 1 }} />
                                                Carregando clientes...
                                            </MenuItem>
                                        ) : customers.length === 0 ? (
                                            <MenuItem disabled>
                                                Nenhum cliente encontrado
                                            </MenuItem>
                                        ) : (
                                            (customers as any[]).map((customer) => (
                                                <MenuItem key={(customer as any).id} value={(customer as any).id}>
                                                    {(customer as any).name}
                                                </MenuItem>
                                            ))
                                        )}
                                    </Select>
                                </FormControl>
                            </Grid>
                        )}

                        {needsProduct(formData.type) && (
                            <Grid item xs={12}>
                                <FormControl fullWidth required>
                                    <InputLabel>Produto</InputLabel>
                                    <Select
                                        value={formData.productId}
                                        onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                                        label="Produto"
                                        disabled={loadingData}
                                    >
                                        {loadingData ? (
                                            <MenuItem disabled>
                                                <CircularProgress size={20} sx={{ mr: 1 }} />
                                                Carregando produtos...
                                            </MenuItem>
                                        ) : (products as any[]).length === 0 ? (
                                            <MenuItem disabled>
                                                Nenhum produto encontrado
                                            </MenuItem>
                                        ) : (
                                            (products as any[]).map((product) => (
                                                <MenuItem key={(product as any).id} value={(product as any).id}>
                                                    {(product as any).name}
                                                </MenuItem>
                                            ))
                                        )}
                                    </Select>
                                </FormControl>
                            </Grid>
                        )}
                    </Grid>
                </DialogContent>

                <DialogActions sx={{ p: 3, pt: 1 }}>
                    <Button onClick={handleClose} variant="outlined">
                        Cancelar
                    </Button>
                    <Button type="submit" variant="contained" disabled={loading || loadingData} startIcon={loading ? <CircularProgress size={20} /> : <AddIcon />}>
                        {loading ? 'Criando...' : 'Criar Relatório'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

const ReportsPage: React.FC = () => {
    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [downloadingReports, setDownloadingReports] = useState<Set<string>>(new Set());
    const [filters, setFilters] = useState({ status: '', type: '', search: '' });
    const [pagination, setPagination] = useState({ page: 1, pageSize: 10, total: 0, totalPages: 0 });
    const { error: showError, success: showSuccess } = useToast();

    const loadReports = useCallback(async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({ page: String(pagination.page), pageSize: String(pagination.pageSize) });
            const response = await apiRequest(`${API_CONFIG.ENDPOINTS.REPORTS}?${params.toString()}`);
            let reportsData: any = (response as any).items || (response as any).data || response || [];
            reportsData = Array.isArray(reportsData) ? reportsData : [];

            if (filters.status) {
                reportsData = reportsData.filter((report: Report) => report.status === filters.status);
            }
            if (filters.type) {
                reportsData = reportsData.filter((report: Report) => report.type === filters.type);
            }
            if (filters.search) {
                reportsData = reportsData.filter((report: Report) =>
                    report.name.toLowerCase().includes(filters.search.toLowerCase()) ||
                    (report.description && report.description.toLowerCase().includes(filters.search.toLowerCase()))
                );
            }

            setReports(reportsData);

            if ((response as any).total) {
                setPagination(prev => ({
                    ...prev,
                    total: (response as any).total,
                    totalPages: Math.ceil((response as any).total / pagination.pageSize)
                }));
            }
        } catch (error) {
            showError('Erro ao carregar relatórios');
        } finally {
            setLoading(false);
        }
    }, [pagination.page, pagination.pageSize, filters, showError]);

    useEffect(() => {
        loadReports();
    }, [loadReports]);

    const handleFilterChange = (field: string, value: string) => {
        setFilters(prev => ({ ...prev, [field]: value }));
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    const handlePageChange = (newPage: number) => {
        setPagination(prev => ({ ...prev, page: newPage }));
    };

    const handlePageSizeChange = (newPageSize: number) => {
        setPagination(prev => ({ ...prev, pageSize: newPageSize, page: 1 }));
    };

    const clearFilters = () => {
        setFilters({ status: '', type: '', search: '' });
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    useEffect(() => {
        const interval = setInterval(() => { loadReports(); }, 30000);
        return () => clearInterval(interval);
    }, [loadReports]);

    const handleDownload = async (reportId: string) => {
        setDownloadingReports(prev => new Set(prev).add(reportId));
        try {
            const url = buildApiUrl(API_CONFIG.ENDPOINTS.REPORTS_DOWNLOAD(reportId));
            window.open(url, '_blank');
            showSuccess('Download iniciado!');
        } catch (error) {
            showError('Erro ao fazer download do relatório');
        } finally {
            setDownloadingReports(prev => { const s = new Set(prev); s.delete(reportId); return s; });
        }
    };

    const formatDate = (dateString: string) => new Date(dateString).toLocaleString('pt-BR');

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'READY': return <CheckCircleIcon color="success" />;
            case 'PROCESSING': return <HourglassEmptyIcon color="primary" />;
            case 'FAILED': return <ErrorIcon color="error" />;
            case 'PENDING': return <ScheduleIcon color="warning" />;
            default: return <ScheduleIcon color="disabled" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'READY': return 'success';
            case 'PROCESSING': return 'primary';
            case 'FAILED': return 'error';
            case 'PENDING': return 'warning';
            default: return 'default';
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
                <Box sx={{ textAlign: 'center' }}>
                    <CircularProgress size={60} />
                    <Typography variant="h6" sx={{ mt: 2 }}>
                        Carregando relatórios...
                    </Typography>
                </Box>
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexDirection: { xs: 'column', sm: 'row' }, gap: { xs: 2, sm: 0 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <AssessmentIcon color="primary" sx={{ fontSize: { xs: 28, sm: 32 } }} />
                    <Typography variant="h4" component="h1" fontWeight="bold" sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}>
                        Relatórios
                    </Typography>
                </Box>
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => setIsModalOpen(true)} size="large">
                    Novo Relatório
                </Button>
            </Box>

            <Paper sx={{ borderRadius: 2, overflow: 'hidden', mb: 3 }}>
                <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider', backgroundColor: 'grey.50' }}>
                    <Typography variant="h6" fontWeight="medium" sx={{ mb: 2 }}>
                        Filtros
                    </Typography>
                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} sm={6} md={3}>
                            <TextField fullWidth label="Buscar relatórios" value={filters.search} onChange={(e) => handleFilterChange('search', e.target.value)} placeholder="Nome ou descrição..." InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon /></InputAdornment>) }} />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <FormControl fullWidth>
                                <InputLabel>Status</InputLabel>
                                <Select value={filters.status} onChange={(e) => handleFilterChange('status', e.target.value)} label="Status">
                                    <MenuItem value="">Todos</MenuItem>
                                    <MenuItem value="PENDING">Pendente</MenuItem>
                                    <MenuItem value="PROCESSING">Processando</MenuItem>
                                    <MenuItem value="READY">Pronto</MenuItem>
                                    <MenuItem value="FAILED">Falhou</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <FormControl fullWidth>
                                <InputLabel>Tipo</InputLabel>
                                <Select value={filters.type} onChange={(e) => handleFilterChange('type', e.target.value)} label="Tipo">
                                    <MenuItem value="">Todos</MenuItem>
                                    {Object.entries(REPORT_TYPE_LABELS).map(([key, label]) => (
                                        <MenuItem key={key} value={key}>{label}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                                <Button variant="outlined" startIcon={<ClearIcon />} onClick={clearFilters}>Limpar</Button>
                            </Box>
                        </Grid>
                    </Grid>
                </Box>
            </Paper>

            <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
                <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider', backgroundColor: 'grey.50' }}>
                    <Typography variant="h6" fontWeight="medium">Relatórios ({reports.length})</Typography>
                    <Typography variant="body2" color="text.secondary">Lista atualizada automaticamente a cada 30 segundos</Typography>
                </Box>

                {reports.length === 0 ? (
                    <Box sx={{ p: 6, textAlign: 'center' }}>
                        <AssessmentIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                        <Typography variant="h6" color="text.secondary" gutterBottom>Nenhum relatório encontrado</Typography>
                        <Typography variant="body2" color="text.disabled">Crie seu primeiro relatório clicando no botão "Novo Relatório"</Typography>
                    </Box>
                ) : (
                    <List>
                        {reports.map((report, index) => (
                            <React.Fragment key={report.id}>
                                <ListItem sx={{ py: 3, flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'flex-start', sm: 'center' } }}>
                                    <ListItemText
                                        primary={<Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1, flexWrap: 'wrap' }}>{getStatusIcon(report.status)}<Typography variant="h6" component="span" sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>{report.name}</Typography><Chip label={REPORT_STATUS_LABELS[report.status]} color={getStatusColor(report.status) as any} size="small" /></Box>}
                                        secondary={<Box>{report.description && (<Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>{report.description}</Typography>)}<Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', flexDirection: { xs: 'column', sm: 'row' } }}><Chip label={`Tipo: ${REPORT_TYPE_LABELS[report.type]}`} variant="outlined" size="small" />{report.requestedBy && (<Chip label={`Criado por: ${report.requestedBy}`} variant="outlined" size="small" />)}<Chip label={`Criado em: ${formatDate(report.createdAt)}`} variant="outlined" size="small" /></Box></Box>}
                                        sx={{ width: { xs: '100%', sm: 'auto' } }}
                                    />
                                    <ListItemSecondaryAction sx={{ position: { xs: 'static', sm: 'absolute' }, right: { xs: 'auto', sm: 16 }, top: { xs: 'auto', sm: '50%' }, transform: { xs: 'none', sm: 'translateY(-50%)' }, mt: { xs: 0.5, sm: 0 }, mb: { xs: 2, sm: 0 }, width: { xs: '100%', sm: 'auto' }, display: { xs: 'flex', sm: 'block' }, justifyContent: { xs: 'center', sm: 'flex-start' } }}>
                                        {report.status === 'READY' && report.fileKey && (
                                            <Button variant="contained" color="success" startIcon={downloadingReports.has(report.id) ? (<CircularProgress size={16} color="inherit" />) : (<DownloadIcon />)} onClick={() => handleDownload(report.id)} disabled={downloadingReports.has(report.id)}>
                                                {downloadingReports.has(report.id) ? 'Baixando...' : 'Download'}
                                            </Button>
                                        )}
                                    </ListItemSecondaryAction>
                                </ListItem>
                                {index < reports.length - 1 && <Divider />}
                            </React.Fragment>
                        ))}
                    </List>
                )}

                {pagination.totalPages > 1 && (
                    <Box sx={{ p: 3, borderTop: 1, borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Typography variant="body2" color="text.secondary">
                                Mostrando {((pagination.page - 1) * pagination.pageSize) + 1} - {Math.min(pagination.page * pagination.pageSize, pagination.total)} de {pagination.total} relatórios
                            </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <FormControl size="small">
                                <InputLabel>Itens por página</InputLabel>
                                <Select
                                    value={pagination.pageSize}
                                    onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                                    label="Itens por página"
                                    sx={{ minWidth: 140 }}
                                >
                                    {[5, 10, 25, 50].map(size => (
                                        <MenuItem key={size} value={size}>{size}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            <Pagination count={pagination.totalPages} page={pagination.page} onChange={(_e, p) => handlePageChange(p)} color="primary" />
                        </Box>
                    </Box>
                )}
            </Paper>

            <CreateReportModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onReportCreated={loadReports} />
        </Box>
    );
};

export default ReportsPage;
