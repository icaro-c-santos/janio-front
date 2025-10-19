import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Typography,
    TextField,
    Button,
    Grid,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Alert,
    CircularProgress,
    Divider,
    FormHelperText,
} from '@mui/material';
import { AttachFile as AttachFileIcon } from '@mui/icons-material';
import { salesService, CreateSaleRequest } from '../../../services/salesService';
import { customersService, Customer } from '../../../services/customersService';
import { useToast } from '../../../contexts/ToastContext';

interface SalesFormProps {
    onSuccess?: () => void;
    onCancel?: () => void;
    onConfirm?: (saleData: CreateSaleRequest) => void;
}

const SalesForm: React.FC<SalesFormProps> = ({ onSuccess, onCancel, onConfirm }) => {
    const { success: showSuccess, error: showError } = useToast();

    const [formData, setFormData] = useState<CreateSaleRequest>({
        customerId: '',
        quantity: 1,
        unitPrice: 0,
        saleDate: new Date().toISOString().split('T')[0],
        receipt: undefined,
    });

    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                setLoadingData(true);
                const customersData = await customersService.getAllCustomers();
                setCustomers(customersData);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Erro ao carregar dados');
                showError(err instanceof Error ? err.message : 'Erro ao carregar dados');
            } finally {
                setLoadingData(false);
            }
        };
        loadInitialData();
    }, [showError]);

    const handleCustomerChange = async (customerId: string) => {
        setFormData(prev => ({ ...prev, customerId }));
    };

    const handleInputChange = (field: keyof CreateSaleRequest, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (fieldErrors[field]) {
            setFieldErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            setFormData(prev => ({ ...prev, receipt: file }));
        }
    };

    const validateForm = (): boolean => {
        const errors: Record<string, string> = {};
        if (!formData.customerId) {
            errors.customerId = 'Cliente é obrigatório';
        }
        if (!formData.quantity || formData.quantity <= 0) {
            errors.quantity = 'Quantidade deve ser maior que zero';
        }
        if (!formData.unitPrice || formData.unitPrice <= 0) {
            errors.unitPrice = 'Preço deve ser maior que zero';
        }
        if (!formData.saleDate) {
            errors.saleDate = 'Data da venda é obrigatória';
        }
        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) {
            setError('Por favor, corrija os erros nos campos destacados');
            return;
        }
        if (onConfirm) {
            onConfirm(formData);
        } else {
            await createSale();
        }
    };

    const createSale = async () => {
        setLoading(true);
        setError(null);
        try {
            await salesService.createSale(formData);
            showSuccess('Venda cadastrada com sucesso!');
            onSuccess?.();
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Erro ao cadastrar venda';
            setError(errorMessage);
            showError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            customerId: '',
            quantity: 1,
            unitPrice: 0,
            saleDate: new Date().toISOString().split('T')[0],
            receipt: undefined,
        });
        setSelectedFile(null);
        setError(null);
        setFieldErrors({});
    };

    if (loadingData) {
        return (
            <Paper sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
                    <CircularProgress />
                </Box>
            </Paper>
        );
    }

    return (
        <Paper sx={{ p: 3 }}>
            <Typography variant="h5" component="h2" gutterBottom>
                Cadastrar Nova Venda
            </Typography>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            <form onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <FormControl fullWidth error={!!fieldErrors.customerId}>
                            <InputLabel>Cliente</InputLabel>
                            <Select
                                value={formData.customerId}
                                label="Cliente"
                                onChange={(e) => handleCustomerChange(e.target.value)}
                            >
                                {customers.map((customer) => (
                                    <MenuItem key={customer.id} value={customer.id}>
                                        {customer.name}
                                    </MenuItem>
                                ))}
                            </Select>
                            {fieldErrors.customerId && (
                                <FormHelperText>{fieldErrors.customerId}</FormHelperText>
                            )}
                        </FormControl>
                    </Grid>

                    <Grid item xs={12}>
                        <Divider sx={{ my: 2 }}>
                            <Typography variant="h6">Detalhes da Venda</Typography>
                        </Divider>
                    </Grid>

                    <Grid item xs={12} md={4}>
                        <TextField
                            fullWidth
                            label="Quantidade"
                            type="number"
                            value={formData.quantity || ''}
                            onChange={(e) => {
                                const value = parseInt(e.target.value);
                                handleInputChange('quantity', isNaN(value) ? 1 : value);
                            }}
                            error={!!fieldErrors.quantity}
                            helperText={fieldErrors.quantity || 'Digite a quantidade'}
                            inputProps={{ min: 1 }}
                            required
                        />
                    </Grid>

                    <Grid item xs={12} md={4}>
                        <TextField
                            fullWidth
                            label="Preço Unitário"
                            type="number"
                            value={formData.unitPrice || ''}
                            onChange={(e) => {
                                const raw = String(e.target.value).replace(',', '.');
                                const value = parseFloat(raw);
                                handleInputChange('unitPrice', isNaN(value) ? 0 : value);
                            }}
                            error={!!fieldErrors.unitPrice}
                            helperText={fieldErrors.unitPrice || 'Digite o preço unitário'}
                            inputProps={{ min: 0, step: 0.01 }}
                            required
                        />
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            label="Data da Venda"
                            type="date"
                            value={formData.saleDate}
                            onChange={(e) => handleInputChange('saleDate', e.target.value)}
                            error={!!fieldErrors.saleDate}
                            helperText={fieldErrors.saleDate}
                            InputLabelProps={{ shrink: true }}
                            required
                        />
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Box>
                            <input
                                accept=".pdf"
                                style={{ display: 'none' }}
                                id="file-upload"
                                type="file"
                                onChange={handleFileChange}
                            />
                            <label htmlFor="file-upload">
                                <Button
                                    variant="outlined"
                                    component="span"
                                    startIcon={<AttachFileIcon />}
                                    fullWidth
                                    sx={{ mb: 1 }}
                                >
                                    {selectedFile ? selectedFile.name : 'Anexar Recibo PDF (Opcional)'}
                                </Button>
                            </label>
                            {selectedFile && (
                                <Typography variant="caption" color="text.secondary" display="block">
                                    Arquivo selecionado: {selectedFile.name}
                                </Typography>
                            )}
                            <Typography variant="caption" color="text.secondary" display="block">
                                Apenas arquivos PDF são aceitos
                            </Typography>
                        </Box>
                    </Grid>

                    <Grid item xs={12}>
                        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                            <Button
                                variant="outlined"
                                onClick={onCancel || resetForm}
                                disabled={loading}
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                variant="contained"
                                disabled={loading}
                                startIcon={loading ? <CircularProgress size={20} /> : null}
                            >
                                {loading ? 'Cadastrando...' : 'Confirmar Venda'}
                            </Button>
                        </Box>
                    </Grid>
                </Grid>
            </form>
        </Paper>
    );
};

export default SalesForm;
