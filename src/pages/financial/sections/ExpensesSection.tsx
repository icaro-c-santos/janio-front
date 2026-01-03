import React, { useCallback, useEffect, useState } from 'react';
import {
    Box,
    Button,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    Chip,
    IconButton,
    Card,
    CardContent,
    Stack,
    TextField,
    MenuItem,
    useTheme,
    useMediaQuery,
    CircularProgress,
    Alert,
    Link,
} from '@mui/material';
import {
    Add as AddIcon,
    Refresh as RefreshIcon,
    Receipt as ReceiptIcon,
    FilterList as FilterIcon,
    Clear as ClearIcon,
} from '@mui/icons-material';
import {
    ExpenseListItem,
    ExpenseType,
    ExpenseFilters,
    expensesService,
} from '../../../services/expensesService';
import CreateExpenseDialog from './CreateExpenseDialog';
import CreateExpenseTypeDialog from './CreateExpenseTypeDialog';

const ExpensesSection: React.FC = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const [expenses, setExpenses] = useState<ExpenseListItem[]>([]);
    const [types, setTypes] = useState<ExpenseType[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Filters
    const [showFilters, setShowFilters] = useState(false);
    const [filterTypeId, setFilterTypeId] = useState('');
    const [filterStartDate, setFilterStartDate] = useState('');
    const [filterEndDate, setFilterEndDate] = useState('');

    // Dialogs
    const [createOpen, setCreateOpen] = useState(false);
    const [createTypeOpen, setCreateTypeOpen] = useState(false);

    const loadTypes = useCallback(async () => {
        try {
            const data = await expensesService.listTypes();
            setTypes(data);
        } catch (e) {
            console.error('Erro ao carregar tipos:', e);
        }
    }, []);

    const loadExpenses = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const filters: ExpenseFilters = {};
            if (filterTypeId) filters.expenseTypeId = filterTypeId;
            if (filterStartDate) filters.startDate = filterStartDate;
            if (filterEndDate) filters.endDate = filterEndDate;

            const data = await expensesService.list(filters);
            setExpenses(data);
        } catch (e: any) {
            setError(e?.message || 'Erro ao carregar despesas');
        } finally {
            setLoading(false);
        }
    }, [filterTypeId, filterStartDate, filterEndDate]);

    useEffect(() => {
        loadTypes();
    }, [loadTypes]);

    useEffect(() => {
        loadExpenses();
    }, [loadExpenses]);

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        }).format(value);
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('pt-BR');
    };

    const clearFilters = () => {
        setFilterTypeId('');
        setFilterStartDate('');
        setFilterEndDate('');
    };

    const renderFilters = () => (
        <Paper sx={{ p: 2, mb: 2 }}>
            <Stack
                direction={{ xs: 'column', md: 'row' }}
                spacing={2}
                alignItems={{ xs: 'stretch', md: 'center' }}
            >
                <TextField
                    select
                    label="Tipo de Despesa"
                    value={filterTypeId}
                    onChange={(e) => setFilterTypeId(e.target.value)}
                    size="small"
                    sx={{ minWidth: 200 }}
                >
                    <MenuItem value="">Todos</MenuItem>
                    {types.map((t) => (
                        <MenuItem key={t.id} value={t.id}>
                            {t.name}
                        </MenuItem>
                    ))}
                </TextField>

                <TextField
                    label="Data Início"
                    type="date"
                    value={filterStartDate}
                    onChange={(e) => setFilterStartDate(e.target.value)}
                    size="small"
                    InputLabelProps={{ shrink: true }}
                />

                <TextField
                    label="Data Fim"
                    type="date"
                    value={filterEndDate}
                    onChange={(e) => setFilterEndDate(e.target.value)}
                    size="small"
                    InputLabelProps={{ shrink: true }}
                />

                <Button
                    variant="outlined"
                    startIcon={<ClearIcon />}
                    onClick={clearFilters}
                    size="small"
                >
                    Limpar
                </Button>
            </Stack>
        </Paper>
    );

    const renderMobileCard = (expense: ExpenseListItem) => (
        <Card key={expense.id} sx={{ mb: 2 }}>
            <CardContent>
                <Stack spacing={1}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Box>
                            <Chip
                                label={expense.expenseType?.name || 'Sem tipo'}
                                size="small"
                                color="primary"
                                variant="outlined"
                            />
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                {formatDate(expense.expenseDate)}
                            </Typography>
                        </Box>
                        <Typography variant="h6" color="error.main" fontWeight="bold">
                            {formatCurrency(Number(expense.amount))}
                        </Typography>
                    </Box>

                    {expense.description && (
                        <Typography variant="body2" color="text.secondary">
                            {expense.description}
                        </Typography>
                    )}

                    {expense.receiptDownloadUrl && (
                        <Link
                            href={expense.receiptDownloadUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                        >
                            <ReceiptIcon fontSize="small" />
                            Ver comprovante
                        </Link>
                    )}
                </Stack>
            </CardContent>
        </Card>
    );

    const renderDesktopTable = () => (
        <TableContainer component={Paper}>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Data</TableCell>
                        <TableCell>Tipo</TableCell>
                        <TableCell>Descrição</TableCell>
                        <TableCell align="right">Valor</TableCell>
                        <TableCell align="center">Comprovante</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {expenses.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={5} align="center">
                                <Typography color="text.secondary" py={3}>
                                    Nenhuma despesa encontrada
                                </Typography>
                            </TableCell>
                        </TableRow>
                    ) : (
                        expenses.map((expense) => (
                            <TableRow key={expense.id} hover>
                                <TableCell>{formatDate(expense.expenseDate)}</TableCell>
                                <TableCell>
                                    <Chip
                                        label={expense.expenseType?.name || 'Sem tipo'}
                                        size="small"
                                        color="primary"
                                        variant="outlined"
                                    />
                                </TableCell>
                                <TableCell>{expense.description || '-'}</TableCell>
                                <TableCell align="right">
                                    <Typography color="error.main" fontWeight="medium">
                                        {formatCurrency(Number(expense.amount))}
                                    </Typography>
                                </TableCell>
                                <TableCell align="center">
                                    {expense.receiptDownloadUrl ? (
                                        <IconButton
                                            href={expense.receiptDownloadUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            size="small"
                                            color="primary"
                                        >
                                            <ReceiptIcon />
                                        </IconButton>
                                    ) : (
                                        <Typography color="text.disabled">-</Typography>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </TableContainer>
    );

    return (
        <Box>
            {/* Header */}
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    justifyContent: 'space-between',
                    alignItems: { xs: 'stretch', sm: 'center' },
                    gap: 2,
                    mb: 2,
                }}
            >
                <Typography variant="h6">Despesas</Typography>

                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    <Button
                        variant="outlined"
                        startIcon={<FilterIcon />}
                        onClick={() => setShowFilters(!showFilters)}
                        size="small"
                    >
                        Filtros
                    </Button>

                    <IconButton onClick={loadExpenses} size="small" title="Atualizar">
                        <RefreshIcon />
                    </IconButton>

                    <Button
                        variant="outlined"
                        size="small"
                        onClick={() => setCreateTypeOpen(true)}
                    >
                        Novo Tipo
                    </Button>

                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => setCreateOpen(true)}
                    >
                        Nova Despesa
                    </Button>
                </Stack>
            </Box>

            {/* Filters */}
            {showFilters && renderFilters()}

            {/* Error */}
            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            {/* Loading */}
            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress />
                </Box>
            ) : isMobile ? (
                // Mobile Cards
                <Box>
                    {expenses.length === 0 ? (
                        <Paper sx={{ p: 3, textAlign: 'center' }}>
                            <Typography color="text.secondary">
                                Nenhuma despesa encontrada
                            </Typography>
                        </Paper>
                    ) : (
                        expenses.map(renderMobileCard)
                    )}
                </Box>
            ) : (
                // Desktop Table
                renderDesktopTable()
            )}

            {/* Dialogs */}
            <CreateExpenseDialog
                open={createOpen}
                onClose={() => setCreateOpen(false)}
                types={types}
                onCreated={() => {
                    setCreateOpen(false);
                    loadExpenses();
                }}
            />

            <CreateExpenseTypeDialog
                open={createTypeOpen}
                onClose={() => setCreateTypeOpen(false)}
                onCreated={() => {
                    setCreateTypeOpen(false);
                    loadTypes();
                }}
            />
        </Box>
    );
};

export default ExpensesSection;

