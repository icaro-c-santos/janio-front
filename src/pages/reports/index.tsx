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
    Autocomplete,
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
    VENDAS_MENSAL_GERAL: 'Vendas Mensal (Geral)',
    VENDAS_MENSAL_POR_CLIENTE: 'Vendas Mensal por Cliente',
    VENDAS_ANUAL_GERAL: 'Vendas Anual (Geral)',
    VENDAS_ANUAL_POR_CLIENTE: 'Vendas Anual por Cliente',
    ESTOQUE_MENSAL: 'Estoque Mensal',
    ESTOQUE_ANUAL: 'Estoque Anual',
    DRE_MENSAL: 'DRE Mensal',
    DRE_ANUAL: 'DRE Anual',
};
const REPORT_STATUS_LABELS: Record<string, string> = {
    PENDING: 'Pendente',
    PROCESSING: 'Processando',
    READY: 'Pronto',
    FAILED: 'Falhou',
};
const needsCustomer = (type: string) => type?.includes('POR_CLIENTE');
import { useToast } from '../../hooks/useToast';
import { customersService } from '../../services/customersService';

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
    downloadUrl?: string | null;
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
    });
    const [availableTypes, setAvailableTypes] = useState<string[]>([]);
    type SimpleItem = { id: string; name: string };
    const [customers, setCustomers] = useState<SimpleItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(false);
    const [loadingCustomers, setLoadingCustomers] = useState(false);
    const { error: showError, success: showSuccess } = useToast();


    useEffect(() => {
        (async () => {
            try {
                const types = await apiRequest(API_CONFIG.ENDPOINTS.REPORTS_TYPES);
                if (Array.isArray(types)) setAvailableTypes(types as string[]);
            } catch (_) {
                // fallback: use keys from map
                setAvailableTypes(Object.keys(REPORT_TYPE_LABELS));
            }
        })();
    }, []);

    // Carrega clientes quando o modal abre
    useEffect(() => {
        const loadCustomers = async () => {
            setLoadingCustomers(true);
            try {
                const customersList = await customersService.getAllCustomers();
                const mapped = (customersList || []).map((c: any) => ({ id: c.id, name: c.name }));
                setCustomers(mapped);
            } catch (_err) {
                setCustomers([]);
            } finally {
                setLoadingCustomers(false);
            }
        };

        if (isOpen) {
            loadCustomers();
        }
    }, [isOpen]);

    // Garante carregar clientes ao selecionar um tipo POR_CLIENTE
    useEffect(() => {
        const shouldLoad = needsCustomer(formData.type) && customers.length === 0 && !loadingCustomers;
        if (!shouldLoad) return;
        (async () => {
            setLoadingCustomers(true);
            try {
                const customersList = await customersService.getAllCustomers();
                const mapped = (customersList || []).map((c: any) => ({ id: c.id, name: c.name }));
                setCustomers(mapped);
            } finally {
                setLoadingCustomers(false);
            }
        })();
    }, [formData.type]);


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


        setLoading(true);
        try {
            const reportData = {
                name: formData.name,
                description: formData.description || undefined,
                type: formData.type,
                metadata: {
                    ...(needsCustomer(formData.type) && formData.customerId
                        ? { customerId: formData.customerId }
                        : {}),
                },
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
                                    {availableTypes.map((key) => (
                                        <MenuItem key={key} value={key}>
                                            {REPORT_TYPE_LABELS[key] ?? key}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        {needsCustomer(formData.type) && (
                            <Grid item xs={12}>
                                <Autocomplete
                                    options={customers}
                                    loading={loadingCustomers}
                                    getOptionLabel={(o) => (o ? o.name : '')}
                                    value={customers.find((c) => c.id === formData.customerId) || null}
                                    onChange={(_e, val) => setFormData({ ...formData, customerId: val?.id || '' })}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="Cliente"
                                            placeholder="Selecione"
                                            required
                                            fullWidth
                                            InputProps={{
                                                ...params.InputProps,
                                                endAdornment: (
                                                    <>
                                                        {loadingCustomers ? <CircularProgress color="inherit" size={20} /> : null}
                                                        {params.InputProps.endAdornment}
                                                    </>
                                                ),
                                            }}
                                        />
                                    )}
                                />
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
    const [uiFilters, setUiFilters] = useState({ status: '', type: '', search: '' });
    const [pagination, setPagination] = useState({ page: 1, pageSize: 10, total: 0, totalPages: 0 });
    const { error: showError, success: showSuccess } = useToast();
    const [detailOpen, setDetailOpen] = useState(false);
    const [detailLoading, setDetailLoading] = useState(false);
    const [selectedReport, setSelectedReport] = useState<Report | null>(null);

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
        setUiFilters(prev => ({ ...prev, [field]: value }));
    };

    const applyFilters = () => {
        setFilters(uiFilters);
        setPagination(prev => ({ ...prev, page: 1 }));
        // dispara carregamento com os filtros aplicados
        // como loadReports depende de filters e pagination, o useEffect irá chamar
        // mas forçamos aqui também para feedback imediato
        loadReports();
    };

    const handlePageChange = (newPage: number) => {
        setPagination(prev => ({ ...prev, page: newPage }));
    };

    const handlePageSizeChange = (newPageSize: number) => {
        setPagination(prev => ({ ...prev, pageSize: newPageSize, page: 1 }));
    };

    const clearFilters = () => {
        setUiFilters({ status: '', type: '', search: '' });
    };

    useEffect(() => {
        const interval = setInterval(() => { loadReports(); }, 30000);
        return () => clearInterval(interval);
    }, [loadReports]);

    const openDetail = async (id: string) => {
        setDetailOpen(true);
        setDetailLoading(true);
        try {
            const detail = await apiRequest(`${API_CONFIG.ENDPOINTS.REPORTS}/${id}`);
            setSelectedReport(detail as any);
        } catch (e) {
            showError('Erro ao carregar detalhes do relatório');
            setSelectedReport(null);
        } finally {
            setDetailLoading(false);
        }
    };

    const closeDetail = () => {
        setDetailOpen(false);
        setSelectedReport(null);
    };

    const handleDownloadFromDetail = () => {
        const url = selectedReport?.downloadUrl;
        if (url) {
            window.open(url, '_blank');
            showSuccess('Download iniciado!');
        } else {
            showError('URL de download indisponível');
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
                            <TextField fullWidth label="Buscar relatórios" value={uiFilters.search} onChange={(e) => handleFilterChange('search', e.target.value)} placeholder="Nome ou descrição..." InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon /></InputAdornment>) }} />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <FormControl fullWidth>
                                <InputLabel>Status</InputLabel>
                                <Select value={uiFilters.status} onChange={(e) => handleFilterChange('status', e.target.value)} label="Status">
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
                                <Select value={uiFilters.type} onChange={(e) => handleFilterChange('type', e.target.value)} label="Tipo">
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
                                <Button variant="contained" onClick={applyFilters}>Filtrar</Button>
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
                                <ListItem onClick={() => openDetail(report.id)} sx={{ py: 3, flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'flex-start', sm: 'center' }, cursor: 'pointer' }}>
                                    <ListItemText
                                        primary={<Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1, flexWrap: 'wrap' }}>{getStatusIcon(report.status)}<Typography variant="h6" component="span" sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>{report.name}</Typography><Chip label={REPORT_STATUS_LABELS[report.status]} color={getStatusColor(report.status) as any} size="small" /></Box>}
                                        secondary={<Box>{report.description && (<Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>{report.description}</Typography>)}<Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', flexDirection: { xs: 'column', sm: 'row' } }}><Chip label={`Tipo: ${REPORT_TYPE_LABELS[report.type]}`} variant="outlined" size="small" />{report.requestedBy && (<Chip label={`Criado por: ${report.requestedBy}`} variant="outlined" size="small" />)}<Chip label={`Criado em: ${formatDate(report.createdAt)}`} variant="outlined" size="small" /></Box></Box>}
                                        sx={{ width: { xs: '100%', sm: 'auto' } }}
                                    />
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

            <Dialog open={detailOpen} onClose={closeDetail} maxWidth="sm" fullWidth>
                <DialogTitle>Detalhes do Relatório</DialogTitle>
                <DialogContent dividers>
                    {detailLoading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                            <CircularProgress />
                        </Box>
                    ) : !selectedReport ? (
                        <Alert severity="error">Não foi possível carregar os detalhes.</Alert>
                    ) : (
                        <Box sx={{ display: 'grid', gap: 2 }}>
                            <Typography variant="h6">{selectedReport.name}</Typography>
                            {selectedReport.description && (
                                <Typography variant="body2" color="text.secondary">{selectedReport.description}</Typography>
                            )}
                            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                <Chip label={`Status: ${REPORT_STATUS_LABELS[selectedReport.status] || selectedReport.status}`} />
                                <Chip label={`Tipo: ${REPORT_TYPE_LABELS[selectedReport.type] || selectedReport.type}`} />
                                <Chip label={`Criado em: ${formatDate(selectedReport.createdAt)}`} />
                            </Box>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeDetail}>Fechar</Button>
                    {selectedReport && selectedReport.status === 'READY' && selectedReport.downloadUrl && (
                        <Button variant="contained" color="success" startIcon={<DownloadIcon />} onClick={handleDownloadFromDetail}>
                            Download
                        </Button>
                    )}
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ReportsPage;
