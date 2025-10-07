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
import {
    getReports,
    createReport,
    downloadReport,
    REPORT_TYPE_LABELS,
    REPORT_STATUS_LABELS,
    REPORT_STATUS_COLORS,
    needsCustomer,
    needsProduct,
    needsCustomerAndProduct,
    REPORT_TYPES
} from '../services/reportsService';
import { apiRequest, API_CONFIG } from '../config/api';
import { useToast } from '../hooks/useToast';

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
    const [customers, setCustomers] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(false);
    const { error: showError, success: showSuccess } = useToast();

    // Carrega clientes e produtos quando o modal abre
    useEffect(() => {
        if (isOpen) {
            loadCustomersAndProducts();
        }
    }, [isOpen]);

    const loadCustomersAndProducts = async () => {
        setLoadingData(true);
        try {
            console.log('Carregando clientes e produtos...');
            const [customersResponse, productsResponse] = await Promise.all([
                apiRequest(API_CONFIG.ENDPOINTS.CUSTOMERS),
                apiRequest(API_CONFIG.ENDPOINTS.PRODUCTS)
            ]);

            console.log('Resposta clientes:', customersResponse);
            console.log('Resposta produtos:', productsResponse);

            // Mapear clientes para o formato esperado
            let customersData = [];
            if (customersResponse.success && customersResponse.data) {
                customersData = customersResponse.data.items || customersResponse.data || [];
            } else if (customersResponse.items) {
                customersData = customersResponse.items;
            } else if (Array.isArray(customersResponse)) {
                customersData = customersResponse;
            }

            console.log('Dados clientes:', customersData);

            const mappedCustomers = customersData.map((customer: any) => ({
                id: customer.userId || customer.id,
                name: customer.user?.type === 'INDIVIDUAL'
                    ? customer.user.individual?.fullName || 'Nome não informado'
                    : customer.user?.company?.legalName || 'Razão social não informada'
            }));

            // Mapear produtos para o formato esperado
            let productsData = [];
            if (productsResponse.success && productsResponse.data) {
                productsData = Array.isArray(productsResponse.data) ? productsResponse.data : [productsResponse.data];
            } else if (Array.isArray(productsResponse)) {
                productsData = productsResponse;
            } else if (Array.isArray(productsResponse.data)) {
                productsData = productsResponse.data;
            }

            console.log('Dados produtos:', productsData);

            const mappedProducts = productsData.map((product: any) => ({
                id: product.id,
                name: product.name
            }));

            console.log('Clientes mapeados:', mappedCustomers);
            console.log('Produtos mapeados:', mappedProducts);

            setCustomers(mappedCustomers);
            setProducts(mappedProducts);
        } catch (error) {
            console.error('Erro ao carregar dados:', error);
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

            await createReport(reportData);
            showSuccess('Relatório criado com sucesso!');
            onReportCreated();
            handleClose();
        } catch (error) {
            console.error('Erro ao criar relatório:', error);
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
        <Dialog
            open={isOpen}
            onClose={handleClose}
            maxWidth="sm"
            fullWidth
            fullScreen={{ xs: true, sm: false }}
            sx={{
                '& .MuiDialog-paper': {
                    m: { xs: 0, sm: 2 }
                }
            }}
        >
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
                                            customers.map((customer) => (
                                                <MenuItem key={customer.id} value={customer.id}>
                                                    {customer.name}
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
                                        ) : products.length === 0 ? (
                                            <MenuItem disabled>
                                                Nenhum produto encontrado
                                            </MenuItem>
                                        ) : (
                                            products.map((product) => (
                                                <MenuItem key={product.id} value={product.id}>
                                                    {product.name}
                                                </MenuItem>
                                            ))
                                        )}
                                    </Select>
                                </FormControl>
                            </Grid>
                        )}
                    </Grid>
                </DialogContent>

                <DialogActions sx={{
                    p: 3,
                    pt: 1,
                    flexDirection: { xs: 'column', sm: 'row' },
                    gap: { xs: 2, sm: 1 }
                }}>
                    <Button
                        onClick={handleClose}
                        variant="outlined"
                        fullWidth={{ xs: true, sm: false }}
                        size="large"
                    >
                        Cancelar
                    </Button>
                    <Button
                        type="submit"
                        variant="contained"
                        disabled={loading || loadingData}
                        startIcon={loading ? <CircularProgress size={20} /> : <AddIcon />}
                        fullWidth={{ xs: true, sm: false }}
                        size="large"
                    >
                        {loading ? 'Criando...' : 'Criar Relatório'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

const Reports: React.FC = () => {
    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [downloadingReports, setDownloadingReports] = useState<Set<string>>(new Set());
    const [filters, setFilters] = useState({
        status: '',
        type: '',
        search: ''
    });
    const [pagination, setPagination] = useState({
        page: 1,
        pageSize: 10,
        total: 0,
        totalPages: 0
    });
    const { error: showError, success: showSuccess } = useToast();

    const loadReports = useCallback(async () => {
        try {
            setLoading(true);
            const response = await getReports(pagination.page, pagination.pageSize);

            // Mapear relatórios para o formato esperado
            let reportsData = response.items || response.data || response || [];
            reportsData = Array.isArray(reportsData) ? reportsData : [];

            // Aplicar filtros
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

            // Atualizar paginação se disponível na resposta
            if (response.total) {
                setPagination(prev => ({
                    ...prev,
                    total: response.total,
                    totalPages: Math.ceil(response.total / pagination.pageSize)
                }));
            }
        } catch (error) {
            console.error('Erro ao carregar relatórios:', error);
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
        setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page when filtering
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

    // Auto-reload a cada 30 segundos
    useEffect(() => {
        const interval = setInterval(() => {
            loadReports();
        }, 30000);

        return () => clearInterval(interval);
    }, [loadReports]);

    const handleDownload = async (reportId: string) => {
        setDownloadingReports(prev => new Set(prev).add(reportId));

        try {
            await downloadReport(reportId);
            showSuccess('Download iniciado!');
        } catch (error) {
            console.error('Erro no download:', error);
            showError('Erro ao fazer download do relatório');
        } finally {
            setDownloadingReports(prev => {
                const newSet = new Set(prev);
                newSet.delete(reportId);
                return newSet;
            });
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('pt-BR');
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'READY':
                return <CheckCircleIcon color="success" />;
            case 'PROCESSING':
                return <HourglassEmptyIcon color="primary" />;
            case 'FAILED':
                return <ErrorIcon color="error" />;
            case 'PENDING':
                return <ScheduleIcon color="warning" />;
            default:
                return <ScheduleIcon color="disabled" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'READY':
                return 'success';
            case 'PROCESSING':
                return 'primary';
            case 'FAILED':
                return 'error';
            case 'PENDING':
                return 'warning';
            default:
                return 'default';
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
            {/* Header */}
            <Box sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 3,
                flexDirection: { xs: 'column', sm: 'row' },
                gap: { xs: 2, sm: 0 }
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <AssessmentIcon color="primary" sx={{ fontSize: { xs: 28, sm: 32 } }} />
                    <Typography variant="h4" component="h1" fontWeight="bold" sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}>
                        Relatórios
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setIsModalOpen(true)}
                    size="large"
                    fullWidth={{ xs: true, sm: false }}
                    sx={{ minWidth: { xs: 'auto', sm: 'auto' } }}
                >
                    Novo Relatório
                </Button>
            </Box>

            {/* Filters */}
            <Paper sx={{ borderRadius: 2, overflow: 'hidden', mb: 3 }}>
                <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider', backgroundColor: 'grey.50' }}>
                    <Typography variant="h6" fontWeight="medium" sx={{ mb: 2 }}>
                        Filtros
                    </Typography>
                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} sm={6} md={3}>
                            <TextField
                                fullWidth
                                label="Buscar relatórios"
                                value={filters.search}
                                onChange={(e) => handleFilterChange('search', e.target.value)}
                                placeholder="Nome ou descrição..."
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <FormControl fullWidth>
                                <InputLabel>Status</InputLabel>
                                <Select
                                    value={filters.status}
                                    onChange={(e) => handleFilterChange('status', e.target.value)}
                                    label="Status"
                                >
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
                                <Select
                                    value={filters.type}
                                    onChange={(e) => handleFilterChange('type', e.target.value)}
                                    label="Tipo"
                                >
                                    <MenuItem value="">Todos</MenuItem>
                                    {Object.entries(REPORT_TYPE_LABELS).map(([key, label]) => (
                                        <MenuItem key={key} value={key}>
                                            {label}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                                <Button
                                    variant="outlined"
                                    startIcon={<ClearIcon />}
                                    onClick={clearFilters}
                                    fullWidth={{ xs: true, sm: false }}
                                >
                                    Limpar
                                </Button>
                            </Box>
                        </Grid>
                    </Grid>
                </Box>
            </Paper>

            {/* Reports List */}
            <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
                <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider', backgroundColor: 'grey.50' }}>
                    <Typography variant="h6" fontWeight="medium">
                        Relatórios ({reports.length})
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Lista atualizada automaticamente a cada 30 segundos
                    </Typography>
                </Box>

                {reports.length === 0 ? (
                    <Box sx={{ p: 6, textAlign: 'center' }}>
                        <AssessmentIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                        <Typography variant="h6" color="text.secondary" gutterBottom>
                            Nenhum relatório encontrado
                        </Typography>
                        <Typography variant="body2" color="text.disabled">
                            Crie seu primeiro relatório clicando no botão "Novo Relatório"
                        </Typography>
                    </Box>
                ) : (
                    <List>
                        {reports.map((report, index) => (
                            <React.Fragment key={report.id}>
                                <ListItem sx={{
                                    py: 3,
                                    flexDirection: { xs: 'column', sm: 'row' },
                                    alignItems: { xs: 'flex-start', sm: 'center' }
                                }}>
                                    <ListItemText
                                        primary={
                                            <Box sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 2,
                                                mb: 1,
                                                flexWrap: 'wrap'
                                            }}>
                                                {getStatusIcon(report.status)}
                                                <Typography variant="h6" component="span" sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                                                    {report.name}
                                                </Typography>
                                                <Chip
                                                    label={REPORT_STATUS_LABELS[report.status]}
                                                    color={getStatusColor(report.status) as any}
                                                    size="small"
                                                />
                                            </Box>
                                        }
                                        secondary={
                                            <Box>
                                                {report.description && (
                                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                                        {report.description}
                                                    </Typography>
                                                )}
                                                <Box sx={{
                                                    display: 'flex',
                                                    gap: 1,
                                                    flexWrap: 'wrap',
                                                    flexDirection: { xs: 'column', sm: 'row' }
                                                }}>
                                                    <Chip
                                                        label={`Tipo: ${REPORT_TYPE_LABELS[report.type]}`}
                                                        variant="outlined"
                                                        size="small"
                                                    />
                                                    {report.requestedBy && (
                                                        <Chip
                                                            label={`Criado por: ${report.requestedBy}`}
                                                            variant="outlined"
                                                            size="small"
                                                        />
                                                    )}
                                                    <Chip
                                                        label={`Criado em: ${formatDate(report.createdAt)}`}
                                                        variant="outlined"
                                                        size="small"
                                                    />
                                                </Box>
                                            </Box>
                                        }
                                        sx={{ width: { xs: '100%', sm: 'auto' } }}
                                    />
                                    <ListItemSecondaryAction sx={{
                                        position: { xs: 'static', sm: 'absolute' },
                                        right: { xs: 'auto', sm: 16 },
                                        top: { xs: 'auto', sm: '50%' },
                                        transform: { xs: 'none', sm: 'translateY(-50%)' },
                                        mt: { xs: 0.5, sm: 0 },
                                        mb: { xs: 2, sm: 0 },
                                        width: { xs: '100%', sm: 'auto' },
                                        display: { xs: 'flex', sm: 'block' },
                                        justifyContent: { xs: 'center', sm: 'flex-start' }
                                    }}>
                                        {report.status === 'READY' && report.fileKey && (
                                            <Button
                                                variant="contained"
                                                color="success"
                                                startIcon={
                                                    downloadingReports.has(report.id) ? (
                                                        <CircularProgress size={16} color="inherit" />
                                                    ) : (
                                                        <DownloadIcon />
                                                    )
                                                }
                                                onClick={() => handleDownload(report.id)}
                                                disabled={downloadingReports.has(report.id)}
                                                fullWidth={{ xs: true, sm: false }}
                                                sx={{ minWidth: { xs: 'auto', sm: 140 } }}
                                            >
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

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                    <Box sx={{
                        p: 3,
                        borderTop: 1,
                        borderColor: 'divider',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexDirection: { xs: 'column', sm: 'row' },
                        gap: 2
                    }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Typography variant="body2" color="text.secondary">
                                Mostrando {((pagination.page - 1) * pagination.pageSize) + 1} - {Math.min(pagination.page * pagination.pageSize, pagination.total)} de {pagination.total} relatórios
                            </Typography>
                            <FormControl size="small" sx={{ minWidth: 80 }}>
                                <InputLabel>Por página</InputLabel>
                                <Select
                                    value={pagination.pageSize}
                                    onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                                    label="Por página"
                                >
                                    <MenuItem value={5}>5</MenuItem>
                                    <MenuItem value={10}>10</MenuItem>
                                    <MenuItem value={20}>20</MenuItem>
                                    <MenuItem value={50}>50</MenuItem>
                                </Select>
                            </FormControl>
                        </Box>
                        <Pagination
                            count={pagination.totalPages}
                            page={pagination.page}
                            onChange={(_, page) => handlePageChange(page)}
                            color="primary"
                            showFirstButton
                            showLastButton
                        />
                    </Box>
                )}
            </Paper>

            <CreateReportModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onReportCreated={loadReports}
            />
        </Box>
    );
};

export default Reports;
