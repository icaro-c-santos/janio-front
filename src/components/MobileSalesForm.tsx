import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    TextField,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Alert,
    CircularProgress,
    FormHelperText,
    Stepper,
    Step,
    StepLabel,
    Paper,
    Divider,
    Chip,
} from '@mui/material';
import { AttachFile as AttachFileIcon } from '@mui/icons-material';
import { salesService, CreateSaleRequest, Product } from '../services/salesService';
import { useToast } from '../contexts/ToastContext';

interface MobileSalesFormProps {
    onSuccess?: () => void;
    onCancel?: () => void;
    onConfirm?: (saleData: CreateSaleRequest) => void;
}

interface Customer {
    id: string;
    name: string;
    type: "INDIVIDUAL" | "COMPANY";
}

const steps = ['Produto e Cliente', 'Detalhes da Venda', 'Confirmação'];

const MobileSalesForm: React.FC<MobileSalesFormProps> = ({ onSuccess, onCancel, onConfirm }) => {
    const { success: showSuccess, error: showError } = useToast();

    const [activeStep, setActiveStep] = useState(0);
    const [formData, setFormData] = useState<CreateSaleRequest>({
        productId: '',
        customerId: '',
        quantity: 1,
        price: 0,
        totalValue: 0,
        saleDate: new Date().toISOString().split('T')[0],
        file: undefined,
    });

    const [products, setProducts] = useState<Product[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    // Carregar dados iniciais
    useEffect(() => {
        const loadInitialData = async () => {
            try {
                setLoadingData(true);

                const [productsData, customersData] = await Promise.all([
                    salesService.getProducts(),
                    salesService.getCustomers()
                ]);

                setProducts(productsData);
                setCustomers(customersData);

                // Preselecionar primeiro produto
                if (productsData.length > 0) {
                    setFormData(prev => ({
                        ...prev,
                        productId: productsData[0].id,
                        price: productsData[0].price || 0,
                        totalValue: (productsData[0].price || 0) * prev.quantity
                    }));
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Erro ao carregar dados');
                showError(err instanceof Error ? err.message : 'Erro ao carregar dados');
            } finally {
                setLoadingData(false);
            }
        };

        loadInitialData();
    }, [showError]);

    // Calcular valor total quando quantidade ou preço mudar
    useEffect(() => {
        const quantity = Number(formData.quantity) || 0;
        const price = Number(formData.price) || 0;
        const total = quantity * price;
        setFormData(prev => ({ ...prev, totalValue: total }));
    }, [formData.quantity, formData.price]);

    // Buscar preço específico quando cliente for selecionado
    const handleCustomerChange = async (customerId: string) => {
        if (!customerId || !formData.productId) {
            setFormData(prev => ({ ...prev, customerId }));
            return;
        }

        try {
            console.log('Buscando preço específico para:', { productId: formData.productId, customerId });
            const specificPrice = await salesService.getProductPriceByCustomer(
                formData.productId,
                customerId
            );

            console.log('Preço específico retornado:', specificPrice);

            const selectedProduct = products.find(p => p.id === formData.productId);
            const finalPrice = specificPrice !== null ? specificPrice : (selectedProduct?.price || 0);

            console.log('Preço final a ser aplicado:', finalPrice);

            setFormData(prev => ({
                ...prev,
                customerId,
                price: finalPrice,
                totalValue: finalPrice * prev.quantity
            }));
        } catch (err) {
            console.error('Erro ao buscar preço específico:', err);
            const selectedProduct = products.find(p => p.id === formData.productId);
            setFormData(prev => ({
                ...prev,
                customerId,
                price: selectedProduct?.price || 0,
                totalValue: (selectedProduct?.price || 0) * prev.quantity
            }));
        }
    };

    const handleInputChange = (field: keyof CreateSaleRequest, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));

        // Se o produto foi alterado e já há um cliente selecionado, buscar preço específico
        if (field === 'productId' && formData.customerId) {
            handleProductChange(value, formData.customerId);
        }

        if (fieldErrors[field]) {
            setFieldErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    // Buscar preço específico quando produto for alterado e cliente já estiver selecionado
    const handleProductChange = async (productId: string, customerId: string) => {
        if (!productId || !customerId) return;

        try {
            const specificPrice = await salesService.getProductPriceByCustomer(
                productId,
                customerId
            );

            const selectedProduct = products.find(p => p.id === productId);
            const finalPrice = specificPrice !== null ? specificPrice : (selectedProduct?.price || 0);

            setFormData(prev => ({
                ...prev,
                price: finalPrice,
                totalValue: finalPrice * prev.quantity
            }));
        } catch (err) {
            console.error('Erro ao buscar preço específico:', err);
            const selectedProduct = products.find(p => p.id === productId);
            setFormData(prev => ({
                ...prev,
                price: selectedProduct?.price || 0,
                totalValue: (selectedProduct?.price || 0) * prev.quantity
            }));
        }
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            setFormData(prev => ({ ...prev, file }));
        }
    };

    const validateStep = (step: number): boolean => {
        const errors: Record<string, string> = {};

        if (step === 0) {
            if (!formData.productId) {
                errors.productId = 'Produto é obrigatório';
            }
            if (!formData.customerId) {
                errors.customerId = 'Cliente é obrigatório';
            }
        } else if (step === 1) {
            if (!formData.quantity || formData.quantity <= 0) {
                errors.quantity = 'Quantidade deve ser maior que zero';
            }
            if (!formData.price || formData.price <= 0) {
                errors.price = 'Preço deve ser maior que zero';
            }
            if (!formData.saleDate) {
                errors.saleDate = 'Data da venda é obrigatória';
            }
        }

        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleNext = () => {
        if (validateStep(activeStep)) {
            setActiveStep((prevActiveStep) => prevActiveStep + 1);
        }
    };

    const handleBack = () => {
        setActiveStep((prevActiveStep) => prevActiveStep - 1);
    };

    const handleSubmit = async () => {
        if (!validateStep(1)) {
            setError('Por favor, corrija os erros nos campos destacados');
            return;
        }

        if (onConfirm) {
            onConfirm(formData);
        }
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        }).format(value);
    };

    const getSelectedProduct = () => products.find(p => p.id === formData.productId);
    const getSelectedCustomer = () => customers.find(c => c.id === formData.customerId);

    if (loadingData) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200, p: 2 }}>
                <CircularProgress />
            </Box>
        );
    }

    const renderStepContent = (step: number) => {
        switch (step) {
            case 0:
                return (
                    <Box sx={{ p: 2 }}>
                        <Typography variant="h6" gutterBottom>
                            Produto e Cliente
                        </Typography>

                        <FormControl fullWidth error={!!fieldErrors.productId} sx={{ mb: 2 }}>
                            <InputLabel>Produto</InputLabel>
                            <Select
                                value={formData.productId}
                                label="Produto"
                                onChange={(e) => handleInputChange('productId', e.target.value)}
                            >
                                {products.map((product) => (
                                    <MenuItem key={product.id} value={product.id}>
                                        {product.name}
                                    </MenuItem>
                                ))}
                            </Select>
                            {fieldErrors.productId && (
                                <FormHelperText>{fieldErrors.productId}</FormHelperText>
                            )}
                        </FormControl>

                        <FormControl fullWidth error={!!fieldErrors.customerId}>
                            <InputLabel>Cliente</InputLabel>
                            <Select
                                value={formData.customerId}
                                label="Cliente"
                                onChange={(e) => handleCustomerChange(e.target.value)}
                            >
                                {customers.map((customer) => (
                                    <MenuItem key={customer.id} value={customer.id}>
                                        {customer.name} ({customer.type === 'INDIVIDUAL' ? 'PF' : 'PJ'})
                                    </MenuItem>
                                ))}
                            </Select>
                            {fieldErrors.customerId && (
                                <FormHelperText>{fieldErrors.customerId}</FormHelperText>
                            )}
                        </FormControl>
                    </Box>
                );

            case 1:
                return (
                    <Box sx={{ p: 2 }}>
                        <Typography variant="h6" gutterBottom>
                            Detalhes da Venda
                        </Typography>

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
                            sx={{ mb: 2 }}
                            required
                        />

                        <TextField
                            fullWidth
                            label="Preço Unitário"
                            type="number"
                            value={formData.price || ''}
                            onChange={(e) => {
                                const value = parseFloat(e.target.value);
                                handleInputChange('price', isNaN(value) ? 0 : value);
                            }}
                            error={!!fieldErrors.price}
                            helperText={fieldErrors.price || 'Digite o preço unitário'}
                            inputProps={{ min: 0, step: 0.01 }}
                            sx={{ mb: 2 }}
                            required
                        />

                        <TextField
                            fullWidth
                            label="Valor Total"
                            type="number"
                            value={isNaN(formData.totalValue) ? '0.00' : formData.totalValue.toFixed(2)}
                            InputProps={{ readOnly: true }}
                            helperText="Calculado automaticamente"
                            sx={{ mb: 2 }}
                        />

                        <TextField
                            fullWidth
                            label="Data da Venda"
                            type="date"
                            value={formData.saleDate}
                            onChange={(e) => handleInputChange('saleDate', e.target.value)}
                            error={!!fieldErrors.saleDate}
                            helperText={fieldErrors.saleDate}
                            InputLabelProps={{ shrink: true }}
                            sx={{ mb: 2 }}
                            required
                        />

                        <Box>
                            <input
                                accept=".pdf"
                                style={{ display: 'none' }}
                                id="file-upload-mobile"
                                type="file"
                                onChange={handleFileChange}
                            />
                            <label htmlFor="file-upload-mobile">
                                <Button
                                    variant="outlined"
                                    component="span"
                                    startIcon={<AttachFileIcon />}
                                    fullWidth
                                >
                                    {selectedFile ? selectedFile.name : 'Anexar PDF (Opcional)'}
                                </Button>
                            </label>
                            {selectedFile && (
                                <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                                    Arquivo selecionado: {selectedFile.name}
                                </Typography>
                            )}
                        </Box>
                    </Box>
                );

            case 2:
                return (
                    <Box sx={{ p: 2 }}>
                        <Typography variant="h6" gutterBottom>
                            Confirmação
                        </Typography>

                        <Paper sx={{ p: 2, mb: 2 }}>
                            <Typography variant="subtitle2" gutterBottom>
                                Resumo da Venda
                            </Typography>

                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography variant="body2" color="text.secondary">Produto:</Typography>
                                    <Typography variant="body2">{getSelectedProduct()?.name}</Typography>
                                </Box>

                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography variant="body2" color="text.secondary">Cliente:</Typography>
                                    <Typography variant="body2">{getSelectedCustomer()?.name}</Typography>
                                </Box>

                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography variant="body2" color="text.secondary">Quantidade:</Typography>
                                    <Typography variant="body2">{formData.quantity}</Typography>
                                </Box>

                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography variant="body2" color="text.secondary">Preço Unit.:</Typography>
                                    <Typography variant="body2">{formatCurrency(formData.price)}</Typography>
                                </Box>

                                <Divider sx={{ my: 1 }} />

                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography variant="h6" color="primary">Total:</Typography>
                                    <Typography variant="h6" color="primary" fontWeight="bold">
                                        {formatCurrency(formData.totalValue)}
                                    </Typography>
                                </Box>

                                {selectedFile && (
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                                        <Typography variant="body2" color="text.secondary">Anexo:</Typography>
                                        <Chip label="PDF" size="small" color="primary" />
                                    </Box>
                                )}
                            </Box>
                        </Paper>
                    </Box>
                );

            default:
                return null;
        }
    };

    return (
        <Box>
            <Stepper activeStep={activeStep} sx={{ p: 2 }}>
                {steps.map((label) => (
                    <Step key={label}>
                        <StepLabel>{label}</StepLabel>
                    </Step>
                ))}
            </Stepper>

            {error && (
                <Alert severity="error" sx={{ m: 2 }}>
                    {error}
                </Alert>
            )}

            {renderStepContent(activeStep)}

            <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 2, pt: 1 }}>
                <Button
                    disabled={activeStep === 0}
                    onClick={handleBack}
                    variant="outlined"
                >
                    Voltar
                </Button>

                {activeStep === steps.length - 1 ? (
                    <Button
                        onClick={handleSubmit}
                        variant="contained"
                        disabled={loading}
                        startIcon={loading ? <CircularProgress size={20} /> : null}
                    >
                        {loading ? 'Confirmando...' : 'Confirmar Venda'}
                    </Button>
                ) : (
                    <Button
                        onClick={handleNext}
                        variant="contained"
                    >
                        Próximo
                    </Button>
                )}
            </Box>
        </Box>
    );
};

export default MobileSalesForm;
